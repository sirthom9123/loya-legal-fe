import React, { useEffect, useState } from "react";
import ClientLayout from "../components/ClientLayout.jsx";
import { getAiJson, postAiJson } from "../utils/aiApi.js";

const TABS = [
  { key: "generate", label: "Generate Draft" },
  { key: "redline", label: "Redline / Edit" },
  { key: "clause", label: "Insert Clause" },
];

const STYLES = [
  { value: "formal", label: "Formal" },
  { value: "plain_english", label: "Plain English" },
  { value: "balanced", label: "Balanced" },
  { value: "aggressive", label: "Aggressive" },
];

const POSITIONS = [
  { value: "beginning", label: "Beginning" },
  { value: "after_definitions", label: "After Definitions" },
  { value: "before_signatures", label: "Before Signatures" },
  { value: "end", label: "End" },
];

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-4">
      {title && <div className="px-4 py-3 border-b border-slate-100 font-semibold text-sm text-slate-700">{title}</div>}
      <div className="p-4">{children}</div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function Drafting() {
  const [tab, setTab] = useState("generate");
  const [templates, setTemplates] = useState([]);
  const [playbooks, setPlaybooks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAiJson("/api/ai/sa/templates/").catch(() => ({ templates: [] })),
      getAiJson("/api/ai/playbooks/").catch(() => ({ results: [] })),
      getAiJson("/api/ai/documents/").catch(() => ({ results: [] })),
    ]).then(([tplData, pbData, docData]) => {
      setTemplates(tplData.templates || []);
      setPlaybooks(pbData.results || []);
      setDocuments(docData.results || []);
      setLoading(false);
    });
  }, []);

  return (
    <ClientLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Drafting Workspace</h1>
        <p className="text-sm text-slate-500 mb-6">
          Generate full legal documents, apply redlines, or insert clauses — with template and playbook support.
        </p>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-6 w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                tab === t.key ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-slate-400 animate-pulse">Loading resources…</p>
        ) : (
          <>
            {tab === "generate" && (
              <GenerateTab templates={templates} playbooks={playbooks} documents={documents} />
            )}
            {tab === "redline" && <RedlineTab />}
            {tab === "clause" && <ClauseTab templates={templates} />}
          </>
        )}
      </div>
    </ClientLayout>
  );
}

/* ================================================================
   Generate Full Draft Tab
   ================================================================ */

function GenerateTab({ templates, playbooks, documents }) {
  const [instruction, setInstruction] = useState("");
  const [contractType, setContractType] = useState("");
  const [style, setStyle] = useState("balanced");
  const [templateSlug, setTemplateSlug] = useState("");
  const [templateVars, setTemplateVars] = useState({});
  const [playbookId, setPlaybookId] = useState("");
  const [precedentId, setPrecedentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const selectedTpl = templates.find((t) => t.slug === templateSlug);

  const handleGenerate = async () => {
    if (!instruction.trim()) return;
    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const body = {
        instruction: instruction.trim(),
        contract_type: contractType,
        style,
      };
      if (templateSlug) {
        body.template_slug = templateSlug;
        if (Object.keys(templateVars).length) body.template_variables = templateVars;
      }
      if (playbookId) body.playbook_id = Number(playbookId);
      if (precedentId) body.precedent_document_id = Number(precedentId);
      const data = await postAiJson("/api/ai/draft/full/", body);
      setResult(data);
    } catch (e) {
      setError(e.message || "Draft generation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionCard title="Draft Instructions">
        <label className="block text-sm font-medium text-slate-700 mb-1">What should be drafted?</label>
        <textarea
          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
          rows={4}
          placeholder="e.g. Draft a BCEA-compliant fixed-term employment contract for a senior developer in Johannesburg…"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Contract Type</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Employment, NDA, Lease"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Style</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={style} onChange={(e) => setStyle(e.target.value)}>
              {STYLES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Optional: Template, Playbook & Precedent">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">SA Template</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={templateSlug} onChange={(e) => { setTemplateSlug(e.target.value); setTemplateVars({}); }}>
              <option value="">None</option>
              {templates.map((t) => (
                <option key={t.slug} value={t.slug}>{t.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Playbook (compliance)</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={playbookId} onChange={(e) => setPlaybookId(e.target.value)}>
              <option value="">None</option>
              {playbooks.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Precedent Document</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={precedentId} onChange={(e) => setPrecedentId(e.target.value)}>
              <option value="">None</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>{d.title || d.file_name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedTpl && selectedTpl.variables && selectedTpl.variables.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500 mb-2">Template Variables</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedTpl.variables.map((v) => (
                <div key={v.key}>
                  <label className="text-xs text-slate-500">{v.label}{v.required && " *"}</label>
                  <input
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
                    value={templateVars[v.key] || ""}
                    onChange={(e) => setTemplateVars((prev) => ({ ...prev, [v.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      <button
        onClick={handleGenerate}
        disabled={submitting || !instruction.trim()}
        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {submitting ? "Generating…" : "Generate Draft"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 space-y-4">
          <SectionCard title="Generated Draft">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs text-slate-400">Model: {result.model} | Latency: {result.metrics?.latency_ms}ms</span>
              <CopyButton text={result.draft_text} />
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 rounded-lg p-4 max-h-[600px] overflow-y-auto border border-slate-200">
              {result.draft_text}
            </pre>
          </SectionCard>

          {result.sections && result.sections.length > 0 && (
            <SectionCard title="Document Sections">
              <div className="space-y-3">
                {result.sections.map((s, i) => (
                  <div key={i} className="border-l-2 border-indigo-300 pl-3">
                    <p className="text-sm font-semibold text-slate-700">{s.title}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{typeof s.content === "string" ? s.content.slice(0, 300) : ""}{typeof s.content === "string" && s.content.length > 300 ? "…" : ""}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {result.compliance_notes && result.compliance_notes.length > 0 && (
            <SectionCard title="Playbook Compliance Notes">
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {result.compliance_notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </SectionCard>
          )}

          {result.rationale && (
            <SectionCard title="Rationale">
              <p className="text-sm text-slate-600">{result.rationale}</p>
            </SectionCard>
          )}
        </div>
      )}
    </>
  );
}

/* ================================================================
   Redline / Edit Tab
   ================================================================ */

function RedlineTab() {
  const [originalText, setOriginalText] = useState("");
  const [instruction, setInstruction] = useState("");
  const [contractType, setContractType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleRedline = async () => {
    if (!originalText.trim() || !instruction.trim()) return;
    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const data = await postAiJson("/api/ai/draft/redline/", {
        original_text: originalText.trim(),
        instruction: instruction.trim(),
        contract_type: contractType,
      });
      setResult(data);
    } catch (e) {
      setError(e.message || "Redline generation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionCard title="Original Text">
        <textarea
          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
          rows={8}
          placeholder="Paste the existing clause or document text here…"
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
        />
      </SectionCard>

      <SectionCard title="Edit Instruction">
        <textarea
          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
          rows={3}
          placeholder="e.g. Make the termination clause more employee-friendly and add a 30-day notice requirement…"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
        />
        <div className="mt-3">
          <label className="block text-xs font-medium text-slate-500 mb-1">Contract Type (optional)</label>
          <input
            className="w-full md:w-1/2 border border-slate-300 rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. Employment"
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
          />
        </div>
      </SectionCard>

      <button
        onClick={handleRedline}
        disabled={submitting || !originalText.trim() || !instruction.trim()}
        className="px-6 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition"
      >
        {submitting ? "Generating Redlines…" : "Generate Redlines"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 space-y-4">
          <SectionCard title="Revised Text">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs text-slate-400">Model: {result.model} | Latency: {result.metrics?.latency_ms}ms</span>
              <CopyButton text={result.revised_text} />
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 rounded-lg p-4 max-h-[500px] overflow-y-auto border border-slate-200">
              {result.revised_text}
            </pre>
          </SectionCard>

          {result.changes && result.changes.length > 0 && (
            <SectionCard title={`Tracked Changes (${result.changes.length})`}>
              <div className="space-y-3">
                {result.changes.map((c, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                      <div>
                        <span className="text-xs font-medium text-red-500 uppercase">Original</span>
                        <p className="text-sm text-slate-600 mt-0.5 bg-red-50 px-2 py-1 rounded line-through">{c.original}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600 uppercase">Revised</span>
                        <p className="text-sm text-slate-700 mt-0.5 bg-green-50 px-2 py-1 rounded">{c.revised}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500"><span className="font-medium">Reason:</span> {c.reason}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {result.summary && (
            <SectionCard title="Changes Summary">
              <p className="text-sm text-slate-600">{result.summary}</p>
            </SectionCard>
          )}
        </div>
      )}
    </>
  );
}

/* ================================================================
   Insert Clause Tab
   ================================================================ */

function ClauseTab({ templates }) {
  const [documentText, setDocumentText] = useState("");
  const [clauseType, setClauseType] = useState("");
  const [position, setPosition] = useState("end");
  const [templateSlug, setTemplateSlug] = useState("");
  const [contractType, setContractType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleInsert = async () => {
    if (!documentText.trim() || !clauseType.trim()) return;
    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const body = {
        document_text: documentText.trim(),
        clause_type: clauseType.trim(),
        position,
        contract_type: contractType,
      };
      if (templateSlug) body.template_slug = templateSlug;
      const data = await postAiJson("/api/ai/draft/clause/", body);
      setResult(data);
    } catch (e) {
      setError(e.message || "Clause insertion failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SectionCard title="Existing Document">
        <textarea
          className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none"
          rows={8}
          placeholder="Paste the existing document text…"
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
        />
      </SectionCard>

      <SectionCard title="Clause Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Clause Type</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Confidentiality, Force Majeure, Indemnity"
              value={clauseType}
              onChange={(e) => setClauseType(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Position</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={position} onChange={(e) => setPosition(e.target.value)}>
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Contract Type (optional)</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. NDA, Employment"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Reference Template</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={templateSlug} onChange={(e) => setTemplateSlug(e.target.value)}>
              <option value="">None</option>
              {templates.map((t) => (
                <option key={t.slug} value={t.slug}>{t.title}</option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      <button
        onClick={handleInsert}
        disabled={submitting || !documentText.trim() || !clauseType.trim()}
        className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition"
      >
        {submitting ? "Generating Clause…" : "Generate & Insert Clause"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 space-y-4">
          <SectionCard title={result.clause_title || "Generated Clause"}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs text-slate-400">Model: {result.model} | Latency: {result.metrics?.latency_ms}ms</span>
              <CopyButton text={result.clause_text} />
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 rounded-lg p-4 max-h-[400px] overflow-y-auto border border-slate-200">
              {result.clause_text}
            </pre>
          </SectionCard>

          {result.rationale && (
            <SectionCard title="Rationale">
              <p className="text-sm text-slate-600">{result.rationale}</p>
            </SectionCard>
          )}
        </div>
      )}
    </>
  );
}
