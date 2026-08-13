import React, { useEffect, useState } from "react";
import ClientLayout from "../components/ClientLayout.jsx";
import TemplatePicker from "../components/saTemplates/TemplatePicker.jsx";
import TemplateForm from "../components/saTemplates/TemplateForm.jsx";
import DraftEditor from "../components/saTemplates/DraftEditor.jsx";
import { getAiJson, postAiJson } from "../utils/aiApi.js";

export default function SATemplates() {
  const [templates, setTemplates] = useState([]);
  const [playbooks, setPlaybooks] = useState([]);
  const [letterheads, setLetterheads] = useState([]);
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [variables, setVariables] = useState({});
  const [preview, setPreview] = useState("");
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [usePlaybook, setUsePlaybook] = useState(false);
  const [playbookId, setPlaybookId] = useState("");
  const [includeLetterhead, setIncludeLetterhead] = useState(false);
  const [workspaceId, setWorkspaceId] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [tplData, pbData, lhData, caseData] = await Promise.all([
          getAiJson("/api/ai/sa/templates/"),
          getAiJson("/api/ai/playbooks/").catch(() => ({ results: [] })),
          getAiJson("/api/ai/letterheads/").catch(() => ({ letterheads: [] })),
          getAiJson("/api/ai/cases/").catch(() => ({ results: [] })),
        ]);
        setTemplates(Array.isArray(tplData.templates) ? tplData.templates : []);
        setPlaybooks(Array.isArray(pbData.results) ? pbData.results : []);
        setLetterheads(Array.isArray(lhData.letterheads) ? lhData.letterheads : []);
        setCases(Array.isArray(caseData.results) ? caseData.results : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load templates");
      }
    }
    load();
  }, []);

  async function onSelectTemplate(slug) {
    setSelected(slug);
    setDetail(null);
    setPreview("");
    setDraft(null);
    setVariables({});
    setError("");
    setUsePlaybook(false);
    setPlaybookId("");
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

  async function onPreview() {
    if (!selected) return;
    setLoading(true);
    setError("");
    setPreview("");
    try {
      const data = await postAiJson(`/api/ai/sa/templates/${selected}/preview/`, { variables });
      setPreview(data.rendered || "");
    } catch (err) {
      // Fallback to legacy POST on detail endpoint
      try {
        const data = await postAiJson(`/api/ai/sa/templates/${selected}/`, { variables });
        setPreview(data.rendered || "");
      } catch (err2) {
        setError(err2 instanceof Error ? err2.message : "Preview failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function onGenerate() {
    if (!selected || !detail?.is_pilot) return;
    setLoading(true);
    setError("");
    setDraft(null);
    setPreview("");
    try {
      const body = {
        variables,
        auto_save: true,
        include_letterhead: includeLetterhead,
        workspace_id: workspaceId ? Number(workspaceId) : null,
        language: "en",
      };
      if (usePlaybook && playbookId) {
        body.playbook_id = Number(playbookId);
      }
      const data = await postAiJson(`/api/ai/sa/templates/${selected}/draft/`, body);
      setDraft(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Full draft generation failed");
    } finally {
      setLoading(false);
    }
  }

  function onBackToList() {
    setSelected(null);
    setDetail(null);
    setPreview("");
    setDraft(null);
  }

  function onBackToForm() {
    setDraft(null);
  }

  return (
    <ClientLayout title="SA Legal Templates">
      <p className="text-sm text-slate-600 mb-6 max-w-3xl">
        Pre-built South African legal document templates. Select a template, fill in the variables, and generate a
        complete attorney-ready document (pilot templates) — or preview the authoritative outline.
      </p>

      {loading && selected && !draft ? (
        <div className="mb-4 max-w-3xl rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Generating full document clause-by-clause… this can take 30–90 seconds for comprehensive drafts.
        </div>
      ) : null}

      {!selected ? (
        <TemplatePicker
          templates={templates}
          search={search}
          onSearchChange={setSearch}
          onSelect={onSelectTemplate}
        />
      ) : null}

      {selected && detail && !draft ? (
        <>
          <TemplateForm
            detail={detail}
            variables={variables}
            setVariables={setVariables}
            letterheads={letterheads}
            workspaceId={workspaceId}
            setWorkspaceId={setWorkspaceId}
            includeLetterhead={includeLetterhead}
            setIncludeLetterhead={setIncludeLetterhead}
            playbooks={playbooks}
            usePlaybook={usePlaybook}
            setUsePlaybook={setUsePlaybook}
            playbookId={playbookId}
            setPlaybookId={setPlaybookId}
            loading={loading}
            onGenerate={onGenerate}
            onPreview={onPreview}
            onBack={onBackToList}
          />
          {preview ? (
            <div className="card-surface-static p-5 sm:p-6 rounded-xl border border-slate-200 max-w-4xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#0F172A]">Outline preview</h3>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(preview);
                  }}
                  className="text-xs text-[#16A34A] hover:underline"
                >
                  Copy to clipboard
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-800 bg-slate-50 rounded-lg p-4 border border-slate-100 max-h-[600px] overflow-y-auto">
                {preview}
              </pre>
            </div>
          ) : null}
        </>
      ) : null}

      {draft ? (
        <DraftEditor
          draft={draft}
          setDraft={setDraft}
          templateSlug={selected}
          workspaceId={workspaceId}
          includeLetterhead={includeLetterhead}
          cases={cases}
          onBack={onBackToForm}
        />
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2 max-w-3xl">
          {error}
        </p>
      ) : null}
    </ClientLayout>
  );
}
