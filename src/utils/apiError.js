/** Optional friendlier copy when the API only returns `code` (no usable `detail`). */
const CODE_MESSAGES = {
  ai_provider_payment_required:
    "The AI provider reported a payment or billing issue (for example, no credits). Check the provider account or contact support.",
  ai_provider_rate_limited: "The AI provider is rate-limiting requests. Please wait a moment and try again.",
  ai_provider_unreachable: "Could not reach the AI service. Check your connection or try again later.",
  ai_provider_unavailable: "The AI service is temporarily unavailable. Please try again shortly.",
  ai_provider_unauthorized: "The AI service is misconfigured. Please contact support.",
  ai_provider_forbidden: "The AI provider refused this request. Contact support if it continues.",
  ai_provider_bad_request: "The AI provider rejected the request. Try a different model or shorter input.",
  ai_provider_error: "The AI service returned an error. Please try again or contact support.",
};

/**
 * Format DRF validation errors or { detail: "...", code?: string } into a readable string.
 */
export function formatApiError(data) {
  if (!data || typeof data !== "object") return "Request failed";
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
  if (Array.isArray(data.detail)) return data.detail.join(" ");
  if (typeof data.code === "string" && CODE_MESSAGES[data.code]) return CODE_MESSAGES[data.code];

  const parts = [];
  for (const [key, val] of Object.entries(data)) {
    if (key === "detail" || key === "code") continue;
    if (Array.isArray(val)) {
      parts.push(`${key}: ${val.join(", ")}`);
    } else if (val && typeof val === "object") {
      parts.push(`${key}: ${JSON.stringify(val)}`);
    } else if (val != null) {
      parts.push(`${key}: ${val}`);
    }
  }
  if (parts.length) return parts.join(" ");
  if (typeof data.code === "string") return `Error (${data.code})`;
  return "Request failed";
}
