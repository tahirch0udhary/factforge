import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Filter, ShieldCheck, TrendingUp } from "lucide-react";
import Badge from "../component/common/Badge";
import PageHeader from "../component/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { getHealth, getHistory } from "../services/factforgeApi";

function credibilityScore(source) {
  const useCount = source.useCount || 0;
  const realRate = source.realRate || 0;
  const avgConfidence = source.avgConfidence || 0;
  const activityScore = Math.min(1, useCount / 6) * 20;
  return Math.round(realRate * 45 + avgConfidence * 35 + activityScore + 20);
}

function AdminSourcesPage() {
  const { user, isAuthenticated } = useAuth();
  const [health, setHealth] = useState(null);
  const [history, setHistory] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [minimumScore, setMinimumScore] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getHealth(), getHistory({ limit: 100 })])
      .then(([healthResponse, historyResponse]) => {
        setHealth(healthResponse);
        setHistory(historyResponse);
      })
      .catch((err) => setError(err.message || "Unable to fetch service health"));
  }, []);

  const sourceProfiles = useMemo(() => {
    const byId = new Map();

    history.forEach((row) => {
      (row.trusted_sources || []).forEach((source) => {
        const existing = byId.get(source.source_id) || {
          ...source,
          useCount: 0,
          realCount: 0,
          confidenceTotal: 0,
          lastSeen: row.submitted_at
        };

        existing.useCount += 1;
        existing.confidenceTotal += row.final_confidence || 0;
        existing.realCount += row.final_prediction?.toLowerCase() === "real" ? 1 : 0;
        existing.lastSeen = existing.lastSeen > row.submitted_at ? existing.lastSeen : row.submitted_at;
        byId.set(source.source_id, existing);
      });
    });

    return Array.from(byId.values())
      .map((source) => {
        const avgConfidence = source.useCount ? source.confidenceTotal / source.useCount : 0;
        const realRate = source.useCount ? source.realCount / source.useCount : 0;
        return {
          ...source,
          avgConfidence,
          realRate,
          credibility: credibilityScore({ ...source, avgConfidence, realRate })
        };
      })
      .filter((source) => categoryFilter === "all" || (source.category || "other") === categoryFilter)
      .filter((source) => source.credibility >= minimumScore)
      .sort((left, right) => right.credibility - left.credibility);
  }, [history, categoryFilter, minimumScore]);

  const categories = useMemo(() => {
    return Array.from(new Set(sourceProfiles.map((source) => source.category || "other")));
  }, [sourceProfiles]);

  const insights = useMemo(() => {
    return {
      totalSources: sourceProfiles.length,
      highCredibility: sourceProfiles.filter((source) => source.credibility >= 75).length,
      needsReview: sourceProfiles.filter((source) => source.credibility < 55).length,
      topCategory: categories[0] || "other"
    };
  }, [sourceProfiles, categories]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Source Intelligence"
        title="Credibility scoring and trusted source filters"
        description="Analyze source usage across your claim history and quickly separate stronger sources from weak ones."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <article className="card border-stone-200/70 bg-white/75">
          <p className="text-sm font-semibold text-stone-500">Tracked sources</p>
          <p className="mt-2 text-3xl font-extrabold text-stone-950">{insights.totalSources}</p>
        </article>
        <article className="card border-stone-200/70 bg-white/75">
          <p className="text-sm font-semibold text-stone-500">High credibility</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-700">{insights.highCredibility}</p>
        </article>
        <article className="card border-stone-200/70 bg-white/75">
          <p className="text-sm font-semibold text-stone-500">Needs review</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-700">{insights.needsReview}</p>
        </article>
        <article className="card border-stone-200/70 bg-white/75">
          <p className="text-sm font-semibold text-stone-500">Top category</p>
          <p className="mt-2 text-3xl font-extrabold text-stone-950 capitalize">{insights.topCategory}</p>
        </article>
      </section>

      <section className="card space-y-4 border-stone-200/70 bg-white/75 fade-in-up">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Filters</p>
            <h2 className="mt-2 font-heading text-xl font-bold text-stone-950">Focus on the sources that matter</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <Filter size={16} />
            <span>Score threshold: {minimumScore}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${categoryFilter === "all" ? "bg-stone-950 text-white" : "bg-stone-100 text-stone-700"}`}
                onClick={() => setCategoryFilter("all")}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${categoryFilter === category ? "bg-stone-950 text-white" : "bg-stone-100 text-stone-700"}`}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="score-range" className="text-sm font-semibold text-stone-700">Minimum credibility score</label>
            <input
              id="score-range"
              type="range"
              min="0"
              max="100"
              step="5"
              value={minimumScore}
              onChange={(event) => setMinimumScore(Number(event.target.value))}
              className="w-full accent-teal-700"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card border-stone-200/70 bg-white/75 fade-in-up">
          <ShieldCheck className="text-teal-700" size={18} />
          <h2 className="mt-3 font-heading text-xl font-bold text-stone-950">Authentication</h2>
        <p className="text-sm text-stone-600">
          Status: <span className="font-semibold">{isAuthenticated ? "Authenticated" : "Not authenticated"}</span>
        </p>
        </article>

      <article className="card space-y-3 border-stone-200/70 bg-white/75 fade-in-up stagger-1">
        <BadgeCheck className="text-amber-700" size={18} />
        <h2 className="font-heading text-xl font-bold text-stone-950">API Health</h2>
        {health ? (
          <>
            <p className="text-sm text-stone-600">Status: <span className="font-semibold">{health.status}</span></p>
            <p className="text-sm text-stone-600">Threshold: <span className="font-semibold">{health.threshold}</span></p>
            <ul className="space-y-1 text-sm text-stone-700">
              <li>Baseline: {health.models?.baseline}</li>
              <li>BERT: {health.models?.bert}</li>
              <li>Groq: {health.models?.groq}</li>
            </ul>
          </>
        ) : (
          <p className="text-sm text-stone-500">Loading health status...</p>
        )}
      </article>

      <article className="card space-y-3 border-stone-200/70 bg-white/75 fade-in-up stagger-2">
        <TrendingUp className="text-stone-900" size={18} />
        <h2 className="font-heading text-xl font-bold text-stone-950">Source quality signal</h2>
        <p className="text-sm text-stone-600">
          Strong sources rise when they repeatedly appear on higher-confidence claims, while weak ones fall as their credibility score drops.
        </p>
      </article>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Source list</p>
            <h2 className="mt-2 font-heading text-xl font-bold text-stone-950">Credibility-ranked sources</h2>
          </div>
          <p className="text-sm text-stone-500">{sourceProfiles.length} matching sources</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {sourceProfiles.length ? (
            sourceProfiles.map((source) => (
              <article key={source.source_id} className="card border-stone-200/70 bg-white/75">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">{source.category || "other"}</p>
                    <h3 className="mt-2 font-heading text-xl font-bold text-stone-950">{source.source_name}</h3>
                  </div>
                  <Badge tone={source.credibility >= 75 ? "success" : source.credibility >= 55 ? "warning" : "danger"}>
                    {source.credibility}/100
                  </Badge>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-stone-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Uses</p>
                    <p className="mt-2 text-lg font-bold text-stone-950">{source.useCount}</p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Real rate</p>
                    <p className="mt-2 text-lg font-bold text-stone-950">{Math.round(source.realRate * 100)}%</p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Avg confidence</p>
                    <p className="mt-2 text-lg font-bold text-stone-950">{Math.round(source.avgConfidence * 100)}%</p>
                  </div>
                </div>

                <div className="mt-4 h-2 rounded-full bg-stone-200">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,#d97706,#0f766e)]"
                    style={{ width: `${source.credibility}%` }}
                  />
                </div>

                {source.article_name ? <p className="mt-3 text-sm text-stone-600">Latest article: {source.article_name}</p> : null}
              </article>
            ))
          ) : (
            <div className="card border-stone-200/70 bg-white/75">
              <p className="text-sm text-stone-600">No sources match the current filters.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminSourcesPage;
