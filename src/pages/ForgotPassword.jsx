import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatApiError } from "../utils/apiError.js";
import { apiUrl } from "../utils/apiUrl.js";
import { NomoraeWordmark } from "../components/BrandMark.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(apiUrl("/api/auth/password-reset/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 200) {
        setError(formatApiError(data));
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-vanilla">
      <div className="w-full max-w-md card-surface p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <NomoraeWordmark className="h-11 w-auto max-w-[260px] object-contain" />
        </div>

        {submitted ? (
          <>
            <div className="text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl mb-4">
                ✉️
              </span>
              <h1 className="text-xl font-semibold text-brand-900 mb-2">Check your email</h1>
              <p className="text-sm text-brand-700/70 mb-6 leading-relaxed">
                If an account exists for <strong className="text-brand-800">{email}</strong>, we've sent a password
                reset link. It expires in 1 hour.
              </p>
              <p className="text-xs text-slate-500 mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="btn-secondary w-full"
              >
                Try a different email
              </button>
              <Link to="/login" className="btn-primary w-full text-center">
                Back to sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-brand-900 text-center mb-1">Forgot password?</h1>
            <p className="text-sm text-brand-700/70 text-center mb-6">
              Enter the email address linked to your account and we'll send a reset link.
            </p>

            {error ? (
              <p className="text-red-600 mb-4 text-sm whitespace-pre-wrap rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                {error}
              </p>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1.5">Email address</label>
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button type="submit" disabled={loading || !email.trim()} className="btn-primary w-full disabled:opacity-50">
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="text-sm mt-6 text-center text-brand-700">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-medium text-brand-700 underline decoration-brand-400 hover:text-brand-900"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
