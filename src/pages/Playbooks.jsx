import React, { useEffect, useState } from "react";
import ClientLayout from "../components/ClientLayout.jsx";
import { getAiJson, postAiJson } from "../utils/aiApi.js";
import { authHeaders } from "../utils/authHeaders.js";

const RISK_COLORS = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

function RiskBadge({ level }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${RISK_COLORS[level] || RISK_COLORS.medium}`}>
      {level}
    </span>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: "bg-slate-100 text-slate-600",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

export default function Playbooks() {
  const [tab, setTab] = useState("playbooks");
  const [playbooks, setPlaybooks] = useState([]);
  const [builtins, setBuiltins] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPb, setSelectedPb] = useState(null);
  const [pbDetail, setPbDetail] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("");
  const [creating, setCreating] = useState(false);

  const [addRuleCat, setAddRuleCat] = useState("");
  const [addRuleText, setAddRuleText] = useState("");
  const [addRuleRisk, setAddRuleRisk] = useState("medium");
  const [addRuleSugg, setAddRuleSugg] = useState("");

  const [analyzeDocId, setAnalyzeDocId] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => { loadInit(); }, []);

  async function loadInit() {
    setLoading(true);
    try {
      const [pbRes, builtinRes, docRes] = await Promise.all([
        getAiJson("/api/ai/playbooks/"),
        getAiJson("/api/ai/playbooks/builtins/"),
        getAiJson("/api/ai/documents/"),
      ]);
      setPlaybooks(pbRes.results || []);
      setBuiltins(builtinRes.builtins || []);
      setDocuments(docRes.results || docRes.documents || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id) {
    try {
      const detail = await getAiJson(`/api/ai/playbooks/${id}/`);
      setPbDetail(detail);
      setSelectedPb(id);
      const aRes = await getAiJson(`/api/ai/playbooks/${id}/analyses/`);
      setAnalyses(aRes.results || []);
      setAnalysisResult(null);
    } catch (e) {
      setError(e.message);
    }
  }

  async function createFromBuiltin(idx) {
    try {
      await postAiJson("/api/ai/playbooks/from-builtin/", { builtin_index: idx });
      const res = await getAiJson("/api/ai/playbooks/");
      setPlaybooks(res.results || []);
    } catch (e) {
      setError(e.message);
    }
  }

  async function createCustom() {
    if (!newTitle.trim()) { setError("Title is required."); return; }
    setCreating(true);
    try {
      const pb = await postAiJson("/api/ai/playbooks/", {
        title: newTitle.trim(),
        description: newDesc.trim(),
        contract_type: newType.trim(),
        rules: [],
      });
      setNewTitle(""); setNewDesc(""); setNewType("");
      setShowCreate(false);
      const res = await getAiJson("/api/ai/playbooks/");
      setPlaybooks(res.results || []);
      await loadDetail(pb.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function deletePlaybook(id) {
    try {
      await fetch(`/api/ai/playbooks/${id}/`, { method: "DELETE", headers: authHeaders({ json: false }) });
      setPlaybooks((prev) => prev.filter((p) => p.id !== id));
      if (selectedPb === id) { setSelectedPb(null); setPbDetail(null); }
    } catch (e) {
      setError(e.message);
    }
  }

  async function addRule() {
    if (!addRuleCat.trim() || !addRuleText.trim()) { setError("Clause category and rule are required."); return; }
    try {
      await postAiJson(`/api/ai/playbooks/${selectedPb}/rules/`, {
        clause_category: addRuleCat.trim(),
        rule: addRuleText.trim(),
        risk_level: addRuleRisk,
        suggestion: addRuleSugg.trim(),
      });
      setAddRuleCat(""); setAddRuleText(""); setAddRuleRisk("medium"); setAddRuleSugg("");
      await loadDetail(selectedPb);
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteRule(ruleId) {
    try {
      await fetch(`/api/ai/playbooks/${selectedPb}/rules/${ruleId}/`, {
        method: "DELETE", headers: authHeaders({ json: false }),
      });
      await loadDetail(selectedPb);
    } catch (e) {
      setError(e.message);
    }
  }

  async function runAnalysis() {
    if (!analyzeDocId) { setError("Select a document to analyze."); return; }
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await postAiJson(`/api/ai/playbooks/${selectedPb}/analyze/`, {
        document_id: Number(analyzeDocId),
      });
      setAnalysisResult(res);
      const aRes = await getAiJson(`/api/ai/playbooks/${selectedPb}/analyses/`);
      setAnalyses(aRes.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function loadAnalysisDetail(analysisId) {
    try {
      const res = await getAiJson(`/api/ai/playbooks/${selectedPb}/analyses/${analysisId}/`);
      setAnalysisResult(res);
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) {
    return (
      <ClientLayout title="Playbooks">
        <div className="text-center py-20 text-slate-500">Loading...</div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Playbooks">
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
          <button className="ml-3 underline" onClick={() => setError("")}>dismiss</button>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
        {[
          { key: "playbooks", label: "My Playbooks" },
          { key: "builtins", label: "Templates" },
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

      {tab === "builtins" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
          {builtins.map((b, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-sm text-[#0F172A] mb-1">{b.title}</h3>
              <p className="text-xs text-slate-500 mb-2">{b.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{b.rule_count} rules · {b.contract_type}</span>
                <button
                  onClick={() => createFromBuiltin(idx)}
                  className="text-xs text-[#16A34A] font-medium hover:underline"
                >
                  + Add to My Playbooks
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "playbooks" && (
        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
          {/* Left: playbook list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700">Playbooks</h3>
              <button
                onClick={() => setShowCreate(!showCreate)}
                className="text-xs text-[#16A34A] font-medium hover:underline"
              >
                {showCreate ? "Cancel" : "+ New"}
              </button>
            </div>

            {showCreate && (
              <div className="rounded-xl border border-[#16A34A]/30 bg-[#DCFCE7]/30 p-4 space-y-2">
                <input
                  type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Playbook title" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#16A34A] focus:outline-none"
                />
                <textarea
                  value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Description (optional)" rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#16A34A] focus:outline-none resize-y"
                />
                <input
                  type="text" value={newType} onChange={(e) => setNewType(e.target.value)}
                  placeholder="Contract type (optional)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#16A34A] focus:outline-none"
                />
                <button
                  onClick={createCustom} disabled={creating}
                  className="w-full rounded-lg bg-[#16A34A] text-white py-2 text-sm font-medium hover:bg-[#15803D] disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Playbook"}
                </button>
              </div>
            )}

            {playbooks.length === 0 && !showCreate && (
              <p className="text-sm text-slate-500 p-3">No playbooks yet. Create one or use a template.</p>
            )}

            {playbooks.map((pb) => (
              <button
                key={pb.id}
                onClick={() => loadDetail(pb.id)}
                className={`w-full text-left rounded-xl border p-3 transition-colors ${
                  selectedPb === pb.id
                    ? "border-[#16A34A] bg-[#DCFCE7]/40 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{pb.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${pb.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {pb.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {pb.rule_count} rules{pb.contract_type ? ` · ${pb.contract_type}` : ""}
                </div>
              </button>
            ))}
          </div>

          {/* Right: detail panel */}
          <div>
            {!pbDetail && (
              <div className="text-center text-slate-500 py-20 text-sm">
                Select a playbook to view and manage rules.
              </div>
            )}

            {pbDetail && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{pbDetail.title}</h3>
                    {pbDetail.description && (
                      <p className="text-sm text-slate-500 mt-1">{pbDetail.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {pbDetail.contract_type && (
                        <span className="text-xs text-slate-400">{pbDetail.contract_type}</span>
                      )}
                      <span className="text-xs text-slate-400">{pbDetail.rules?.length || 0} rules</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePlaybook(pbDetail.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 shadow-sm"
                  >
                    Delete
                  </button>
                </div>

                {/* Rules list */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Rules</h4>
                  {(!pbDetail.rules || pbDetail.rules.length === 0) && (
                    <p className="text-sm text-slate-500">No rules yet. Add rules below.</p>
                  )}
                  <div className="space-y-2">
                    {(pbDetail.rules || []).map((r) => (
                      <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800">{r.clause_category}</span>
                            <RiskBadge level={r.risk_level} />
                          </div>
                          <button
                            onClick={() => deleteRule(r.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-xs text-slate-600">{r.rule}</p>
                        {r.suggestion && (
                          <p className="text-xs text-slate-400 mt-1 italic">Suggestion: {r.suggestion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add rule form */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700">Add Rule</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text" value={addRuleCat} onChange={(e) => setAddRuleCat(e.target.value)}
                      placeholder="Clause category" className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#16A34A] focus:outline-none"
                    />
                    <select
                      value={addRuleRisk} onChange={(e) => setAddRuleRisk(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#16A34A] focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <textarea
                    value={addRuleText} onChange={(e) => setAddRuleText(e.target.value)}
                    placeholder="Rule description (what to check for)" rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#16A34A] focus:outline-none resize-y"
                  />
                  <input
                    type="text" value={addRuleSugg} onChange={(e) => setAddRuleSugg(e.target.value)}
                    placeholder="Suggestion if violated (optional)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#16A34A] focus:outline-none"
                  />
                  <button
                    onClick={addRule}
                    className="rounded-lg bg-[#16A34A] text-white px-4 py-2 text-sm font-medium hover:bg-[#15803D]"
                  >
                    Add Rule
                  </button>
                </div>

                {/* Analyze */}
                <div className="rounded-xl border border-[#16A34A]/20 bg-[#DCFCE7]/20 p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Apply Playbook to Document</h4>
                  <div className="flex flex-wrap gap-2 items-end">
                    <select
                      value={analyzeDocId}
                      onChange={(e) => setAnalyzeDocId(e.target.value)}
                      className="flex-1 min-w-[200px] rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#16A34A] focus:outline-none"
                    >
                      <option value="">Select document...</option>
                      {documents.map((d) => (
                        <option key={d.id} value={d.id}>{d.title || d.file_name}</option>
                      ))}
                    </select>
                    <button
                      onClick={runAnalysis}
                      disabled={analyzing}
                      className="rounded-lg bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {analyzing ? "Analyzing..." : "Run Analysis"}
                    </button>
                  </div>
                </div>

                {/* Analysis result */}
                {analysisResult && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-700">Analysis Result</h4>
                      <StatusBadge status={analysisResult.status} />
                    </div>
                    {analysisResult.summary && (
                      <p className="text-sm text-slate-600">{analysisResult.summary}</p>
                    )}
                    {analysisResult.error_message && (
                      <p className="text-sm text-red-600">{analysisResult.error_message}</p>
                    )}
                    {analysisResult.results && analysisResult.results.length > 0 && (
                      <div className="space-y-2">
                        {analysisResult.results.map((r, idx) => (
                          <div
                            key={idx}
                            className={`rounded-lg border p-3 ${
                              r.compliant
                                ? "border-green-200 bg-green-50/50"
                                : "border-red-200 bg-red-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold ${r.compliant ? "text-green-600" : "text-red-600"}`}>
                                {r.compliant ? "COMPLIANT" : "VIOLATION"}
                              </span>
                              <span className="text-sm font-medium text-slate-800">{r.clause_category}</span>
                              <RiskBadge level={r.risk_level} />
                            </div>
                            {r.finding && (
                              <p className="text-xs text-slate-700 mb-1">{r.finding}</p>
                            )}
                            {r.relevant_excerpt && (
                              <p className="text-xs text-slate-500 italic border-l-2 border-slate-300 pl-2 mb-1">
                                "{r.relevant_excerpt}"
                              </p>
                            )}
                            {!r.compliant && r.suggestion && (
                              <p className="text-xs text-amber-700 mt-1">
                                <strong>Suggestion:</strong> {r.suggestion}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Past analyses */}
                {analyses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Analysis History</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {analyses.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => loadAnalysisDetail(a.id)}
                          className="w-full text-left rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate">{a.document_title}</span>
                            <StatusBadge status={a.status} />
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {a.summary || "No summary"}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                          </div>
                        </button>
                      ))}
                    </div>
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
