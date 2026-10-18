import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, SearchCheck, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const authedNavItems = [
  { to: "/", label: "Home" },
  { to: "/verify", label: "Verify" },
  { to: "/review", label: "Review" },
  { to: "/history", label: "History" },
  { to: "/stats", label: "Stats" },
  { to: "/about", label: "About" }
];

const guestNavItems = [
  { to: "/", label: "Home" },
  { to: "/verify", label: "Verify" },
  { to: "/review", label: "Review" },
  { to: "/history", label: "History" },
  { to: "/stats", label: "Stats" },
  { to: "/about", label: "About" }
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navItems = isAuthenticated ? authedNavItems : guestNavItems;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[color:var(--surface)]/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="rounded-2xl bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] p-2 text-white shadow-lg shadow-teal-950/20">
            <SearchCheck size={18} />
          </span>
          <div>
            <p className="font-heading text-lg font-bold leading-none text-stone-950">FactForge</p>
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Claim intelligence platform</p>
          </div>
        </Link>

        <button
          className="btn-secondary md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-stone-950 text-white shadow-md shadow-stone-900/20"
                    : "text-stone-600 hover:bg-white/80 hover:text-stone-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <span className="px-2 text-xs font-semibold text-stone-500">{user.full_name}</span>
              <button type="button" className="btn-secondary" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/signin"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-stone-950 text-white shadow-md shadow-stone-900/20"
                    : "text-stone-600 hover:bg-white/80 hover:text-stone-900"
                }`
              }
            >
              Sign in
            </NavLink>
          )}
        </nav>
      </div>

      {menuOpen && (
        <nav className="mx-4 mb-3 space-y-1 rounded-2xl border border-stone-200/70 bg-[color:var(--surface)] p-2 shadow-soft md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-stone-950 text-white" : "text-stone-700 hover:bg-white/80"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-stone-700 hover:bg-white/80"
            >
              Logout
            </button>
          ) : (
            <NavLink
              to="/signin"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-stone-950 text-white" : "text-stone-700 hover:bg-white/80"
                }`
              }
            >
              Sign in
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}

export default Navbar;
