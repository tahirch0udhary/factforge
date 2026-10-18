from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db, User, Claim, Prediction, ClaimTrustedSource, TrustedSource
from app.schemas import HistoryItem, StatsResponse, HistorySourceItem
from app.auth import get_current_user
from app.pipeline import get_pipeline

router = APIRouter(prefix="/api", tags=["History & Stats"])


@router.get("/history", response_model=list[HistoryItem])
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the current user's claim verification history."""
    claims = (
        db.query(Claim)
        .filter(Claim.user_id == current_user.id)
        .order_by(Claim.submitted_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    items = []
    for c in claims:
        pred = c.prediction
        if pred:
            links = (
                db.query(ClaimTrustedSource, TrustedSource)
                .join(TrustedSource, TrustedSource.source_id == ClaimTrustedSource.source_id)
                .filter(ClaimTrustedSource.claim_id == c.id)
                .all()
            )
            sources = [
                HistorySourceItem(
                    source_id=source.source_id,
                    source_name=source.source_name,
                    article_name=link.article_name,
                    category=source.category,
                )
                for link, source in links
            ]

            items.append(HistoryItem(
                claim_id=c.id,
                claim_text=c.claim_text,
                final_prediction=pred.final_prediction,
                final_confidence=pred.final_confidence,
                decided_by=pred.decided_by,
                explanation=pred.explanation,
                groq_reasoning=pred.groq_explanation,
                submitted_at=c.submitted_at,
                trusted_sources=sources,
            ))
    return items


@router.get("/stats", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get verification statistics for the current user."""
    user_preds = (
        db.query(Prediction)
        .join(Claim)
        .filter(Claim.user_id == current_user.id)
    )

    total = user_preds.count()
    if total == 0:
        return StatsResponse(
            total_claims=0, fake_count=0, real_count=0,
            avg_confidence=0.0,
            decided_by_baseline=0, decided_by_bert=0, decided_by_groq=0,
            baseline_model_info={}, bert_model_info={},
        )

    fake_count = user_preds.filter(Prediction.final_label == 0).count()
    real_count = user_preds.filter(Prediction.final_label == 1).count()
    avg_conf = db.query(func.avg(Prediction.final_confidence)).join(Claim).filter(
        Claim.user_id == current_user.id
    ).scalar() or 0.0

    by_baseline = user_preds.filter(Prediction.decided_by == "baseline").count()
    by_bert = user_preds.filter(Prediction.decided_by == "bert").count()
    by_groq = user_preds.filter(Prediction.decided_by == "groq").count()

    pipeline = get_pipeline()

    return StatsResponse(
        total_claims=total,
        fake_count=fake_count,
        real_count=real_count,
        avg_confidence=round(float(avg_conf), 4),
        decided_by_baseline=by_baseline,
        decided_by_bert=by_bert,
        decided_by_groq=by_groq,
        baseline_model_info={
            "model": pipeline.baseline.metadata["model_name"],
            "f1": pipeline.baseline.metadata["performance"]["f1_score"],
            "dataset": "LIAR",
        },
        bert_model_info={
            "model": pipeline.bert.metadata["model_name"],
            "f1": pipeline.bert.metadata["test_f1"],
            "dataset": "ISOT",
        },
    )
