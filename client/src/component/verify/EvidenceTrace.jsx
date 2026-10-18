import Badge from "../common/Badge";
import ConfidenceMeter from "./ConfidenceMeter";

function EvidenceTrace({
  title = "Evidence Trace",
  claimText,
  finalPrediction,
  finalLabel,
  finalConfidence,
  decidedBy,
  signals = [],
  sources = [],
  explanation,
  groqReasoning
}) {
  const isReal = finalLabel === 1 || String(finalPrediction).toLowerCase() === "real";

  return (
    <section className="space-y-4 rounded-2xl border border-stone-200/80 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">{title}</p>
          <h3 className="mt-2 font-heading text-xl font-bold text-stone-950">Decision path and supporting evidence</h3>
        </div>
        <Badge tone={isReal ? "success" : "danger"}>{finalPrediction || "Pending"}</Badge>
      </div>

      {claimText ? <p className="rounded-2xl bg-stone-950 px-4 py-3 text-sm leading-6 text-stone-100">{claimText}</p> : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Final decision</p>
          <p className="mt-2 font-heading text-2xl font-bold text-stone-950">{finalPrediction || "Pending"}</p>
          <p className="mt-1 text-sm text-stone-600">Decided by <span className="font-semibold text-stone-900">{decidedBy || "--"}</span></p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Confidence</p>
          <div className="mt-3">
            <ConfidenceMeter score={finalConfidence || 0} />
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Evidence summary</p>
          <p className="mt-2 text-sm text-stone-600">
            {signals.length ? `${signals.length} model signals captured for this decision.` : "Summary available from the claim record and linked sources."}
          </p>
        </div>
      </div>

      {signals.length ? (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Model signals</p>
          <div className="grid gap-3 md:grid-cols-3">
            {signals.map((signal) => (
              <div key={signal.name} className={`rounded-2xl border p-4 ${signal.active ? "border-teal-200 bg-teal-50" : "border-stone-200 bg-stone-50"}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-stone-900">{signal.name}</p>
                  {signal.active ? <Badge tone="info">Active</Badge> : <Badge tone="neutral">Observed</Badge>}
                </div>
                <p className="mt-2 text-sm text-stone-600">{signal.prediction || "Unavailable"}</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">
                  {typeof signal.confidence === "number" ? `${Math.round(signal.confidence * 100)}% confidence` : "No confidence"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {explanation ? (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Reasoning</p>
          <p className="mt-2 leading-6">{explanation}</p>
        </div>
      ) : null}

      {groqReasoning ? (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">LLM reasoning</p>
          <p className="mt-2 leading-6">{groqReasoning}</p>
        </div>
      ) : null}

      {sources.length ? (
        <div className="space-y-2 rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Sources linked to this claim</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {sources.map((source) => (
              <div key={source.source_id} className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-stone-900">{source.source_name}</p>
                  {source.category ? <Badge tone="neutral">{source.category}</Badge> : null}
                </div>
                {source.article_name ? <p className="mt-1 text-sm text-stone-600">{source.article_name}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default EvidenceTrace;