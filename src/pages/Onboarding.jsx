import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";
import { formatApiError } from "../utils/apiError.js";
import { persistSessionUser } from "../utils/sessionUser.js";

export default function Onboarding() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [loading, setLoading] = useState(true);

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
      if (!res.ok) {
        navigate("/login", { replace: true });
        return;
      }
      if (data.user) {
        persistSessionUser(data.user);
        setEmailVerified(Boolean(data.user.email_verified));
        if (data.user.onboarding_completed) {
          navigate("/dashboard", { replace: true });
          return;
        }
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function chooseFreeTrial() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/auth/onboarding/choose/"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ choice: "free_trial" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data));
        setBusy(false);
        return;
      }
      if (data.user) persistSessionUser(data.user);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Network error.");
    } finally {
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

  if (!emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-vanilla">
        <div className="w-full max-w-md card-surface p-6 sm:p-8 text-center">
          <h1 className="text-xl font-semibold text-brand-900 mb-2">Verify your email first</h1>
          <p className="text-sm text-brand-700/80 mb-6">
            Check your inbox for the verification link, then return here to choose your plan.
          </p>
          <Link to="/dashboard" className="btn-primary inline-block">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-vanilla">
      <div className="w-full max-w-lg card-surface p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-brand-900 text-center mb-1">Welcome to Nomorae</h1>
        <p className="text-sm text-brand-700/70 text-center mb-8">
          Choose how you want to get started. You can change or upgrade later in Billing.
        </p>

        {error ? (
          <p className="text-red-600 mb-4 text-sm rounded-lg bg-red-50 border border-red-100 px-3 py-2">{error}</p>
        ) : null}

        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <h2 className="font-semibold text-brand-900">Free trial</h2>
            <p className="text-sm text-brand-800/80 mt-1">
              Full product access for a limited time (14 days). No card required. Pick this to explore everything before you
              subscribe.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={chooseFreeTrial}
              className="mt-3 btn-primary w-full sm:w-auto"
            >
              {busy ? "Saving…" : "Start free trial"}
            </button>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <h2 className="font-semibold text-brand-900">One-document check</h2>
            <p className="text-sm text-brand-800/80 mt-1">
              Upload a single agreement and use AI Q&amp;A on that file only. Pay once; file kept 14 days. Best for a
              quick validation pass.
            </p>
            <Link to="/billing" className="mt-3 inline-flex btn-primary w-full sm:w-auto text-center justify-center">
              Pay &amp; continue to upload
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-brand-900">Subscribe (Starter / Pro / Firm)</h2>
            <p className="text-sm text-slate-600 mt-1">
              Pay securely via PayFast. Your first renewal date includes an extra trial window from signup (see Billing
              for amounts).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/billing" className="btn-secondary text-sm px-4 py-2 rounded-xl">
                Billing &amp; checkout
              </Link>
              <Link to="/plans" className="text-sm font-medium text-[#16A34A] hover:underline px-2 py-2">
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
