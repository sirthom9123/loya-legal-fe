import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ClientLayout from "../components/ClientLayout.jsx";
import TemplatePicker from "../components/saTemplates/TemplatePicker.jsx";
import TemplateForm from "../components/saTemplates/TemplateForm.jsx";
import DraftEditor from "../components/saTemplates/DraftEditor.jsx";
import { getAiJson, postAiJson } from "../utils/aiApi.js";
import {
  clearSaDraftSession,
  draftFromDocument,
  loadSaDraftSession,
  saveSaDraftSession,
} from "../utils/draftSession.js";

const POLL_MS = 2500;

export default function SATemplates() {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const [usePlaybook, setUsePlaybook] = useState(false);
  const [playbookId, setPlaybookId] = useState("");
  const [includeLetterhead, setIncludeLetterhead] = useState(false);
  const [workspaceId, setWorkspaceId] = useState("");

  const pollRef = useRef(null);
  const restoredRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setPolling(false);
  }, []);

  const applyCompletedDoc = useCallback(
    (doc, { slug, workspace, letterhead } = {}) => {
      const next = draftFromDocument(doc);
      if (!next) return;
      setDraft(next);
      setSelected(slug || next.template_slug || selected);
      if (workspace != null && workspace !== "") setWorkspaceId(String(workspace));
      if (typeof letterhead === "boolean") setIncludeLetterhead(letterhead);
      saveSaDraftSession({
        document_id: next.document_id,
        template_slug: next.template_slug,
        template_title: next.template_title,
        status: "completed",
        draft: next,
        workspace_id: workspace ?? workspaceId,
        include_letterhead: letterhead ?? includeLetterhead,
      });
      setStatusMsg("Draft ready.");
      stopPolling();
      setLoading(false);
    },
    [includeLetterhead, selected, stopPolling, workspaceId]
  );

  const pollDocument = useCallback(
    async (documentId, extras = {}) => {
      try {
        const doc = await getAiJson(`/api/ai/documents/${documentId}/`);
        const status = doc.processing_status;
        if (status === "completed") {
          applyCompletedDoc(doc, extras);
          return;
        }
        if (status === "failed") {
          setError(doc.error_message || "Draft generation failed.");
          saveSaDraftSession({
            document_id: documentId,
            status: "failed",
            template_slug: extras.slug || selected,
            workspace_id: extras.workspace ?? workspaceId,
            include_letterhead: extras.letterhead ?? includeLetterhead,
          });
          stopPolling();
          setLoading(false);
          return;
        }
        setPolling(true);
        setStatusMsg(
          status === "processing"
            ? "Generating your document (typically 1–3 minutes)… you can browse other pages and we’ll notify you when it’s ready."
            : "Draft queued… waiting for the background worker (usually starts within a few seconds)."
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to check draft status");
      }
    },
    [applyCompletedDoc, includeLetterhead, selected, stopPolling, workspaceId]
  );

  const startPolling = useCallback(
    (documentId, extras = {}) => {
      stopPolling();
      setPolling(true);
      setLoading(true);
      pollDocument(documentId, extras);
      pollRef.current = setInterval(() => pollDocument(documentId, extras), POLL_MS);
    },
    [pollDocument, stopPolling]
  );

  useEffect(() => () => stopPolling(), [stopPolling]);

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

  // Restore session or ?document= deep link once
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    async function restore() {
      const fromQuery = searchParams.get("document");
      const session = loadSaDraftSession();
      const documentId = fromQuery ? Number(fromQuery) : session?.document_id;
      if (!documentId || Number.isNaN(documentId)) {
        if (session?.draft && session.status === "completed") {
          setDraft(session.draft);
          setSelected(session.template_slug || null);
          if (session.workspace_id) setWorkspaceId(String(session.workspace_id));
          if (typeof session.include_letterhead === "boolean") {
            setIncludeLetterhead(session.include_letterhead);
          }
        }
        return;
      }

      try {
        const doc = await getAiJson(`/api/ai/documents/${documentId}/`);
        const slug = doc.metadata?.template_slug || session?.template_slug;
        const extras = {
          slug,
          workspace: session?.workspace_id ?? doc.metadata?.workspace_id,
          letterhead: session?.include_letterhead ?? doc.metadata?.include_letterhead,
        };
        if (doc.processing_status === "completed") {
          applyCompletedDoc(doc, extras);
          if (slug) {
            try {
              const data = await getAiJson(`/api/ai/sa/templates/${slug}/`);
              setDetail(data);
              const init = {};
              for (const v of data.variables || []) init[v.key] = (doc.metadata?.variables || {})[v.key] ?? v.default ?? "";
              setVariables(init);
            } catch {
              /* detail optional when viewing completed draft */
            }
          }
        } else if (doc.processing_status === "pending" || doc.processing_status === "processing") {
          setSelected(slug || null);
          if (extras.workspace) setWorkspaceId(String(extras.workspace));
          startPolling(documentId, extras);
        } else if (doc.processing_status === "failed") {
          setError(doc.error_message || "Previous draft generation failed.");
          setSelected(slug || null);
        }
      } catch {
        /* stale session */
        if (!fromQuery) clearSaDraftSession();
      }
    }
    restore();
  }, [applyCompletedDoc, searchParams, startPolling]);

  async function onSelectTemplate(slug) {
    setSelected(slug);
    setDetail(null);
    setPreview("");
    setError("");
    setUsePlaybook(false);
    setPlaybookId("");
    // Keep existing completed draft if same slug; otherwise clear editor view when picking another
    const session = loadSaDraftSession();
    if (session?.template_slug && session.template_slug !== slug) {
      setDraft(null);
    }
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
    setStatusMsg("");
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
      const documentId = data.document_id;
      if (!documentId) {
        throw new Error("No document_id returned from draft API");
      }
      saveSaDraftSession({
        document_id: documentId,
        template_slug: selected,
        template_title: data.template_title || detail.title,
        status: data.processing_status || "pending",
        workspace_id: workspaceId,
        include_letterhead: includeLetterhead,
      });
      setSearchParams({ document: String(documentId) }, { replace: true });
      setStatusMsg(
        data.detail ||
          "Draft generation started — usually about 1–3 minutes. You can leave this page; we'll notify you when it's ready."
      );
      // Sync complete payloads (legacy) vs async 202
      if (data.sections && Array.isArray(data.sections) && data.sections.length) {
        setDraft(data);
        saveSaDraftSession({
          document_id: documentId,
          template_slug: selected,
          template_title: data.template_title,
          status: "completed",
          draft: data,
          workspace_id: workspaceId,
          include_letterhead: includeLetterhead,
        });
        setLoading(false);
      } else {
        startPolling(documentId, {
          slug: selected,
          workspace: workspaceId,
          letterhead: includeLetterhead,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Full draft generation failed");
      setLoading(false);
    }
  }

  function onBackToList() {
    stopPolling();
    setSelected(null);
    setDetail(null);
    setPreview("");
    // Keep session so returning still works; only clear editor view
  }

  function onBackToForm() {
    // Keep draft in session; just show form again
    setDraft(null);
  }

  function onClearDraft() {
    stopPolling();
    clearSaDraftSession();
    setDraft(null);
    setStatusMsg("");
    setSearchParams({}, { replace: true });
  }

  // Persist edits while viewing draft
  useEffect(() => {
    if (!draft?.document_id) return;
    saveSaDraftSession({
      document_id: draft.document_id,
      template_slug: draft.template_slug || selected,
      template_title: draft.template_title,
      status: "completed",
      draft,
      workspace_id: workspaceId,
      include_letterhead: includeLetterhead,
    });
  }, [draft, selected, workspaceId, includeLetterhead]);

  return (
    <ClientLayout title="SA Legal Templates">
      <p className="text-sm text-slate-600 mb-6 max-w-3xl">
        Pre-built South African legal document templates. Select a template, fill in the variables, and generate a
        complete attorney-ready document (pilot templates) — or preview the authoritative outline.
      </p>

      {(loading || polling) && !draft ? (
        <div className="mb-4 max-w-3xl rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-medium">
            {statusMsg || "Generating full document in the background…"}
          </p>
          <p className="text-xs mt-1 text-emerald-700 leading-relaxed">
            Expect about <strong>1–3 minutes</strong> for most templates (occasionally longer for complex
            instruments). Feel free to open other pages — check the notification bell when it&apos;s done, or return
            here; your draft is saved automatically.
          </p>
        </div>
      ) : null}

      {draft && !loading ? (
        <div className="mb-4 max-w-6xl flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm">
          <span className="text-slate-600">
            Working on <span className="font-medium text-slate-800">{draft.template_title || "draft"}</span>
            {draft.document_id ? ` · Doc #${draft.document_id}` : ""}
          </span>
          <button type="button" onClick={onClearDraft} className="text-xs text-slate-500 hover:text-red-600 underline">
            Clear and start over
          </button>
        </div>
      ) : null}

      {!selected && !draft ? (
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
            loading={loading || polling}
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
          templateSlug={selected || draft.template_slug}
          workspaceId={workspaceId}
          includeLetterhead={includeLetterhead}
          cases={cases}
          onBack={onBackToForm}
        />
      ) : null}

      {statusMsg && !loading && !polling && !draft ? (
        <p className="mt-4 text-sm text-emerald-700 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 max-w-3xl">
          {statusMsg}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2 max-w-3xl">
          {error}
        </p>
      ) : null}
    </ClientLayout>
  );
}
