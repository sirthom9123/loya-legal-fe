import React from "react";

function VariableInput({ variable, value, onChange }) {
  const type = variable.type || "text";
  const common =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white";

  if (type === "enum" && Array.isArray(variable.enum) && variable.enum.length) {
    return (
      <select className={common} value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {variable.enum.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }
  if (type === "textarea") {
    return (
      <textarea
        rows={3}
        className={common}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={variable.default || ""}
      />
    );
  }
  return (
    <input
      type="text"
      className={common}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={variable.default || ""}
    />
  );
}

export default function TemplateForm({
  detail,
  variables,
  setVariables,
  letterheads,
  workspaceId,
  setWorkspaceId,
  includeLetterhead,
  setIncludeLetterhead,
  playbooks,
  usePlaybook,
  setUsePlaybook,
  playbookId,
  setPlaybookId,
  loading,
  onGenerate,
  onPreview,
  onBack,
}) {
  const isPilot = Boolean(detail?.is_pilot);

  return (
    <div className="max-w-4xl">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-[#16A34A] hover:underline mb-4 inline-flex items-center gap-1"
      >
        &larr; Back to templates
      </button>

      <div className="card-surface-static p-5 sm:p-6 rounded-xl border border-slate-200 mb-6">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="text-lg font-semibold text-[#0F172A]">{detail.title}</h2>
          {isPilot ? (
            <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
              AI full draft
            </span>
          ) : (
            <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600">
              Outline only
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 mb-4">{detail.description}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onGenerate();
          }}
          className="space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-800">Template variables</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {(detail.variables || []).map((v) => (
              <label
                key={v.key}
                className={`block text-sm text-slate-700 ${v.type === "textarea" ? "sm:col-span-2" : ""}`}
              >
                <span className="flex items-center gap-1">
                  {v.label}
                  {v.required ? <span className="text-red-400 text-xs">*</span> : null}
                </span>
                <VariableInput
                  variable={v}
                  value={variables[v.key] || ""}
                  onChange={(val) => setVariables((prev) => ({ ...prev, [v.key]: val }))}
                />
              </label>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Generation options</h3>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={usePlaybook}
                onChange={(e) => setUsePlaybook(e.target.checked)}
                disabled={!isPilot}
              />
              Apply firm playbook (opt-in)
            </label>
            {usePlaybook ? (
              <select
                className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={playbookId}
                onChange={(e) => setPlaybookId(e.target.value)}
              >
                <option value="">Select playbook…</option>
                {(playbooks || []).map((pb) => (
                  <option key={pb.id} value={pb.id}>
                    {pb.title || `Playbook #${pb.id}`}
                  </option>
                ))}
              </select>
            ) : null}

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeLetterhead}
                onChange={(e) => setIncludeLetterhead(e.target.checked)}
              />
              Include firm letterhead on save / DOCX
            </label>
            {includeLetterhead ? (
              <select
                className="w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
              >
                <option value="">Select letterhead…</option>
                {(letterheads || []).map((lh) => (
                  <option key={lh.workspace_id} value={lh.workspace_id}>
                    {lh.firm_name}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={loading || !isPilot} className="btn-primary disabled:opacity-50">
              {loading ? "Generating full document…" : "Generate full document"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onPreview}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Preview outline
            </button>
          </div>
          {!isPilot ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              This template is not yet on the comprehensive AI pipeline. Use Preview outline, or open Drafting
              Workspace for free-form generation.
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Full drafts are auto-saved as documents and counted against your full-draft monthly quota (separate
              from chat AI usage).
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
