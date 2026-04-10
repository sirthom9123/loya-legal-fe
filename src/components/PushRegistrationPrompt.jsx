import React, { useEffect, useState } from "react";
import { fetchPushStatus, subscribeWebPush } from "../utils/webPush.js";

const STORAGE_KEY = "loya_prompt_web_push";

/**
 * One-time modal after registration (session flag) to offer browser notifications.
 */
export default function PushRegistrationPrompt() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("access")) return undefined;
    const flag = sessionStorage.getItem(STORAGE_KEY);
    if (flag !== "1") return undefined;

    let cancelled = false;
    (async () => {
      try {
        const s = await fetchPushStatus();
        if (cancelled) return;
        if (!s.vapid_enabled || s.push_active || !s.push_notifications_enabled) {
          sessionStorage.removeItem(STORAGE_KEY);
          return;
        }
        setOpen(true);
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss() {
    sessionStorage.removeItem(STORAGE_KEY);
    setOpen(false);
  }

  async function onAllow() {
    setErr("");
    setBusy(true);
    try {
      await subscribeWebPush();
      sessionStorage.removeItem(STORAGE_KEY);
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not enable notifications");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="push-prompt-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 space-y-4"
      >
        <h2 id="push-prompt-title" className="text-lg font-semibold text-[#0F172A]">
          Stay on top of deadlines?
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Allow browser notifications for case deadline reminders when you choose &quot;include push&quot; on a case. You
          can change this anytime in Settings.
        </p>
        {err ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</p>
        ) : null}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={dismiss}
            disabled={busy}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={onAllow}
            disabled={busy}
            className="px-4 py-2.5 rounded-xl bg-[#16A34A] text-white text-sm font-semibold hover:bg-[#15803D] disabled:opacity-60"
          >
            {busy ? "…" : "Allow notifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
