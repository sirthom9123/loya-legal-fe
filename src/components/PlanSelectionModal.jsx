import React from "react";
import PlanPicker from "./PlanPicker.jsx";
import { persistSessionUser } from "../utils/sessionUser.js";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";

export default function PlanSelectionModal() {
  async function refreshProfile() {
    const access = localStorage.getItem("access");
    if (!access) return;
    const res = await fetch(apiUrl("/api/auth/profile/"), { headers: authHeaders({ json: false }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.user) persistSessionUser(data.user);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-selection-title"
        className="relative z-10 w-full max-w-3xl max-h-[min(90vh,720px)] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 sm:p-8"
      >
        <h2 id="plan-selection-title" className="text-xl sm:text-2xl font-semibold text-[#0F172A] text-center">
          Your trial has ended
        </h2>
        <p className="mt-2 text-sm text-slate-600 text-center max-w-xl mx-auto">
          Choose a subscription to keep using Nomorae. You can complete checkout on PayFast, or open Billing for
          usage and subscription management.
        </p>
        <div className="mt-6">
          <PlanPicker variant="modal" onAfterSubscribe={refreshProfile} />
        </div>
      </div>
    </div>
  );
}
