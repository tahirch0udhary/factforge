function ConfidenceMeter({ score }) {
  const pct = Math.round(score * 100);
  const tone = pct >= 60 ? "bg-emerald-600" : "bg-rose-600";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-semibold text-stone-700">
        <span>Confidence</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full rounded-full transition-all duration-700 ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default ConfidenceMeter;
