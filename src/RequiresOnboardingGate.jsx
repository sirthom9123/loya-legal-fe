import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authHeaders } from "./utils/authHeaders.js";
import { apiUrl } from "./utils/apiUrl.js";
import { persistSessionUser } from "./utils/sessionUser.js";

/**
 * After email verification, user must complete onboarding (trial / PayFast) before the main app.
 * Billing and plans are sibling routes (outside this gate). Staff skips this gate.
 */
export default function RequiresOnboardingGate() {
  const location = useLocation();
  const [state, setState] = useState(() => ({
    loading: true,
    redirect: false,
  }));

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const access = localStorage.getItem("access");
      if (!access) {
        if (!cancelled) setState({ loading: false, redirect: false });
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
            setState({ loading: false, redirect: false });
            return;
          }
          if (u.email_verified && u.onboarding_completed === false) {
            setState({ loading: false, redirect: true });
            return;
          }
        }
        setState({ loading: false, redirect: false });
      } catch {
        if (!cancelled) setState({ loading: false, redirect: false });
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
  if (state.redirect) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}
