import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import { formatApiError } from "../utils/apiError.js";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";

const TABS = [
  { id: "newsletter", label: "Newsletter", variant: "newsletter", previewPath: "/api/admin/saas/product-email/preview/" },
  { id: "lead_gen", label: "Lead generation", variant: "lead_gen", previewPath: "/api/admin/saas/lead-gen/preview/" },
];

export default function AdminComms() {
  const [tab, setTab] = useState("newsletter");
  const t = TABS.find((x) => x.id === tab) || TABS[0];

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [markdownBody, setMarkdownBody] = useState("");
  const [path, setPath] = useState("");
  const [brief, setBrief] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [saveToFile, setSaveToFile] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [lastModel, setLastModel] = useState("");
  const [fileNote, setFileNote] = useState("");

  const loadFilePreview = useCallback(async () => {
    setError("");
    setFileNote("");
    setLoading(true);
    setSendResult(null);
    try {
      const res = await fetch(apiUrl(t.previewPath), {
        headers: authHeaders({ json: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 404) {
          setSubject("");
          setMarkdownBody("");
          setPath(data.path || "");
          setFileNote("No markdown file yet — generate with AI or paste content below, then send.");
          return;
        }
        setError(formatApiError(data));
        setSubject("");
        setMarkdownBody("");
        setPath(data.path || "");
        return;
      }
      setSubject(data.subject || "");
      setMarkdownBody(data.markdown_body || "");
      setPath(data.path || "");
    } finally {
      setLoading(false);
    }
  }, [t.previewPath]);

  useEffect(() => {
    loadFilePreview();
  }, [loadFilePreview]);

  async function renderPreviewFromEditor() {
    setError("");
    setSendResult(null);
    try {
      const res = await fetch(apiUrl("/api/admin/saas/email/preview-render/"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ markdown_body: markdownBody, variant: t.variant }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data));
        return;
      }
      setSendResult({ preview_only: true, note: "Preview refreshed from editor (not sent)." });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed");
    }
  }

  async function generateDraft() {
    setError("");
    setSendResult(null);
    setDrafting(true);
    setLastModel("");
    try {
      const res = await fetch(apiUrl("/api/admin/saas/email/draft/"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          kind: t.id === "lead_gen" ? "lead_gen" : "newsletter",
          brief: brief.trim(),
          save_to_file: saveToFile,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data));
        return;
      }
      setSubject(data.subject || "");
      setMarkdownBody(data.markdown_body || "");
      if (data.model) setLastModel(data.model);
      if (data.path_written) setPath(data.path_written);
      setSendResult({
        draft: true,
        path_written: data.path_written,
        note: data.path_written ? `Saved to ${data.path_written}` : "Generated — review before send.",
      });
    } finally {
      setDrafting(false);
    }
  }

  async function postSend(dryRun) {
    setError("");
    setSendResult(null);
    setSending(true);
    try {
      const sendUrl =
        t.variant === "lead_gen" ? "/api/admin/saas/lead-gen/send/" : "/api/admin/saas/newsletter/send/";
      const payload = { dry_run: dryRun };
      if (subject.trim() && markdownBody.trim()) {
        payload.subject = subject.trim();
        payload.markdown_body = markdownBody.trim();
      }
      const res = await fetch(apiUrl(sendUrl), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data));
        return;
      }
      setSendResult(data);
    } finally {
      setSending(false);
    }
  }

  const audienceHint =
    t.variant === "lead_gen"
      ? "prospect mailing list only (not app sign-ups) — manage under Mailing lists"
      : "newsletter mailing list (Profile opt-in + imports) — manage under Mailing lists";

  return (
    <AdminLayout title="Communications" subtitle="AI drafts, newsletters & lead gen">
      <div className="max-w-3xl space-y-6">
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
          {TABS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setTab(x.id)}
              className={[
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                tab === x.id ? "bg-white text-emerald-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              {x.label}
            </button>
          ))}
        </div>

        <div className="card-surface-static p-5 sm:p-6 border border-emerald-100">
          <h2 className="text-sm font-semibold text-slate-800">1. AI draft (OpenRouter)</h2>
          <p className="text-xs text-slate-600 mt-1 mb-3">
            Paste a short brief (talking points, tone, links). The model returns subject + markdown body. Optionally save to the
            server markdown file for git.
          </p>
          <textarea
            className="input-field min-h-[100px] text-sm"
            placeholder={
              t.variant === "lead_gen"
                ? "e.g. Push free trial, mention new contract AI, CTA register, deadline end of month…"
                : "e.g. Ship dark mode, faster RAG, link to /billing yearly discount…"
            }
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
          />
          <label className="flex items-center gap-2 mt-3 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-emerald-600"
              checked={saveToFile}
              onChange={(e) => setSaveToFile(e.target.checked)}
            />
            Save to file on server (overwrites {t.variant === "lead_gen" ? "LEAD_GEN_AD.md" : "PRODUCT_EMAIL_DIGEST.md"})
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={drafting || !brief.trim()}
              onClick={() => generateDraft()}
              className="btn-primary disabled:opacity-50"
            >
              {drafting ? "Generating…" : "Generate with AI"}
            </button>
            {lastModel ? (
              <span className="text-xs text-slate-500 self-center">Model: {lastModel}</span>
            ) : null}
          </div>
        </div>

        {fileNote ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50 text-sky-950 text-sm px-4 py-3">{fileNote}</div>
        ) : null}

        <div className="card-surface-static p-5 sm:p-6 border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800">2. Edit & preview</h2>
          <p className="text-xs text-slate-600 mt-1 mb-3">
            File path:{" "}
            {path ? (
              <code className="text-xs bg-slate-50 px-1 rounded break-all">{path}</code>
            ) : (
              "—"
            )}{" "}
            <button type="button" className="text-emerald-700 font-medium ml-2" onClick={() => loadFilePreview()}>
              Reload from file
            </button>
          </p>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Subject</label>
          <input
            className="input-field mb-3 text-sm"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <label className="block text-xs font-semibold text-slate-500 mb-1">Markdown body</label>
          <textarea
            className="input-field min-h-[200px] text-xs font-mono"
            value={markdownBody}
            onChange={(e) => setMarkdownBody(e.target.value)}
          />
          <button type="button" className="mt-2 text-sm text-emerald-800 font-medium" onClick={() => renderPreviewFromEditor()}>
            Validate render (server)
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3 whitespace-pre-wrap">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-slate-600">Loading file preview…</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={sending || loading || !markdownBody.trim()}
            onClick={() => postSend(true)}
            className="btn-secondary disabled:opacity-50"
          >
            {sending ? "Sending…" : "Dry run (email me only)"}
          </button>
          <button
            type="button"
            disabled={sending || loading || !markdownBody.trim()}
            onClick={() => {
              if (
                !window.confirm(
                  `Send this ${t.label.toLowerCase()} to all ${audienceHint}? Uses SMTP quota.`,
                )
              ) {
                return;
              }
              postSend(false);
            }}
            className="btn-primary disabled:opacity-50"
          >
            Send to audience
          </button>
        </div>

        {sendResult && !sendResult.preview_only ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 text-emerald-950 text-sm px-4 py-3 space-y-1">
            {sendResult.draft ? (
              <p>
                <strong>Draft</strong> — {sendResult.note || "OK"}
                {sendResult.path_written ? (
                  <span className="block text-xs mt-1 opacity-90">{sendResult.path_written}</span>
                ) : null}
              </p>
            ) : (
              <p>
                <strong>{sendResult.dry_run ? "Dry run" : "Send"}</strong> — sent: {sendResult.sent}, failed:{" "}
                {sendResult.failed?.length ?? 0}
                {!sendResult.dry_run && sendResult.recipient_count != null
                  ? ` (targets: ${sendResult.recipient_count})`
                  : ""}
                {sendResult.variant ? ` · ${sendResult.variant}` : ""}
              </p>
            )}
            {sendResult.failed && sendResult.failed.length > 0 ? (
              <ul className="list-disc list-inside text-xs opacity-90">
                {sendResult.failed.slice(0, 8).map((f, i) => (
                  <li key={i}>
                    {f.email}: {f.error}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        {sendResult?.preview_only ? (
          <p className="text-xs text-slate-500">{sendResult.note}</p>
        ) : null}
      </div>
    </AdminLayout>
  );
}
