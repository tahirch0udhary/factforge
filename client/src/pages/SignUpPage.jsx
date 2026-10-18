import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthScaffold from "../component/common/AuthScaffold";
import PasswordField from "../component/common/PasswordField";
import { useAuth } from "../context/AuthContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const initialSignup = {
  full_name: "",
  email: "",
  password: ""
};

function SignUpPage() {
  const { isAuthenticated, isBootstrapping, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(initialSignup);
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
    if (!form.full_name.trim()) {
      setError("Full name is required");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!STRONG_PASSWORD_PATTERN.test(form.password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character");
      return;
    }

    setLoading(true);
    try {
      await signup({ ...form, email, full_name: form.full_name.trim() });
      setForm(initialSignup);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold
      title="Create your account"
      subtitle="Use a valid email and a strong password with uppercase, lowercase, number, and special character."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/signin" className="font-semibold text-cyan-700 hover:text-cyan-800">
            Sign in
          </Link>
        </>
      }
    >
      {error ? <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <form className="grid gap-3" onSubmit={handleSubmit}>
        <input
          className="input"
          type="text"
          placeholder="Full name"
          value={form.full_name}
          onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
          autoComplete="name"
          required
        />
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
          id="signup-password"
          label="Password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          autoComplete="new-password"
        />
        <button className="btn-primary mt-1" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthScaffold>
  );
}

export default SignUpPage;
