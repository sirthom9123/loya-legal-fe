/** Resolve a path for files in Vite `public/` (works with `import.meta.env.BASE_URL` subpath deploys). */
export function publicAsset(relativePath) {
  const base = import.meta.env.BASE_URL || "/";
  const rel = relativePath.replace(/^\//, "");
  if (base === "/") return `/${rel}`;
  return base.endsWith("/") ? `${base}${rel}` : `${base}/${rel}`;
}
