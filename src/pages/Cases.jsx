import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ClientLayout from "../components/ClientLayout.jsx";
import { getAiJson, patchAiJson, postAiJson } from "../utils/aiApi.js";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";

const INCLUDE_PUSH_STORAGE_KEY = "nomorae.cases.includePushReminders";

const CASE_TYPES = [
  { value: "labour", label: "Labour" },
  { value: "civil", label: "Civil" },
  { value: "corporate", label: "Corporate" },
  { value: "property", label: "Property / lease" },
  { value: "general", label: "General" },
];

function statusBadge(s) {
  const map = {
    pending: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-emerald-100 text-emerald-800",
    overdue: "bg-red-100 text-red-800",
    skipped: "bg-amber-100 text-amber-800",
  };
  return map[s] || "bg-slate-100 text-slate-600";
}

export default function Cases() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("list");
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [caseType, setCaseType] = useState("general");
  const [jurisdiction, setJurisdiction] = useState("South Africa");
  const [filingDate, setFilingDate] = useState("");
  const [docIds, setDocIds] = useState([]);
  const [applyTemplate, setApplyTemplate] = useState(true);
  const [initWorkflow, setInitWorkflow] = useState(true);
  const [creating, setCreating] = useState(false);

  const [commentTaskId, setCommentTaskId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [reminderInfo, setReminderInfo] = useState("");
  const [includePushReminders, setIncludePushReminders] = useState(() => {
    try {
      return sessionStorage.getItem(INCLUDE_PUSH_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  async function loadList() {
    const data = await getAiJson("/api/ai/cases/");
    setCases(Array.isArray(data.results) ? data.results : []);
  }

  async function loadDocs() {
    const data = await getAiJson("/api/ai/documents/");
    const rows = data.results || data.documents || [];
    setDocuments(Array.isArray(rows) ? rows : []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([loadList(), loadDocs()]);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const caseFromUrl = searchParams.get("case");
  useEffect(() => {
    if (!caseFromUrl || loading) return;
    let cancelled = false;
    (async () => {
      try {
        const d = await getAiJson(`/api/ai/cases/${caseFromUrl}/`);
        if (cancelled) return;
        setDetail(d);
        setTab("detail");
        setSearchParams(
          (prev) => {
            const p = new URLSearchParams(prev);
            p.delete("case");
            return p;
          },
          { replace: true },
        );
      } catch {
        if (!cancelled) {
          setError("Could not open the linked case.");
          setSearchParams(
            (prev) => {
              const p = new URLSearchParams(prev);
              p.delete("case");
              return p;
            },
            { replace: true },
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [caseFromUrl, loading, setSearchParams]);

  async function openCase(caseId) {
    setError("");
    try {
      const d = await getAiJson(`/api/ai/cases/${caseId}/`);
      setDetail(d);
      setTab("detail");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load case");
    }
  }

  function toggleDoc(id) {
    setDocIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onCreate(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const keyDates = {};
      if (filingDate.trim()) keyDates.filing_date = filingDate.trim();
      const created = await postAiJson("/api/ai/cases/", {
        title: title.trim(),
        case_type: caseType,
        jurisdiction: jurisdiction.trim() || "South Africa",
        key_dates: keyDates,
        parties: [],
        document_ids: docIds,
        apply_template: applyTemplate,
        init_workflow: initWorkflow,
      });
      setTitle("");
      setFilingDate("");
      setDocIds([]);
      await loadList();
      if (created?.case_id) {
        setDetail(created);
        setTab("detail");
      } else {
        setTab("list");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function patchMilestoneStatus(milestoneId, statusVal) {
    if (!detail?.case_id) return;
    try {
      const res = await fetch(apiUrl(`/api/ai/cases/${detail.case_id}/milestones/${milestoneId}/`), {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: statusVal }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.detail || "Update failed");
      setDetail(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function patchTaskStatus(taskId, statusVal) {
    if (!detail?.case_id) return;
    try {
      const res = await fetch(apiUrl(`/api/ai/cases/${detail.case_id}/tasks/${taskId}/`), {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: statusVal }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.detail || "Update failed");
      setDetail(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function patchTaskEvidence(taskId, docId, checked) {
    if (!detail?.case_id) return;
    const t = (detail.tasks || []).find((x) => x.id === taskId);
    if (!t) return;
    const cur = t.evidence_document_ids || [];
    const evidence_document_ids = checked ? Array.from(new Set([...cur, docId])) : cur.filter((x) => x !== docId);
    try {
      const json = await patchAiJson(`/api/ai/cases/${detail.case_id}/tasks/${taskId}/`, {
        evidence_document_ids,
      });
      setDetail(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update proof attachments");
    }
  }

  async function patchCaseAutoAdvance(enabled) {
    if (!detail?.case_id) return;
    try {
      const json = await patchAiJson(`/api/ai/cases/${detail.case_id}/`, {
        auto_advance_on_feedback: enabled,
      });
      setDetail(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function submitComment(taskId) {
    if (!detail?.case_id || !commentText.trim()) return;
    try {
      const res = await fetch(apiUrl(`/api/ai/cases/${detail.case_id}/tasks/${taskId}/comments/`), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ text: commentText.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.detail || "Comment failed");
      setDetail(json);
      setCommentText("");
      setCommentTaskId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comment failed");
    }
  }

  async function dispatchReminders() {
    if (!detail?.case_id) return;
    try {
      const res = await fetch(apiUrl(`/api/ai/cases/${detail.case_id}/reminders/dispatch/`), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          hours_before_deadline: 48,
          include_push: includePushReminders,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.detail || "Dispatch failed");
      setError("");
      let info =
        `Logged ${json.preview_count} reminder(s); emails attempted: ${json.emails_attempted}.` +
        (typeof json.push_notifications_sent === "number" ? ` Push deliveries: ${json.push_notifications_sent}.` : "");
      if (Array.isArray(json.warnings) && json.warnings.length > 0) {
        info += ` ${json.warnings.join(" ")}`;
      }
      setReminderInfo(info);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dispatch failed");
    }
  }

  if (loading) {
    return (
      <ClientLayout title="Cases">
        <div className="text-center py-20 text-slate-500">Loading…</div>
      </ClientLayout>
    );
  }

  const focusTaskId = detail?.next_step?.focus_task_id ?? null;
  const activeTasks = (detail?.tasks || []).filter((t) => t.status !== "completed");
  const doneTasks = (detail?.tasks || []).filter((t) => t.status === "completed");

  return (
    <ClientLayout title="Cases">
      <p className="text-sm text-slate-600 mb-6 max-w-3xl">
        Workflow-driven case management: procedural milestones, tasks, progress, and next-step guidance. New cases can
        spawn a linked workflow planner for research and drafting support.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab("list")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === "list" ? "bg-[#DCFCE7] text-[#14532D]" : "bg-slate-100 text-slate-700"}`}
        >
          All cases
        </button>
        <button
          type="button"
          onClick={() => setTab("create")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === "create" ? "bg-[#DCFCE7] text-[#14532D]" : "bg-slate-100 text-slate-700"}`}
        >
          New case
        </button>
        {detail ? (
          <button
            type="button"
            onClick={() => setTab("detail")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === "detail" ? "bg-[#DCFCE7] text-[#14532D]" : "bg-slate-100 text-slate-700"}`}
          >
            Current case
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      ) : null}
      {reminderInfo ? (
        <p className="mb-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          {reminderInfo}
        </p>
      ) : null}

      {tab === "list" && (
        <div className="card-surface-static p-5 max-w-4xl">
          <h2 className="text-base font-semibold text-[#0F172A] mb-3">Your cases</h2>
          {cases.length === 0 ? (
            <p className="text-sm text-slate-500">No cases yet. Create one to generate a procedural timeline.</p>
          ) : (
            <ul className="space-y-2">
              {cases.map((c) => (
                <li key={c.case_id}>
                  <button
                    type="button"
                    onClick={() => openCase(c.case_id)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-[#86EFAC] hover:bg-[#F0FDF4]/50 transition-colors"
                  >
                    <div className="flex justify-between gap-2">
                      <span className="font-medium text-slate-800">{c.title}</span>
                      <span className="text-xs uppercase text-slate-500">{c.case_type}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {c.milestone_count} milestones · {c.task_count} tasks
                      {c.workflow_run_id ? ` · workflow #${c.workflow_run_id}` : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "create" && (
        <form onSubmit={onCreate} className="card-surface-static p-5 max-w-xl space-y-4">
          <h2 className="text-base font-semibold text-[#0F172A]">Create case</h2>
          <label className="block text-sm text-slate-700">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="block text-sm text-slate-700">
            Case type
            <select
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {CASE_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-700">
            Jurisdiction
            <input
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-slate-700">
            Filing date (optional, anchors timeline)
            <input
              type="date"
              value={filingDate}
              onChange={(e) => setFilingDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={applyTemplate} onChange={(e) => setApplyTemplate(e.target.checked)} />
            Apply procedural template for this case type
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={initWorkflow} onChange={(e) => setInitWorkflow(e.target.checked)} />
            Initialise linked workflow planner
          </label>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Attach documents (ingested)</p>
            <div className="max-h-40 overflow-y-auto space-y-1 border rounded-lg p-2 bg-slate-50">
              {documents.length === 0 ? (
                <p className="text-xs text-slate-500">No documents.</p>
              ) : (
                documents.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 text-xs text-slate-700">
                    <input type="checkbox" checked={docIds.includes(d.id)} onChange={() => toggleDoc(d.id)} />
                    {d.title || d.file_name || `Doc ${d.id}`}
                  </label>
                ))
              )}
            </div>
          </div>
          <button type="submit" disabled={creating} className="btn-primary disabled:opacity-50">
            {creating ? "Creating…" : "Create case"}
          </button>
        </form>
      )}

      {tab === "detail" && detail && (
        <div className="space-y-6 max-w-5xl">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">{detail.title}</h2>
              <p className="text-xs text-slate-500 font-mono mt-1">case_id: {detail.case_id}</p>
              <p className="text-sm text-slate-600 mt-2">
                {detail.case_type} · {detail.jurisdiction} · {detail.status}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {detail.workflow_run_id ? (
                <Link
                  to="/workflows"
                  className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-[#16A34A] font-medium"
                >
                  Open workflows (run #{detail.workflow_run_id})
                </Link>
              ) : null}
              <Link
                to="/calendar"
                className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-[#16A34A] font-medium"
              >
                Calendar
              </Link>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={includePushReminders}
                  onChange={(e) => {
                    const v = e.target.checked;
                    setIncludePushReminders(v);
                    try {
                      sessionStorage.setItem(INCLUDE_PUSH_STORAGE_KEY, v ? "1" : "0");
                    } catch {
                      /* ignore */
                    }
                  }}
                />
                Include push (if enabled)
              </label>
              <button type="button" onClick={dispatchReminders} className="text-sm px-3 py-2 rounded-lg border border-slate-200">
                Dispatch deadline reminders
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card-surface-static p-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Progress</h3>
              <p className="text-2xl font-bold text-[#15803D]">{detail.progress?.percent_complete ?? 0}%</p>
              <p className="text-xs text-slate-600 mt-2">
                Milestones {detail.progress?.milestones_completed}/{detail.progress?.milestones_total} · Tasks{" "}
                {detail.progress?.tasks_completed}/{detail.progress?.tasks_total}
              </p>
              {detail.progress?.missed_or_overdue?.length ? (
                <p className="text-xs text-red-600 mt-2">
                  Overdue / missed: {detail.progress.missed_or_overdue.map((x) => x.name).join(", ")}
                </p>
              ) : null}
            </div>
            <div className="card-surface-static p-4 border-l-4 border-[#16A34A]">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Next step</h3>
              <p className="text-sm font-medium text-[#0F172A]">{detail.next_step?.next_step}</p>
              {detail.next_step?.due_date ? (
                <p className="text-xs text-slate-600 mt-1">Due {detail.next_step.due_date}</p>
              ) : null}
              <p className="text-xs text-slate-500 mt-2">{detail.next_step?.reason}</p>
              {focusTaskId ? (
                <p className="text-xs text-emerald-700 mt-2 font-medium">Current focus task is highlighted in the table below.</p>
              ) : null}
            </div>
          </div>

          <label className="flex items-start gap-3 max-w-2xl cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={!!detail.auto_advance_on_feedback}
              onChange={(e) => patchCaseAutoAdvance(e.target.checked)}
            />
            <span className="text-sm text-slate-700">
              <span className="font-medium text-slate-800">Auto-advance milestones (optional, off by default)</span>
              <span className="block text-slate-600 mt-0.5">
                When enabled, completing every task under the current milestone will mark that milestone done and move the
                next one to in progress. You stay in control — this only runs after you mark tasks complete.
              </span>
            </span>
          </label>

          <div className="card-surface-static p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Milestones</h3>
            <ul className="space-y-2">
              {(detail.milestones || []).map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-slate-50">
                  <div>
                    <span className="text-sm font-medium text-slate-800">{m.name}</span>
                    {m.due_date ? <span className="text-xs text-slate-500 ml-2">due {m.due_date}</span> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusBadge(m.status)}`}>{m.status}</span>
                    {m.status !== "completed" ? (
                      <button
                        type="button"
                        className="text-xs text-[#16A34A] hover:underline"
                        onClick={() => patchMilestoneStatus(m.id, "completed")}
                      >
                        Mark done
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface-static p-4 overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Tasks</h3>
            <p className="text-xs text-slate-600 mb-3 max-w-3xl">
              Attach proof from your ingested documents (any document you uploaded or already linked to this case). Notes
              are stored on the task and shown below each title.
            </p>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b">
                  <th className="py-2 pr-3">Task & notes</th>
                  <th className="py-2 pr-3">Due</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 w-44">Proof (documents)</th>
                  <th className="py-2 pr-3">Add note</th>
                </tr>
              </thead>
              <tbody>
                {activeTasks.length ? (
                  <tr className="bg-slate-100/90">
                    <td colSpan={5} className="py-2 px-2 text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Open ({activeTasks.length})
                    </td>
                  </tr>
                ) : null}
                {activeTasks.map((t) => (
                  <tr
                    key={t.id}
                    className={`border-b border-slate-100 align-top ${
                      focusTaskId === t.id ? "bg-emerald-50/90 ring-1 ring-inset ring-emerald-200" : ""
                    }`}
                  >
                    <td className="py-2 pr-3">
                      <div className="font-medium text-slate-800">{t.name}</div>
                      <span className={`inline-block mt-1 text-xs capitalize ${statusBadge(t.effective_status || t.status)}`}>
                        {t.effective_status || t.status}
                      </span>
                      {(t.comments || []).length ? (
                        <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc pl-4 max-w-md">
                          {(t.comments || []).map((c, idx) => (
                            <li key={idx}>
                              <span className="text-slate-500">{c.username || "user"}:</span> {c.text}
                              {c.created_at ? (
                                <span className="text-slate-400 ml-1">({new Date(c.created_at).toLocaleString()})</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">No notes yet.</p>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-slate-600">{t.due_date || "—"}</td>
                    <td className="py-2 pr-3">
                      <select
                        value={t.status}
                        onChange={(e) => patchTaskStatus(t.id, e.target.value)}
                        className="text-xs rounded border border-slate-200 px-2 py-1"
                      >
                        <option value="pending">pending</option>
                        <option value="in_progress">in progress</option>
                        <option value="completed">completed</option>
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="max-h-28 overflow-y-auto space-y-1 text-xs">
                        {documents.length === 0 ? (
                          <span className="text-slate-400">No documents</span>
                        ) : (
                          documents.map((d) => (
                            <label key={d.id} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(t.evidence_document_ids || []).includes(d.id)}
                                onChange={(e) => patchTaskEvidence(t.id, d.id, e.target.checked)}
                              />
                              <span className="truncate max-w-[10rem]" title={d.title || d.file_name}>
                                {d.title || d.file_name || `#${d.id}`}
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      {commentTaskId === t.id ? (
                        <div className="flex flex-col gap-1 min-w-[9rem]">
                          <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="text-xs rounded border px-2 py-1 w-full"
                            placeholder="Note…"
                          />
                          <button type="button" className="text-xs text-[#16A34A] text-left" onClick={() => submitComment(t.id)}>
                            Save note
                          </button>
                        </div>
                      ) : (
                        <button type="button" className="text-xs text-[#16A34A]" onClick={() => setCommentTaskId(t.id)}>
                          + note
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {doneTasks.length ? (
                  <tr className="bg-slate-100/90">
                    <td colSpan={5} className="py-2 px-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Completed ({doneTasks.length})
                    </td>
                  </tr>
                ) : null}
                {doneTasks.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 align-top opacity-80">
                    <td className="py-2 pr-3">
                      <div className="font-medium text-slate-700">{t.name}</div>
                      <span className={`inline-block mt-1 text-xs capitalize ${statusBadge(t.effective_status || t.status)}`}>
                        {t.effective_status || t.status}
                      </span>
                      {(t.comments || []).length ? (
                        <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc pl-4 max-w-md">
                          {(t.comments || []).map((c, idx) => (
                            <li key={idx}>
                              <span className="text-slate-500">{c.username || "user"}:</span> {c.text}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </td>
                    <td className="py-2 pr-3 text-slate-600">{t.due_date || "—"}</td>
                    <td className="py-2 pr-3">
                      <select
                        value={t.status}
                        onChange={(e) => patchTaskStatus(t.id, e.target.value)}
                        className="text-xs rounded border border-slate-200 px-2 py-1"
                      >
                        <option value="pending">pending</option>
                        <option value="in_progress">in progress</option>
                        <option value="completed">completed</option>
                      </select>
                    </td>
                    <td className="py-2 pr-3 text-xs text-slate-500">
                      {(t.evidence_document_ids || []).length
                        ? `${(t.evidence_document_ids || []).length} doc(s)`
                        : "—"}
                    </td>
                    <td className="py-2 pr-3">
                      {commentTaskId === t.id ? (
                        <div className="flex flex-col gap-1 min-w-[9rem]">
                          <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="text-xs rounded border px-2 py-1 w-full"
                            placeholder="Note…"
                          />
                          <button type="button" className="text-xs text-[#16A34A] text-left" onClick={() => submitComment(t.id)}>
                            Save note
                          </button>
                        </div>
                      ) : (
                        <button type="button" className="text-xs text-[#16A34A]" onClick={() => setCommentTaskId(t.id)}>
                          + note
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
