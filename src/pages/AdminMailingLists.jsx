import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { formatApiError } from "../utils/apiError.js";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";

const KINDS = [
  { id: "newsletter", label: "Newsletter", hint: "Product updates; synced when logged-in users opt in under Profile." },
  { id: "lead_gen", label: "Lead generation", hint: "Prospects who have not signed up — import or use the public subscribe API." },
];

export default function AdminMailingLists() {
  const [tab, setTab] = useState("newsletter");
  const meta = KINDS.find((k) => k.id === tab) || KINDS[0];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState([]);
  const [singleEmail, setSingleEmail] = useState("");
  const [singleFirstName, setSingleFirstName] = useState("");
  const [singleFirm, setSingleFirm] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editFirm, setEditFirm] = useState("");

  const load = useCallback(async () => {
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/saas/mailing-list/?kind=${encodeURIComponent(tab)}&limit=100`), {
        headers: authHeaders({ json: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data));
        setResults([]);
        return;
      }
      setTotal(data.total ?? 0);
      setResults(data.results || []);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function addOne(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/admin/saas/mailing-list/create/"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          kind: tab,
          email: singleEmail.trim(),
          first_name: singleFirstName.trim(),
          firm: singleFirm.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data));
        return;
      }
      setMsg(data.created ? "Added." : "Updated.");
      setSingleEmail("");
      setSingleFirstName("");
      setSingleFirm("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function importBulk() {
    setError("");
    setMsg("");
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/admin/saas/mailing-list/bulk/"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ kind: tab, emails: bulkText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data));
        return;
      }
      setMsg(`Imported ${data.saved ?? 0} of ${data.submitted ?? 0}. Invalid: ${data.invalid_count ?? 0}.`);
      setBulkText("");
      load();
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(row, next) {
    setError("");
    setMsg("");
    const res = await fetch(apiUrl(`/api/admin/saas/mailing-list/${row.id}/`), {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ is_active: next }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(formatApiError(data));
      return;
    }
    load();
  }

  function startEdit(row) {
    setEditingId(row.id);
    setEditFirstName(row.first_name || "");
    setEditFirm(row.firm || "");
  }

  async function saveEdit(row) {
    setError("");
    setMsg("");
    const res = await fetch(apiUrl(`/api/admin/saas/mailing-list/${row.id}/`), {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ first_name: editFirstName.trim(), firm: editFirm.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(formatApiError(data));
      return;
    }
    setEditingId(null);
    load();
  }

  return (
    <AdminLayout title="Mailing lists" subtitle="Newsletter vs lead-gen prospects">
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setTab(k.id)}
              className={[
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                tab === k.id ? "bg-white text-emerald-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              {k.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-600">{meta.hint}</p>

        <div className="rounded-xl border border-sky-200 bg-sky-50/90 text-sky-950 text-sm px-4 py-3">
          <strong className="font-semibold">Public API (landing pages):</strong>{" "}
          <code className="text-xs bg-white/80 px-1 rounded">POST /api/marketing/subscribe/</code> with{" "}
          <code className="text-xs">list</code>: <code className="text-xs">newsletter</code> or{" "}
          <code className="text-xs">lead_gen</code>, <code className="text-xs">email</code>, and leave{" "}
          <code className="text-xs">website</code> empty (honeypot).
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3 whitespace-pre-wrap">
            {error}
          </div>
        ) : null}
        {msg ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 text-sm px-4 py-3">{msg}</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <form onSubmit={addOne} className="card-surface-static p-4 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Add one contact</h3>
            <input
              type="email"
              className="input-field text-sm mb-2"
              placeholder="email@example.com"
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                className="input-field text-sm"
                placeholder="First name (optional)"
                value={singleFirstName}
                onChange={(e) => setSingleFirstName(e.target.value)}
              />
              <input
                type="text"
                className="input-field text-sm"
                placeholder="Firm (optional)"
                value={singleFirm}
                onChange={(e) => setSingleFirm(e.target.value)}
              />
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Used to fill <code className="bg-slate-50 px-1 rounded">{"{{FirstName}}"}</code> /{" "}
              <code className="bg-slate-50 px-1 rounded">{"{{Firm}}"}</code> merge tags in Communications.
            </p>
            <button type="submit" disabled={busy || !singleEmail.trim()} className="btn-primary text-sm disabled:opacity-50">
              Add
            </button>
          </form>
          <div className="card-surface-static p-4 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Bulk (paste)</h3>
            <textarea
              className="input-field text-xs font-mono min-h-[88px] mb-2"
              placeholder={"one@a.com\nretha@cdhlegal.com,Retha,CDH (Cliffe Dekker Hofmeyr)"}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <p className="text-xs text-slate-500 mb-2">
              One per line: bare email, or <code className="bg-slate-50 px-1 rounded">email,First Name,Firm</code>.
            </p>
            <button type="button" disabled={busy || !bulkText.trim()} onClick={importBulk} className="btn-secondary text-sm">
              Import
            </button>
          </div>
        </div>

        <div className="card-surface-static border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-800">Addresses ({total} total)</span>
            <button type="button" className="text-sm text-emerald-800 font-medium" onClick={() => load()}>
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="p-4 text-sm text-slate-600">Loading…</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No rows yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[420px] overflow-auto">
              {results.map((row) => (
                <li key={row.id} className="px-4 py-2.5 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono text-slate-800">{row.email}</span>
                      {editingId !== row.id ? (
                        <span className="ml-2 text-xs text-slate-500">
                          {row.first_name || row.firm
                            ? `${row.first_name || "—"} · ${row.firm || "—"}`
                            : "no name/firm set"}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={row.is_active ? "text-emerald-700" : "text-slate-400"}>
                        {row.is_active ? "active" : "inactive"}
                      </span>
                      <button
                        type="button"
                        className="text-xs font-medium text-slate-600 hover:text-slate-900"
                        onClick={() => toggleActive(row, !row.is_active)}
                      >
                        {row.is_active ? "Deactivate" : "Activate"}
                      </button>
                      {editingId === row.id ? (
                        <>
                          <button type="button" className="text-xs font-medium text-emerald-700" onClick={() => saveEdit(row)}>
                            Save
                          </button>
                          <button
                            type="button"
                            className="text-xs font-medium text-slate-500"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="text-xs font-medium text-slate-600 hover:text-slate-900"
                          onClick={() => startEdit(row)}
                        >
                          Edit name/firm
                        </button>
                      )}
                    </div>
                  </div>
                  {editingId === row.id ? (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input
                        type="text"
                        className="input-field text-xs"
                        placeholder="First name"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                      />
                      <input
                        type="text"
                        className="input-field text-xs"
                        placeholder="Firm"
                        value={editFirm}
                        onChange={(e) => setEditFirm(e.target.value)}
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
