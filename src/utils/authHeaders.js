/** @param {{ json?: boolean }} opts */
export function authHeaders(opts = {}) {
  const json = opts.json !== false;
  const access = localStorage.getItem("access");
  const headers = {};
  if (json) headers["Content-Type"] = "application/json";
  if (access) headers.Authorization = `Bearer ${access}`;
  return headers;
}
