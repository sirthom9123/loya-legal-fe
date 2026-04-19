import React from "react";

/**
 * Autoplay muted loop preview for marketing pages (`frontend/public/` assets).
 */
export default function MarketingPreviewVideo({ src, title, caption, className = "" }) {
  return (
    <figure className={`rounded-2xl border border-brand-200/90 bg-black overflow-hidden shadow-lg ring-1 ring-black/5 ${className}`}>
      <video
        className="w-full aspect-video object-cover bg-slate-900"
        autoPlay
        muted
        loop
        playsInline
        controls
        preload="metadata"
        aria-label={title || "Product preview video"}
      >
        <source src={src} type="video/mp4" />
      </video>
      {(title || caption) && (
        <figcaption className="bg-white px-4 py-3 border-t border-brand-100">
          {title ? <p className="text-sm font-semibold text-[#0F172A]">{title}</p> : null}
          {caption ? <p className="mt-1 text-xs text-slate-600">{caption}</p> : null}
        </figcaption>
      )}
    </figure>
  );
}
