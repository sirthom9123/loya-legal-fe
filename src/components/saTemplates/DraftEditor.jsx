import React, { useMemo, useState } from "react";
import { postAiJson } from "../../utils/aiApi.js";
import { downloadDocx } from "../../utils/downloadDocx.js";

function SectionBlock({
  section,
  index,
  busyKey,
  onChange,
  onRegenerate,
  onTighten,
  onExpand,
  onRedline,
  onDelete,
}) {
  const key = section.key || `idx-${index}`;
  const busy = busyKey === key;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
      <input
        className="w-full text-sm font-semibold text-[#0F172A] border-0 border-b border-transparent focus:border-slate-200 focus:outline-none px-0 py-1"
        value={section.heading || ""}
        onChange={(e) => onChange(index, { ...section, heading: e.target.value })}
      />
      <textarea
        rows={8}
        className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:border-slate-200"
        value={section.content || ""}
        onChange={(e) => onChange(index, { ...section, content: e.target.value })}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onRegenerate(index)}
          className="text-xs px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy ? "Working…" : "Regenerate"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onTighten(index)}
          className="text-xs px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          Tighten
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onExpand(index)}
          className="text-xs px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          Expand
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onRedline(index)}
          className="text-xs px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          Redline
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(index)}
          className="text-xs px-2.5 py-1 rounded-md border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      {Array.isArray(section.statute_citations) && section.statute_citations.length > 0 ? (
        <div className="flex flex-wrap gap-1 pt-1">
          {section.statute_citations.map((c, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px]">
              {c}
            </span>
          ))}
        </div>
      ) : null}
      {Array.isArray(section.warnings) && section.warnings.length > 0 ? (
        <ul className="text-xs text-amber-700 list-disc pl-4">
          {section.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function DraftEditor({
  draft,
  setDraft,
  templateSlug,
  workspaceId,
  includeLetterhead,
  cases,
  onBack,
}) {
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [caseId, setCaseId] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const sections = draft?.sections || [];
  const allCitations = useMemo(() => {
    const set = new Set();
    for (const s of sections) {
      for (const c of s.statute_citations || []) set.add(c);
    }
    return [...set];
  }, [sections]);

  function updateSection(index, next) {
    setDraft((prev) => {
      const list = [...(prev.sections || [])];
      list[index] = next;
      return { ...prev, sections: list };
    });
  }

  async function runSectionAction(index, { style = "as-is", mode = "regenerate" } = {}) {
    const section = sections[index];
    if (!section) return;
    const key = section.key || `idx-${index}`;
    setBusyKey(key);
    setError("");
    try {
      const data = await postAiJson("/api/ai/draft/section/regenerate/", {
        document_id: draft.document_id || null,
        document_text: draft.draft_text || "",
        section_key: section.key || key,
        section_heading: section.heading || "",
        current_content: section.content || "",
        style,
        mode,
        template_slug: templateSlug || "",
      });
      updateSection(index, {
        ...section,
        content: data.content || section.content,
        statute_citations: data.statute_citations || section.statute_citations || [],
        warnings: data.warnings || [],
      });
      if (data.summary) setStatusMsg(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Section update failed");
    } finally {
      setBusyKey("");
    }
  }

  function addClause() {
    setDraft((prev) => ({
      ...prev,
      sections: [
        ...(prev.sections || []),
        { key: `custom-${Date.now()}`, heading: "NEW CLAUSE", content: "", statute_citations: [], warnings: [] },
      ],
    }));
  }

  function deleteClause(index) {
    setDraft((prev) => ({
      ...prev,
      sections: (prev.sections || []).filter((_, i) => i !== index),
    }));
  }

  async function onExportDocx() {
    setExporting(true);
    setError("");
    try {
      const path = draft.document_id
        ? `/api/ai/draft/${draft.document_id}/export.docx`
        : "/api/ai/draft/export.docx";
      await downloadDocx(
        path,
        {
          title: draft.template_title || "Legal Document",
          sections,
          include_letterhead: includeLetterhead,
          workspace_id: workspaceId ? Number(workspaceId) : null,
          draft_text: draft.draft_text || "",
        },
        `${(draft.template_title || "document").replace(/\s+/g, "_")}.docx`
      );
      setStatusMsg("DOCX downloaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "DOCX export failed");
    } finally {
      setExporting(false);
    }
  }

  async function onSave() {
    setSaving(true);
    setError("");
    try {
      const draftText = [
        `# ${draft.template_title || "Document"}`,
        ...sections.map((s) => `\n## ${s.heading}\n\n${s.content}\n`),
      ].join("\n");
      const body = {
        title: draft.template_title || "SA Template Draft",
        content: draftText,
        include_letterhead: includeLetterhead,
        workspace_id: workspaceId ? Number(workspaceId) : null,
        case_id: caseId || null,
      };
      const data = await postAiJson("/api/ai/draft/save-document/", body);
      setDraft((prev) => ({ ...prev, document_id: data.document_id, draft_text: draftText }));
      setStatusMsg(
        data.case_linked
          ? `Saved as document #${data.document_id} and attached to case.`
          : `Saved as document #${data.document_id}.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-6xl">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-[#16A34A] hover:underline mb-4 inline-flex items-center gap-1"
      >
        &larr; Back to form
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A]">{draft.template_title || "Generated draft"}</h2>
          <p className="text-xs text-slate-500">
            {draft.document_id ? `Auto-saved as document #${draft.document_id}` : "Not yet saved"}
            {draft.model_used || draft.model ? ` · Model: ${draft.model_used || draft.model}` : ""}
            {draft.skeleton_version != null ? ` · Skeleton v${draft.skeleton_version}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="btn-primary disabled:opacity-50 text-sm"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={onExportDocx}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {exporting ? "Exporting…" : "Download DOCX"}
          </button>
          <button
            type="button"
            onClick={addClause}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Add clause
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {sections.map((section, index) => (
            <SectionBlock
              key={section.key || `idx-${index}`}
              section={section}
              index={index}
              busyKey={busyKey}
              onChange={updateSection}
              onRegenerate={(i) => runSectionAction(i, { style: "as-is" })}
              onTighten={(i) => runSectionAction(i, { style: "tighten" })}
              onExpand={(i) => runSectionAction(i, { style: "expand" })}
              onRedline={(i) => runSectionAction(i, { mode: "redline" })}
              onDelete={deleteClause}
            />
          ))}
        </div>

        <aside className="space-y-4">
          <div className="card-surface-static rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Attach to case
            </h3>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            >
              <option value="">None</option>
              {(cases || []).map((c) => (
                <option key={c.case_public_id || c.id} value={c.case_public_id || ""}>
                  {c.title || c.case_public_id}
                </option>
              ))}
            </select>
          </div>

          <div className="card-surface-static rounded-xl border border-slate-200 p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Statutes</h3>
            {allCitations.length === 0 ? (
              <p className="text-xs text-slate-400">No citations recorded.</p>
            ) : (
              <ul className="space-y-1">
                {allCitations.map((c) => (
                  <li key={c} className="text-xs text-emerald-800 bg-emerald-50 rounded px-2 py-1">
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {(draft.compliance_notes || []).length > 0 ? (
            <div className="card-surface-static rounded-xl border border-slate-200 p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Compliance notes
              </h3>
              <ul className="list-disc pl-4 space-y-1">
                {draft.compliance_notes.map((n, i) => (
                  <li key={i} className="text-xs text-slate-600">
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {draft.rationale ? (
            <div className="card-surface-static rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Rationale
              </h3>
              <p className="text-xs text-slate-600 whitespace-pre-wrap">{draft.rationale}</p>
            </div>
          ) : null}

          {draft.token_usage || draft.usage ? (
            <div className="card-surface-static rounded-xl border border-slate-200 p-4 text-xs text-slate-500">
              Tokens:{" "}
              {(draft.token_usage || draft.usage)?.total_tokens ??
                ((draft.token_usage || draft.usage)?.prompt_tokens || 0) +
                  ((draft.token_usage || draft.usage)?.completion_tokens || 0)}
              {draft.metrics?.latency_ms != null ? ` · ${draft.metrics.latency_ms} ms` : ""}
            </div>
          ) : null}
        </aside>
      </div>

      {statusMsg ? (
        <p className="mt-4 text-sm text-emerald-700 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
          {statusMsg}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2">{error}</p>
      ) : null}
    </div>
  );
}
