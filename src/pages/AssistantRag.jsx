import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import ClientLayout from "../components/ClientLayout.jsx";
import { pushAiActivity } from "../utils/aiActivity.js";
import { postAiJson } from "../utils/aiApi.js";
import { authHeaders } from "../utils/authHeaders.js";

const TABS = [
  { id: "rag", label: "RAG Q&A" },
  { id: "risk", label: "Clause risk" },
  { id: "draft", label: "Drafting" },
  { id: "research", label: "Legal research" },
];

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

const TAB_IDS = new Set(["rag", "risk", "draft", "research"]);

export default function AssistantRag() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState("rag");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [ragQuery, setRagQuery] = useState("");
  const [model, setModel] = useState("");
  const [ragDocuments, setRagDocuments] = useState([]);
  const [ragSelectedDocIds, setRagSelectedDocIds] = useState([]);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [usage, setUsage] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [responseModel, setResponseModel] = useState("");

  const [clauseText, setClauseText] = useState("");
  const [jurisdiction, setJurisdiction] = useState("South Africa");
  const [contractType, setContractType] = useState("");
  const [riskResult, setRiskResult] = useState(null);

  const [researchQuery, setResearchQuery] = useState("");
  const [researchTopK, setResearchTopK] = useState(8);
  const [researchMaxContextChars, setResearchMaxContextChars] = useState(24000);
  const [researchLanguage, setResearchLanguage] = useState("");
  const [includeExternalSources, setIncludeExternalSources] = useState(false);
  const [citationVerification, setCitationVerification] = useState(null);
  const [researchPrecedents, setResearchPrecedents] = useState([]);
  const [externalSources, setExternalSources] = useState(null);

  const [instruction, setInstruction] = useState("");
  const [draftSource, setDraftSource] = useState("");
  const [draftStyle, setDraftStyle] = useState("balanced");
  const [draftResult, setDraftResult] = useState(null);

  useEffect(() => {
    const hash = (location.hash || "").replace(/^#/, "");
    if (TAB_IDS.has(hash)) {
      setTab(hash);
    }
  }, [location.hash]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setRagQuery(q);
    const docIdsParam = searchParams.get("docIds");
    if (docIdsParam) {
      const ids = docIdsParam
        .split(",")
        .map((x) => Number(x))
        .filter((x) => Number.isInteger(x) && x > 0);
      setRagSelectedDocIds(Array.from(new Set(ids)));
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadRagDocuments() {
      try {
        const res = await fetch("/api/ai/documents/?page=1&page_size=200", {
          headers: authHeaders({ json: false }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setRagDocuments(Array.isArray(data.results) ? data.results : []);
        }
      } catch {
        // keep RAG usable without document list
      }
    }
    loadRagDocuments();
  }, []);

  function toggleRagDocument(id) {
    setRagSelectedDocIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const riskToneClass = useMemo(() => {
    const level = riskResult?.risk_level;
    if (level === "critical") return "bg-red-100 text-red-700";
    if (level === "high") return "bg-orange-100 text-orange-700";
    if (level === "medium") return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  }, [riskResult?.risk_level]);

  function resetShared() {
    setError("");
    setUsage(null);
    setMetrics(null);
    setResponseModel("");
    setCitationVerification(null);
    setResearchPrecedents([]);
    setExternalSources(null);
  }

  async function onRagSubmit(e) {
    e.preventDefault();
    const q = ragQuery.trim();
    if (!q) return;
    resetShared();
    setLoading(true);
    setAnswer("");
    setSources([]);
    try {
      const body = {
        query: q,
        document_ids: ragSelectedDocIds.length ? ragSelectedDocIds : undefined,
      };
      const data = await postAiJson("/api/ai/rag/", body);
      const ans = typeof data.answer === "string" ? data.answer : "";
      setAnswer(ans);
      setSources(Array.isArray(data.sources) ? data.sources : []);
      setUsage(data.usage || null);
      setMetrics(data.metrics || null);
      setResponseModel(data.model || "");
      pushAiActivity("summary", `RAG: ${q.slice(0, 90)} → ${ans.slice(0, 140)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function onRiskSubmit(e) {
    e.preventDefault();
    const clause = clauseText.trim();
    if (!clause) return;
    resetShared();
    setLoading(true);
    setRiskResult(null);
    try {
      const data = await postAiJson("/api/ai/risk/", {
        clause_text: clause,
        jurisdiction: jurisdiction.trim(),
        contract_type: contractType.trim(),
        model: model.trim() || undefined,
      });
      setRiskResult(data);
      setUsage(data.usage || null);
      setMetrics(data.metrics || null);
      setResponseModel(data.model || "");
      pushAiActivity("summary", `Risk: ${data.risk_level || "unknown"} (${data.risk_score ?? "?"})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Risk analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDraftSubmit(e) {
    e.preventDefault();
    const task = instruction.trim();
    if (!task) return;
    resetShared();
    setLoading(true);
    setDraftResult(null);
    try {
      const data = await postAiJson("/api/ai/draft/", {
        instruction: task,
        source_text: draftSource.trim(),
        style: draftStyle,
        contract_type: contractType.trim(),
        model: model.trim() || undefined,
      });
      setDraftResult(data);
      setUsage(data.usage || null);
      setMetrics(data.metrics || null);
      setResponseModel(data.model || "");
      pushAiActivity("summary", `Draft: ${task.slice(0, 100)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Drafting failed");
    } finally {
      setLoading(false);
    }
  }

  async function onResearchSubmit(e) {
    e.preventDefault();
    const q = researchQuery.trim();
    if (!q) return;
    resetShared();
    setLoading(true);
    setAnswer("");
    setSources([]);
    setCitationVerification(null);
    setExternalSources(null);
    try {
      const body = {
        query: q,
        top_k: Math.min(50, Math.max(1, Number(researchTopK) || 8)),
        max_context_chars: Number(researchMaxContextChars) || 24000,
        include_external_sources: includeExternalSources,
      };
      if (model.trim()) body.model = model.trim();
      if (researchLanguage.trim()) body.language = researchLanguage.trim();

      const data = await postAiJson("/api/ai/research/", body);
      const ans = typeof data.answer === "string" ? data.answer : "";
      setAnswer(ans);
      setSources(Array.isArray(data.sources) ? data.sources : []);
      setUsage(data.usage || null);
      setMetrics(data.metrics || null);
      setResponseModel(data.model || "");
      setCitationVerification(data.citation_verification || null);
      setResearchPrecedents(Array.isArray(data.precedents) ? data.precedents : []);
      setExternalSources(data.external_sources || null);
      pushAiActivity("summary", `Research: ${q.slice(0, 90)} → ${ans.slice(0, 140)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ClientLayout title="Assistant (RAG)">
      <p className="text-sm text-slate-600 mb-4 max-w-3xl">
        Production workflows for grounded Q&A, structured clause-risk classification, and drafting. Each response shows
        model, latency, and token usage for observability.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setError("");
              window.history.replaceState(null, "", `${location.pathname}#${t.id}`);
            }}
            className={[
              "px-3 py-2 rounded-lg text-sm font-medium border",
              tab === t.id ? "bg-[#DCFCE7] border-[#86EFAC] text-[#14532D]" : "bg-white border-slate-200 text-slate-600",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card-surface-static p-5 sm:p-6 space-y-4 max-w-5xl">
        {tab === "rag" ? (
          <form onSubmit={onRagSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Question
              <textarea
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                placeholder="What is the notice period for termination?"
              />
            </label>
            <div className="flex flex-wrap gap-4 items-end">
              <p className="text-xs text-slate-500">
                Retrieval depth is managed by backend defaults for MVP.
              </p>
            </div>
            <div>
              <p className="block text-sm font-medium text-slate-700 mb-1.5">
                Documents scope {ragSelectedDocIds.length ? `(${ragSelectedDocIds.length} selected)` : "(all uploaded documents)"}
              </p>
              {ragDocuments.length === 0 ? (
                <p className="text-xs text-slate-500">No documents found yet. Upload documents first.</p>
              ) : (
                <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                  {ragDocuments.map((doc) => (
                    <label key={doc.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={ragSelectedDocIds.includes(doc.id)}
                        onChange={() => toggleRagDocument(doc.id)}
                        className="rounded border-slate-300 text-[#16A34A] focus:ring-[#22C55E]/40"
                      />
                      <span className="truncate">{doc.title || doc.file_name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={loading || !ragQuery.trim()} className="btn-primary disabled:opacity-50">
              {loading ? "Thinking…" : "Ask"}
            </button>

            {answer ? (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <MetricsPills model={responseModel} usage={usage} metrics={metrics} />
                <div className="prose prose-slate max-w-none text-slate-800 whitespace-pre-wrap">{answer}</div>
                {sources.length > 0 ? (
                  <ul className="space-y-2">
                    {sources.map((s, i) => (
                      <li key={`${s.chunk_id ?? i}`} className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-800">{s.document_title || "Document"}</span>
                          {typeof s.score === "number" ? (
                            <span className="font-mono text-xs text-slate-500">{s.score.toFixed(4)}</span>
                          ) : null}
                        </div>
                        {s.document_id != null ? (
                          <Link to={`/documents/${s.document_id}`} className="text-xs text-[#16A34A] hover:underline">
                            Open source document
                          </Link>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </form>
        ) : null}

        {tab === "risk" ? (
          <form onSubmit={onRiskSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Clause text
              <textarea
                value={clauseText}
                onChange={(e) => setClauseText(e.target.value)}
                rows={6}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                placeholder="Paste a clause for risk assessment…"
              />
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="text-sm text-slate-700">
                Jurisdiction
                <input
                  type="text"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="block mt-1 w-52 rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="text-sm text-slate-700">
                Contract type
                <input
                  type="text"
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="block mt-1 w-52 rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
            </div>
            <button type="submit" disabled={loading || !clauseText.trim()} className="btn-primary disabled:opacity-50">
              {loading ? "Analyzing…" : "Analyze risk"}
            </button>

            {riskResult ? (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <MetricsPills model={responseModel} usage={usage} metrics={metrics} />
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase ${riskToneClass}`}>
                    {riskResult.risk_level}
                  </span>
                  <span className="text-sm text-slate-700">Score: {riskResult.risk_score}/100</span>
                  <span className="text-sm text-slate-500">Type: {riskResult.clause_type || "general"}</span>
                </div>
                {riskResult.rationale ? <p className="text-sm text-slate-700">{riskResult.rationale}</p> : null}
                {Array.isArray(riskResult.key_issues) && riskResult.key_issues.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Key issues</h3>
                    <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                      {riskResult.key_issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {Array.isArray(riskResult.recommendations) && riskResult.recommendations.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Recommendations</h3>
                    <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                      {riskResult.recommendations.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </form>
        ) : null}

        {tab === "draft" ? (
          <form onSubmit={onDraftSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Drafting instruction
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                placeholder="Rewrite this clause to cap liability at 12 months fees and carve out fraud."
              />
            </label>
            <label className="block text-sm text-slate-700">
              Source clause/text (optional)
              <textarea
                value={draftSource}
                onChange={(e) => setDraftSource(e.target.value)}
                rows={5}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              />
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="text-sm text-slate-700">
                Style
                <select
                  value={draftStyle}
                  onChange={(e) => setDraftStyle(e.target.value)}
                  className="block mt-1 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="balanced">Balanced</option>
                  <option value="formal">Formal</option>
                  <option value="plain_english">Plain English</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </label>
            </div>
            <button type="submit" disabled={loading || !instruction.trim()} className="btn-primary disabled:opacity-50">
              {loading ? "Drafting…" : "Generate draft"}
            </button>

            {draftResult ? (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <MetricsPills model={responseModel} usage={usage} metrics={metrics} />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Draft text</h3>
                  <pre className="text-sm whitespace-pre-wrap p-3 rounded-lg border border-slate-100 bg-slate-50">
                    {draftResult.draft_text}
                  </pre>
                </div>
                {draftResult.rationale ? <p className="text-sm text-slate-700">{draftResult.rationale}</p> : null}
                {Array.isArray(draftResult.redline_notes) && draftResult.redline_notes.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">Redline notes</h3>
                    <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                      {draftResult.redline_notes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </form>
        ) : null}

        {tab === "research" ? (
          <form onSubmit={onResearchSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Legal research question
              <textarea
                value={researchQuery}
                onChange={(e) => setResearchQuery(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                placeholder="e.g. What are typical termination notice periods under South African employment contracts?"
              />
            </label>

            <div className="flex flex-wrap gap-4 items-end">
              <label className="text-sm text-slate-700">
                Top K (chunks)
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={researchTopK}
                  onChange={(e) => setResearchTopK(Number(e.target.value))}
                  className="block mt-1 w-28 rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="text-sm text-slate-700">
                Max context chars
                <input
                  type="number"
                  min={1000}
                  max={100000}
                  value={researchMaxContextChars}
                  onChange={(e) => setResearchMaxContextChars(Number(e.target.value))}
                  className="block mt-1 w-48 rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="text-sm text-slate-700">
                Language (optional)
                <select
                  value={researchLanguage}
                  onChange={(e) => setResearchLanguage(e.target.value)}
                  className="block mt-1 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="">Auto-detect</option>
                  <option value="en">English</option>
                  <option value="af">Afrikaans</option>
                  <option value="zu">Zulu</option>
                  <option value="xh">Xhosa</option>
                  <option value="st">Sesotho</option>
                </select>
              </label>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeExternalSources}
                onChange={(e) => setIncludeExternalSources(e.target.checked)}
                className="rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A]"
              />
              Include external SA legal sources (SAFLII case law &amp; legislation)
            </label>

            <button type="submit" disabled={loading || !researchQuery.trim()} className="btn-primary disabled:opacity-50">
              {loading ? "Researching…" : "Research"}
            </button>

            {answer ? (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <MetricsPills model={responseModel} usage={usage} metrics={metrics} />

                {citationVerification ? (
                  <div className="text-sm space-y-2">
                    <p className="font-semibold text-slate-800">Citation verification</p>
                    <p
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase",
                        citationVerification.status === "verified"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700",
                      ].join(" ")}
                    >
                      {citationVerification.status}
                    </p>
                    {citationVerification.external_verification ? (
                      <span className="ml-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                        External sources checked
                      </span>
                    ) : null}
                    {Array.isArray(citationVerification.missing_titles) && citationVerification.missing_titles.length > 0 ? (
                      <p className="text-slate-600">
                        Missing internal citations: {citationVerification.missing_titles.join(", ")}
                      </p>
                    ) : null}
                    {Array.isArray(citationVerification.external_citation_checks) && citationVerification.external_citation_checks.length > 0 ? (
                      <div className="mt-2">
                        <p className="font-medium text-slate-700 mb-1">External citation checks</p>
                        <ul className="space-y-1">
                          {citationVerification.external_citation_checks.map((c, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className={["inline-block w-2 h-2 rounded-full", c.found ? "bg-emerald-500" : "bg-red-400"].join(" ")} />
                              <span className="font-mono text-xs">{c.citation}</span>
                              {c.found && c.url ? (
                                <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[#16A34A] hover:underline text-xs">
                                  View on SAFLII
                                </a>
                              ) : null}
                              {!c.found ? <span className="text-xs text-slate-500">Not found externally</span> : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {externalSources ? (
                  <div className="space-y-3">
                    {Array.isArray(externalSources.case_law) && externalSources.case_law.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-semibold text-[#0F172A] mb-1">External case law (SAFLII)</h3>
                        <ul className="space-y-2">
                          {externalSources.case_law.map((c, i) => (
                            <li key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-[#0F172A]">{c.title}</span>
                                {c.court ? <span className="text-xs text-slate-500">{c.court}</span> : null}
                              </div>
                              {c.citation ? <p className="text-xs font-mono text-blue-700 mt-0.5">{c.citation}</p> : null}
                              {c.snippet ? <p className="mt-1 text-slate-700 line-clamp-3">{c.snippet}</p> : null}
                              {c.url ? (
                                <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#16A34A] hover:underline mt-1 inline-block">
                                  View full judgment
                                </a>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {Array.isArray(externalSources.legislation) && externalSources.legislation.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-semibold text-[#0F172A] mb-1">Legislation</h3>
                        <ul className="space-y-2">
                          {externalSources.legislation.map((l, i) => (
                            <li key={i} className="p-3 bg-violet-50 rounded-lg border border-violet-100 text-sm">
                              <span className="font-medium text-[#0F172A]">{l.title}</span>
                              {l.url ? (
                                <a href={l.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-[#16A34A] hover:underline">
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

                <div className="prose prose-slate max-w-none text-slate-800 whitespace-pre-wrap">{answer}</div>

                {Array.isArray(researchPrecedents) && researchPrecedents.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#0F172A]">Precedents</h3>
                    <ul className="space-y-2">
                      {researchPrecedents.map((p, i) => (
                        <li key={`${p.document_title ?? "doc"}-${i}`} className="card-surface-static p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#0F172A]">{p.document_title || "Document"}</span>
                            <span className={[
                              "px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase",
                              p.source_type === "internal" ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-700",
                            ].join(" ")}>
                              {p.source_type === "internal" ? "Internal" : "SAFLII"}
                            </span>
                            {p.court ? <span className="text-xs text-slate-500">{p.court}</span> : null}
                          </div>
                          {p.citation ? <p className="text-xs font-mono text-blue-700 mt-0.5">{p.citation}</p> : null}
                          {p.summary ? (
                            <p className="mt-1 text-slate-700 whitespace-pre-wrap">{p.summary}</p>
                          ) : null}
                          {p.url ? (
                            <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#16A34A] hover:underline mt-1 inline-block">
                              View source
                            </a>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {sources.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#0F172A]">Sources</h3>
                    <ul className="space-y-2">
                      {sources.map((s, i) => (
                        <li key={`${s.chunk_id ?? i}-${s.document_id ?? ""}`} className="card-surface-static p-3 text-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-medium text-[#0F172A]">{s.document_title || "Document"}</span>
                            {typeof s.score === "number" ? (
                              <span className="text-xs font-mono text-slate-600">{s.score.toFixed(4)}</span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-slate-700 whitespace-pre-wrap line-clamp-4">{s.content}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </form>
        ) : null}

        {error ? <p className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2">{error}</p> : null}
      </div>
    </ClientLayout>
  );
}
