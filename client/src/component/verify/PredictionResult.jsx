import Badge from "../common/Badge";
import EvidenceTrace from "./EvidenceTrace";

function PredictionResult({ result }) {
  if (!result) {
    return (
      <section className="card fade-in-up stagger-1">
        <p className="text-sm text-stone-500">No prediction yet. Submit a claim to see the result.</p>
      </section>
    );
  }

  const isTrue = result.final_label === 1;
  const explanationText = typeof result.explanation === "string" ? result.explanation : "";
  const reasoningSplit = explanationText.split(/Groq reasoning:\s*/i);
  const summaryExplanation = reasoningSplit[0]?.trim() || "";
  const groqReasoning = (result.groq_reasoning || reasoningSplit[1] || "").trim();

  return (
    <div className="space-y-4 fade-in-up stagger-1">
      <section className="card space-y-4 border-stone-200/80 bg-white/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Prediction Output</p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-stone-950">Final verdict for the submitted claim</h2>
          </div>
          <Badge tone={isTrue ? "success" : "danger"}>{result.final_prediction}</Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Model label</p>
            <p className="mt-2 text-2xl font-bold text-stone-950">{result.final_label}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Decision source</p>
            <p className="mt-2 text-2xl font-bold text-stone-950">{result.decided_by}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Confidence</p>
            <p className="mt-2 text-2xl font-bold text-stone-950">{Math.round((result.final_confidence || 0) * 100)}%</p>
          </div>
        </div>
      </section>

      <EvidenceTrace
        title="Evidence Trace"
        claimText={result.claim_text}
        finalPrediction={result.final_prediction}
        finalLabel={result.final_label}
        finalConfidence={result.final_confidence}
        decidedBy={result.decided_by}
        signals={[
          result.baseline_result ? { name: "Baseline", prediction: result.baseline_result.prediction, confidence: result.baseline_result.confidence, active: result.decided_by === "baseline" } : null,
          result.bert_result ? { name: "BERT", prediction: result.bert_result.prediction, confidence: result.bert_result.confidence, active: result.decided_by === "bert" } : null,
          result.groq_result ? { name: "Groq", prediction: result.groq_result.prediction, confidence: result.groq_result.confidence, active: result.decided_by === "groq" } : null
        ].filter(Boolean)}
        sources={result.trusted_sources || []}
        explanation={summaryExplanation}
        groqReasoning={groqReasoning}
      />
    </div>
  );
}

export default PredictionResult;
