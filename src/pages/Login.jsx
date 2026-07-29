import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { formatApiError } from "../utils/apiError.js";
import { persistSessionUser } from "../utils/sessionUser.js";
import { apiUrl } from "../utils/apiUrl.js";
import { normalizeInviteToken } from "../utils/inviteToken.js";
import { NomoraeWordmark } from "../components/BrandMark.jsx";

export default function Login() {
  const [searchParams] = useSearchParams();
  const inviteToken = normalizeInviteToken(searchParams.get("invite_token"));
  const registerHref = inviteToken
    ? `/register?invite_token=${encodeURIComponent(inviteToken)}`
    : "/register";

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 2FA state
  const [twoFaRequired, setTwoFaRequired] = useState(false);
  const [twoFaUserId, setTwoFaUserId] = useState(null);
  const [twoFaEmailHint, setTwoFaEmailHint] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const res = await fetch(apiUrl("/api/auth/token/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: login.trim(), password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(formatApiError(data));
      return;
    }

    if (data.two_fa_required) {
      setTwoFaRequired(true);
      setTwoFaUserId(data.user_id);
      setTwoFaEmailHint(data.email_hint || "");
      return;
    }

    await completeLogin(data);
  }

  async function onVerify2FA(e) {
    e.preventDefault();
    setError("");

    const res = await fetch(apiUrl("/api/auth/2fa/verify/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: twoFaUserId, code: twoFaCode.trim() }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(formatApiError(data));
      return;
    }

    await completeLogin(data);
  }

  async function onResendCode() {
    setError("");
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    const res = await fetch(apiUrl("/api/auth/2fa/resend/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: twoFaUserId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(formatApiError(data));
    }
  }

  async function completeLogin(data) {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    let sessionUser = data.user;

    if (inviteToken) {
      try {
        const inviteRes = await fetch(apiUrl("/api/ai/workspaces/invites/accept/"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.access}`,
          },
          body: JSON.stringify({ token: inviteToken }),
        });
        const inviteData = await inviteRes.json().catch(() => ({}));
        if (!inviteRes.ok) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
          setError(formatApiError(inviteData));
          return;
        }
        if (inviteData.user) sessionUser = inviteData.user;
      } catch {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        setError("Could not accept the workspace invitation. Please try again.");
        return;
      }
    }

    if (sessionUser) persistSessionUser(sessionUser);
    if (sessionUser?.is_invited_member && !sessionUser?.profile_setup_completed) {
      navigate("/welcome", { replace: true });
      return;
    }
    navigate("/dashboard", { replace: true });
  }

  if (twoFaRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-vanilla">
        <div className="w-full max-w-md card-surface p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <NomoraeWordmark className="h-11 w-auto max-w-[260px] object-contain" />
          </div>
          <h1 className="text-2xl font-semibold text-brand-900 text-center mb-1">Two-Factor Authentication</h1>
          <p className="text-sm text-brand-700/70 text-center mb-6">
            A verification code was sent to <strong>{twoFaEmailHint}</strong>. Enter it below to complete sign-in.
          </p>
          {error ? (
            <p className="text-red-600 mb-4 text-sm whitespace-pre-wrap rounded-lg bg-red-50 border border-red-100 px-3 py-2">
              {error}
            </p>
          ) : null}
          <form onSubmit={onVerify2FA} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-800 mb-1.5">
                Verification code
              </label>
              <input
                className="input-field text-center text-2xl tracking-[0.3em] font-mono"
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="000000"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                autoFocus
              />
            </div>
            <button type="submit" disabled={twoFaCode.length !== 6} className="btn-primary w-full disabled:opacity-60">
              Verify &amp; Sign in
            </button>
          </form>
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={onResendCode}
              disabled={resendCooldown > 0}
              className="text-sm font-medium text-brand-700 underline decoration-brand-400 hover:text-brand-900 disabled:opacity-50 disabled:no-underline"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTwoFaRequired(false);
                setTwoFaCode("");
                setError("");
              }}
              className="text-sm text-brand-700/70 hover:text-brand-900"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-vanilla">
      <div className="w-full max-w-md card-surface p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <NomoraeWordmark className="h-11 w-auto max-w-[260px] object-contain" />
        </div>
        <h1 className="text-2xl font-semibold text-brand-900 text-center mb-1">Welcome back</h1>
        <p className="text-sm text-brand-700/70 text-center mb-6">
          Sign in with your <strong>username</strong> or <strong>email</strong>.
        </p>
        {error ? (
          <p className="text-red-600 mb-4 text-sm whitespace-pre-wrap rounded-lg bg-red-50 border border-red-100 px-3 py-2">
            {error}
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-800 mb-1.5">
              Email or username
            </label>
            <input
              className="input-field"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              placeholder="you@example.com or your_username"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-brand-800">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-brand-700 underline decoration-brand-400 hover:text-brand-900"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Sign in
          </button>
        </form>
        <p className="text-sm mt-6 text-center text-brand-700">
          No account?{" "}
          <Link to={registerHref} className="font-medium text-brand-700 underline decoration-brand-400 hover:text-brand-900">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
