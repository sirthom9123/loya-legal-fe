import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function UserMenu({ name, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "?";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-brand-200 bg-white p-0.5 pl-1 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-brand-500/20"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
          {initials}
        </span>
        <span className="hidden sm:block max-w-[8rem] truncate pr-2 text-sm font-medium text-slate-800">
          {name}
        </span>
        <svg className="mr-1 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50 animate-in fade-in">
          <Link
            to="/profile"
            className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <button
            type="button"
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
