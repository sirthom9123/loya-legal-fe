import React, { useEffect, useState } from "react";
import ClientLayout from "../components/ClientLayout.jsx";
import { getAiJson } from "../utils/aiApi.js";

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function loadReport(filterStatus) {
    setLoading(true);
    setError("");
    try {
      const params = filterStatus ? `?status=${filterStatus}` : "";
      const data = await getAiJson(`/api/ai/billing-report/${params}`);
      setReport(data);
    } catch (e) {
      setError(e.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport(statusFilter);
  }, [statusFilter]);

  return (
    <ClientLayout title="Reports">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Billing Report</h1>
          <p className="text-sm text-slate-500 mt-1">
            Fee reconciliation across all your cases. Track totals, recoverable amounts, and outstanding own-client fees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-600">Filter by status:</label>
          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All cases</option>
            <option value="active">Active</option>
            <option value="settled">Settled</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</div>
        )}

        {loading ? (
          <p className="text-slate-400 animate-pulse">Loading report…</p>
        ) : report ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard label="Total Fees" value={`R ${report.grand_total}`} color="slate" />
              <SummaryCard label="Recoverable (P&P)" value={`R ${report.grand_recoverable}`} color="emerald" />
              <SummaryCard label="Own Client" value={`R ${report.grand_own_client}`} color="amber" />
              <SummaryCard label="Cases with Billing" value={report.case_count} color="indigo" />
            </div>

            {report.cases && report.cases.length > 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-semibold text-sm text-slate-700">Case Breakdown</h2>
                  <span className="text-xs text-slate-500">{report.cases.length} case(s)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <th className="px-4 py-3 font-semibold">Case</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Attorney</th>
                        <th className="px-4 py-3 font-semibold text-right">Items</th>
                        <th className="px-4 py-3 font-semibold text-right">Total</th>
                        <th className="px-4 py-3 font-semibold text-right">Recoverable</th>
                        <th className="px-4 py-3 font-semibold text-right">Own Client</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.cases.map((c) => (
                        <tr key={c.case_id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">{c.title}</td>
                          <td className="px-4 py-3 text-slate-600 capitalize">{c.case_type}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(c.status)}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{c.created_by || "—"}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{c.item_count}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">R {c.total}</td>
                          <td className="px-4 py-3 text-right text-emerald-700">R {c.recoverable}</td>
                          <td className="px-4 py-3 text-right text-amber-700">R {c.own_client}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-semibold text-sm">
                        <td colSpan={5} className="px-4 py-3 text-slate-700">Totals</td>
                        <td className="px-4 py-3 text-right text-slate-900">R {report.grand_total}</td>
                        <td className="px-4 py-3 text-right text-emerald-800">R {report.grand_recoverable}</td>
                        <td className="px-4 py-3 text-right text-amber-800">R {report.grand_own_client}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-500">No billing items recorded yet. Add fees to case tasks to see them here.</p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </ClientLayout>
  );
}

function SummaryCard({ label, value, color }) {
  const colors = {
    slate: "bg-slate-50 border-slate-200",
    emerald: "bg-emerald-50 border-emerald-200",
    amber: "bg-amber-50 border-amber-200",
    indigo: "bg-indigo-50 border-indigo-200",
  };
  const textColors = {
    slate: "text-slate-800",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    indigo: "text-indigo-700",
  };
  return (
    <div className={`rounded-lg border p-4 ${colors[color] || colors.slate}`}>
      <p className={`text-xl font-bold ${textColors[color] || textColors.slate}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function statusColor(s) {
  const map = {
    active: "bg-blue-100 text-blue-800",
    settled: "bg-emerald-100 text-emerald-800",
    closed: "bg-slate-100 text-slate-700",
    archived: "bg-slate-100 text-slate-500",
  };
  return map[s] || "bg-slate-100 text-slate-600";
}
