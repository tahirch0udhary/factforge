import { ArrowDownRight, ArrowUpRight } from "lucide-react";

function StatCard({ title, value, change, intent = "neutral", note }) {
  const tone = {
    success: "text-emerald-700",
    danger: "text-rose-700",
    neutral: "text-stone-700"
  }[intent];

  return (
    <article className="card fade-in-up">
      <p className="text-sm font-semibold text-stone-500">{title}</p>
      <p className="mt-2 text-3xl font-extrabold text-stone-900">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className={`inline-flex items-center gap-1 font-bold ${tone}`}>
          {change >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
          {Math.abs(change)}%
        </span>
        <span className="text-stone-500">{note}</span>
      </div>
    </article>
  );
}

export default StatCard;
