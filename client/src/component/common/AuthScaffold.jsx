import { LockKeyhole, Sparkles } from "lucide-react";

function AuthScaffold({ title, subtitle, children, footer }) {
  return (
    <section className="surface-panel relative overflow-hidden p-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_10%_-10%,rgba(217,119,6,0.14),transparent_55%),radial-gradient(46rem_24rem_at_100%_120%,rgba(15,118,110,0.16),transparent_55%)]" />

      <div className="relative grid gap-6 p-5 md:grid-cols-[1fr_1.1fr] md:gap-10 md:p-10">
        <aside className="rounded-[1.75rem] border border-amber-100 bg-[linear-gradient(180deg,rgba(255,250,240,0.95),rgba(255,241,214,0.7))] p-6 fade-in-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-amber-800">
            <Sparkles size={14} />
            FactForge Access
          </p>
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-stone-950">
            Secure access for claim verification workflows
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-700">
            Authentication unlocks personal history, model analytics, protected verification APIs, and trusted review workflows.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-stone-600">
            <div className="rounded-2xl bg-white/80 px-3 py-4 shadow-sm">
              <p className="font-heading text-lg font-bold text-stone-950">24/7</p>
              <p className="mt-1">Access</p>
            </div>
            <div className="rounded-2xl bg-white/80 px-3 py-4 shadow-sm">
              <p className="font-heading text-lg font-bold text-stone-950">AI</p>
              <p className="mt-1">Review</p>
            </div>
            <div className="rounded-2xl bg-white/80 px-3 py-4 shadow-sm">
              <p className="font-heading text-lg font-bold text-stone-950">Logs</p>
              <p className="mt-1">Tracked</p>
            </div>
          </div>
        </aside>

        <div className="card fade-in-up stagger-1 border-stone-200/80 bg-white/80">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-bold text-stone-950">{title}</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold text-white">
              <LockKeyhole size={14} />
              Secure Session
            </span>
          </div>

          {subtitle ? <p className="mb-5 text-sm text-stone-600">{subtitle}</p> : null}

          {children}

          {footer ? <div className="mt-4 border-t border-stone-200 pt-4 text-sm text-stone-600">{footer}</div> : null}
        </div>
      </div>
    </section>
  );
}

export default AuthScaffold;
