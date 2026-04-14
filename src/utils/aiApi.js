import { authHeaders } from "./authHeaders.js";
import { formatApiError } from "./apiError.js";
import { apiUrl } from "./apiUrl.js";

/** Failed AI API call with optional `code` from DRF (e.g. ai_provider_payment_required). */
export class AiApiError extends Error {
  /** @param {string} message */
  constructor(message, { status, code, body } = {}) {
    super(message);
    this.name = "AiApiError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

function throwAiFailure(res, data) {
  const message = formatApiError(data);
  throw new AiApiError(message, {
    status: res.status,
    code: typeof data?.code === "string" ? data.code : undefined,
    body: data,
  });
}

/**
 * POST JSON to an AI endpoint; throws {@link AiApiError} with formatted message on failure.
 * @param {string} path e.g. "/api/ai/search/"
 * @param {Record<string, unknown>} body
 */
export async function postAiJson(path, body) {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throwAiFailure(res, data);
  return data;
}

export async function getAiJson(path) {
  const res = await fetch(apiUrl(path), {
    headers: authHeaders({ json: false }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throwAiFailure(res, data);
  return data;
}

/** PATCH JSON; throws {@link AiApiError} on failure. */
export async function patchAiJson(path, body) {
  const res = await fetch(apiUrl(path), {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throwAiFailure(res, data);
  return data;
}
