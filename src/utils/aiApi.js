import { authHeaders } from "./authHeaders.js";
import { formatApiError } from "./apiError.js";

/**
 * POST JSON to an AI endpoint; throws Error with formatted message on failure.
 * @param {string} path e.g. "/api/ai/search/"
 * @param {Record<string, unknown>} body
 */
export async function postAiJson(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatApiError(data));
  return data;
}

export async function getAiJson(path) {
  const res = await fetch(path, {
    headers: authHeaders({ json: false }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatApiError(data));
  return data;
}
