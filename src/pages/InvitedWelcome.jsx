import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";
import { formatApiError } from "../utils/apiError.js";
import { persistSessionUser } from "../utils/sessionUser.js";
import { NomoraeWordmark } from "../components/BrandMark.jsx";

/**
 * Short profile setup for invited workspace members (name only).
 * Subscription/plan onboarding is skipped — they use the firm's plan.
 */
export default function InvitedWelcome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const access = localStorage.getItem("access");
      if (!access) {
        navigate("/login", { replace: true });
        return;
      }
      const res = await fetch(apiUrl("/api/auth/profile/"), {
        headers: authHeaders({ json: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (!res.ok || !data.user) {
        navigate("/login", { replace: true });
        return;
      }
      persistSessionUser(data.user);
      const u = data.user;
      if (!u.is_invited_member) {
        navigate(u.onboarding_completed ? "/dashboard" : "/onboarding", { replace: true });
        return;
      }
      if (u.profile_setup_completed) {
        navigate("/dashboard", { replace: true });
        return;
      }
      setFirstName(u.first_name || "");
      setLastName(u.last_name || "");
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/auth/profile/setup/"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data));
        setBusy(false);
        return;
      }
      if (data.user) persistSessionUser(data.user);
      try {
        sessionStorage.setItem("nomorae_prompt_web_push", "1");
      } catch {
        /* ignore */
      }
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Network error.");
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vanilla text-brand-800 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-vanilla">
      <div className="w-full max-w-md card-surface p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <NomoraeWordmark className="h-11 w-auto max-w-[260px] object-contain" />
        </div>
        <h1 className="text-2xl font-semibold text-brand-900 text-center mb-1">Welcome to the team</h1>
        <p className="text-sm text-brand-700/70 text-center mb-6">
          You&apos;ve joined a workspace on Nomorae. Tell us your name so colleagues know who you are — no subscription
          setup needed.
        </p>

        {error ? (
          <p className="text-red-600 mb-4 text-sm rounded-lg bg-red-50 border border-red-100 px-3 py-2">{error}</p>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-800 mb-1.5">First name</label>
            <input
              className="input-field"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-800 mb-1.5">Last name</label>
            <input
              className="input-field"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? "Saving…" : "Continue to dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
