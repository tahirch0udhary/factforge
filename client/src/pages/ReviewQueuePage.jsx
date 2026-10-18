import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Flag, Layers3, ShieldAlert, ShieldCheck } from "lucide-react";
import Badge from "../component/common/Badge";
import EvidenceTrace from "../component/verify/EvidenceTrace";
import PageHeader from "../component/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { getHistory } from "../services/factforgeApi";

const STATUS_OPTIONS = ["all", "approved", "needs review", "escalated"];

function deriveStatus(row) {
  const confidence = row.final_confidence || 0;
  if (confidence >= 0.85) return "approved";
  if (confidence >= 0.65 || row.decided_by === "groq") return "needs review";
  return "escalated";
}

function statusTone(status) {
  if (status === "approved") return "success";
  if (status === "needs review") return "warning";
  return "danger";
}

function ReviewQueuePage() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  
  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setRows([]);
      return;
    }

    getHistory({ limit: 100 })
      .then(setRows)
      .catch((err) => setError(err.message || "Unable to load review queue"));
  }, [isAuthenticated]);

  const queue = useMemo(() => {
    return rows
      .map((row, index) => ({ ...row, review_status: deriveStatus(row), priority: 100 - Math.round((row.final_confidence || 0) * 100) + index }))
      .filter((row) => statusFilter === "all" || row.review_status === statusFilter)
      .sort((left, right) => left.priority - right.priority);
  }, [rows, statusFilter]);

  const totals = useMemo(() => {
    return queue.reduce(
      (acc, row) => {
        acc[row.review_status] += 1;
        return acc;
      },
      { approved: 0, "needs review": 0, escalated: 0 }
    );
  }, [queue]);

  if (isBootstrapping) {
    return <p className="text-sm text-stone-600">Checking session...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Review Queue"
        title="Prioritize claims that need a human look"
        description="Queue items are ranked by confidence and decision source so the most uncertain claims surface first."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      {!isAuthenticated ? (
        <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">Sign in to access the review queue and triage items.</p>
          <p className="mt-2">Public demo entries are visible, but full review tools require authentication.</p>
          <Link to="/signin" className="btn-primary mt-3 inline-block">Sign in</Link>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <article className="card border-stone-200/70 bg-white/75">
          <p className="text-sm font-semibold text-stone-500">Queued</p>
          <p className="mt-2 text-3xl font-extrabold text-stone-950">{queue.length}</p>
        </article>
        <article className="card border-stone-200/70 bg-white/75">
          <p className="text-sm font-semibold text-stone-500">Approved</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{totals.approved}</p>
        </article>
        <article className="card border-stone-200/70 bg-white/75">
          <p className="text-sm font-semibold text-stone-500">Needs review</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-700">{totals["needs review"]}</p>
        </article>
        <article className="card border-stone-200/70 bg-white/75">
          <p className="text-sm font-semibold text-stone-500">Escalated</p>
          <p className="mt-2 text-3xl font-extrabold text-rose-700">{totals.escalated}</p>
        </article>
      </section>

      <section className="card space-y-4 border-stone-200/70 bg-white/75">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Filter</p>
            <h2 className="mt-2 font-heading text-xl font-bold text-stone-950">Queue status</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === status ? "bg-stone-950 text-white" : "bg-white text-stone-700 hover:bg-stone-100"
                }`}
              >
                {status === "all" ? "All" : status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <Filter className="text-teal-700" size={18} />
            <p className="mt-3 text-sm font-semibold text-stone-950">Confidence-first ordering</p>
            <p className="mt-1 text-sm text-stone-600">Lower confidence claims appear earlier in the queue.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <Layers3 className="text-amber-700" size={18} />
            <p className="mt-3 text-sm font-semibold text-stone-950">Three-level status model</p>
            <p className="mt-1 text-sm text-stone-600">Approved, needs review, and escalated keep triage simple.</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <ShieldAlert className="text-rose-700" size={18} />
            <p className="mt-3 text-sm font-semibold text-stone-950">Uncertain claims first</p>
            <p className="mt-1 text-sm text-stone-600">Groq-led or low-confidence verdicts are highlighted.</p>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {queue.map((row) => (
          <article key={row.claim_id} className="card border-stone-200/70 bg-white/75">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge tone={statusTone(row.review_status)}>{row.review_status}</Badge>
                <p className="text-sm text-stone-500">Claim #{row.claim_id}</p>
              </div>
              <p className="text-sm text-stone-500">{new Date(row.submitted_at).toLocaleString()}</p>
            </div>

            <p className="mt-3 text-lg font-semibold text-stone-950">{row.claim_text}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Verdict</p>
                <p className="mt-2 text-sm font-semibold text-stone-950">{row.final_prediction}</p>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Confidence</p>
                <p className="mt-2 text-sm font-semibold text-stone-950">{Math.round((row.final_confidence || 0) * 100)}%</p>
              </div>
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Decision source</p>
                <p className="mt-2 text-sm font-semibold text-stone-950">{row.decided_by}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <EvidenceTrace
                title="Claim trace"
                claimText={row.claim_text}
                finalPrediction={row.final_prediction}
                finalLabel={row.final_prediction?.toLowerCase() === "real" ? 1 : 0}
                finalConfidence={row.final_confidence}
                decidedBy={row.decided_by}
                explanation={row.explanation}
                groqReasoning={row.groq_reasoning}
                sources={row.trusted_sources || []}
              />

              <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Review notes</p>
                <p className="text-sm text-stone-700">
                  {row.review_status === "approved"
                    ? "This claim is stable enough for quick confirmation."
                    : row.review_status === "needs review"
                      ? "Needs a short human pass to validate the supporting evidence."
                      : "Escalate this claim for a deeper review because the model confidence is low."}
                </p>
                <div className="rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">Priority</span>
                    <span className="font-semibold text-stone-950">{row.priority}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-stone-200">
                    <div
                      className="h-2 rounded-full bg-[linear-gradient(90deg,#d97706,#0f766e)]"
                      style={{ width: `${Math.max(18, 100 - (row.final_confidence || 0) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default ReviewQueuePage;