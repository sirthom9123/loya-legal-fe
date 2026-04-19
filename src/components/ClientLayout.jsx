import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { authHeaders } from "../utils/authHeaders.js";
import { getBreadcrumb } from "../utils/breadcrumb.js";
import { clearSessionUser, getSessionUser, persistSessionUser } from "../utils/sessionUser.js";
import { apiUrl } from "../utils/apiUrl.js";
import {
  IconBell,
  IconBilling,
  IconBriefcase,
  IconCalendar,
  IconLayers,
  IconDashboard,
  IconDocuments,
  IconMessages,
  IconPencilSquare,
  IconPlaybook,
  IconScale,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconTable,
  IconTemplate,
  IconUsers,
  IconWorkflow,
  IconFilm,
} from "./Icons.jsx";
import { NomoraeWordmark } from "./BrandMark.jsx";
import UserMenu from "./UserMenu.jsx";
import PlanSelectionModal from "./PlanSelectionModal.jsx";
import PushRegistrationPrompt from "./PushRegistrationPrompt.jsx";

function SidebarNavItem({ to, end, icon: Icon, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-4",
          isActive
            ? "border-[#16A34A] bg-[#DCFCE7] text-[#0F172A] shadow-md"
            : "border-transparent text-slate-700 hover:bg-white/70 hover:shadow-sm",
        ].join(" ")
      }
    >
      <Icon className="h-5 w-5 shrink-0 opacity-90" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function ClientLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
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
  }, [location.pathname]);

  function onLogout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    clearSessionUser();
    navigate("/login", { replace: true });
  }

  const displayName =
    user && [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  const name = displayName || user?.username || "Account";

  const crumbs = getBreadcrumb(location.pathname);
  const closeMobile = () => setSidebarOpen(false);

  const paywallModalOpen = Boolean(
    user?.requires_plan_selection &&
      !user?.workspace_member_only &&
      !location.pathname.startsWith("/billing") &&
      !location.pathname.startsWith("/plans")
  );
  const canAccessBillingSettings = !user?.workspace_member_only;

  function onSearchSubmit(e) {
    e.preventDefault();
    const q = searchQ.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  const sidebarContent = (
    <>
      <div className="px-4 py-5 border-b border-brand-200/80">
        <Link
          to="/dashboard"
          onClick={closeMobile}
          className="flex items-center"
        >
          <NomoraeWordmark className="h-9 w-auto max-w-[220px] object-contain object-left" />
          <span className="font-brand text-base sm:text-lg font-semibold whitespace-nowrap leading-none">
            Nomorae
          </span>
        </Link>
        <p className="mt-3 text-xs font-medium text-slate-600 flex items-center gap-1.5">
          <span aria-hidden>🇿🇦</span> South Africa Region
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        <SidebarNavItem to="/dashboard" end icon={IconDashboard} label="Dashboard" onNavigate={closeMobile} />
        <SidebarNavItem to="/walkthrough" icon={IconFilm} label="Walkthrough" onNavigate={closeMobile} />
        <SidebarNavItem to="/documents" icon={IconDocuments} label="Documents" onNavigate={closeMobile} />
        <SidebarNavItem to="/search" icon={IconSearch} label="Semantic search" onNavigate={closeMobile} />
        <SidebarNavItem to="/assistant" icon={IconSparkles} label="Assistant (RAG)" onNavigate={closeMobile} />
        {/* <SidebarNavItem to="/chat" icon={IconMessages} label="Chat" onNavigate={closeMobile} /> */}
        <SidebarNavItem to="/sa-templates" icon={IconTemplate} label="SA Templates" onNavigate={closeMobile} />
        <SidebarNavItem to="/sa-modules" icon={IconScale} label="Practice Modules" onNavigate={closeMobile} />
        <SidebarNavItem to="/review" icon={IconTable} label="Document Review" onNavigate={closeMobile} />
        <SidebarNavItem to="/drafting" icon={IconPencilSquare} label="Drafting" onNavigate={closeMobile} />
        <SidebarNavItem to="/collaboration" icon={IconUsers} label="Collaboration" onNavigate={closeMobile} />
        <SidebarNavItem to="/cases" icon={IconBriefcase} label="Cases" onNavigate={closeMobile} />
        <SidebarNavItem to="/calendar" icon={IconCalendar} label="Calendar" onNavigate={closeMobile} />
        <SidebarNavItem to="/workflows" icon={IconWorkflow} label="Workflows" onNavigate={closeMobile} />
        <SidebarNavItem to="/playbooks" icon={IconPlaybook} label="Playbooks" onNavigate={closeMobile} />
        {canAccessBillingSettings ? (
          <>
            <SidebarNavItem to="/plans" icon={IconLayers} label="Plans" onNavigate={closeMobile} />
            <SidebarNavItem to="/billing" icon={IconBilling} label="Billing" onNavigate={closeMobile} />
            <SidebarNavItem to="/profile" icon={IconSettings} label="Settings" onNavigate={closeMobile} />
          </>
        ) : null}
        {user?.is_staff ? (
          <NavLink
            to="/admin/dashboard"
            onClick={closeMobile}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold border-l-4 mt-2 transition-all",
                isActive
                  ? "border-emerald-400 bg-emerald-950/80 text-white"
                  : "border-transparent text-emerald-100 hover:bg-white/10",
              ].join(" ")
            }
          >
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white/20">ADM</span>
            Admin
          </NavLink>
        ) : null}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0 border-r border-brand-200/90 bg-gradient-to-b from-white to-[#DCFCE7]/40 shadow-sm">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[min(20rem,88vw)] flex flex-col bg-white shadow-2xl border-r border-brand-100 animate-[slideIn_0.2s_ease-out]">
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      <div className="flex-1 flex flex-col min-w-0 dashboard-shell">
        <header className="glass-header sticky top-0 z-30 border-b border-white/20">
          <div className="flex h-14 sm:h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              className="lg:hidden inline-flex rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-800 shadow-sm hover:bg-white"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <form onSubmit={onSearchSubmit} className="flex-1 max-w-xl min-w-0">
              <label className="relative block">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Semantic search…"
                  className="w-full rounded-xl border border-slate-200/90 bg-white/90 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 shadow-inner focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30"
                />
              </label>
            </form>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  className="relative rounded-xl border border-slate-200 bg-white/90 p-2 text-slate-600 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-[#22C55E]/20"
                  aria-label="Notifications"
                  onClick={() => setNotifOpen((o) => !o)}
                >
                  <IconBell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#16A34A] px-1 text-[10px] font-bold text-white">
                    0
                  </span>
                </button>
                {notifOpen ? (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white py-3 px-4 shadow-xl z-40 text-sm text-slate-600">
                    No new notifications.
                  </div>
                ) : null}
              </div>
              <UserMenu name={name} onLogout={onLogout} />
            </div>
          </div>
        </header>

        <div className="border-b border-slate-200/80 bg-white/50 px-4 sm:px-6 py-2.5">
          <nav className="text-sm text-slate-500 flex flex-wrap items-center gap-x-1 gap-y-1" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center">
                {i > 0 ? <span className="mx-2 text-slate-300">/</span> : null}
                {c.to ? (
                  <Link to={c.to} className="hover:text-[#16A34A] transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-800">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        <main className="flex-1 page-transition px-4 sm:px-6 py-6 sm:py-8 overflow-x-hidden">
          {title ? (
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] mb-6 sm:mb-8 tracking-tight">
              {title}
            </h1>
          ) : null}
          {children}
        </main>

        <footer className="border-t border-slate-200/90 bg-white/60 mt-auto">
          <div className="px-4 sm:px-6 py-3 text-center text-xs text-slate-500">
            Nomorae AI Assistant | Product by Yehuda Solutions · <span className="whitespace-nowrap">🇿🇦 ZAR-ready metrics</span> · Client portal
          </div>
        </footer>
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0.8; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      {paywallModalOpen ? <PlanSelectionModal /> : null}
      <PushRegistrationPrompt />
    </div>
  );
}
