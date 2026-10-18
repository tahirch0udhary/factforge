import { Link } from "react-router-dom";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/verify", label: "Verify" },
  { to: "/review", label: "Review" },
  { to: "/history", label: "History" },
  { to: "/stats", label: "Stats" },
  { to: "/about", label: "About" }
];

function Footer() {
  return (
    <footer className="relative mt-12 border-t border-stone-200/70 bg-[color:var(--surface)]/85 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(217,119,6,0.08),transparent_24%),radial-gradient(circle_at_85%_0%,rgba(15,118,110,0.08),transparent_26%)]" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm text-stone-600 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.9fr] lg:px-8">
        <div className="space-y-3">
          <p className="font-heading text-2xl font-bold text-stone-950">FactForge</p>
          <p className="max-w-md leading-6 text-stone-600">
            A claim verification platform built for transparent decisions, source traceability, and production-ready review workflows.
          </p>
          <p className="text-sm font-semibold text-stone-700">
            Product contact: <a className="text-teal-700 hover:text-teal-800" href="mailto:deeprootcode@gmail.com">deeprootcode@gmail.com</a>
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Quick Links</p>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-xl border border-stone-200/70 bg-white/70 px-3 py-2 text-stone-700 transition hover:border-stone-300 hover:bg-white hover:text-stone-950"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Project Info</p>
          <div className="rounded-2xl border border-stone-200/70 bg-white/70 p-4 shadow-sm">
            <p className="font-semibold text-stone-950">Developed by DeepRootCode</p>
            <p className="mt-2 text-stone-600">Independent project implementation and design system.</p>
            <p className="mt-2 text-stone-600">Built for deployment, monitoring, and traceable review.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
