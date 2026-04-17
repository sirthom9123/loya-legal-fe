import React from "react";

/** Full wordmark (Nomorae + Legal) — use in headers, footers, auth cards. */
export function NomoraeWordmark({ className = "", alt = "Nomorae", ...props }) {
  return <img src="/wordmark-logo.png" alt={alt} className={className} {...props} />;
}

/** Square brand icon — favicon asset for compact UI (sidebar tight spots, etc.). */
export function NomoraeAppIcon({ className = "h-10 w-10", alt = "Nomorae", ...props }) {
  return <img src="/favicon.png" alt={alt} className={className} {...props} />;
}
