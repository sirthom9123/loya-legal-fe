import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authHeaders } from "./utils/authHeaders.js";
import { apiUrl } from "./utils/apiUrl.js";
import { persistSessionUser } from "./utils/sessionUser.js";

/**
 * Owners: subscription onboarding after email verification.
 * Invited members: profile setup (/welcome) only — never plan onboarding.
 */
export default function RequiresOnboardingGate() {
  const location = useLocation();
  const [state, setState] = useState(() => ({
    loading: true,
    redirectTo: null,
  }));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const access = localStorage.getItem("access");
      if (!access) {
        if (!cancelled) setState({ loading: false, redirectTo: null });
        return;
      }
      try {
        const res = await fetch(apiUrl("/api/auth/profile/"), {
          headers: authHeaders({ json: false }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.user) {
          persistSessionUser(data.user);
          const u = data.user;
          if (u.is_staff) {
            setState({ loading: false, redirectTo: null });
            return;
          }
          if (u.is_invited_member) {
            if (!u.profile_setup_completed && location.pathname !== "/welcome") {
              setState({ loading: false, redirectTo: "/welcome" });
              return;
            }
            setState({ loading: false, redirectTo: null });
            return;
          }
          if (u.email_verified && u.onboarding_completed === false) {
            setState({ loading: false, redirectTo: "/onboarding" });
            return;
          }
        }
        setState({ loading: false, redirectTo: null });
      } catch {
        if (!cancelled) setState({ loading: false, redirectTo: null });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vanilla text-brand-800 text-sm font-medium">
        Loading…
      </div>
    );
  }
  if (state.redirectTo) {
    return <Navigate to={state.redirectTo} replace />;
  }
  return <Outlet />;
}
