import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authHeaders } from "./utils/authHeaders.js";
import { persistSessionUser } from "./utils/sessionUser.js";
import { apiUrl } from "./utils/apiUrl.js";

export default function AdminRoute({ children }) {
  const access = localStorage.getItem("access");
  const [state, setState] = useState("loading"); // loading | ok | deny | noauth

  useEffect(() => {
    if (!access) {
      setState("noauth");
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetch(apiUrl("/api/auth/profile/"), {
        headers: authHeaders({ json: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (!res.ok) {
        setState("noauth");
        return;
      }
      if (data.user) persistSessionUser(data.user);
      setState(data.user?.is_staff === true ? "ok" : "deny");
    })();
    return () => {
      cancelled = true;
    };
  }, [access]);

  if (!access || state === "noauth") {
    return <Navigate to="/login" replace />;
  }

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-950 text-brand-100">
        <p className="text-sm">Checking access…</p>
      </div>
    );
  }

  if (state === "deny") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
