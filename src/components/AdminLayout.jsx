import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { authHeaders } from "../utils/authHeaders.js";
import { clearSessionUser, getSessionUser, persistSessionUser } from "../utils/sessionUser.js";
import { apiUrl } from "../utils/apiUrl.js";

function NavItem({ to, end, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-4",
          isActive
            ? "border-[#16A34A] bg-[#DCFCE7] text-[#0F172A] shadow-sm"
            : "border-transparent text-slate-700 hover:bg-white/80 hover:shadow-sm",
        ].join(" ")
      }
    >
      <span>{label}</span>
    </NavLink>
  );
}

export default function AdminLayout({ children, title, subtitle }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => getSessionUser());

  useEffect(() => {
    async function sync() {
      const access = localStorage.getItem("access");
      if (!access) return;
      const res = await fetch(apiUrl("/api/auth/profile/"), {
        headers: authHeaders({ json: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        persistSessionUser(data.user);
        setUser(data.user);
      }
    }
    sync();
  }, []);

  function onLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    clearSessionUser();
    navigate("/login", { replace: true });
  }

  const displayName =
    user && [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  const name = displayName || user?.username || "Admin";
  const closeMobile = () => setSidebarOpen(false);

  const side = (
    <>
      <div className="p-4 border-b border-emerald-100/80">
        <Link to="/admin/dashboard" className="flex items-center gap-3 font-bold text-[#0F172A] tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#15803D] text-white text-xs font-bold shadow-md">
            NR
          </span>
          <span>
            SaaS admin
            <span className="block text-xs font-normal text-slate-500">Nomorae</span>
          </span>
        </Link>
        <p className="mt-3 text-xs text-slate-500 truncate">{name}</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <NavItem to="/admin/dashboard" end label="Overview" onNavigate={closeMobile} />
        <NavItem to="/admin/comms" label="Communications" onNavigate={closeMobile} />
        <NavItem to="/admin/mailing-lists" label="Mailing lists" onNavigate={closeMobile} />
        <NavItem to="/admin/demo-leads" label="Demo requests" onNavigate={closeMobile} />
        <div className="pt-3 mt-3 border-t border-slate-100">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Product</p>
          <NavItem to="/dashboard" label="Client app" onNavigate={closeMobile} />
          <NavItem to="/documents" label="Documents" onNavigate={closeMobile} />
          <NavItem to="/profile" label="Profile" onNavigate={closeMobile} />
        </div>
      </nav>
      <div className="p-3 border-t border-emerald-100/80">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex dashboard-shell text-slate-900">
      <aside className="hidden lg:flex w-64 flex-col border-r border-emerald-100/90 bg-white/90 backdrop-blur-sm shadow-sm">
        {side}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <header className="sticky top-0 z-30 glass-header flex items-center justify-between gap-3 px-4 py-3 lg:px-8 border-b border-emerald-100/80">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden rounded-xl border border-emerald-200 bg-white p-2 text-slate-800 shadow-sm"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen((s) => !s)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-[#0F172A] truncate">{title || "Admin"}</h1>
              {subtitle ? <p className="text-xs text-slate-500 truncate">{subtitle}</p> : null}
            </div>
          </div>
          <span className="hidden sm:inline text-xs text-slate-500 truncate max-w-[10rem]">{name}</span>
        </header>

        {sidebarOpen ? (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="relative w-72 max-w-[85vw] bg-white border-r border-emerald-100 flex flex-col min-h-0 shadow-xl rounded-r-2xl overflow-hidden">
              {side}
            </aside>
          </div>
        ) : null}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto page-transition">{children}</main>
      </div>
    </div>
  );
}
