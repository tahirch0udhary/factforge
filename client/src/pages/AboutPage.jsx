import PageHeader from "../component/common/PageHeader";

function AboutPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="About FactForge"
        title="Built for trustworthy claim verification"
        description="FactForge helps teams evaluate suspicious statements with explainable AI outputs and a workflow designed for fast decisions under uncertainty."
      />

      <section className="relative overflow-hidden rounded-3xl border border-stone-200 bg-[color:var(--surface)] p-6 shadow-soft fade-in-up md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(42rem_18rem_at_105%_0%,rgba(20,184,166,0.16),transparent_55%),radial-gradient(34rem_16rem_at_-5%_110%,rgba(14,116,144,0.14),transparent_58%)]" />

        <div className="relative grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-800">
              Mission
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-stone-900">
              Make verification fast, transparent, and practical
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-stone-700 md:text-base">
              We designed FactForge to reduce guesswork when claims spread quickly. The platform combines model output, confidence scoring,
              and written reasoning so users can move from raw statements to clear, auditable decisions.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white/80 p-4 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-500">Focus Areas</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">Claim Analysis</span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">Reasoned Explanations</span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">Decision Traceability</span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">Confidence-Aware Workflow</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card fade-in-up stagger-1">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-700">01</p>
          <h3 className="mt-2 font-heading text-xl font-bold text-stone-900">Clarity First</h3>
          <p className="mt-2 text-sm text-stone-600">
            Outputs are presented in plain language so analysts and non-technical stakeholders can interpret results quickly.
          </p>
        </article>

        <article className="card fade-in-up stagger-2">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-700">02</p>
          <h3 className="mt-2 font-heading text-xl font-bold text-stone-900">Human-in-the-Loop</h3>
          <p className="mt-2 text-sm text-stone-600">
            The platform supports review rather than blind automation, helping teams challenge uncertain predictions before action.
          </p>
        </article>

        <article className="card fade-in-up stagger-3">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-700">03</p>
          <h3 className="mt-2 font-heading text-xl font-bold text-stone-900">Operational Ready</h3>
          <p className="mt-2 text-sm text-stone-600">
            Built for day-to-day use with authentication, history tracking, and performance visibility in one connected experience.
          </p>
        </article>
      </section>
    </div>
  );
}

export default AboutPage;
