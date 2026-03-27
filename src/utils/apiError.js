/**
 * Format DRF validation errors or { detail: "..." } into a readable string.
 */
export function formatApiError(data) {
  if (!data || typeof data !== "object") return "Request failed";
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) return data.detail.join(" ");

  const parts = [];
  for (const [key, val] of Object.entries(data)) {
    if (key === "detail") continue;
    if (Array.isArray(val)) {
      parts.push(`${key}: ${val.join(", ")}`);
    } else if (val && typeof val === "object") {
      parts.push(`${key}: ${JSON.stringify(val)}`);
    } else if (val != null) {
      parts.push(`${key}: ${val}`);
    }
  }
  return parts.length ? parts.join(" ") : "Request failed";
}
