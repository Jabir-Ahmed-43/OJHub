import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Users, ListChecks, PlusCircle, Trophy, LayoutGrid } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/admin/users", label: "Manage Users", icon: Users },
  { to: "/admin/problems", label: "Manage Problems", icon: ListChecks },
  { to: "/admin/contests", label: "Manage Contests", icon: Trophy },
  { to: "/admin/problems/new", label: "Add Problem", icon: PlusCircle },
  { to: "/admin/contests/new", label: "Create Contest", icon: PlusCircle },
];

const AdminLayout = () => {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-shrink-0 md:block">
        <div className="sticky top-20 rounded-xl border border-slate-800 bg-slate-900 p-3">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Admin Panel
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-500/10 text-brand-400"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
