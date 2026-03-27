const API_ORIGIN = (import.meta.env.VITE_API_URL || "").trim();

export function apiUrl(path) {
  if (!API_ORIGIN) return path;
  const base = API_ORIGIN.replace(/\/$/, "");
  if (!path) return base;
  return `${base}${String(path).startsWith("/") ? "" : "/"}${path}`;
}

