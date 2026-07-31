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
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [firmAddress, setFirmAddress] = useState("");
  const [firmPhone, setFirmPhone] = useState("");
  const [firmEmail, setFirmEmail] = useState("");
  const [hasOrganisation, setHasOrganisation] = useState(false);

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
        setFirstName(data.user.first_name || "");
        setLastName(data.user.last_name || "");
        if (data.user.is_invited_member) {
          navigate(data.user.profile_setup_completed ? "/dashboard" : "/welcome", { replace: true });
          return;
        }
        if (data.user.onboarding_completed) {
          navigate("/dashboard", { replace: true });
          return;
        }
        const orgs = Array.isArray(data.user.organizations) ? data.user.organizations : [];
        const ownsOrg = orgs.some((o) => o.is_billing_admin || o.role === "owner");
        setHasOrganisation(ownsOrg);
        if (ownsOrg) {
          const primary = orgs.find((o) => o.is_billing_admin || o.role === "owner");
          if (primary?.name) setFirmName(primary.name);
          setStep(3);
        } else if ((data.user.first_name || "").trim() && (data.user.last_name || "").trim()) {
          setStep(2);
        }
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function saveNamesAndContinue() {
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    setBusy(true);
    try {
      await fetch(apiUrl("/api/auth/profile/"), {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim() }),
      });
      setStep(2);
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function saveFirmAndContinue() {
    setError("");
    if (!firmName.trim()) {
      setError("Please enter your firm name.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/auth/onboarding/firm/"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          firm_name: firmName.trim(),
          firm_address: firmAddress.trim(),
          firm_phone: firmPhone.trim(),
          firm_email: firmEmail.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data));
        setBusy(false);
        return;
      }
      if (data.user) persistSessionUser(data.user);
      setHasOrganisation(true);
      setStep(3);
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function chooseFreeTrial() {
    setError("");
    if (!hasOrganisation) {
      setError("Set up your firm before starting a trial.");
      setStep(2);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/auth/onboarding/choose/"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          choice: "free_trial",
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === "firm_setup_required") {
          setStep(2);
        }
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

  async function continueToBilling(path) {
    setError("");
    if (!hasOrganisation) {
      setError("Set up your firm before continuing to billing.");
      setStep(2);
      return;
    }
    navigate(path);
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
        <p className="text-sm text-brand-700/70 text-center mb-2">
          {step === 1 && "Tell us who you are."}
          {step === 2 && "Set up your firm — this is the billing entity for your team."}
          {step === 3 && "Choose how you want to get started."}
        </p>
        <p className="text-xs text-brand-600/60 text-center mb-8">Step {step} of 3</p>

        {error ? (
          <p className="text-red-600 mb-4 text-sm rounded-lg bg-red-50 border border-red-100 px-3 py-2">{error}</p>
        ) : null}

        {step === 1 ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1.5">First name</label>
                <input
                  className="input-field"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Thabo"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1.5">Last name</label>
                <input
                  className="input-field"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Mokoena"
                  autoComplete="family-name"
                />
              </div>
            </div>
            <button type="button" disabled={busy} onClick={saveNamesAndContinue} className="btn-primary w-full">
              {busy ? "Saving…" : "Continue"}
            </button>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1.5">Firm name</label>
                <input
                  className="input-field"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  placeholder="e.g. Mokoena & Partners"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1.5">Firm address</label>
                <textarea
                  className="input-field min-h-[72px]"
                  value={firmAddress}
                  onChange={(e) => setFirmAddress(e.target.value)}
                  placeholder="Physical / postal address"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-brand-800 mb-1.5">Phone</label>
                  <input className="input-field" value={firmPhone} onChange={(e) => setFirmPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-800 mb-1.5">Email</label>
                  <input
                    className="input-field"
                    type="email"
                    value={firmEmail}
                    onChange={(e) => setFirmEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={busy} onClick={() => setStep(1)} className="btn-secondary px-4 py-2 rounded-xl">
                Back
              </button>
              <button type="button" disabled={busy} onClick={saveFirmAndContinue} className="btn-primary flex-1">
                {busy ? "Saving…" : "Continue to plan"}
              </button>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <h2 className="font-semibold text-brand-900">Free trial</h2>
              <p className="text-sm text-brand-800/80 mt-1">
                Full product access for a limited time. No card required. Explore everything before you subscribe.
              </p>
              <button type="button" disabled={busy} onClick={chooseFreeTrial} className="mt-3 btn-primary w-full sm:w-auto">
                {busy ? "Saving…" : "Start free trial"}
              </button>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <h2 className="font-semibold text-brand-900">One-document check</h2>
              <p className="text-sm text-brand-800/80 mt-1">
                Upload a single agreement and use AI Q&amp;A on that file only. Pay once; file kept 14 days.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => continueToBilling("/billing")}
                className="mt-3 btn-primary w-full sm:w-auto"
              >
                Pay &amp; continue to upload
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="font-semibold text-brand-900">Subscribe (Starter / Pro / Firm)</h2>
              <p className="text-sm text-slate-600 mt-1">
                Pay securely via PayFast. Subscription is billed to {firmName || "your firm"}.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => continueToBilling("/billing")}
                  className="btn-secondary text-sm px-4 py-2 rounded-xl"
                >
                  Billing &amp; checkout
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => continueToBilling("/plans")}
                  className="text-sm font-medium text-[#16A34A] hover:underline px-2 py-2"
                >
                  Compare plans
                </button>
              </div>
            </div>
            <button type="button" disabled={busy} onClick={() => setStep(2)} className="text-sm text-brand-600 hover:underline">
              Edit firm details
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
