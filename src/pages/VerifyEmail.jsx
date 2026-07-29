import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiUrl } from "../utils/apiUrl.js";
import { persistSessionUser } from "../utils/sessionUser.js";
import { NomoraeWordmark } from "../components/BrandMark.jsx";

/** Undo quoted-printable artifacts when email clients mangle ``?token=-…`` links. */
function normalizeEmailToken(raw) {
  const token = (raw || "").trim();
  if (token.startsWith("3D-") && token.length > 3) return token.slice(2);
  if (token.startsWith("3D") && token.length > 2) return token.slice(2);
  return token;
}

function continuePathForUser(user) {
  if (!user) return "/login";
  if (user.is_staff) return "/dashboard";
  if (user.is_invited_member) {
    return user.profile_setup_completed ? "/dashboard" : "/welcome";
  }
  if (user.onboarding_completed) return "/dashboard";
  return "/onboarding";
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = normalizeEmailToken(searchParams.get("token") || "");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [continueTo, setContinueTo] = useState("/login");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return undefined;
    }

    let cancelled = false;

    async function verify() {
      try {
        const res = await fetch(apiUrl(`/api/auth/verify-email/?token=${encodeURIComponent(token)}`));
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (res.ok) {
          setStatus("success");
          setMessage(data.detail || "Email verified successfully.");

          const access = localStorage.getItem("access");
          if (!access) {
            setContinueTo("/login");
            return;
          }

          try {
            const pr = await fetch(apiUrl("/api/auth/profile/"), {
              headers: { Authorization: `Bearer ${access}` },
            });
            const profileData = await pr.json().catch(() => ({}));
            if (cancelled) return;

            if (pr.ok && profileData.user) {
              persistSessionUser(profileData.user);
              setContinueTo(continuePathForUser(profileData.user));
              return;
            }
          } catch {
            /* ignore profile refresh */
          }

          setContinueTo("/dashboard");
        } else {
          setStatus("error");
          setMessage(data.detail || "Verification failed.");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Network error. Please try again.");
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  function continueLabel() {
    if (continueTo === "/welcome") return "Complete your profile";
    if (continueTo === "/onboarding") return "Continue setup";
    return "Continue to dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-vanilla">
      <div className="w-full max-w-md card-surface p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-6">
          <NomoraeWordmark className="h-11 w-auto max-w-[260px] object-contain" />
        </div>

        {status === "loading" ? (
          <>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-2xl mb-4 animate-pulse">
              ⏳
            </div>
            <h1 className="text-xl font-semibold text-brand-900 mb-2">Verifying your email…</h1>
            <p className="text-sm text-brand-700/70">Please wait while we confirm your address.</p>
          </>
        ) : null}

        {status === "success" ? (
          <>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl mb-4">
              ✓
            </div>
            <h1 className="text-xl font-semibold text-brand-900 mb-2">Email verified!</h1>
            <p className="text-sm text-brand-700/70 mb-6">{message}</p>
            <Link to={continueTo} className="btn-primary w-full inline-block text-center">
              {continueLabel()}
            </Link>
          </>
        ) : null}

        {status === "error" ? (
          <>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl mb-4">
              ✕
            </div>
            <h1 className="text-xl font-semibold text-brand-900 mb-2">Verification failed</h1>
            <p className="text-sm text-red-600/90 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link to="/login" className="btn-primary w-full text-center">
                Sign in
              </Link>
              <p className="text-xs text-slate-500">
                You can request a new verification email from your dashboard after signing in.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
