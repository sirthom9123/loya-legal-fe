import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ClientLayout from "../components/ClientLayout.jsx";
import { SkeletonLine } from "../components/Skeleton.jsx";
import { formatApiError } from "../utils/apiError.js";
import { authHeaders } from "../utils/authHeaders.js";
import { clearSessionUser, persistSessionUser } from "../utils/sessionUser.js";
import { apiUrl } from "../utils/apiUrl.js";
import { fetchPushStatus, subscribeWebPush } from "../utils/webPush.js";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [pushPref, setPushPref] = useState(true);
  const [pushSubCount, setPushSubCount] = useState(0);
  const [vapidOk, setVapidOk] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [productEmailOptIn, setProductEmailOptIn] = useState(false);
  const [digestBusy, setDigestBusy] = useState(false);
  const [workspaceMemberOnly, setWorkspaceMemberOnly] = useState(false);

  useEffect(() => {
    async function load() {
      const access = localStorage.getItem("access");
      if (!access) {
        navigate("/login", { replace: true });
        return;
      }
      const res = await fetch(apiUrl("/api/auth/profile/"), { headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          clearSessionUser();
          navigate("/login", { replace: true });
          return;
        }
        setError(formatApiError(data));
        setLoading(false);
        return;
      }
      const u = data.user || {};
      if (data.user) persistSessionUser(data.user);
      setFirstName(u.first_name || "");
      setLastName(u.last_name || "");
      setEmail(u.email || "");
      setIsActive(u.is_active !== false);
      setPushPref(u.push_notifications_enabled !== false);
      setPushSubCount(Number(u.web_push_subscription_count) || 0);
      setProductEmailOptIn(u.product_updates_email_opt_in === true);
      setWorkspaceMemberOnly(u.workspace_member_only === true);
      setLoading(false);
    }
    load();
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await fetchPushStatus();
        if (!cancelled) setVapidOk(!!s.vapid_enabled);
      } catch {
        if (!cancelled) setVapidOk(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function patchProductEmailOptIn(enabled) {
    setError("");
    setSuccess("");
    setDigestBusy(true);
    try {
      const res = await fetch(apiUrl("/api/auth/profile/"), {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ product_updates_email_opt_in: enabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data));
        return;
      }
      const u = data.user || {};
      if (data.user) persistSessionUser(data.user);
      setProductEmailOptIn(u.product_updates_email_opt_in === true);
      setWorkspaceMemberOnly(u.workspace_member_only === true);
      setSuccess(
        enabled
          ? "Your email is on the product newsletter mailing list."
          : "Your email was removed from the newsletter mailing list.",
      );
    } finally {
      setDigestBusy(false);
    }
  }

  async function patchPushNotifications(enabled) {
    setError("");
    setSuccess("");
    setPushBusy(true);
    try {
      const res = await fetch(apiUrl("/api/auth/profile/"), {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ push_notifications_enabled: enabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(formatApiError(data));
        return;
      }
      const u = data.user || {};
      if (data.user) persistSessionUser(data.user);
      setPushPref(u.push_notifications_enabled !== false);
      setPushSubCount(Number(u.web_push_subscription_count) || 0);
      setWorkspaceMemberOnly(u.workspace_member_only === true);
      setSuccess(enabled ? "Browser notifications allowed." : "Browser notifications turned off; devices were unregistered.");
    } finally {
      setPushBusy(false);
    }
  }

  async function onRegisterThisBrowser() {
    setError("");
    setSuccess("");
    setPushBusy(true);
    try {
      await subscribeWebPush();
      const res = await fetch(apiUrl("/api/auth/profile/"), { headers: authHeaders({ json: false }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        persistSessionUser(data.user);
        setPushSubCount(Number(data.user.web_push_subscription_count) || 0);
        setPushPref(data.user.push_notifications_enabled !== false);
      }
      setSuccess("This browser is now registered for push.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not register this browser");
    } finally {
      setPushBusy(false);
    }
  }

  async function onSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const body = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
    };

    if (newPassword || newPasswordConfirm || currentPassword) {
      if (newPassword !== newPasswordConfirm) {
        setError("New passwords do not match.");
        setSaving(false);
        return;
      }
      body.current_password = currentPassword;
      body.new_password = newPassword;
      body.new_password_confirm = newPasswordConfirm;
    }

    const res = await fetch(apiUrl("/api/auth/profile/"), {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(formatApiError(data));
      return;
    }

    setSuccess("Profile updated.");
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
    if (data.user) {
      persistSessionUser(data.user);
      setFirstName(data.user.first_name || "");
      setLastName(data.user.last_name || "");
      setEmail(data.user.email || "");
      setWorkspaceMemberOnly(data.user.workspace_member_only === true);
    }
  }

  async function onDeactivate() {
    const password = window.prompt("Enter your password to deactivate your account:");
    if (password === null) return;
    setError("");
    setSuccess("");
    const res = await fetch(apiUrl("/api/auth/deactivate/"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(formatApiError(data));
      return;
    }
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    clearSessionUser();
    navigate("/login", { replace: true });
  }

  async function onDelete() {
    const ok = window.confirm("Permanently delete your account? This cannot be undone.");
    if (!ok) return;
    const password = window.prompt("Enter your password to confirm deletion:");
    if (password === null) return;
    setError("");
    setSuccess("");
    const res = await fetch(apiUrl("/api/auth/account/delete/"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(formatApiError(data));
      return;
    }
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    clearSessionUser();
    navigate("/login", { replace: true });
  }

  const initials =
    [firstName, lastName]
      .filter(Boolean)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  if (loading) {
    return (
      <ClientLayout title="Settings">
        <div className="max-w-lg mx-auto space-y-4">
          <SkeletonLine className="h-28 w-full rounded-2xl" />
          <SkeletonLine className="h-48 w-full rounded-2xl" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="Settings">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="card-surface-static p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 border-l-4 border-l-[#16A34A]">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-xl font-bold text-white shadow-lg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-[#0F172A]">
                {[firstName, lastName].filter(Boolean).join(" ") || "Your profile"}
              </h2>
              <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-semibold text-[#166534]">
                Lawyer
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                <span
                  className={`h-2 w-2 rounded-full ${isActive ? "bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-slate-300"}`}
                />
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 truncate">{email || "No email on file"}</p>
          </div>
        </div>

        <div className="card-surface-static p-5 sm:p-6 border border-slate-200/80">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Notifications</h2>
          <p className="text-xs text-slate-600 mb-4">
            Control whether Nomorae may send browser push notifications for case reminders. Turning this off removes registered
            devices. You can still use the{" "}
            <Link to="/calendar" className="text-[#16A34A] font-medium hover:underline">
              Calendar
            </Link>{" "}
            to register a device when this is on.
          </p>
          {!vapidOk ? (
            <p className="text-xs text-amber-700 mb-3">Push is not available — server VAPID keys are not configured.</p>
          ) : null}
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span className="text-sm text-slate-700">Allow browser push notifications</span>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A]"
              checked={pushPref}
              disabled={pushBusy}
              onChange={(e) => patchPushNotifications(e.target.checked)}
            />
          </label>
          <p className="text-xs text-slate-500 mt-2">
            Registered browser{pushSubCount === 1 ? "" : "s"}: {vapidOk ? pushSubCount : "—"}
          </p>
          {vapidOk && pushPref && pushSubCount === 0 ? (
            <button
              type="button"
              disabled={pushBusy}
              onClick={onRegisterThisBrowser}
              className="mt-3 text-sm px-3 py-2 rounded-lg border border-slate-200 font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Register this browser
            </button>
          ) : null}
        </div>

        <div className="card-surface-static p-5 sm:p-6 border border-slate-200/80">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Newsletter (product emails)</h2>
          <p className="text-xs text-slate-600 mb-4">
            Adds your account email to the product newsletter mailing list. Turn off anytime — we remove your address from
            that list.
          </p>
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <span className="text-sm text-slate-700">Product &amp; feature announcements</span>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A]"
              checked={productEmailOptIn}
              disabled={digestBusy}
              onChange={(e) => patchProductEmailOptIn(e.target.checked)}
            />
          </label>
        </div>

        {!workspaceMemberOnly ? (
          <div className="card-surface-static p-5 sm:p-6 border border-slate-200/80">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">Account & billing</h2>
            <p className="text-xs text-slate-600 mb-4">
              Subscription options are managed here instead of the sidebar.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/billing"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Open Billing
              </Link>
              <Link
                to="/plans"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                View Plans
              </Link>
            </div>
          </div>
        ) : null}

        <div className="card-surface p-5 sm:p-6">
        {error ? (
          <p className="text-red-600 mb-4 text-sm whitespace-pre-wrap rounded-lg bg-red-50 border border-red-100 px-3 py-2">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-[#166534] mb-4 text-sm font-medium rounded-lg bg-[#DCFCE7] border border-brand-200 px-3 py-2">
            {success}
          </p>
        ) : null}

        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
            <input
              className="input-field"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
            <input
              className="input-field"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Change password (optional)</h2>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                className="input-field"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <input
                type="password"
                placeholder="New password"
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="input-field"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">Danger zone</h2>
          <button
            type="button"
            onClick={onDeactivate}
            className="w-full rounded-xl border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2.5 text-sm font-medium hover:bg-amber-100"
          >
            Deactivate account
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="w-full rounded-xl border border-red-300 bg-red-50 text-red-800 px-3 py-2.5 text-sm font-medium hover:bg-red-100"
          >
            Delete account permanently
          </button>
        </div>
      </div>
      </div>
    </ClientLayout>
  );
}
