function Badge({ tone = "neutral", children }) {
  const palette = {
    neutral: "bg-stone-100 text-stone-700",
    success: "bg-emerald-100 text-emerald-800",
    danger: "bg-rose-100 text-rose-800",
    warning: "bg-amber-100 text-amber-800",
    info: "bg-cyan-100 text-cyan-800"
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${palette[tone] ?? palette.neutral}`}>
      {children}
    </span>
  );
}

export default Badge;
