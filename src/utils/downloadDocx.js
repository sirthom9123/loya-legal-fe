import { authHeaders } from "./authHeaders.js";
import { apiUrl } from "./apiUrl.js";
import { AiApiError } from "./aiApi.js";
import { formatApiError } from "./apiError.js";

/**
 * POST to a DOCX export endpoint and trigger a browser download.
 * @param {string} path e.g. "/api/ai/draft/12/export.docx"
 * @param {Record<string, unknown>} body
 * @param {string} [filename]
 */
export async function downloadDocx(path, body, filename = "document.docx") {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new AiApiError(formatApiError(data), {
      status: res.status,
      code: typeof data?.code === "string" ? data.code : undefined,
      body: data,
    });
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".docx") ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
