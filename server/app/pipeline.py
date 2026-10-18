import os
import re
import pickle
import json
import logging
from typing import Optional

import numpy as np
import torch
from transformers import AutoTokenizer, DistilBertTokenizerFast, DistilBertForSequenceClassification
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import spacy
from groq import Groq

from app.config import settings

logger = logging.getLogger("factforge.pipeline")


class BaselinePredictor:
    """TF-IDF + Random Forest trained on LIAR dataset."""

    def __init__(self, model_dir: str):
        logger.info(f"Loading baseline model from {model_dir}")
        with open(os.path.join(model_dir, "best_model.pkl"), "rb") as f:
            self.model = pickle.load(f)
        with open(os.path.join(model_dir, "tfidf_vectorizer.pkl"), "rb") as f:
            self.tfidf = pickle.load(f)
        with open(os.path.join(model_dir, "feature_scaler.pkl"), "rb") as f:
            self.scaler = pickle.load(f)
        with open(os.path.join(model_dir, "feature_columns.pkl"), "rb") as f:
            self.feature_columns = pickle.load(f)
        with open(os.path.join(model_dir, "model_metadata.pkl"), "rb") as f:
            self.metadata = pickle.load(f)

        # NLP tools for feature extraction
        self.vader = SentimentIntensityAnalyzer()
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("Downloading spaCy model en_core_web_sm...")
            spacy.cli.download("en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")

        # Negation words to preserve during stop-word removal
        self.negation_words = {"not", "never", "no", "neither", "nor", "cannot", "without"}

        logger.info(f"Baseline loaded: {self.metadata['model_name']} (F1={self.metadata['performance']['f1_score']:.4f})")

    def _preprocess_text(self, text: str) -> str:
        """Replicate the training preprocessing pipeline."""
        text = text.lower()
        text = re.sub(r"http\S+|www\.\S+", "URL_LINK", text)
        text = re.sub(r"\b(19|20)\d{2}\b", "YEAR", text)
        text = re.sub(r"\d+(\.\d+)?%", "PERCENTAGE", text)

        doc = self.nlp(text)
        tokens = []
        for token in doc:
            if token.is_punct:
                continue
            if token.is_stop and token.text not in self.negation_words:
                continue
            tokens.append(token.lemma_)

        return " ".join(tokens)

    def _extract_features(self, text: str) -> dict:
        """Extract the 29 numerical features matching training."""
        sentiment = self.vader.polarity_scores(text)
        doc = self.nlp(text)
        words = text.split()
        word_count = len(words)

        # NER counts
        ner_counts = {"PERSON": 0, "ORG": 0, "GPE": 0, "DATE": 0, "MONEY": 0, "PERCENT": 0}
        for ent in doc.ents:
            if ent.label_ in ner_counts:
                ner_counts[ent.label_] += 1
        ner_total = sum(ner_counts.values())

        # Linguistic markers
        hedge_words = {"may", "might", "could", "possibly", "perhaps", "suggest", "appear", "seem"}
        absolute_words = {"always", "never", "all", "none", "every", "completely", "totally", "definitely"}
        tokens_lower = [w.lower() for w in words]
        hedge_count = sum(1 for w in tokens_lower if w in hedge_words)
        absolute_count = sum(1 for w in tokens_lower if w in absolute_words)

        return {
            "text_length": len(text),
            "word_count": word_count,
            "avg_word_length": np.mean([len(w) for w in words]) if words else 0,
            "exclamation_count": text.count("!"),
            "question_count": text.count("?"),
            "uppercase_ratio": sum(1 for c in text if c.isupper()) / max(len(text), 1),
            "sentiment_pos": sentiment["pos"],
            "sentiment_neg": sentiment["neg"],
            "sentiment_neu": sentiment["neu"],
            "sentiment_compound": sentiment["compound"],
            "false_ratio": 0.5,       # Unknown speaker — use neutral
            "true_ratio": 0.5,
            "barely_true_ratio": 0.0,
            "pants_fire_ratio": 0.0,
            "half_true_ratio": 0.0,
            "speaker_experience": 0,
            "credibility_score": 0.5,
            "ner_person": ner_counts["PERSON"],
            "ner_org": ner_counts["ORG"],
            "ner_gpe": ner_counts["GPE"],
            "ner_date": ner_counts["DATE"],
            "ner_money": ner_counts["MONEY"],
            "ner_percent": ner_counts["PERCENT"],
            "ner_total": ner_total,
            "number_count": len(re.findall(r"\d+", text)),
            "hedge_count": hedge_count,
            "absolute_count": absolute_count,
            "hedge_ratio": hedge_count / max(word_count, 1),
            "absolute_ratio": absolute_count / max(word_count, 1),
        }

    def predict(self, text: str, subject: str = "", context: str = "") -> dict:
        # Combine text fields as done in training
        combined = text
        if subject:
            combined += " " + subject
        if context:
            combined += " " + context

        processed = self._preprocess_text(combined)

        # TF-IDF features
        tfidf_features = self.tfidf.transform([processed])

        # Numerical features
        features = self._extract_features(text)
        num_array = np.array([[features[col] for col in self.feature_columns]])
        num_scaled = self.scaler.transform(num_array)

        # Combine: TF-IDF (sparse) + numerical
        from scipy.sparse import hstack
        X = hstack([tfidf_features, num_scaled])

        # Predict
        proba = self.model.predict_proba(X)[0]
        label = int(np.argmax(proba))
        confidence = float(proba[label])

        return {
            "label": label,
            "prediction": "Real" if label == 1 else "Fake",
            "confidence": round(confidence, 4),
        }


class BertPredictor:
    """DistilBERT trained on ISOT dataset."""

    def __init__(self, model_dir: str):
        logger.info(f"Loading BERT model from {model_dir}")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        with open(os.path.join(model_dir, "model_metadata.json")) as f:
            self.metadata = json.load(f)

        self.tokenizer = self._load_tokenizer(model_dir)
        self.model = DistilBertForSequenceClassification.from_pretrained(model_dir)
        self.model.to(self.device)
        self.model.eval()

        self.max_length = self.metadata["max_length"]
        logger.info(f"BERT loaded on {self.device} (F1={self.metadata['test_f1']:.4f})")

    def _load_tokenizer(self, model_dir: str):
        """
        Load tokenizer from local files only.

        Some exported bundles include tokenizer.json but not vocab.txt.
        In that case, use the fast tokenizer directly from tokenizer_file.
        """
        try:
            return AutoTokenizer.from_pretrained(
                model_dir,
                use_fast=True,
                local_files_only=True,
            )
        except Exception as exc:
            tokenizer_json = os.path.join(model_dir, "tokenizer.json")
            if os.path.exists(tokenizer_json):
                logger.warning(
                    "AutoTokenizer failed (%s). Falling back to DistilBertTokenizerFast with tokenizer.json",
                    exc,
                )
                return DistilBertTokenizerFast(tokenizer_file=tokenizer_json)
            raise RuntimeError(
                f"Unable to load tokenizer from {model_dir}. Ensure tokenizer files are present."
            ) from exc

    @torch.no_grad()
    def predict(self, text: str) -> dict:
        # Minimal cleaning
        text = re.sub(r"http\S+|www\.\S+", "", text)
        text = re.sub(r"\s+", " ", text).strip()

        encoding = self.tokenizer(
            text,
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )
        input_ids = encoding["input_ids"].to(self.device)
        attention_mask = encoding["attention_mask"].to(self.device)

        outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
        probs = torch.softmax(outputs.logits, dim=1).squeeze()

        label = int(torch.argmax(probs).item())
        confidence = float(probs[label].item())

        return {
            "label": label,
            "prediction": "Real" if label == 1 else "Fake",
            "confidence": round(confidence, 4),
        }


class GroqPredictor:
    """LLM fallback using Groq API (Llama) for reasoning-based verification."""

    def __init__(self):
        api_key = settings.GROQ_API_KEY
        self.model_name = settings.GROQ_MODEL
        if api_key:
            self.client = Groq(api_key=api_key)
            logger.info("Groq client initialized with model %s", self.model_name)
        else:
            self.client = None
            logger.warning("No GROQ_API_KEY set — LLM fallback disabled")

    def predict(self, text: str, speaker: str = "", subject: str = "") -> dict:
        if not self.client:
            return {
                "label": -1,
                "prediction": "Unknown",
                "confidence": 0.0,
                "explanation": "Groq API key not configured. Set GROQ_API_KEY in .env",
                "sources": [],
            }

        context_parts = []
        if speaker:
            context_parts.append(f"Speaker: {speaker}")
        if subject:
            context_parts.append(f"Subject: {subject}")
        context_str = ". ".join(context_parts) + "." if context_parts else ""

        prompt = f"""You are a fact-checking expert. Analyze this claim and determine if it is likely TRUE or FALSE.

Claim: "{text}"
{context_str}

Respond in EXACTLY this JSON format and nothing else:
{{
  "verdict": "Real" or "Fake",
  "confidence": a number between 0.5 and 1.0,
    "explanation": "4-6 sentence reasoning that states the key evidence checks you used and why this verdict is more likely",
    "sources": [
        {{
            "website_name": "publisher or website name",
            "article_name": "article headline or source title",
            "category": "news|fact-check|government|science|other"
        }}
    ]
}}"""

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=300,
            )
            raw = response.choices[0].message.content.strip()

            # Parse JSON from response with defensive fallbacks.
            result = self._parse_json_response(raw)

            verdict = result.get("verdict", "Unknown")
            label = 1 if verdict.lower() == "real" else 0
            confidence = float(result.get("confidence", 0.6))
            explanation_raw = result.get("explanation")
            explanation = str(explanation_raw).strip() if explanation_raw is not None else ""
            if not explanation:
                explanation = "No detailed reasoning provided by Groq."
            raw_sources = result.get("sources", [])

            parsed_sources = []
            if isinstance(raw_sources, list):
                for item in raw_sources[:3]:
                    if not isinstance(item, dict):
                        continue
                    parsed_sources.append({
                        "website_name": str(item.get("website_name", "")).strip(),
                        "article_name": str(item.get("article_name", "")).strip(),
                        "category": str(item.get("category", "other")).strip() or "other",
                    })

            return {
                "label": label,
                "prediction": verdict,
                "confidence": round(min(max(confidence, 0.5), 1.0), 4),
                "explanation": explanation,
                "sources": parsed_sources,
            }

        except Exception as e:
            logger.error(f"Groq API error: {e}")
            return {
                "label": -1,
                "prediction": "Unknown",
                "confidence": 0.0,
                "explanation": f"LLM analysis failed: {str(e)}",
                "sources": [],
            }

    def _parse_json_response(self, raw: str) -> dict:
        """
        Robustly parse JSON emitted by LLM responses.
        Handles extra prose, markdown fences, and common trailing-comma issues.
        """
        candidates = []

        # 1) As-is content.
        candidates.append(raw.strip())

        # 2) Remove markdown code fences if present.
        fenced = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
        fenced = re.sub(r"\s*```$", "", fenced)
        candidates.append(fenced.strip())

        # 3) Try extracting the largest {...} block.
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if json_match:
            candidates.append(json_match.group().strip())

        for candidate in candidates:
            if not candidate:
                continue

            # Pass A: direct JSON decode.
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                pass

            # Pass B: remove common trailing commas before } or ] and retry.
            cleaned = re.sub(r",\s*([}\]])", r"\1", candidate)
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                continue

        raise ValueError("Unable to parse Groq JSON response")


class FactForgePipeline:
    """
    Multi-model pipeline:
      1. Baseline (TF-IDF + RF) — best for short political claims
      2. BERT (DistilBERT)      — best for news articles
            3. Groq (Llama LLM)       — fallback + secondary opinion for confident model outputs
    """

    def __init__(self):
        self.threshold = settings.HIGH_CONFIDENCE_THRESHOLD
        logger.info(f"Initializing pipeline (threshold={self.threshold})")

        self.baseline = BaselinePredictor(settings.BASELINE_MODEL_DIR)
        self.bert = BertPredictor(settings.BERT_MODEL_DIR)
        self.groq = GroqPredictor()

        logger.info("Pipeline ready.")

    def verify(self, text: str, speaker: str = "", subject: str = "", context: str = "") -> dict:
        """
        Run the full verification pipeline.
        Returns all model results + final decision.
        """
        result = {
            "baseline": None,
            "bert": None,
            "groq": None,
            "final_label": None,
            "final_prediction": None,
            "final_confidence": None,
            "decided_by": None,
            "explanation": None,
        }

        # ─── Step 1: Baseline model ───
        baseline_res = self.baseline.predict(text, subject=subject, context=context)
        result["baseline"] = baseline_res
        baseline_confident = baseline_res["confidence"] >= self.threshold

        # ─── Step 2: BERT model ───
        bert_res = self.bert.predict(text)
        result["bert"] = bert_res
        bert_confident = bert_res["confidence"] >= self.threshold

        # If baseline and/or BERT are confident, ask Groq as final validator.
        confident_candidates = []
        if baseline_confident:
            confident_candidates.append(("baseline", baseline_res))
        if bert_confident:
            confident_candidates.append(("bert", bert_res))

        if confident_candidates:
            primary_name, primary_res = max(confident_candidates, key=lambda x: x[1]["confidence"])
            groq_res = self.groq.predict(text, speaker=speaker, subject=subject)
            result["groq"] = groq_res

            if groq_res["label"] != -1:
                if groq_res["label"] != primary_res["label"]:
                    result["final_label"] = groq_res["label"]
                    result["final_prediction"] = groq_res["prediction"]
                    result["final_confidence"] = groq_res["confidence"]
                    result["decided_by"] = "groq"
                    groq_reason = groq_res.get("explanation", "")
                    result["explanation"] = (
                        f"{primary_name.capitalize()} was confident but Groq disagreed, so final decision follows Groq: "
                        f"{groq_res['prediction']} ({groq_res['confidence']:.1%} confidence)."
                        + (f"\n\nGroq reasoning: {groq_reason}" if groq_reason else "")
                    )
                else:
                    result["final_label"] = primary_res["label"]
                    result["final_prediction"] = primary_res["prediction"]
                    result["final_confidence"] = primary_res["confidence"]
                    result["decided_by"] = primary_name
                    groq_reason = groq_res.get("explanation", "")
                    result["explanation"] = (
                        f"{primary_name.capitalize()} was confident and Groq confirmed the same verdict. "
                        f"Final decision: {primary_res['prediction']} ({primary_res['confidence']:.1%} confidence)."
                        + (f"\n\nGroq reasoning: {groq_reason}" if groq_reason else "")
                    )
            else:
                result["final_label"] = primary_res["label"]
                result["final_prediction"] = primary_res["prediction"]
                result["final_confidence"] = primary_res["confidence"]
                result["decided_by"] = primary_name
                result["explanation"] = (
                    f"{primary_name.capitalize()} was confident, but Groq was unavailable. "
                    f"Using {primary_name} output: {primary_res['prediction']} ({primary_res['confidence']:.1%} confidence)."
                )

            return result

        # ─── Step 3: LLM Fallback ───
        groq_res = self.groq.predict(text, speaker=speaker, subject=subject)
        result["groq"] = groq_res

        if groq_res["label"] != -1:
            result["final_label"] = groq_res["label"]
            result["final_prediction"] = groq_res["prediction"]
            result["final_confidence"] = groq_res["confidence"]
            result["decided_by"] = "groq"
            groq_reason = groq_res.get("explanation", "")
            result["explanation"] = (
                f"Baseline and BERT were not highly confident, so final decision follows Groq fallback: "
                f"{groq_res['prediction']} ({groq_res['confidence']:.1%} confidence)."
                + (f"\n\nGroq reasoning: {groq_reason}" if groq_reason else "")
            )
        else:
            # All models failed or uncertain — use the most confident one
            candidates = [
                ("baseline", baseline_res),
                ("bert", bert_res),
            ]
            best_name, best_res = max(candidates, key=lambda x: x[1]["confidence"])
            result["final_label"] = best_res["label"]
            result["final_prediction"] = best_res["prediction"]
            result["final_confidence"] = best_res["confidence"]
            result["decided_by"] = best_name
            result["explanation"] = (
                f"No model was highly confident. Best guess from {best_name} "
                f"({best_res['confidence']:.1%} confidence). Treat with caution."
            )

        return result


# ─── Singleton ───
_pipeline: Optional[FactForgePipeline] = None


def get_pipeline() -> FactForgePipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = FactForgePipeline()
    return _pipeline
