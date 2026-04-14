import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";

function StatCard({ label, value, hint }) {
  return (
    <div className="card-surface-static p-4 sm:p-5 border border-emerald-100/90 min-w-[140px] flex-shrink-0 shadow-soft">
      <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] tabular-nums">{value}</p>
      <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">{label}</p>
      {hint ? <p className="text-xs text-slate-400 mt-1">{hint}</p> : null}
    </div>
  );
}

export default function AdminDashboard() {
  const adminUrl = `${apiUrl("/admin/")}`;
  const [overview, setOverview] = useState(null);
  const [overviewErr, setOverviewErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setOverviewErr("");
      const res = await fetch(apiUrl("/api/admin/saas/overview/"), {
        headers: authHeaders({ json: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (!res.ok) {
        setOverviewErr(data.detail || "Could not load overview.");
        return;
      }
      setOverview(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminLayout title="Overview" subtitle="Operations & growth">
      <div className="space-y-8 max-w-5xl">
        {overviewErr ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-950 text-sm px-4 py-3">{overviewErr}</div>
        ) : null}

        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="flex gap-3 sm:gap-4 min-w-min px-1">
            <StatCard
              label="Active users"
              value={overview ? String(overview.total_users) : "…"}
              hint="is_active"
            />
            <StatCard
              label="Verified emails"
              value={overview ? String(overview.verified_email_profiles) : "…"}
              hint="profiles"
            />
            <StatCard
              label="Newsletter list"
              value={overview ? String(overview.newsletter_list_count ?? "0") : "…"}
              hint="mailing list (active)"
            />
            <StatCard
              label="Lead gen list"
              value={overview ? String(overview.lead_gen_list_count ?? "0") : "…"}
              hint="prospects (active)"
            />
            <StatCard
              label="Demo requests (total)"
              value={overview?.demo_leads_total != null ? String(overview.demo_leads_total) : "…"}
              hint="Book a demo"
            />
            <StatCard
              label="Demo requests (7d)"
              value={overview?.demo_leads_last_7_days != null ? String(overview.demo_leads_last_7_days) : "…"}
              hint="recent"
            />
            <StatCard
              label="Documents"
              value={overview?.documents_total != null ? String(overview.documents_total) : "—"}
              hint="all workspaces"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/admin/demo-leads"
            className="card-interactive block rounded-2xl border border-emerald-200 bg-white p-5 sm:p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Demo requests</h2>
            <p className="text-sm text-slate-600 mb-3">
              Landing page “Book a demo” submissions (email + in-app list).
            </p>
            <span className="text-sm font-semibold text-emerald-700">Open →</span>
          </Link>
          <Link
            to="/admin/mailing-lists"
            className="card-interactive block rounded-2xl border border-emerald-200 bg-white p-5 sm:p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Mailing lists</h2>
            <p className="text-sm text-slate-600 mb-3">
              Newsletter subscribers and lead-gen prospects (import, API, Profile sync for newsletter).
            </p>
            <span className="text-sm font-semibold text-emerald-700">Open →</span>
          </Link>
          <Link
            to="/admin/comms"
            className="card-interactive block rounded-2xl border border-emerald-200 bg-white p-5 sm:p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Communications</h2>
            <p className="text-sm text-slate-600 mb-3">
              AI-assisted drafts (OpenRouter), preview, and send to the lists above.
            </p>
            <span className="text-sm font-semibold text-emerald-700">Open →</span>
          </Link>

          <a
            href={adminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-interactive block rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-soft"
          >
            <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Django Admin</h2>
            <p className="text-sm text-slate-600 mb-3">
              Raw models: users, billing intents, and records. Opens in a new tab.
            </p>
            <span className="text-sm font-semibold text-slate-600">Open in new tab →</span>
          </a>
        </div>

        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">Markdown sources on server</h2>
            <p className="text-sm text-slate-600 mb-2">
              Optional files — or generate copy in Communications without editing git. Env overrides:{" "}
              <code className="text-xs bg-white px-1 rounded">PRODUCT_EMAIL_DIGEST_PATH</code>,{" "}
              <code className="text-xs bg-white px-1 rounded">LEAD_GEN_EMAIL_PATH</code>.
            </p>
          </div>
          {overview?.product_email_digest_path ? (
            <p className="text-xs font-mono text-slate-500 break-all bg-white/80 rounded-lg px-3 py-2 border border-emerald-100">
              <strong className="font-sans text-slate-700">Newsletter:</strong> {overview.product_email_digest_path}
              {overview.product_email_digest_file_exists ? (
                <span className="ml-2 text-emerald-700 font-sans font-semibold">(found)</span>
              ) : (
                <span className="ml-2 text-amber-700 font-sans font-semibold">(missing)</span>
              )}
            </p>
          ) : null}
          {overview?.lead_gen_email_path ? (
            <p className="text-xs font-mono text-slate-500 break-all bg-white/80 rounded-lg px-3 py-2 border border-emerald-100">
              <strong className="font-sans text-slate-700">Lead gen:</strong> {overview.lead_gen_email_path}
              {overview.lead_gen_email_file_exists ? (
                <span className="ml-2 text-emerald-700 font-sans font-semibold">(found)</span>
              ) : (
                <span className="ml-2 text-amber-700 font-sans font-semibold">(missing)</span>
              )}
            </p>
          ) : null}
          {!overview?.product_email_digest_path && !overview?.lead_gen_email_path ? (
            <p className="text-sm text-slate-500">Load overview to see paths.</p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-soft">
          <h2 className="text-base font-semibold text-[#0F172A] mb-2">API reference</h2>
          <p className="text-sm text-slate-600">
            REST endpoints live under <code className="text-emerald-800 bg-emerald-50 px-1 rounded">/api/</code>. Staff-only SaaS
            routes are under <code className="text-emerald-800 bg-emerald-50 px-1 rounded">/api/admin/saas/</code>. See{" "}
            <code className="text-slate-700">API_ENDPOINTS.md</code> in the repo.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
