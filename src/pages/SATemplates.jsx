import React, { useEffect, useState } from "react";
import ClientLayout from "../components/ClientLayout.jsx";
import { getAiJson, postAiJson } from "../utils/aiApi.js";

export default function SATemplates() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [variables, setVariables] = useState({});
  const [rendered, setRendered] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getAiJson("/api/ai/sa/templates/");
        setTemplates(Array.isArray(data.templates) ? data.templates : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load templates");
      }
    }
    load();
  }, []);

  async function onSelectTemplate(slug) {
    setSelected(slug);
    setDetail(null);
    setRendered("");
    setVariables({});
    setError("");
    try {
      const data = await getAiJson(`/api/ai/sa/templates/${slug}/`);
      setDetail(data);
      const init = {};
      for (const v of data.variables || []) {
        init[v.key] = v.default || "";
      }
      setVariables(init);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template");
    }
  }

  async function onRender(e) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError("");
    setRendered("");
    try {
      const data = await postAiJson(`/api/ai/sa/templates/${selected}/`, { variables });
      setRendered(data.rendered || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Render failed");
    } finally {
      setLoading(false);
    }
  }

  const categoryColors = {
    labour: "bg-blue-100 text-blue-700",
    corporate: "bg-violet-100 text-violet-700",
    conveyancing: "bg-amber-100 text-amber-700",
  };

  return (
    <ClientLayout title="SA Legal Templates">
      <p className="text-sm text-slate-600 mb-6 max-w-3xl">
        Pre-built South African legal document templates compliant with BCEA, POPIA, CPA, and other local legislation.
        Select a template, fill in the variables, and generate a ready-to-use document.
      </p>

      {!selected ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 max-w-5xl">
          {templates.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => onSelectTemplate(t.slug)}
              className="text-left card-surface-static p-5 rounded-xl border border-slate-200 hover:border-[#86EFAC] hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-[#0F172A]">{t.title}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${categoryColors[t.category] || "bg-slate-100 text-slate-600"}`}>
                  {t.category}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">{t.description}</p>
              <div className="flex gap-3 text-xs text-slate-500">
                <span>{t.variable_count} fields</span>
                <span>{t.clause_count} clauses</span>
              </div>
              {Array.isArray(t.applicable_legislation) && t.applicable_legislation.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {t.applicable_legislation.map((leg, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                      {leg}
                    </span>
                  ))}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {selected && detail ? (
        <div className="max-w-4xl">
          <button
            type="button"
            onClick={() => { setSelected(null); setDetail(null); setRendered(""); }}
            className="text-sm text-[#16A34A] hover:underline mb-4 inline-flex items-center gap-1"
          >
            &larr; Back to templates
          </button>

          <div className="card-surface-static p-5 sm:p-6 rounded-xl border border-slate-200 mb-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-1">{detail.title}</h2>
            <p className="text-sm text-slate-600 mb-4">{detail.description}</p>

            <form onSubmit={onRender} className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Template variables</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {(detail.variables || []).map((v) => (
                  <label key={v.key} className="block text-sm text-slate-700">
                    <span className="flex items-center gap-1">
                      {v.label}
                      {v.required ? <span className="text-red-400 text-xs">*</span> : null}
                    </span>
                    <input
                      type="text"
                      value={variables[v.key] || ""}
                      onChange={(e) => setVariables((prev) => ({ ...prev, [v.key]: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder={v.default || ""}
                    />
                  </label>
                ))}
              </div>
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                {loading ? "Generating…" : "Generate document"}
              </button>
            </form>
          </div>

          {rendered ? (
            <div className="card-surface-static p-5 sm:p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#0F172A]">Generated document</h3>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(rendered); }}
                  className="text-xs text-[#16A34A] hover:underline"
                >
                  Copy to clipboard
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-800 bg-slate-50 rounded-lg p-4 border border-slate-100 max-h-[600px] overflow-y-auto">
                {rendered}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2 max-w-3xl">{error}</p> : null}
    </ClientLayout>
  );
}
