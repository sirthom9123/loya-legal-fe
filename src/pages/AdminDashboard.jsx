import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";

const djangoOrigin =
  import.meta.env.VITE_DJANGO_ORIGIN || `${window.location.protocol}//${window.location.hostname}:8000`;

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="rounded-2xl border border-brand-700 bg-gradient-to-br from-brand-900/90 to-brand-950 p-4 sm:p-5 min-w-[140px] flex-shrink-0 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl opacity-90" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl sm:text-3xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs sm:text-sm text-brand-200 font-medium">{label}</p>
      {sub ? <p className="text-xs text-brand-400 mt-1">{sub}</p> : null}
    </div>
  );
}

export default function AdminDashboard() {
  const adminUrl = `${djangoOrigin.replace(/\/$/, "")}/admin/`;
  const [docCount, setDocCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(apiUrl("/api/ai/documents/?page_size=1"), {
        headers: authHeaders({ json: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!cancelled && res.ok) setDocCount(typeof data.count === "number" ? data.count : 0);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminLayout title="Overview">
      <div className="space-y-8">
        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="flex gap-3 sm:gap-4 min-w-min px-1">
            <StatCard
              icon="📂"
              label="Total documents"
              value={docCount === null ? "…" : String(docCount)}
              sub="Your workspace"
            />
            <StatCard icon="⚡" label="Active workflows" value="0" sub="Coming soon" />
            <StatCard icon="🤖" label="AI queries today" value="—" sub="Token log TBD" />
            <StatCard icon="💾" label="Storage used" value="—" sub="Local media (est.)" />
          </div>
        </div>

        <p className="text-brand-200 text-sm sm:text-base">
          Staff tools and monitoring. Set{" "}
          <code className="rounded bg-brand-800 px-1.5 py-0.5 text-xs text-brand-100">VITE_DJANGO_ORIGIN</code> if the
          admin URL differs from this dev origin.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href={adminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-brand-700 bg-brand-900/80 p-5 sm:p-6 hover:border-brand-500 transition-all hover:shadow-lg hover:shadow-brand-900/50"
          >
            <h2 className="text-lg font-semibold text-white mb-2">Django Admin</h2>
            <p className="text-sm text-brand-300 mb-3">
              Users, documents, and system records in the default Django admin.
            </p>
            <span className="text-sm font-medium text-brand-400">Open in new tab →</span>
          </a>

          <div className="rounded-2xl border border-brand-700 bg-brand-900/50 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-2">API</h2>
            <p className="text-sm text-brand-300">
              REST endpoints are under <code className="text-brand-100">/api/</code>. See{" "}
              <code className="text-brand-100">API_ENDPOINTS.md</code> in the repo for the catalog.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-brand-700 bg-brand-900/30 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-brand-100 mb-2">Coming next</h2>
          <ul className="text-sm text-brand-300 space-y-2 list-disc list-inside">
            <li>Usage / token metrics from <code className="text-brand-200">TokenUsageLog</code></li>
            <li>User & document stats (system-wide)</li>
            <li>WhatsApp webhook health</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
