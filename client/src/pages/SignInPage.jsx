import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthScaffold from "../component/common/AuthScaffold";
import PasswordField from "../component/common/PasswordField";
import { useAuth } from "../context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialLogin = {
  email: "",
  password: ""
};

function SignInPage() {
  const { isAuthenticated, isBootstrapping, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(initialLogin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectPath = useMemo(() => {
    const fallback = "/verify";
    const fromPath = location.state?.from?.pathname;
    if (!fromPath || fromPath === "/signin" || fromPath === "/signup" || fromPath === "/auth") {
      return fallback;
    }
    return fromPath;
  }, [location.state]);

  if (isBootstrapping) {
    return (
      <div className="card fade-in-up">
        <p className="text-sm text-stone-600">Checking session...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await login({ ...form, email });
      setForm(initialLogin);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Sign in with your account to continue."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-semibold text-cyan-700 hover:text-cyan-800">
            Create an account
          </Link>
        </>
      }
    >
      {error ? <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <form className="grid gap-3" onSubmit={handleSubmit}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value.trim().toLowerCase() }))}
          autoComplete="email"
          required
        />
        <PasswordField
          id="signin-password"
          label="Password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          autoComplete="current-password"
        />
        <button className="btn-primary mt-1" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthScaffold>
  );
}

export default SignInPage;
