import re

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db, User, Claim, Prediction, TrustedSource, ClaimTrustedSource
from app.schemas import ClaimRequest, VerifyResponse, ModelResult, HistorySourceItem
from app.auth import get_current_user
from app.pipeline import get_pipeline

router = APIRouter(prefix="/api", tags=["Verification"])


def _normalize_category(value: str) -> str:
    raw = (value or "other").strip().lower()
    first = re.split(r"[|,/;]+", raw)[0].strip()
    return first or "other"


@router.post("/verify", response_model=VerifyResponse)
def verify_claim(
    req: ClaimRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a claim for verification.

    Pipeline:
            1. Baseline + BERT predictions
            2. Groq validation/fallback
            3. Optional source suggestions from Groq saved into trusted_sources
    """
    pipeline = get_pipeline()

    # Run the pipeline
    result = pipeline.verify(
        text=req.claim_text,
        speaker=req.speaker or "",
        subject=req.subject or "",
        context=req.context or "",
    )

    # Save claim to DB
    claim = Claim(user_id=current_user.id, claim_text=req.claim_text)
    db.add(claim)
    db.commit()
    db.refresh(claim)

    # Save prediction to DB
    prediction = Prediction(
        claim_id=claim.id,
        final_label=result["final_label"],
        final_prediction=result["final_prediction"],
        final_confidence=result["final_confidence"],
        decided_by=result["decided_by"],
        explanation=result["explanation"],
        baseline_label=result["baseline"]["label"] if result["baseline"] else None,
        baseline_confidence=result["baseline"]["confidence"] if result["baseline"] else None,
        bert_label=result["bert"]["label"] if result["bert"] else None,
        bert_confidence=result["bert"]["confidence"] if result["bert"] else None,
        groq_label=result["groq"]["label"] if result["groq"] else None,
        groq_confidence=result["groq"]["confidence"] if result["groq"] else None,
        groq_explanation=result["groq"]["explanation"] if result["groq"] else None,
    )
    db.add(prediction)

    # Persist trusted sources returned by Groq (if any).
    claim_sources = []
    seen_pairs = set()
    groq_sources = (result.get("groq") or {}).get("sources") or []
    for source in groq_sources:
        source_name = (source.get("website_name") or "").strip()
        article_name = (source.get("article_name") or "").strip()
        category = _normalize_category(source.get("category") or "other")

        if not source_name:
            continue
        dedupe_key = (source_name.lower(), category, article_name.lower())
        if dedupe_key in seen_pairs:
            continue
        seen_pairs.add(dedupe_key)

        existing = (
            db.query(TrustedSource)
            .filter(
                TrustedSource.source_name == source_name,
                TrustedSource.category == category,
            )
            .first()
        )
        if existing:
            trusted_source = existing
        else:
            trusted_source = TrustedSource(
                source_name=source_name,
                article_title=article_name or "Unknown Article",
                category=category,
            )
            db.add(trusted_source)

        claim_sources.append((trusted_source, article_name))

    db.commit()

    # Refresh rows to ensure IDs/timestamps are available.
    for source, _ in claim_sources:
        db.refresh(source)

    # Link trusted sources to this specific claim for later history rendering.
    linked_sources = []
    for source, article_name in claim_sources:
        existing_link = (
            db.query(ClaimTrustedSource)
            .filter(
                ClaimTrustedSource.claim_id == claim.id,
                ClaimTrustedSource.source_id == source.source_id,
            )
            .first()
        )
        if not existing_link:
            db.add(
                ClaimTrustedSource(
                    claim_id=claim.id,
                    source_id=source.source_id,
                    article_name=article_name or None,
                )
            )
        linked_sources.append((source, article_name))

    db.commit()

    # Build response
    response = VerifyResponse(
        claim_id=claim.id,
        claim_text=req.claim_text,
        final_label=result["final_label"],
        final_prediction=result["final_prediction"],
        final_confidence=result["final_confidence"],
        decided_by=result["decided_by"],
        explanation=result["explanation"],
        groq_reasoning=(result.get("groq") or {}).get("explanation"),
    )

    if result["baseline"]:
        response.baseline_result = ModelResult(**result["baseline"])
    if result["bert"]:
        response.bert_result = ModelResult(**result["bert"])
    if result["groq"]:
        groq_data = {k: result["groq"][k] for k in ["label", "prediction", "confidence"]}
        response.groq_result = ModelResult(**groq_data)

    response.trusted_sources = [
        HistorySourceItem(
            source_id=source.source_id,
            source_name=source.source_name,
            article_name=article_name or None,
            category=source.category,
        )
        for source, article_name in linked_sources
    ]

    return response
