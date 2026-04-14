import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";

export default function AdminDemoLeads() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr("");
      setLoading(true);
      const res = await fetch(apiUrl("/api/admin/saas/demo-leads/?limit=100"), {
        headers: authHeaders({ json: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (!res.ok) {
        setErr(data.detail || "Could not load demo requests.");
        setRows([]);
      } else {
        setRows(data.results || []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminLayout title="Demo requests" subtitle="Landing page — Book a demo">
      <div className="space-y-4 max-w-5xl">
        {err ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-950 text-sm px-4 py-3">{err}</div>
        ) : null}
        <p className="text-sm text-slate-600">
          Submissions from the marketing site modal. Admins are also emailed (
          <code className="text-xs bg-slate-100 px-1 rounded">DEMO_LEAD_NOTIFY_EMAIL</code> or{" "}
          <code className="text-xs bg-slate-100 px-1 rounded">EMAIL_HOST_USER</code>).
        </p>

        <div className="card-surface-static overflow-x-auto border border-emerald-100/90 rounded-2xl">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Use case</th>
                <th className="px-4 py-3 font-semibold">Email sent</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-slate-500">
                    No demo requests yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-[#0F172A]">{r.full_name}</td>
                    <td className="px-4 py-2.5">
                      <a href={`mailto:${r.email}`} className="text-[#16A34A] font-medium hover:underline">
                        {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-2.5">{r.company}</td>
                    <td className="px-4 py-2.5 text-slate-600 max-w-xs truncate" title={r.use_case || ""}>
                      {r.use_case || "—"}
                    </td>
                    <td className="px-4 py-2.5">{r.notify_email_sent ? "Yes" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
