import React from "react";

/**
 * Renders long model/semantic text with clear paragraph spacing (splits on blank lines).
 */
export function FormattedAnswer({ text, className = "" }) {
  if (text == null || text === "") return null;
  const blocks = String(text)
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length === 0) return null;
  return (
    <div className={`space-y-4 text-slate-800 leading-relaxed max-w-none ${className}`}>
      {blocks.map((block, i) => (
        <p key={i} className="whitespace-pre-wrap text-[15px] sm:text-base">
          {block}
        </p>
      ))}
    </div>
  );
}

/** Chunk or excerpt text: paragraph breaks where present, comfortable line height when not. */
export function FormattedChunk({ text, className = "" }) {
  if (text == null || text === "") return null;
  const s = String(text);
  if (/\n\n/.test(s)) {
    return <FormattedAnswer text={s} className={className} />;
  }
  return <p className={`text-[15px] sm:text-base text-slate-700 leading-loose whitespace-pre-wrap ${className}`}>{s}</p>;
}
