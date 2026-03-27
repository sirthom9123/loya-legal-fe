import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatApiError } from "../utils/apiError.js";
import { persistSessionUser } from "../utils/sessionUser.js";
import { apiUrl } from "../utils/apiUrl.js";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    const inviteToken = new URLSearchParams(window.location.search).get("invite_token");
    const res = await fetch(apiUrl("/api/auth/register/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim(),
        email: trimmedEmail,
        password,
        password_confirm: passwordConfirm,
        ...(inviteToken ? { invite_token: inviteToken } : {}),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(formatApiError(data));
      return;
    }

    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    if (data.user) persistSessionUser(data.user);

    if (data.email_verification_sent) {
      setRegisteredEmail(trimmedEmail);
      setRegistered(true);
    } else {
      navigate("/dashboard", { replace: true });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-vanilla">
      <div className="w-full max-w-md card-surface p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white text-lg font-bold shadow">
            AI
          </span>
        </div>

        {registered ? (
          <div className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl mb-4">
              ✉️
            </div>
            <h1 className="text-xl font-semibold text-brand-900 mb-2">Verify your email</h1>
            <p className="text-sm text-brand-700/70 mb-2 leading-relaxed">
              We've sent a verification link to{" "}
              <strong className="text-brand-800">{registeredEmail}</strong>.
            </p>
            <p className="text-sm text-brand-700/70 mb-6 leading-relaxed">
              Please check your inbox (and spam folder) and click the link to activate your account.
              The link expires in 24 hours.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/dashboard" className="btn-primary w-full text-center">
                Continue to dashboard
              </Link>
              <p className="text-xs text-slate-500">
                You can resend the verification email from your dashboard if needed.
              </p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-brand-900 text-center mb-1">Create account</h1>
            <p className="text-sm text-brand-700/70 text-center mb-6">
              Username: 3+ characters, letters, numbers, <code className="text-xs bg-brand-100 px-1 rounded">.</code>{" "}
              <code className="text-xs bg-brand-100 px-1 rounded">_</code>{" "}
              <code className="text-xs bg-brand-100 px-1 rounded">-</code> only.
            </p>
            {error ? (
              <p className="text-red-600 mb-4 text-sm whitespace-pre-wrap rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                {error}
              </p>
            ) : null}
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1.5">Username</label>
                <input
                  className="input-field"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1.5">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1.5">Password</label>
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
                <label className="block text-sm font-medium text-brand-800 mb-1.5">Confirm password</label>
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
              <button type="submit" className="btn-primary w-full">
                Create account
              </button>
            </form>
            <p className="text-sm mt-6 text-center text-brand-700">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-brand-700 underline decoration-brand-400 hover:text-brand-900">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
