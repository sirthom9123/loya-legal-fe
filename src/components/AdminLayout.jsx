import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { authHeaders } from "../utils/authHeaders.js";
import { clearSessionUser, getSessionUser, persistSessionUser } from "../utils/sessionUser.js";

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => getSessionUser());

  useEffect(() => {
    async function sync() {
      const access = localStorage.getItem("access");
      if (!access) return;
      const res = await fetch("/api/auth/profile/", {
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

  const sideLink = ({ isActive }) =>
    [
      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      isActive ? "bg-white/20 text-white shadow-inner" : "text-brand-100 hover:bg-white/10",
    ].join(" ");

  return (
    <div className="min-h-screen flex bg-brand-950 text-brand-50">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-brand-800 bg-brand-900">
        <div className="p-4 border-b border-brand-800">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-white tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white text-xs font-bold">
              ADM
            </span>
            Admin
          </Link>
          <p className="mt-2 text-xs text-brand-300 truncate">{name}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <NavLink to="/admin/dashboard" className={sideLink} end>
            Overview
          </NavLink>
          <NavLink to="/dashboard" className={sideLink}>
            Client app
          </NavLink>
          <NavLink to="/documents" className={sideLink}>
            Documents
          </NavLink>
          <NavLink to="/profile" className={sideLink}>
            Profile
          </NavLink>
        </nav>
        <div className="p-3 border-t border-brand-800">
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-lg border border-brand-700 px-3 py-2 text-sm font-medium text-brand-100 hover:bg-brand-800"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-brand-800 bg-brand-900/95 backdrop-blur px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden rounded-lg border border-brand-700 p-2 text-white"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen((s) => !s)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white truncate">{title || "Admin"}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-brand-200">
            <span className="hidden sm:inline truncate max-w-[8rem]">{name}</span>
          </div>
        </header>

        {/* Mobile overlay sidebar */}
        {sidebarOpen ? (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="relative w-72 max-w-[85vw] bg-brand-900 border-r border-brand-800 flex flex-col shadow-xl">
              <div className="p-4 border-b border-brand-800 flex justify-between items-center">
                <span className="font-bold text-white">Admin menu</span>
                <button
                  type="button"
                  className="text-brand-300 p-1"
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                <NavLink
                  to="/admin/dashboard"
                  className={sideLink}
                  onClick={() => setSidebarOpen(false)}
                  end
                >
                  Overview
                </NavLink>
                <NavLink to="/dashboard" className={sideLink} onClick={() => setSidebarOpen(false)}>
                  Client app
                </NavLink>
                <NavLink to="/documents" className={sideLink} onClick={() => setSidebarOpen(false)}>
                  Documents
                </NavLink>
              </nav>
            </aside>
          </div>
        ) : null}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
