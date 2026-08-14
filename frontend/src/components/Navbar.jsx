import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Code2, Trophy, ListChecks, LayoutDashboard, ShieldCheck, LogOut, Menu, X, Sun, Moon, Activity, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";



const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystemTheme = (m) => {
        if (m.matches) {
          root.classList.add("dark");
          root.classList.remove("light");
        } else {
          root.classList.add("light");
          root.classList.remove("dark");
        }
      };
      applySystemTheme(media);
      media.addEventListener("change", applySystemTheme);
      return () => media.removeEventListener("change", applySystemTheme);
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const isDarkActive =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDarkActive ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const navLinks = [
    { label: "Problems", to: "/problems", icon: ListChecks },
    { label: "Contests", to: "/contests", icon: Trophy },
    { label: "Blogs", to: "/blogs", icon: BookOpen },
    { label: "Status", to: "/status", icon: Activity },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <Code2 className="h-7 w-7 text-brand-500" />
          <span>
            OJ<span className="text-brand-500">Hub</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(link.to)
                  ? "bg-brand-500/10 text-brand-400"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive("/dashboard")
                  ? "bg-brand-500/10 text-brand-400"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive("/admin")
                  ? "bg-brand-500/10 text-brand-400"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Toggle theme"
          >
            {isDarkActive ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {isAuthenticated ? (
            <>
              <Link to={`/profile/${user.username}`} className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-white">{user.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-rose-500 hover:text-rose-400"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
            >
              Login / Register
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-300 transition"
            title="Toggle theme"
          >
            {isDarkActive ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Admin
              </Link>
            )}
            <div className="mt-2 border-t border-slate-800 pt-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-400 hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" /> Logout ({user.username})
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
