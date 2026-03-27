import React, { useEffect, useState } from "react";
import ClientLayout from "../components/ClientLayout.jsx";
import { getAiJson, postAiJson } from "../utils/aiApi.js";
import { pushAiActivity } from "../utils/aiActivity.js";

const AREA_ICONS = {
  labour: "👷",
  conveyancing: "🏠",
  corporate: "🏢",
  litigation: "⚖️",
};

function MetricsPills({ model, usage, metrics }) {
  if (!model && !usage && !metrics) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {model ? <span className="px-2 py-1 rounded bg-slate-100 font-mono text-slate-700">{model}</span> : null}
      {metrics?.latency_ms != null ? (
        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">Latency {metrics.latency_ms} ms</span>
      ) : null}
      {usage?.total_tokens != null ? (
        <span className="px-2 py-1 rounded bg-violet-50 text-violet-700">Tokens {usage.total_tokens}</span>
      ) : null}
    </div>
  );
}

export default function SAModules() {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [query, setQuery] = useState("");
  const [contextText, setContextText] = useState("");
  const [model, setModel] = useState("");
  const [includeExternal, setIncludeExternal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAiJson("/api/ai/sa/modules/");
        setAreas(Array.isArray(data.practice_areas) ? data.practice_areas : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load modules");
      }
    }
    load();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q || !selectedArea) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const body = {
        query: q,
        include_external: includeExternal,
      };
      if (contextText.trim()) body.context_text = contextText.trim();
      if (model.trim()) body.model = model.trim();

      const data = await postAiJson(`/api/ai/sa/modules/${selectedArea}/analyze/`, body);
      setResult(data);
      pushAiActivity("summary", `SA Module (${selectedArea}): ${q.slice(0, 80)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ClientLayout title="SA Practice Modules">
      <p className="text-sm text-slate-600 mb-6 max-w-3xl">
        Specialised AI analysis for South African legal practice areas. Each module uses domain-specific
        prompting, applicable legislation, and external sources (SAFLII, CCMA) for grounded advice.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        {areas.map((a) => (
          <button
            key={a.code}
            type="button"
            onClick={() => { setSelectedArea(a.code); setError(""); setResult(null); }}
            className={[
              "px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left",
              selectedArea === a.code
                ? "bg-[#DCFCE7] border-[#86EFAC] text-[#14532D] shadow-md"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm",
            ].join(" ")}
          >
            <span className="mr-1.5">{AREA_ICONS[a.code] || "📋"}</span>
            <span className="font-semibold">{a.name}</span>
            <p className="text-xs mt-1 opacity-80">{a.description}</p>
          </button>
        ))}
      </div>

      {selectedArea ? (
        <div className="card-surface-static p-5 sm:p-6 rounded-xl space-y-4 max-w-5xl">
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Your question or scenario
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                placeholder={
                  selectedArea === "labour"
                    ? "e.g. An employee was dismissed after 3 verbal warnings but no written notice. Was this procedurally fair?"
                    : selectedArea === "conveyancing"
                    ? "e.g. Review the transfer process for a sectional title unit in Johannesburg."
                    : selectedArea === "corporate"
                    ? "e.g. Does this data processing clause comply with POPIA Section 11?"
                    : "e.g. What are the prospects of success for an urgent interdict application?"
                }
              />
            </label>

            <label className="block text-sm text-slate-700">
              Additional context (optional — paste clause text, facts, etc.)
              <textarea
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
              />
            </label>

            <div className="flex flex-wrap gap-4 items-end">
              <label className="text-sm text-slate-700">
                Model (optional)
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="block mt-1 w-64 rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeExternal}
                  onChange={(e) => setIncludeExternal(e.target.checked)}
                  className="rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A]"
                />
                Include external sources (SAFLII, CCMA)
              </label>
            </div>

            <button type="submit" disabled={loading || !query.trim()} className="btn-primary disabled:opacity-50">
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          </form>

          {result ? (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <MetricsPills model={result.model} usage={result.usage} metrics={result.metrics} />

              {result.practice_area ? (
                <div className="flex items-center gap-2 text-sm">
                  <span>{AREA_ICONS[result.practice_area.code] || "📋"}</span>
                  <span className="font-semibold text-[#0F172A]">{result.practice_area.name}</span>
                </div>
              ) : null}

              <div className="prose prose-slate max-w-none text-slate-800 whitespace-pre-wrap">{result.answer}</div>

              {Array.isArray(result.sources) && result.sources.length > 0 ? (
                <div>
                  <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Internal sources used</h3>
                  <ul className="space-y-1">
                    {result.sources.slice(0, 5).map((s, i) => (
                      <li key={i} className="text-sm p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="font-medium">{s.document_title || "Document"}</span>
                        {typeof s.score === "number" ? <span className="ml-2 font-mono text-xs text-slate-500">{s.score.toFixed(3)}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {result.external_sources ? (
                <div className="space-y-2">
                  {Array.isArray(result.external_sources.case_law) && result.external_sources.case_law.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-semibold text-[#0F172A] mb-1">External case law</h3>
                      <ul className="space-y-1">
                        {result.external_sources.case_law.map((c, i) => (
                          <li key={i} className="text-sm p-2 bg-blue-50 rounded border border-blue-100">
                            <span className="font-medium">{c.title}</span>
                            {c.url ? (
                              <a href={c.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-[#16A34A] hover:underline">
                                View
                              </a>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {Array.isArray(result.external_sources.ccma) && result.external_sources.ccma.length > 0 ? (
                    <div>
                      <h3 className="text-sm font-semibold text-[#0F172A] mb-1">CCMA rulings</h3>
                      <ul className="space-y-1">
                        {result.external_sources.ccma.map((c, i) => (
                          <li key={i} className="text-sm p-2 bg-amber-50 rounded border border-amber-100">
                            <span className="font-medium">{c.title}</span>
                            {c.url ? (
                              <a href={c.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-[#16A34A] hover:underline">
                                View
                              </a>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2">{error}</p> : null}
        </div>
      ) : null}
    </ClientLayout>
  );
}
