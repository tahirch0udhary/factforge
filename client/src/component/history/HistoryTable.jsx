import { Fragment, useState } from "react";

import Badge from "../common/Badge";

function deriveStatus(confidence, decidedBy) {
  if ((confidence || 0) >= 0.85) return "approved";
  if ((confidence || 0) >= 0.65 || decidedBy === "groq") return "needs review";
  return "escalated";
}

function HistoryTable({ rows }) {
  const [openClaimId, setOpenClaimId] = useState(null);

  return (
    <section className="card overflow-hidden fade-in-up">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-100/80 text-stone-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Claim</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Prediction</th>
              <th className="px-4 py-3 font-semibold">Confidence</th>
              <th className="px-4 py-3 font-semibold">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isOpen = openClaimId === row.claim_id;
              const explanationText = typeof row.explanation === "string" ? row.explanation : "";
              const reasoningSplit = explanationText.split(/Groq reasoning:\s*/i);
              const summaryExplanation = reasoningSplit[0]?.trim() || "";
              const groqReasoning = (row.groq_reasoning || reasoningSplit[1] || "").trim();
              const status = deriveStatus(row.final_confidence, row.decided_by);
              return (
                <Fragment key={row.claim_id}>
                  <tr className="border-t border-stone-200/70 align-top">
                    <td className="max-w-md px-4 py-3 text-stone-700">
                      <button
                        type="button"
                        className="text-left underline-offset-2 hover:text-teal-700 hover:underline"
                        onClick={() => setOpenClaimId((prev) => (prev === row.claim_id ? null : row.claim_id))}
                      >
                        {row.claim_text}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={status === "approved" ? "success" : status === "needs review" ? "warning" : "danger"}
                      >
                        {status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={row.final_prediction?.toLowerCase() === "real" ? "success" : "danger"}>
                        {row.final_prediction}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-700">{Math.round(row.final_confidence * 100)}%</td>
                    <td className="px-4 py-3 text-stone-500">{new Date(row.submitted_at).toLocaleString()}</td>
                  </tr>

                  {isOpen ? (
                    <tr className="border-t border-stone-100 bg-stone-50/70">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Reasoning</p>
                              <p className="mt-1 text-sm leading-6 text-stone-700">{summaryExplanation || "No explanation available."}</p>
                            </div>

                            {groqReasoning ? (
                              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-3">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Groq reasoning</p>
                                <p className="mt-1 text-sm leading-6 text-teal-950">{groqReasoning}</p>
                              </div>
                            ) : null}
                          </div>

                          <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-3">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Source digest</p>
                            {row.trusted_sources?.length ? (
                              <ul className="space-y-2 text-sm text-stone-700">
                                {row.trusted_sources.map((source) => (
                                  <li key={`${row.claim_id}-${source.source_id}`} className="rounded-xl bg-stone-50 p-3">
                                    <p className="font-semibold text-stone-900">{source.source_name}</p>
                                    <p className="mt-1 text-xs text-stone-600">
                                      {source.category ? `${source.category} · ` : ""}
                                      {source.article_name || "Unknown article"}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-1 text-sm text-stone-500">No sources available for this claim.</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default HistoryTable;
