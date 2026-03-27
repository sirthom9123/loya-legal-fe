import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatApiError } from "../utils/apiError.js";
import { persistSessionUser } from "../utils/sessionUser.js";
import { apiUrl } from "../utils/apiUrl.js";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    if (data.user) persistSessionUser(data.user);
    const inviteToken = new URLSearchParams(window.location.search).get("invite_token");
    if (inviteToken) {
      try {
        await fetch(apiUrl("/api/ai/workspaces/invites/accept/"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.access}`,
          },
          body: JSON.stringify({ token: inviteToken }),
        });
      } catch {
        // ignore invite accept errors on login
      }
    }
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-vanilla">
      <div className="w-full max-w-md card-surface p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white text-lg font-bold shadow">
            AI
          </span>
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
          <Link to="/register" className="font-medium text-brand-700 underline decoration-brand-400 hover:text-brand-900">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
