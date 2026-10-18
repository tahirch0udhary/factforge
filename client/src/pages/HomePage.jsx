import { Link } from "react-router-dom";
import { Activity, ArrowRight, Database, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import PageHeader from "../component/common/PageHeader";
import { useAuth } from "../context/AuthContext";

const highlights = [
  {
    icon: Database,
    title: "Multi-dataset Pipeline",
    text: "Supports LIAR + external fake-news corpora with label harmonization for binary classification."
  },
  {
    icon: Activity,
    title: "BERT Inference Ready",
    text: "Frontend aligned with FastAPI endpoints that return label, confidence score, and prediction text."
  },
  {
    icon: ShieldCheck,
    title: "Operational Dashboard",
    text: "Track historical verifications, monitor model performance, and inspect backend health in real time."
  }
];

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="surface-panel relative overflow-hidden p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(217,119,6,0.16),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(15,118,110,0.16),transparent_24%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <p className="eyebrow w-fit">FactForge Platform</p>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-heading text-5xl font-bold tracking-tight text-stone-950 md:text-6xl">
                Verify claims with an interface that feels as sharp as the analysis behind it.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
                A product-style workspace for claim verification, confidence review, and operational oversight. Built for analysts who need fast answers, transparent reasoning, and a clean path from input to decision.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/verify" className="btn-primary">
                    Start Verification <ArrowRight size={16} />
                  </Link>
                  <Link to="/stats" className="btn-secondary">
                    View Model Stats
                  </Link>
                </>
              ) : (
                <Link to="/signin" className="btn-primary">
                  Sign in to Continue <ArrowRight size={16} />
                </Link>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200/70 bg-white/70 p-4 shadow-sm">
                <Sparkles className="text-amber-700" size={18} />
                <p className="mt-3 text-sm font-semibold text-stone-950">Clear verdicts</p>
                <p className="mt-1 text-sm text-stone-600">Readable outcomes and explanations.</p>
              </div>
              <div className="rounded-2xl border border-stone-200/70 bg-white/70 p-4 shadow-sm">
                <TrendingUp className="text-teal-700" size={18} />
                <p className="mt-3 text-sm font-semibold text-stone-950">Live monitoring</p>
                <p className="mt-1 text-sm text-stone-600">Spot drift and confidence shifts early.</p>
              </div>
              <div className="rounded-2xl border border-stone-200/70 bg-white/70 p-4 shadow-sm">
                <ShieldCheck className="text-stone-900" size={18} />
                <p className="mt-3 text-sm font-semibold text-stone-950">Traceable workflow</p>
                <p className="mt-1 text-sm text-stone-600">Audit history for every reviewed claim.</p>
              </div>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-stone-200/70 bg-stone-950 p-6 text-white shadow-2xl shadow-stone-900/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(217,119,6,0.28),transparent_24%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.1),transparent_20%),linear-gradient(180deg,rgba(17,24,39,0.2),rgba(17,24,39,0.05))]" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-400">Current status</p>
                  <h2 className="mt-2 font-heading text-2xl font-bold">Operational overview</h2>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                  Ready
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Decision path</p>
                  <p className="mt-2 text-3xl font-bold">Fast</p>
                  <p className="mt-2 text-sm text-stone-300">Baseline, BERT, and fallback review.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Confidence</p>
                  <p className="mt-2 text-3xl font-bold">Tracked</p>
                  <p className="mt-2 text-sm text-stone-300">Every verdict keeps a score and reason.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center justify-between text-sm text-stone-300">
                  <span>Workflow</span>
                  <span>Claim - Analyze - Explain</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-4/5 rounded-full bg-[linear-gradient(90deg,#d97706,#0f766e)]" />
                </div>
                <p className="mt-3 text-sm text-stone-300">
                  Designed for quick triage now, with room for source scoring, reviewer collaboration, and release-ready auditability later.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item, index) => (
          <article key={item.title} className={`card fade-in-up stagger-${Math.min(index + 1, 3)} border-stone-200/70 bg-white/75`}>
            <item.icon className="text-teal-700" />
            <h2 className="mt-3 font-heading text-xl font-bold text-stone-950">{item.title}</h2>
            <p className="mt-2 text-sm text-stone-600">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="card grid gap-5 border-stone-200/70 bg-white/75 fade-in-up md:grid-cols-2">
        <div>
          <p className="eyebrow w-fit">Project Scope</p>
          <h2 className="mt-3 font-heading text-2xl font-bold text-stone-950">From claim input to evidence-backed decision</h2>
          <p className="mt-2 text-stone-600">
            FactForge combines transformer-based prediction with operational endpoints for authentication, history, performance tracking, and model health checks.
          </p>
        </div>
        <div className="rounded-[1.75rem] bg-stone-950 p-4 text-sm text-white shadow-lg shadow-stone-900/20">
          <p className="font-semibold text-white">Access flow</p>
          <p className="mt-2">
            Sign in to unlock verification, personal history, and live model analytics. Anonymous users can explore the platform overview on this page.
          </p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
