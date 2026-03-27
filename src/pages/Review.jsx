import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ClientLayout from "../components/ClientLayout.jsx";
import { getAiJson, postAiJson } from "../utils/aiApi.js";
import { authHeaders } from "../utils/authHeaders.js";

const STATUS_COLORS = {
  pending: "bg-slate-100 text-slate-600",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
      {status}
    </span>
  );
}

export default function Review() {
  const [tab, setTab] = useState("create");
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [presets, setPresets] = useState({});
  const [loadingInit, setLoadingInit] = useState(true);

  const [title, setTitle] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [customColumns, setCustomColumns] = useState([]);
  const [executeAsync, setExecuteAsync] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInit();
  }, []);

  async function loadInit() {
    setLoadingInit(true);
    try {
      const [docRes, presetRes, sessionRes] = await Promise.all([
        getAiJson("/api/ai/documents/"),
        getAiJson("/api/ai/reviews/presets/"),
        getAiJson("/api/ai/reviews/"),
      ]);
      setDocuments(docRes.results || docRes.documents || []);
      setPresets(presetRes.presets || {});
      setSessions(sessionRes.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingInit(false);
    }
  }

  function toggleDoc(id) {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function togglePreset(key) {
    setSelectedPresets((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function addCustomColumn() {
    setCustomColumns((prev) => [...prev, { heading: "", prompt: "" }]);
  }

  function updateCustomColumn(idx, field, value) {
    setCustomColumns((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  function removeCustomColumn(idx) {
    setCustomColumns((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onCreate() {
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    if (selectedDocIds.length === 0) { setError("Select at least one document."); return; }
    const validCustom = customColumns.filter((c) => c.heading.trim() && c.prompt.trim());
    if (selectedPresets.length === 0 && validCustom.length === 0) {
      setError("Select at least one preset or add a custom column.");
      return;
    }

    setCreating(true);
    try {
      const body = {
        title: title.trim(),
        document_ids: selectedDocIds,
        presets: selectedPresets,
        columns: validCustom,
        execute_async: executeAsync,
      };
      const res = await postAiJson("/api/ai/reviews/", body);
      setTitle("");
      setSelectedDocIds([]);
      setSelectedPresets([]);
      setCustomColumns([]);

      const refreshed = await getAiJson("/api/ai/reviews/");
      setSessions(refreshed.results || []);
      if (res.session_id) {
        setSelectedSession(res.session_id);
        setTab("history");
        await loadSessionDetail(res.session_id);
      } else if (res.rows) {
        setSessionDetail(res);
        setSelectedSession(res.session_id);
        setTab("history");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function loadSessionDetail(id) {
    try {
      const detail = await getAiJson(`/api/ai/reviews/${id}/`);
      setSessionDetail(detail);
      setSelectedSession(id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function rerunSession(id) {
    try {
      await postAiJson(`/api/ai/reviews/${id}/execute/`, { execute_async: false });
      await loadSessionDetail(id);
      const refreshed = await getAiJson("/api/ai/reviews/");
      setSessions(refreshed.results || []);
    } catch (e) {
      setError(e.message);
    }
  }

  async function exportCsv(id) {
    try {
      const res = await fetch(`/api/ai/reviews/${id}/export/csv/`, {
        headers: authHeaders({ json: false }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `review_${id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteSession(id) {
    try {
      await fetch(`/api/ai/reviews/${id}/`, {
        method: "DELETE",
        headers: authHeaders({ json: false }),
      });
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (selectedSession === id) {
        setSelectedSession(null);
        setSessionDetail(null);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  if (loadingInit) {
    return (
      <ClientLayout title="Document Review">
        <div className="text-center py-20 text-slate-500">Loading...</div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Document Review">
      <div className="mb-6 rounded-xl border border-[#86EFAC]/60 bg-[#F0FDF4] px-4 py-3 text-sm text-[#14532D] flex flex-wrap items-center justify-between gap-3">
        <div>
          <strong className="font-semibold">Tabular / batch review</strong>
          <span className="text-[#166534]/90">
            {" "}
            — Select multiple ingested documents, add preset or custom column prompts, then run. Export CSV from History.
          </span>
        </div>
        <Link
          to="/documents"
          className="shrink-0 rounded-lg bg-white border border-[#16A34A]/40 px-3 py-1.5 text-xs font-semibold text-[#15803D] hover:bg-[#DCFCE7] transition-colors"
        >
          Batch upload documents →
        </Link>
      </div>
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
          <button className="ml-3 underline" onClick={() => setError("")}>dismiss</button>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
        {[
          { key: "create", label: "New Review" },
          { key: "history", label: "History" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-[#16A34A] border border-b-white border-slate-200 -mb-[1px]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "create" && (
        <div className="space-y-6 max-w-4xl">
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
            <strong className="text-slate-700">Column editor:</strong> use presets and/or custom heading + prompt pairs.
            Each column is evaluated per document row in the results table.
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Session Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-[#16A34A] focus:ring-2 focus:ring-[#22C55E]/30 focus:outline-none"
              placeholder="e.g. Due diligence batch review"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Documents ({selectedDocIds.length} selected)
            </label>
            {documents.length === 0 ? (
              <p className="text-sm text-slate-500">No documents available. Upload documents first.</p>
            ) : (
              <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                {documents.map((doc) => (
                  <label
                    key={doc.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocIds.includes(doc.id)}
                      onChange={() => toggleDoc(doc.id)}
                      className="rounded border-slate-300 text-[#16A34A] focus:ring-[#22C55E]/40"
                    />
                    <span className="truncate">{doc.title || doc.file_name}</span>
                    <StatusBadge status={doc.processing_status || "completed"} />
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Column Presets</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePreset(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selectedPresets.includes(key)
                      ? "bg-[#DCFCE7] border-[#16A34A] text-[#15803D]"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {preset.heading}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Custom Columns</label>
              <button
                type="button"
                onClick={addCustomColumn}
                className="text-xs text-[#16A34A] hover:underline font-medium"
              >
                + Add column
              </button>
            </div>
            {customColumns.length === 0 && (
              <p className="text-xs text-slate-500">No custom columns added yet.</p>
            )}
            <div className="space-y-3">
              {customColumns.map((col, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={col.heading}
                      onChange={(e) => updateCustomColumn(idx, "heading", e.target.value)}
                      placeholder="Column heading"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#16A34A] focus:outline-none"
                    />
                    <textarea
                      value={col.prompt}
                      onChange={(e) => updateCustomColumn(idx, "prompt", e.target.value)}
                      placeholder="AI prompt for this column (applied to every document)"
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#16A34A] focus:outline-none resize-y"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomColumn(idx)}
                    className="mt-1 text-red-400 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={executeAsync}
                onChange={(e) => setExecuteAsync(e.target.checked)}
                className="rounded border-slate-300 text-[#16A34A] focus:ring-[#22C55E]/40"
              />
              Run in background (async)
            </label>
          </div>

          <button
            onClick={onCreate}
            disabled={creating}
            className="rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {creating ? "Running..." : "Create & Run Review"}
          </button>
        </div>
      )}

      {tab === "history" && (
        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Review Sessions</h3>
            {sessions.length === 0 && (
              <p className="text-sm text-slate-500 p-3">No sessions yet.</p>
            )}
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSessionDetail(s.id)}
                className={`w-full text-left rounded-xl border p-3 transition-colors ${
                  selectedSession === s.id
                    ? "border-[#16A34A] bg-[#DCFCE7]/40 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{s.title}</span>
                  <StatusBadge status={s.status} />
                </div>
                <div className="text-xs text-slate-500">
                  {s.document_count} docs · {s.column_count} columns
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {s.created_at ? new Date(s.created_at).toLocaleString() : ""}
                </div>
              </button>
            ))}
          </div>

          <div>
            {!sessionDetail && (
              <div className="text-center text-slate-500 py-20 text-sm">
                Select a session to view results.
              </div>
            )}
            {sessionDetail && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{sessionDetail.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={sessionDetail.status} />
                      {sessionDetail.metadata?.latency_ms != null && (
                        <span className="text-xs text-slate-500">
                          {sessionDetail.metadata.latency_ms}ms
                        </span>
                      )}
                      {sessionDetail.metadata?.total_cells != null && (
                        <span className="text-xs text-slate-500">
                          {sessionDetail.metadata.total_cells - (sessionDetail.metadata.failed_cells || 0)}/{sessionDetail.metadata.total_cells} cells completed
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportCsv(sessionDetail.session_id)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => rerunSession(sessionDetail.session_id)}
                      className="rounded-lg border border-[#16A34A] bg-[#DCFCE7] px-3 py-1.5 text-xs font-medium text-[#15803D] hover:bg-[#BBF7D0] shadow-sm transition-colors"
                    >
                      Re-run
                    </button>
                    <button
                      onClick={() => deleteSession(sessionDetail.session_id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 shadow-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {sessionDetail.rows && sessionDetail.columns && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-4 py-3 font-semibold text-slate-700 whitespace-nowrap sticky left-0 bg-slate-50 z-10">
                            Document
                          </th>
                          {sessionDetail.columns.map((col) => (
                            <th
                              key={col.index}
                              className="text-left px-4 py-3 font-semibold text-slate-700 min-w-[200px]"
                              title={col.prompt}
                            >
                              {col.heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sessionDetail.rows.map((row) => (
                          <tr key={row.document_id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-slate-100">
                              {row.document_title}
                            </td>
                            {row.columns.map((cell) => (
                              <td key={cell.column_index} className="px-4 py-3 text-slate-700 align-top">
                                {cell.status === "failed" ? (
                                  <span className="text-red-500 text-xs">Extraction failed</span>
                                ) : cell.status === "pending" || cell.status === "processing" ? (
                                  <span className="text-slate-400 text-xs italic">{cell.status}...</span>
                                ) : (
                                  <div className="whitespace-pre-wrap text-xs leading-relaxed max-h-60 overflow-y-auto">
                                    {cell.value}
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
