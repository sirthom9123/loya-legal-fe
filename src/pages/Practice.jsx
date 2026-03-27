import React, { useEffect, useMemo, useState } from "react";
import ClientLayout from "../components/ClientLayout.jsx";
import { formatApiError } from "../utils/apiError.js";
import { getAiJson, postAiJson } from "../utils/aiApi.js";
import { authHeaders } from "../utils/authHeaders.js";

const TABS = [
  { id: "time", label: "Time & timer" },
  { id: "clients", label: "Clients & matters" },
  { id: "invoices", label: "Invoices" },
  { id: "comms", label: "Communications" },
];

function timerStorageKey(wsId) {
  return `loya_practice_timer_${wsId}`;
}

export default function Practice() {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [tab, setTab] = useState("time");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [clients, setClients] = useState([]);
  const [matters, setMatters] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [report, setReport] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [newClientName, setNewClientName] = useState("");
  const [newMatterTitle, setNewMatterTitle] = useState("");
  const [newMatterClientId, setNewMatterClientId] = useState("");
  const [contactClientId, setContactClientId] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [manualMatterId, setManualMatterId] = useState("");
  const [manualDocId, setManualDocId] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualMinutes, setManualMinutes] = useState(30);
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [timerMatterId, setTimerMatterId] = useState("");
  const [tick, setTick] = useState(0);

  const [invoiceClientId, setInvoiceClientId] = useState("");
  const [invoiceTax, setInvoiceTax] = useState("0");

  const [commMatterId, setCommMatterId] = useState("");
  const [comms, setComms] = useState([]);
  const [commSubject, setCommSubject] = useState("");
  const [commBody, setCommBody] = useState("");
  const [commChannel, setCommChannel] = useState("note");

  const wsId = workspace?.id;

  const elapsedLabel = useMemo(() => {
    if (!timerStartedAt) return "0:00";
    const sec = Math.floor((Date.now() - timerStartedAt) / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [timerStartedAt, tick]);

  async function loadWorkspaces() {
    setLoading(true);
    setError("");
    try {
      const res = await getAiJson("/api/ai/workspaces/");
      const list = res.results || [];
      setWorkspaces(list);
      if (!workspace && list.length > 0) {
        setWorkspace(list[0]);
      }
    } catch (e) {
      setError(e.message || "Failed to load workspaces.");
    } finally {
      setLoading(false);
    }
  }

  async function loadPracticeData(wid) {
    if (!wid) return;
    try {
      const [cl, mt, te, docsRes] = await Promise.all([
        getAiJson(`/api/ai/workspaces/${wid}/practice/clients/`),
        getAiJson(`/api/ai/workspaces/${wid}/practice/matters/`),
        getAiJson(`/api/ai/workspaces/${wid}/practice/time-entries/`),
        getAiJson("/api/ai/documents/"),
      ]);
      setClients(cl.results || []);
      setMatters(mt.results || []);
      setTimeEntries(te.results || []);
      setDocuments(docsRes.results || []);
      const inv = await getAiJson(`/api/ai/workspaces/${wid}/practice/invoices/`);
      setInvoices(inv.results || []);
    } catch (e) {
      setError(e.message || "Failed to load practice data.");
    }
  }

  async function loadReport(wid) {
    try {
      const r = await getAiJson(`/api/ai/workspaces/${wid}/practice/time-entries/report/`);
      setReport(r);
    } catch {
      setReport(null);
    }
  }

  useEffect(() => {
    loadWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (wsId) {
      loadPracticeData(wsId);
      loadReport(wsId);
      try {
        const raw = localStorage.getItem(timerStorageKey(wsId));
        if (raw) {
          const j = JSON.parse(raw);
          if (j.startedAt) setTimerStartedAt(j.startedAt);
          if (j.matterId !== undefined) setTimerMatterId(j.matterId ? String(j.matterId) : "");
        } else {
          setTimerStartedAt(null);
          setTimerMatterId("");
        }
      } catch {
        setTimerStartedAt(null);
      }
    }
  }, [wsId]);

  useEffect(() => {
    if (!timerStartedAt) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [timerStartedAt]);

  function persistTimer(startedAt, matterId) {
    if (!wsId) return;
    localStorage.setItem(timerStorageKey(wsId), JSON.stringify({ startedAt, matterId: matterId || null }));
  }

  function startTimer() {
    const t = Date.now();
    setTimerStartedAt(t);
    persistTimer(t, timerMatterId);
  }

  function stopTimerAndLog() {
    if (!wsId || !timerStartedAt) return;
    const minutes = Math.max(1, Math.round((Date.now() - timerStartedAt) / 60000));
    setManualMinutes(minutes);
    setManualDate(new Date().toISOString().slice(0, 10));
    if (timerMatterId) setManualMatterId(timerMatterId);
    setTimerStartedAt(null);
    persistTimer(null, null);
  }

  async function submitTimeEntry(e) {
    e.preventDefault();
    if (!wsId) return;
    setError("");
    try {
      const body = {
        description: manualDesc.trim(),
        duration_minutes: Number(manualMinutes),
        date_worked: manualDate,
        is_billable: true,
      };
      if (manualMatterId) body.matter_id = Number(manualMatterId);
      if (manualDocId) body.source_document_id = Number(manualDocId);
      await postAiJson(`/api/ai/workspaces/${wsId}/practice/time-entries/`, body);
      setManualDesc("");
      await loadPracticeData(wsId);
      await loadReport(wsId);
    } catch (err) {
      setError(err.message || "Could not save time entry.");
    }
  }

  async function submitTimerLog() {
    if (!wsId || !timerStartedAt) return;
    const minutes = Math.max(1, Math.round((Date.now() - timerStartedAt) / 60000));
    setError("");
    try {
      const body = {
        description: "Timer session",
        duration_minutes: minutes,
        date_worked: new Date().toISOString().slice(0, 10),
        is_billable: true,
      };
      if (timerMatterId) body.matter_id = Number(timerMatterId);
      await postAiJson(`/api/ai/workspaces/${wsId}/practice/time-entries/`, body);
      setTimerStartedAt(null);
      persistTimer(null, null);
      await loadPracticeData(wsId);
      await loadReport(wsId);
    } catch (err) {
      setError(err.message || "Could not log timer.");
    }
  }

  async function createClient(e) {
    e.preventDefault();
    if (!wsId || !newClientName.trim()) return;
    try {
      await postAiJson(`/api/ai/workspaces/${wsId}/practice/clients/`, {
        display_name: newClientName.trim(),
      });
      setNewClientName("");
      await loadPracticeData(wsId);
    } catch (err) {
      setError(err.message || "Could not create client.");
    }
  }

  async function createContact(e) {
    e.preventDefault();
    if (!wsId || !contactClientId || !contactName.trim()) return;
    try {
      await postAiJson(`/api/ai/workspaces/${wsId}/practice/clients/${contactClientId}/contacts/`, {
        name: contactName.trim(),
        email: contactEmail.trim(),
      });
      setContactName("");
      setContactEmail("");
      await loadPracticeData(wsId);
    } catch (err) {
      setError(err.message || "Could not add contact.");
    }
  }

  async function createMatter(e) {
    e.preventDefault();
    if (!wsId || !newMatterTitle.trim()) return;
    try {
      const body = { title: newMatterTitle.trim() };
      if (newMatterClientId) body.client_id = Number(newMatterClientId);
      await postAiJson(`/api/ai/workspaces/${wsId}/practice/matters/`, body);
      setNewMatterTitle("");
      await loadPracticeData(wsId);
    } catch (err) {
      setError(err.message || "Could not create matter.");
    }
  }

  async function generateInvoice(e) {
    e.preventDefault();
    if (!wsId || !invoiceClientId) return;
    try {
      const body = {
        client_id: Number(invoiceClientId),
        tax_rate: invoiceTax || "0",
      };
      await postAiJson(`/api/ai/workspaces/${wsId}/practice/invoices/from-time/`, body);
      await loadPracticeData(wsId);
    } catch (err) {
      setError(err.message || "Could not generate invoice (need unbilled time on matters for this client).");
    }
  }

  async function downloadPdf(invId) {
    if (!wsId) return;
    const res = await fetch(`/api/ai/workspaces/${wsId}/practice/invoices/${invId}/pdf/`, {
      headers: authHeaders({ json: false }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(formatApiError(data));
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function loadCommsForMatter(mid) {
    if (!wsId || !mid) {
      setComms([]);
      return;
    }
    try {
      const r = await getAiJson(`/api/ai/workspaces/${wsId}/practice/matters/${mid}/communications/`);
      setComms(r.results || []);
    } catch {
      setComms([]);
    }
  }

  useEffect(() => {
    if (commMatterId) loadCommsForMatter(commMatterId);
    else setComms([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commMatterId, wsId]);

  async function addCommunication(e) {
    e.preventDefault();
    if (!wsId || !commMatterId) return;
    try {
      await postAiJson(
        `/api/ai/workspaces/${wsId}/practice/matters/${commMatterId}/communications/`,
        {
          channel: commChannel,
          subject: commSubject.trim(),
          body: commBody.trim(),
        }
      );
      setCommSubject("");
      setCommBody("");
      await loadCommsForMatter(commMatterId);
    } catch (err) {
      setError(err.message || "Could not add communication.");
    }
  }

  async function sendCommEmail(commId) {
    if (!wsId || !commMatterId) return;
    setError("");
    try {
      const res = await fetch(
        `/api/ai/workspaces/${wsId}/practice/matters/${commMatterId}/communications/${commId}/send-email/`,
        { method: "POST", headers: authHeaders(), body: "{}" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(formatApiError(data));
      if (data.sent === false && data.detail) {
        setError(data.detail + (data.error ? ` (${data.error})` : ""));
      }
      await loadCommsForMatter(commMatterId);
    } catch (err) {
      setError(err.message || "Send failed.");
    }
  }

  return (
    <ClientLayout title="Practice management">
      <div className="space-y-6">
        <p className="text-sm text-slate-600 max-w-3xl">
          Time tracking, clients and matters, invoicing from time entries, contact log, and outbound email updates —
          scoped to a workspace (same membership rules as the client portal).
        </p>

        {error ? (
          <p className="text-red-600 text-sm rounded-xl bg-red-50 border border-red-100 px-4 py-3">{error}</p>
        ) : null}

        {loading ? (
          <p className="text-slate-500 text-sm">Loading workspaces…</p>
        ) : workspaces.length === 0 ? (
          <div className="card-surface-static p-6">
            <p className="text-slate-700">Create a workspace from the Client portal first, then return here.</p>
            <a href="/collaboration" className="mt-3 inline-block btn-primary text-sm py-2 px-4">
              Open client portal
            </a>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-slate-600">
                Workspace
                <select
                  className="ml-2 mt-1 block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={wsId || ""}
                  onChange={(ev) => {
                    const w = workspaces.find((x) => x.id === Number(ev.target.value));
                    setWorkspace(w || null);
                  }}
                >
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={
                    tab === t.id
                      ? "text-sm font-semibold text-[#16A34A] border-b-2 border-[#16A34A] pb-2 -mb-px px-2"
                      : "text-sm text-slate-600 hover:text-[#0F172A] px-2 pb-2"
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "time" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card-surface-static p-5 space-y-4">
                  <h3 className="font-semibold text-[#0F172A]">Timer</h3>
                  <p className="text-3xl font-mono text-slate-800 tabular-nums">{elapsedLabel}</p>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-500">
                      Matter (optional)
                      <select
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={timerMatterId}
                        onChange={(ev) => {
                          const v = ev.target.value;
                          setTimerMatterId(v);
                          if (timerStartedAt) persistTimer(timerStartedAt, v);
                        }}
                      >
                        <option value="">—</option>
                        {matters.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.title}
                            {m.reference_code ? ` (${m.reference_code})` : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!timerStartedAt ? (
                      <button type="button" className="btn-primary text-sm py-2 px-4" onClick={startTimer}>
                        Start
                      </button>
                    ) : (
                      <>
                        <button type="button" className="btn-primary text-sm py-2 px-4" onClick={submitTimerLog}>
                          Stop &amp; log time
                        </button>
                        <button
                          type="button"
                          className="btn-secondary text-sm py-2 px-4"
                          onClick={stopTimerAndLog}
                        >
                          Stop (fill form below)
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <form onSubmit={submitTimeEntry} className="card-surface-static p-5 space-y-3">
                  <h3 className="font-semibold text-[#0F172A]">Manual time entry</h3>
                  <label className="block text-xs text-slate-500">
                    Matter
                    <select
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={manualMatterId}
                      onChange={(ev) => setManualMatterId(ev.target.value)}
                    >
                      <option value="">— optional —</option>
                      {matters.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs text-slate-500">
                    Document
                    <select
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={manualDocId}
                      onChange={(ev) => setManualDocId(ev.target.value)}
                    >
                      <option value="">— optional —</option>
                      {documents.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.title || d.file_name || d.id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs text-slate-500">
                    Description
                    <input
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={manualDesc}
                      onChange={(ev) => setManualDesc(ev.target.value)}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="text-xs text-slate-500">
                      Minutes
                      <input
                        type="number"
                        min={1}
                        className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={manualMinutes}
                        onChange={(ev) => setManualMinutes(ev.target.value)}
                      />
                    </label>
                    <label className="text-xs text-slate-500">
                      Date worked
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={manualDate}
                        onChange={(ev) => setManualDate(ev.target.value)}
                      />
                    </label>
                  </div>
                  <button type="submit" className="btn-primary text-sm py-2 px-4 w-full sm:w-auto">
                    Save entry
                  </button>
                </form>

                <div className="lg:col-span-2 card-surface-static p-5">
                  <h3 className="font-semibold text-[#0F172A] mb-3">Reports (billable totals)</h3>
                  {report ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">By client</h4>
                        <ul className="space-y-2 text-sm">
                          {(report.by_client || []).map((r) => (
                            <li key={r.client_id} className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                              <span>{r.display_name}</span>
                              <span className="text-slate-600">
                                {r.total_minutes} min — {r.billable_amount} ZAR
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">By matter</h4>
                        <ul className="space-y-2 text-sm">
                          {(report.by_matter || []).map((r) => (
                            <li key={r.matter_id} className="flex justify-between gap-2 border-b border-slate-100 pb-2">
                              <span>{r.title}</span>
                              <span className="text-slate-600">
                                {r.total_minutes} min — {r.billable_amount} ZAR
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No report data yet.</p>
                  )}
                </div>

                <div className="lg:col-span-2 card-surface-static p-5">
                  <h3 className="font-semibold text-[#0F172A] mb-3">Recent time entries</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-500 border-b">
                          <th className="py-2 pr-3">Date</th>
                          <th className="py-2 pr-3">Matter</th>
                          <th className="py-2 pr-3">Min</th>
                          <th className="py-2 pr-3">Note</th>
                          <th className="py-2">Invoiced</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeEntries.slice(0, 40).map((te) => (
                          <tr key={te.id} className="border-b border-slate-50">
                            <td className="py-2 pr-3">{te.date_worked}</td>
                            <td className="py-2 pr-3">{te.matter_id || "—"}</td>
                            <td className="py-2 pr-3">{te.duration_minutes}</td>
                            <td className="py-2 pr-3 max-w-xs truncate">{te.description || "—"}</td>
                            <td className="py-2">{te.invoice_line_id ? "Yes" : "No"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "clients" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card-surface-static p-5 space-y-4">
                  <form onSubmit={createClient} className="space-y-3">
                    <h3 className="font-semibold text-[#0F172A]">New client</h3>
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Display name"
                      value={newClientName}
                      onChange={(ev) => setNewClientName(ev.target.value)}
                    />
                    <button type="submit" className="btn-primary text-sm py-2 px-4">
                      Add client
                    </button>
                  </form>
                  <ul className="text-sm space-y-2">
                    {clients.map((c) => (
                      <li key={c.id} className="border-t border-slate-100 pt-2">
                        <strong>{c.display_name}</strong>
                        {c.billing_email ? <span className="text-slate-500"> — {c.billing_email}</span> : null}
                      </li>
                    ))}
                  </ul>
                  <form onSubmit={createContact} className="pt-4 border-t border-slate-200 space-y-2">
                    <h4 className="text-sm font-semibold text-[#0F172A]">Add contact</h4>
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={contactClientId}
                      onChange={(ev) => setContactClientId(ev.target.value)}
                      required
                    >
                      <option value="">Client…</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.display_name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Name"
                      value={contactName}
                      onChange={(ev) => setContactName(ev.target.value)}
                    />
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Email"
                      type="email"
                      value={contactEmail}
                      onChange={(ev) => setContactEmail(ev.target.value)}
                    />
                    <button type="submit" className="btn-secondary text-sm py-2 px-4">
                      Save contact
                    </button>
                  </form>
                </div>

                <form onSubmit={createMatter} className="card-surface-static p-5 space-y-3">
                  <h3 className="font-semibold text-[#0F172A]">New matter</h3>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={newMatterClientId}
                    onChange={(ev) => setNewMatterClientId(ev.target.value)}
                  >
                    <option value="">— optional client —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.display_name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Matter title"
                    value={newMatterTitle}
                    onChange={(ev) => setNewMatterTitle(ev.target.value)}
                  />
                  <button type="submit" className="btn-primary text-sm py-2 px-4">
                    Add matter
                  </button>
                  <ul className="text-sm space-y-2 mt-4">
                    {matters.map((m) => {
                      const cn = clients.find((c) => c.id === m.client_id);
                      return (
                        <li key={m.id} className="border-t border-slate-100 pt-2">
                          {m.title}
                          {cn ? <span className="text-slate-500"> — {cn.display_name}</span> : null}
                          <span className="text-xs text-slate-400 ml-2">({m.status})</span>
                        </li>
                      );
                    })}
                  </ul>
                </form>
              </div>
            ) : null}

            {tab === "invoices" ? (
              <div className="space-y-6">
                <form onSubmit={generateInvoice} className="card-surface-static p-5 flex flex-wrap gap-3 items-end">
                  <label className="text-sm text-slate-600">
                    Client
                    <select
                      className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm min-w-[200px]"
                      value={invoiceClientId}
                      onChange={(ev) => setInvoiceClientId(ev.target.value)}
                      required
                    >
                      <option value="">Select…</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.display_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-slate-600">
                    Tax rate (e.g. 0.15)
                    <input
                      className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm w-28"
                      value={invoiceTax}
                      onChange={(ev) => setInvoiceTax(ev.target.value)}
                    />
                  </label>
                  <button type="submit" className="btn-primary text-sm py-2 px-4">
                    Generate from unbilled time
                  </button>
                </form>
                <p className="text-xs text-slate-500">
                  Includes only billable entries on matters linked to this client, not yet on an invoice.
                </p>
                <div className="card-surface-static p-5">
                  <h3 className="font-semibold text-[#0F172A] mb-3">Invoices</h3>
                  <ul className="space-y-3 text-sm">
                    {invoices.map((inv) => (
                      <li
                        key={inv.id}
                        className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3"
                      >
                        <div>
                          <strong>{inv.reference}</strong> — {inv.status} — total {inv.total} {inv.currency}
                          <div className="text-xs text-slate-500">{inv.issue_date}</div>
                        </div>
                        <button
                          type="button"
                          className="btn-secondary text-xs py-1.5 px-3"
                          onClick={() => downloadPdf(inv.id)}
                        >
                          Download PDF
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {tab === "comms" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card-surface-static p-5 space-y-3">
                  <h3 className="font-semibold text-[#0F172A]">Matter log</h3>
                  <label className="text-xs text-slate-500 block">
                    Matter
                    <select
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={commMatterId}
                      onChange={(ev) => setCommMatterId(ev.target.value)}
                    >
                      <option value="">Select matter…</option>
                      {matters.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <form onSubmit={addCommunication} className="space-y-2">
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={commChannel}
                      onChange={(ev) => setCommChannel(ev.target.value)}
                    >
                      <option value="note">Note</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="meeting">Meeting</option>
                    </select>
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Subject"
                      value={commSubject}
                      onChange={(ev) => setCommSubject(ev.target.value)}
                    />
                    <textarea
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[100px]"
                      placeholder="Body / notes"
                      value={commBody}
                      onChange={(ev) => setCommBody(ev.target.value)}
                    />
                    <button type="submit" className="btn-primary text-sm py-2 px-4">
                      Add to log
                    </button>
                  </form>
                </div>
                <div className="card-surface-static p-5">
                  <h3 className="font-semibold text-[#0F172A] mb-3">History</h3>
                  <ul className="space-y-3 text-sm max-h-[480px] overflow-y-auto">
                    {comms.map((row) => (
                      <li key={row.id} className="border-b border-slate-100 pb-2">
                        <div className="text-xs text-slate-500">
                          {row.occurred_at} · {row.channel} · {row.direction}
                        </div>
                        {row.subject ? <div className="font-medium">{row.subject}</div> : null}
                        <div className="text-slate-700 whitespace-pre-wrap">{row.body}</div>
                        {row.channel === "email" ? (
                          <button
                            type="button"
                            className="mt-1 text-xs text-[#16A34A] font-semibold"
                            onClick={() => sendCommEmail(row.id)}
                          >
                            Send as email…
                          </button>
                        ) : null}
                        {row.email_sent_at ? (
                          <div className="text-xs text-emerald-600">Sent {row.email_sent_at}</div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </ClientLayout>
  );
}
