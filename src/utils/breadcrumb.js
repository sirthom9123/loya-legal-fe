/** Breadcrumb labels from pathname (client app). */
export function getBreadcrumb(pathname) {
  const parts = [{ label: "Home", to: "/dashboard" }];
  if (pathname === "/dashboard" || pathname === "/") {
    parts.push({ label: "Dashboard", to: null });
    return parts;
  }
  if (pathname.startsWith("/documents/") && pathname !== "/documents") {
    parts.push({ label: "Documents", to: "/documents" });
    parts.push({ label: "Document", to: null });
    return parts;
  }
  if (pathname === "/documents") {
    parts.push({ label: "Documents", to: null });
    return parts;
  }
  if (pathname === "/profile") {
    parts.push({ label: "Settings", to: null });
    return parts;
  }
  if (pathname === "/billing") {
    parts.push({ label: "Billing", to: null });
    return parts;
  }
  if (pathname === "/plans") {
    parts.push({ label: "Plans", to: null });
    return parts;
  }
  if (pathname === "/workflows") {
    parts.push({ label: "Workflows", to: null });
    return parts;
  }
  if (pathname === "/playbooks") {
    parts.push({ label: "Playbooks", to: null });
    return parts;
  }
  if (pathname === "/search") {
    parts.push({ label: "Semantic search", to: null });
    return parts;
  }
  if (pathname === "/assistant") {
    parts.push({ label: "Assistant (RAG)", to: null });
    return parts;
  }
  if (pathname === "/chat") {
    parts.push({ label: "Chat", to: null });
    return parts;
  }
  if (pathname === "/sa-templates") {
    parts.push({ label: "SA Templates", to: null });
    return parts;
  }
  if (pathname === "/review") {
    parts.push({ label: "Document Review", to: null });
    return parts;
  }
  if (pathname === "/drafting") {
    parts.push({ label: "Drafting", to: null });
    return parts;
  }
  if (pathname === "/collaboration") {
    parts.push({ label: "Collaboration", to: null });
    return parts;
  }
  if (pathname === "/sa-modules") {
    parts.push({ label: "Practice Modules", to: null });
    return parts;
  }
  parts.push({ label: "Page", to: null });
  return parts;
}
