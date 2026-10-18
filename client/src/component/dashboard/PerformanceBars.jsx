function PerformanceBars({ stats }) {
  const total = Math.max(1, stats.total_claims || 0);

  const bars = [
    ["Real Predictions", (stats.real_count || 0) / total],
    ["Fake Predictions", (stats.fake_count || 0) / total],
    ["Decided by Baseline", (stats.decided_by_baseline || 0) / total],
    ["Decided by BERT", (stats.decided_by_bert || 0) / total],
    ["Decided by Groq", (stats.decided_by_groq || 0) / total]
  ];

  return (
    <section className="card space-y-4 border-stone-200/70 bg-white/75 fade-in-up stagger-1">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Distribution</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-stone-950">Prediction and decision mix</h2>
      </div>
      <div className="space-y-3">
        {bars.map(([label, value]) => {
          const normalized = Math.max(0, Math.min(1, value || 0));
          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-sm font-semibold text-stone-600">
                <span>{label}</span>
                <span>{(normalized * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 rounded-full bg-stone-200/80">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#d97706,#0f766e)]"
                  style={{ width: `${normalized * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PerformanceBars;
