import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SubscriptionBanner({ user }) {
  if (!user || user.is_staff) return null;
  const tier = user.plan_tier;
  if (tier === "free_trial" && user.trial_ends_at) {
    const end = new Date(user.trial_ends_at);
    if (!Number.isNaN(end.getTime()) && end > new Date()) {
      return (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-emerald-950">
            <strong className="font-semibold">Free trial active</strong> until {end.toLocaleString()}. Explore AI features,
            then pick a plan on Billing.
          </div>
          <Link
            to="/billing"
            className="shrink-0 rounded-lg bg-white border border-emerald-400 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors"
          >
            View billing
          </Link>
        </div>
      );
    }
  }
  if (tier === "free") {
    const needsPlan = Boolean(user.requires_plan_selection);
    return (
      <div
        className={
          needsPlan
            ? "rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm"
            : "rounded-xl border border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm"
        }
      >
        <div className={`text-sm ${needsPlan ? "text-amber-950" : "text-slate-700"}`}>
          {needsPlan ? (
            <>
              Your trial has ended. <span className="font-semibold">Choose a plan</span> to continue using the app, or
              open Billing for PayFast checkout.
            </>
          ) : (
            <>
              You are on the <span className="font-semibold">Free</span> plan. Upgrade for higher limits and AI credits.
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {needsPlan ? (
            <Link
              to="/plans"
              className="rounded-lg bg-[#16A34A] text-white px-3 py-1.5 text-xs font-semibold hover:bg-[#15803d] transition-colors"
            >
              View plans
            </Link>
          ) : null}
          <Link
            to="/billing"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            Billing
          </Link>
        </div>
      </div>
    );
  }
  return null;
}
import ClientLayout from "../components/ClientLayout.jsx";
import { DashboardSkeleton } from "../components/Skeleton.jsx";
import { persistSessionUser } from "../utils/sessionUser.js";
import { getAiActivity } from "../utils/aiActivity.js";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";

function EmailVerificationBanner() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [devVerificationLink, setDevVerificationLink] = useState("");

  async function resend() {
    setSending(true);
    setBannerError("");
    setDevVerificationLink("");
    try {
      const res = await fetch(apiUrl("/api/auth/verify-email/resend/"), {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
        if (typeof data.verification_link === "string" && data.verification_link) {
          setDevVerificationLink(data.verification_link);
        }
      } else {
        setBannerError(data.detail || "Failed to resend.");
      }
    } catch {
      setBannerError("Network error.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-amber-900">
          <strong className="font-semibold">Email not verified.</strong>{" "}
          {sent
            ? "Verification email sent — check your inbox."
            : "Please verify your email address to unlock all features."}
          {bannerError ? <span className="text-red-600 ml-2">{bannerError}</span> : null}
        </div>
        {!sent ? (
          <button
            type="button"
            onClick={resend}
            disabled={sending}
            className="shrink-0 rounded-lg bg-white border border-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            {sending ? "Sending…" : "Resend verification email"}
          </button>
        ) : null}
      </div>
      {sent && devVerificationLink ? (
        <p className="text-xs text-amber-950/90 break-all">
          Local/dev link (open in this browser):{" "}
          <a href={devVerificationLink} className="font-medium underline">
            Verify email
          </a>
        </p>
      ) : null}
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [activity] = useState(() => getAiActivity());

  useEffect(() => {
    async function loadProfile() {
      const access = localStorage.getItem("access");
      if (!access) {
        navigate("/login", { replace: true });
        return;
      }

      const res = await fetch(apiUrl("/api/auth/profile/"), {
        headers: { Authorization: `Bearer ${access}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setError(data?.detail || "Session expired");
        navigate("/login", { replace: true });
        return;
      }

      if (data.user) {
        persistSessionUser(data.user);
        setUser(data.user);
      }
    }

    loadProfile();
  }, [navigate]);

  const displayName =
    user && [user.first_name, user.last_name].filter(Boolean).join(" ").trim();

  return (
    <ClientLayout title="Dashboard">
      {!user && !error ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-8">
          {error ? (
            <p className="text-red-600 text-sm rounded-xl bg-red-50 border border-red-100 px-4 py-3">{error}</p>
          ) : null}

          {user ? (
            <>
              {user.email && user.email_verified === false ? (
                <EmailVerificationBanner />
              ) : null}

              <SubscriptionBanner user={user} />

              <div className="card-surface-static p-5 sm:p-6 border-l-4 border-l-[#16A34A]">
                <p className="text-lg text-[#0F172A]">
                  Welcome back,{" "}
                  <span className="font-semibold text-[#16A34A]">{displayName || user.username}</span>
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Manage documents, workflows, and AI-assisted review from one place.
                </p>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">Quick access</h2>
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      to: "/documents",
                      emoji: "📄",
                      title: "Documents",
                      desc: "Upload, ingest, and open matter files.",
                      cta: "Open",
                      variant: "primary",
                    },
                    // {
                    //   to: "/chat",
                    //   emoji: "💬",
                    //   title: "Chat",
                    //   desc: "Multi-turn chat with history; model follows your plan tier.",
                    //   cta: "Open chat",
                    //   variant: "secondary",
                    // },
                    {
                      to: "/workflows",
                      emoji: "⚡",
                      title: "Workflows",
                      desc: "Plan and run multi-step legal workflows.",
                      cta: "Open workflows",
                      variant: "secondary",
                    },
                    {
                      to: "/playbooks",
                      emoji: "📋",
                      title: "Playbooks",
                      desc: "Compliance rules and AI checks against contracts.",
                      cta: "Open playbooks",
                      variant: "secondary",
                    },
                    {
                      to: "/assistant#research",
                      emoji: "⚖️",
                      title: "Research",
                      desc: "Legal research with internal + SA sources & citations.",
                      cta: "Open research",
                      variant: "secondary",
                    },
                    {
                      to: "/review",
                      emoji: "📊",
                      title: "Tabular review",
                      desc: "Batch documents × AI columns; export results.",
                      cta: "Open review",
                      variant: "secondary",
                    },
                    {
                      to: "/collaboration",
                      emoji: "🤝",
                      title: "Client portal",
                      desc: "Workspaces, invites, shared docs & activity.",
                      cta: "Open portal",
                      variant: "secondary",
                    },
                    {
                      to: "/practice",
                      emoji: "🧾",
                      title: "Practice",
                      desc: "Time tracking, clients, matters, invoices & comms.",
                      cta: "Open practice",
                      variant: "secondary",
                    },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="card-surface card-interactive block p-5 sm:p-6 group"
                    >
                      <span className="text-3xl" aria-hidden>
                        {item.emoji}
                      </span>
                      <h3 className="mt-3 text-lg font-semibold text-[#0F172A] group-hover:text-[#16A34A] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                      <div className="mt-4">
                        <span
                          className={
                            item.variant === "primary"
                              ? "btn-primary text-xs py-2 px-3 pointer-events-none"
                              : "btn-secondary text-xs py-2 px-3 pointer-events-none border-[#16A34A]/40 text-[#16A34A]"
                          }
                        >
                          {item.cta}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">More tools</h2>
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  <Link to="/assistant" className="card-surface card-interactive block p-5 sm:p-6 group">
                    <span className="text-3xl" aria-hidden>
                      ✨
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-[#0F172A] group-hover:text-[#16A34A] transition-colors">
                      Assistant (RAG)
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">Q&A grounded in your ingested documents.</p>
                    <div className="mt-4">
                      <span className="btn-secondary text-xs py-2 px-3 pointer-events-none border-[#16A34A]/40 text-[#16A34A]">
                        Open assistant
                      </span>
                    </div>
                  </Link>

                  <Link to="/search" className="card-surface card-interactive block p-5 sm:p-6 group">
                    <span className="text-3xl" aria-hidden>
                      🔍
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-[#0F172A] group-hover:text-[#16A34A] transition-colors">
                      Semantic search
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">Vector search across your library.</p>
                    <div className="mt-4">
                      <span className="btn-secondary text-xs py-2 px-3 pointer-events-none border-[#16A34A]/40 text-[#16A34A]">
                        Open search
                      </span>
                    </div>
                  </Link>

                  <Link to="/drafting" className="card-surface card-interactive block p-5 sm:p-6 group">
                    <span className="text-3xl" aria-hidden>
                      ✍️
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-[#0F172A] group-hover:text-[#16A34A] transition-colors">
                      Drafting
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">Templates, playbooks, and redlines.</p>
                    <div className="mt-4">
                      <span className="btn-secondary text-xs py-2 px-3 pointer-events-none border-[#16A34A]/40 text-[#16A34A]">
                        Open drafting
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/profile"
                    className="card-surface card-interactive block p-5 sm:p-6 group sm:col-span-2 xl:col-span-1"
                  >
                    <span className="text-3xl" aria-hidden>
                      👤
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-[#0F172A] group-hover:text-[#16A34A] transition-colors">
                      Profile
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">Account security and preferences.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="btn-secondary text-xs py-2 px-3 pointer-events-none border-[#16A34A]/40 text-[#16A34A]">
                        Edit profile
                      </span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="card-surface-static p-5 sm:p-6">
                <h2 className="text-base font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                  <span className="text-xl" aria-hidden>
                    🤖
                  </span>
                  Recent AI activity
                </h2>
                <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {activity.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-3 rounded-xl bg-[#F8FAFC] border border-slate-100 px-3 py-2.5 text-sm"
                    >
                      <span
                        className={
                          item.type === "query"
                            ? "text-[#16A34A] font-medium shrink-0"
                            : item.type === "chat"
                              ? "text-sky-600 font-medium shrink-0"
                              : "text-violet-600 font-medium shrink-0"
                        }
                      >
                        {item.type === "query" ? "Q" : item.type === "chat" ? "C" : "∑"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-slate-800 break-words">{item.text}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.at ? new Date(item.at).toLocaleString() : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-500 mt-3">
                  Search, RAG actions append here automatically.
                </p>
              </div>
            </>
          ) : null}
        </div>
      )}
    </ClientLayout>
  );
}
