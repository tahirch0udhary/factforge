import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="mx-auto mt-24 max-w-lg text-center">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-700">404</p>
      <h1 className="mt-2 font-heading text-4xl font-bold text-stone-900">Page not found</h1>
      <p className="mt-3 text-stone-600">The page you requested does not exist in the FactForge frontend routes.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
