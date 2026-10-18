import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowUpRight, Clock3, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import PageHeader from "../component/common/PageHeader";
import StatCard from "../component/dashboard/StatCard";
import PerformanceBars from "../component/dashboard/PerformanceBars";
import { useAuth } from "../context/AuthContext";
import { getHistory, getStats } from "../services/factforgeApi";

function confidenceBucket(confidence) {
  if (confidence >= 0.8) return "high";
  if (confidence >= 0.6) return "medium";
  return "low";
}

function formatDay(value) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function StatsPage() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const [stats, setStats] = useState({});
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setStats({});
      setHistory([]);
      return;
    }

    Promise.all([getStats(), getHistory({ limit: 100 })])
      .then(([statsResponse, historyResponse]) => {
        setStats(statsResponse);
        setHistory(historyResponse);
      })
      .catch((err) => setError(err.message || "Unable to fetch stats"));
  }, [isAuthenticated]);

  const derived = useMemo(() => {
    const buckets = { high: 0, medium: 0, low: 0 };
    const decisions = { baseline: 0, bert: 0, groq: 0 };
    const dayMap = new Map();

    history.forEach((row) => {
      buckets[confidenceBucket(row.final_confidence || 0)] += 1;
      decisions[row.decided_by] = (decisions[row.decided_by] || 0) + 1;

      const day = formatDay(row.submitted_at);
      const item = dayMap.get(day) || { label: day, count: 0 };
      item.count += 1;
      dayMap.set(day, item);
    });

    const recentDays = Array.from(dayMap.values()).slice(-7);
    const maxDayCount = Math.max(1, ...recentDays.map((item) => item.count));

    return {
      buckets,
      decisions,
      recentDays,
      maxDayCount,
      highConfidenceRate: history.length ? buckets.high / history.length : 0,
      lowConfidenceRate: history.length ? buckets.low / history.length : 0
    };
  }, [history]);

  if (isBootstrapping) {
    return <p className="text-sm text-stone-600">Checking session...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Model Monitoring"
        title="Performance and operations dashboard"
        description="Monitor quality metrics and serving behavior to quickly detect model drift or latency regressions."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      {!isAuthenticated ? (
        <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-semibold">Sign in to view detailed metrics and operational dashboards.</p>
          <p className="mt-2">Public summaries are available, but full metrics require an authenticated account.</p>
          <Link to="/signin" className="btn-primary mt-3 inline-block">Sign in</Link>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Claims" value={stats.total_claims || 0} change={0} note="all-time" intent="neutral" />
        <StatCard title="Avg Confidence" value={stats.avg_confidence ? `${(stats.avg_confidence * 100).toFixed(1)}%` : "0.0%"} change={0} note="across all predictions" intent="success" />
        <StatCard title="High Confidence" value={`${Math.round((derived.highConfidenceRate || 0) * 100)}%`} change={0} note="claims above 80%" intent="neutral" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <PerformanceBars stats={stats} />

        <section className="card space-y-4 border-stone-200/70 bg-white/75 fade-in-up stagger-1">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Insights</p>
            <h2 className="mt-2 font-heading text-xl font-bold text-stone-950">Operational health snapshot</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <Sparkles className="text-amber-700" size={18} />
              <p className="mt-3 text-sm font-semibold text-stone-950">Confidence mix</p>
              <div className="mt-3 space-y-2 text-sm text-stone-600">
                {Object.entries(derived.buckets).map(([label, value]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between">
                      <span className="capitalize">{label}</span>
                      <span>{history.length ? `${Math.round((value / history.length) * 100)}%` : "0%"}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-stone-200">
                      <div className="h-2 rounded-full bg-[linear-gradient(90deg,#d97706,#0f766e)]" style={{ width: `${history.length ? (value / history.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <TrendingUp className="text-teal-700" size={18} />
              <p className="mt-3 text-sm font-semibold text-stone-950">Decision path mix</p>
              <div className="mt-3 space-y-2 text-sm text-stone-600">
                {Object.entries(derived.decisions).map(([label, value]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between">
                      <span className="capitalize">{label}</span>
                      <span>{history.length ? `${Math.round((value / history.length) * 100)}%` : "0%"}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-stone-200">
                      <div className="h-2 rounded-full bg-stone-950" style={{ width: `${history.length ? (value / history.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock3 className="text-stone-700" size={18} />
                <p className="text-sm font-semibold text-stone-950">Recent activity</p>
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Last 7 tracked days</p>
            </div>

            <div className="mt-4 space-y-3">
              {derived.recentDays.length ? (
                derived.recentDays.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-stone-600">
                      <span>{item.label}</span>
                      <span>{item.count} claims</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-200">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(90deg,#d97706,#0f766e)]"
                        style={{ width: `${(item.count / derived.maxDayCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-500">No recent activity yet.</p>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">High confidence rate</p>
                <p className="mt-2 text-2xl font-bold text-stone-950">{Math.round((derived.highConfidenceRate || 0) * 100)}%</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Low confidence rate</p>
                <p className="mt-2 text-2xl font-bold text-stone-950">{Math.round((derived.lowConfidenceRate || 0) * 100)}%</p>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card border-stone-200/70 bg-white/75 fade-in-up">
          <Activity className="text-teal-700" size={18} />
          <h3 className="mt-3 font-heading text-xl font-bold text-stone-950">Live monitoring</h3>
          <p className="mt-2 text-sm text-stone-600">Use the confidence and decision mix to catch drift before it becomes visible in production.</p>
        </article>
        <article className="card border-stone-200/70 bg-white/75 fade-in-up stagger-1">
          <ShieldCheck className="text-amber-700" size={18} />
          <h3 className="mt-3 font-heading text-xl font-bold text-stone-950">Operational confidence</h3>
          <p className="mt-2 text-sm text-stone-600">High confidence claims can move faster, while weaker ones route to the review queue.</p>
        </article>
        <article className="card border-stone-200/70 bg-white/75 fade-in-up stagger-2">
          <ArrowUpRight className="text-stone-900" size={18} />
          <h3 className="mt-3 font-heading text-xl font-bold text-stone-950">Trend visibility</h3>
          <p className="mt-2 text-sm text-stone-600">Track whether model decisions are becoming more certain over time.</p>
        </article>
      </section>
    </div>
  );
}

export default StatsPage;
