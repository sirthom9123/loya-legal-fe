const STORAGE_KEY = "nomorae_sa_template_draft_v1";
const DRAFTING_STORAGE_KEY = "nomorae_drafting_generate_v1";

/** @typedef {{ document_id?: number, template_slug?: string, template_title?: string, status?: string, draft?: object, workspace_id?: string|number|null, include_letterhead?: boolean, updated_at?: string }} SaDraftSession */

export function loadSaDraftSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** @param {SaDraftSession|null} data */
export function saveSaDraftSession(data) {
  try {
    if (!data) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...data, updated_at: new Date().toISOString() })
    );
  } catch {
    /* quota / private mode */
  }
}

export function clearSaDraftSession() {
  saveSaDraftSession(null);
}

export function loadDraftingGenerateSession() {
  try {
    const raw = sessionStorage.getItem(DRAFTING_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDraftingGenerateSession(data) {
  try {
    if (!data) {
      sessionStorage.removeItem(DRAFTING_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(
      DRAFTING_STORAGE_KEY,
      JSON.stringify({ ...data, updated_at: new Date().toISOString() })
    );
  } catch {
    /* ignore */
  }
}

export function clearDraftingGenerateSession() {
  saveDraftingGenerateSession(null);
}

/**
 * Map a SourceDocument detail response into Drafting Generate tab result shape.
 * @param {object} doc
 */
export function draftingResultFromDocument(doc) {
  if (!doc) return null;
  const meta = doc.metadata || {};
  return {
    document_id: doc.id,
    draft_text: doc.raw_text || "",
    sections: Array.isArray(meta.sections) ? meta.sections : [],
    compliance_notes: meta.compliance_notes || [],
    rationale: meta.rationale || "",
    contract_type: meta.contract_type || "",
    processing_status: doc.processing_status,
    error_message: doc.error_message || "",
  };
}

/**
 * Map a SourceDocument detail response into DraftEditor draft shape.
 * @param {object} doc
 */
export function draftFromDocument(doc) {
  if (!doc) return null;
  const meta = doc.metadata || {};
  const sections = Array.isArray(meta.sections) ? meta.sections : [];
  return {
    document_id: doc.id,
    draft_text: doc.raw_text || "",
    sections,
    compliance_notes: meta.compliance_notes || [],
    rationale: meta.rationale || "",
    skeleton_version: meta.skeleton_version,
    instrument_type: meta.instrument_type,
    template_slug: meta.template_slug,
    template_title: meta.template_title || doc.title,
    model: meta.model,
    model_used: meta.model,
    usage: meta.token_usage || {},
    token_usage: meta.token_usage || {},
    metrics: meta.metrics || {},
    v2: true,
    processing_status: doc.processing_status,
    error_message: doc.error_message || "",
  };
}
