import React, { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import FloatingDemoButton from "./FloatingDemoButton.jsx";
import { NomoraeWordmark } from "./BrandMark.jsx";

export default function MarketingLayout({ children, enableDemoButton = true }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const signedIn = useMemo(() => Boolean(localStorage.getItem("access")), []);

  const navItems = [
    { to: "/features", label: "Features" },
    { to: "/solutions", label: "Solutions" },
    { to: "/security", label: "Security" },
    { to: "/pricing", label: "Pricing" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-brand-200/80 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 shrink-0 tracking-tight text-[#0F172A]"
            >
              <NomoraeWordmark className="h-8 w-auto max-w-[160px] sm:h-9 sm:max-w-[200px] object-contain object-left" />
              <span className="font-brand text-base sm:text-lg font-semibold whitespace-nowrap leading-none">
                Nomorae
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? "text-[#0F172A] underline decoration-[#16A34A]/80 underline-offset-4" : ""
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden sm:flex items-center gap-3">
              {signedIn ? (
                <Link
                  to="/dashboard"
                  className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Go to dashboard
                </Link>
              ) : (
                <Link to="/login" className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold">
                  Sign in
                </Link>
              )}
              <Link to="/login" className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold">
                Book a demo
              </Link>
            </div>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-800 shadow-sm hover:bg-white"
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="md:hidden border-t border-brand-200/80 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => (isActive ? "text-[#0F172A] font-semibold" : "text-slate-700")}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="h-px bg-brand-200/80 my-1" />
              {signedIn ? (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-slate-700 font-medium">
                  Go to dashboard
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-slate-700 font-medium">
                  Sign in
                </Link>
              )}
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary rounded-xl px-4 py-2 text-center font-semibold mt-1">
                Book a demo
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <NomoraeWordmark className="h-7 w-auto max-w-[200px] object-contain object-left mb-2" />
              <p className="text-sm text-slate-600 mt-2 max-w-xs">
                Legal work, without the busywork. Built for modern legal teams.
              </p>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">Product</p>
              <div className="mt-2 flex flex-col gap-2">
                <Link to="/features" className="text-slate-600 hover:text-[#16A34A]">
                  Features
                </Link>
                <Link to="/solutions" className="text-slate-600 hover:text-[#16A34A]">
                  Solutions
                </Link>
                <Link to="/security" className="text-slate-600 hover:text-[#16A34A]">
                  Security
                </Link>
              </div>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">Company</p>
              <div className="mt-2 flex flex-col gap-2">
                <Link to="/pricing" className="text-slate-600 hover:text-[#16A34A]">
                  Pricing
                </Link>
                <Link to="/security" className="text-slate-600 hover:text-[#16A34A]">
                  Security
                </Link>
              </div>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">Get started</p>
              <div className="mt-2 flex flex-col gap-2">
                <Link to="/pricing" className="text-slate-600 hover:text-[#16A34A]">
                  Pricing
                </Link>
                <Link to="/login" className="text-slate-600 hover:text-[#16A34A]">
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} Nomorae AI Assistant</span>
            <span className="whitespace-nowrap">SOC2/ISO-ready practices · POPIA-aware</span>
          </div>
        </div>
      </footer>

      {enableDemoButton ? <FloatingDemoButton /> : null}
    </div>
  );
}

