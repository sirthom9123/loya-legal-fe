import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { formatApiError } from "../utils/apiError.js";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/password-reset/confirm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: password,
          new_password_confirm: passwordConfirm,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data));
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-vanilla">
        <div className="w-full max-w-md card-surface p-6 sm:p-8 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl mb-4">
            ⚠️
          </span>
          <h1 className="text-xl font-semibold text-brand-900 mb-2">Invalid reset link</h1>
          <p className="text-sm text-brand-700/70 mb-6">
            This link is missing the required token. Please request a new password reset.
          </p>
          <Link to="/forgot-password" className="btn-primary inline-block">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-vanilla">
      <div className="w-full max-w-md card-surface p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white text-lg font-bold shadow">
            AI
          </span>
        </div>

        {success ? (
          <div className="text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl mb-4">
              ✓
            </span>
            <h1 className="text-xl font-semibold text-brand-900 mb-2">Password reset!</h1>
            <p className="text-sm text-brand-700/70 mb-6">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <Link to="/login" className="btn-primary w-full inline-block text-center">
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-brand-900 text-center mb-1">Set new password</h1>
            <p className="text-sm text-brand-700/70 text-center mb-6">
              Choose a strong password for your account.
            </p>

            {error ? (
              <p className="text-red-600 mb-4 text-sm whitespace-pre-wrap rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                {error}
              </p>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1.5">New password</label>
                <input
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1.5">Confirm new password</label>
                <input
                  type="password"
                  className="input-field"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !password || !passwordConfirm}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>

            <p className="text-sm mt-6 text-center text-brand-700">
              <Link
                to="/login"
                className="font-medium text-brand-700 underline decoration-brand-400 hover:text-brand-900"
              >
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
