import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ClientLayout from "../components/ClientLayout.jsx";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";

function formatTier(code) {
  if (!code) return "—";
  return String(code).replace(/_/g, " ");
}

function ConfirmModal({ open, title, children, confirmLabel, onConfirm, onCancel, busy, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-6"
      >
        <h3 id="confirm-modal-title" className="text-lg font-semibold text-[#0F172A]">
          {title}
        </h3>
        <div className="mt-3 text-sm text-slate-600">{children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={
              danger
                ? "rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                : "rounded-xl bg-[#16A34A] text-white px-4 py-2 text-sm font-semibold hover:bg-[#15803d] disabled:opacity-50"
            }
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Billing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  /** Blocks double-submit before React re-renders; stays set when redirecting to PayFast. */
  const paymentLockRef = useRef(false);
  const [actionMsg, setActionMsg] = useState("");
  const [creditQty, setCreditQty] = useState(50);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [proSeats, setProSeats] = useState(3);
  const [firmSeats, setFirmSeats] = useState(10);

  const loadUsage = useCallback(async () => {
    setError("");
    const res = await fetch(apiUrl("/api/billing/usage/"), { headers: authHeaders({ json: false }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.detail || "Could not load usage.");
      setUsage(null);
      return;
    }
    setUsage(data);
    const pb = data?.payfast?.pro_seat_bounds;
    const fb = data?.payfast?.firm_seat_bounds;
    if (pb?.min != null) setProSeats((s) => Math.max(pb.min, Math.min(Number(s) || pb.min, pb.max)));
    if (fb?.min != null) setFirmSeats((s) => Math.max(fb.min, Math.min(Number(s) || fb.min, fb.max)));
    if (data.subscription_seat_count && data.plan_tier === "pro" && pb)
      setProSeats(Math.max(pb.min, Math.min(Number(data.subscription_seat_count), pb.max)));
    if (data.subscription_seat_count && data.plan_tier === "firm" && fb)
      setFirmSeats(Math.max(fb.min, Math.min(Number(data.subscription_seat_count), fb.max)));
    if (data.subscription_billing_cycle === "yearly" || data.subscription_billing_cycle === "monthly") {
      setBillingCycle(data.subscription_billing_cycle);
    }
  }, []);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  useEffect(() => {
    const ret = searchParams.get("payfast_return");
    const cancel = searchParams.get("payfast_cancel");
    if (ret === "1") {
      setActionMsg(
        "Returned from PayFast. Your plan may take a few seconds to update — refresh if needed."
      );
      loadUsage();
      searchParams.delete("payfast_return");
      searchParams.delete("token");
      setSearchParams(searchParams, { replace: true });
    } else if (cancel === "1") {
      setActionMsg("PayFast checkout was cancelled.");
      searchParams.delete("payfast_cancel");
      searchParams.delete("token");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, loadUsage]);

  async function postPayfastCheckout(path, body = {}) {
    if (paymentLockRef.current) return;
    paymentLockRef.current = true;
    setBusy(true);
    setActionMsg("");
    let navigating = false;
    try {
      const res = await fetch(apiUrl(path), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.payment_url) {
        navigating = true;
        window.location.href = data.payment_url;
        return;
      }
      setActionMsg(data.detail || "Could not start PayFast checkout.");
    } catch {
      setActionMsg("Network error.");
    } finally {
      if (!navigating) {
        paymentLockRef.current = false;
        setBusy(false);
      }
    }
  }

  async function upgradePayfastEnterprise() {
    if (paymentLockRef.current) return;
    paymentLockRef.current = true;
    setBusy(true);
    setActionMsg("");
    try {
      const res = await fetch(apiUrl("/api/billing/payfast/subscription/update/"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ target_tier: "enterprise", billing_cycle: billingCycle }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setActionMsg(data.detail || "Upgraded to Enterprise.");
        await loadUsage();
      } else {
        setActionMsg(data.detail || "Upgrade failed.");
      }
    } catch {
      setActionMsg("Network error.");
    } finally {
      paymentLockRef.current = false;
      setBusy(false);
    }
  }

  async function startPayfastCredits() {
    if (paymentLockRef.current) return;
    paymentLockRef.current = true;
    setBusy(true);
    setActionMsg("");
    let navigating = false;
    try {
      const res = await fetch(apiUrl("/api/billing/payfast/credits/"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ credits: Math.min(50000, Math.max(1, Number(creditQty) || 50)) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.payment_url) {
        navigating = true;
        window.location.href = data.payment_url;
        return;
      }
      setActionMsg(data.detail || "Could not start PayFast checkout.");
    } catch {
      setActionMsg("Network error.");
    } finally {
      if (!navigating) {
        paymentLockRef.current = false;
        setBusy(false);
      }
    }
  }

  async function confirmCancelPayfastSubscription() {
    if (paymentLockRef.current) return;
    paymentLockRef.current = true;
    setBusy(true);
    setActionMsg("");
    try {
      const res = await fetch(apiUrl("/api/billing/payfast/cancel/"), {
        method: "POST",
        headers: authHeaders(),
        body: "{}",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setActionMsg(data.detail || "Cancelled.");
        setCancelModalOpen(false);
        await loadUsage();
      } else {
        setActionMsg(data.detail || "Cancel failed.");
      }
    } catch {
      setActionMsg("Network error.");
    } finally {
      paymentLockRef.current = false;
      setBusy(false);
    }
  }

  const pf = usage?.payfast;
  const tier = usage?.plan_tier;
  const oneDocumentAccessActive =
    tier === "one_document" &&
    usage?.subscription_period_end &&
    new Date(usage.subscription_period_end) > new Date();
  const blockOneDocumentPurchase = Boolean(pf?.has_active_subscription || oneDocumentAccessActive);
  const showPayfastSubscribe = pf?.enabled && !pf?.has_active_subscription;
  const qLimit = usage?.ai_queries_limit_per_month;
  const qUsed = usage?.ai_queries_used_this_month ?? 0;
  const qLabel = qLimit == null ? `${qUsed} (unlimited)` : `${qUsed} / ${qLimit}`;
  const dLimit = usage?.completed_documents_limit;
  const dUsed = usage?.completed_documents_count ?? 0;
  const dLabel = dLimit == null ? `${dUsed} (unlimited)` : `${dUsed} / ${dLimit}`;
  const models = usage?.pricing_models;
  const canEnterprise = Boolean(pf?.can_upgrade_to_enterprise && (tier === "pro" || tier === "firm"));
  const pb = pf?.pro_seat_bounds;
  const fb = pf?.firm_seat_bounds;
  const checkoutBody = (extra = {}) => ({ billing_cycle: billingCycle, ...extra });

  return (
    <ClientLayout title="Billing & usage">
      <ConfirmModal
        open={cancelModalOpen}
        title="Cancel PayFast subscription?"
        confirmLabel="Yes, cancel subscription"
        danger
        busy={busy}
        onCancel={() => !busy && setCancelModalOpen(false)}
        onConfirm={confirmCancelPayfastSubscription}
      >
        <p>
          Your recurring billing will stop at PayFast and your account will move to the <strong>Free</strong> plan.
          You can subscribe again later from this page.
        </p>
      </ConfirmModal>

      {error ? (
        <p className="text-red-600 text-sm rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-4">{error}</p>
      ) : null}
      {actionMsg ? (
        <p className="text-sm rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 px-4 py-3 mb-4">
          {actionMsg}
        </p>
      ) : null}

      {!usage ? (
        <p className="text-slate-600 text-sm">Loading…</p>
      ) : (
        <div className="space-y-6 max-w-2xl">
          <div className="card-surface-static p-5 sm:p-6 border border-slate-200/80">
            <h2 className="text-lg font-semibold text-[#0F172A]">Current plan</h2>
            <p className="mt-2 text-2xl font-bold text-[#16A34A] capitalize">{formatTier(usage.plan_tier)}</p>
            {usage.is_trial_active ? (
              <p className="mt-2 text-sm text-slate-600">
                Trial active
                {usage.trial_ends_at ? ` until ${new Date(usage.trial_ends_at).toLocaleString()}` : ""}.
              </p>
            ) : null}
            {usage.subscription_period_end ? (
              <p className="mt-1 text-sm text-slate-600">
                Subscription renews / ends: {new Date(usage.subscription_period_end).toLocaleString()}
              </p>
            ) : null}
            <p className="mt-3 text-sm text-slate-600">
              AI credits balance: <span className="font-semibold text-[#0F172A]">{usage.ai_credits_balance ?? 0}</span>
            </p>
            <p className="mt-4 text-sm">
              <Link to="/plans" className="text-[#16A34A] font-medium hover:underline">
                Compare all plans
              </Link>
            </p>
          </div>

          <div className="card-surface-static p-5 sm:p-6 border border-slate-200/80">
            <h2 className="text-lg font-semibold text-[#0F172A]">Usage this month</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>
                <span className="text-slate-500">AI queries:</span> {qLabel}
              </li>
              <li>
                <span className="text-slate-500">Completed documents:</span> {dLabel}
              </li>
            </ul>
          </div>

          {models?.tiers?.length ? (
            <div className="card-surface-static p-5 sm:p-6 border border-slate-200/80">
              <h2 className="text-lg font-semibold text-[#0F172A]">Pricing models (ZAR)</h2>
              <p className="mt-2 text-sm text-slate-600">
                Guide ranges from our catalog; PayFast amounts below are the live checkout prices when configured.
              </p>
              <ul className="mt-3 space-y-3 text-sm text-slate-700">
                {models.tiers.map((t) => (
                  <li key={t.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <span className="font-semibold text-[#0F172A]">{t.name}</span>
                    <span className="text-slate-500"> — {t.audience}</span>
                    {t.price_range_zar ? (
                      <span className="block text-slate-600 mt-0.5">
                        R{t.price_range_zar[0]}–R{t.price_range_zar[1]} / mo (guide)
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              {models.hybrid ? (
                <p className="mt-3 text-sm text-slate-600">{models.hybrid.summary}</p>
              ) : null}
            </div>
          ) : null}

          {pf?.enabled ? (
            <div className="card-surface-static p-5 sm:p-6 border border-[#16A34A]/30 bg-emerald-50/30">
              <h2 className="text-lg font-semibold text-[#0F172A]">PayFast checkout</h2>
              <p className="mt-2 text-sm text-slate-600">
                {pf.sandbox
                  ? "Sandbox mode — use PayFast test buyers only."
                  : "You will be redirected to PayFast to complete payment in ZAR."}{" "}
                Amounts scale by seats (Professional / Firm) and billing cycle; yearly plans include a 10–15% discount
                (see Plans). Reference amounts: Starter <strong>R{pf.starter_monthly_amount_zar}</strong>, Professional{" "}
                <strong>R{pf.pro_monthly_amount_zar}</strong>, Firm <strong>R{pf.firm_monthly_amount_zar}</strong> (defaults).
                Enterprise (upgrade): <strong>R{pf.enterprise_monthly_amount_zar}</strong> / month.
                Credits: <strong>R{pf.credit_unit_zar}</strong> per credit unit. One-document check (once-off):{" "}
                <strong>R{pf.one_document_amount_zar ?? "—"}</strong> — single upload, AI Q&A on that file only, 14-day retention.
              </p>
              {pf.enabled && !blockOneDocumentPurchase ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
                  <p className="text-sm font-semibold text-amber-950">One-document check</p>
                  <p className="mt-1 text-sm text-amber-900/90">
                    Upload one contract or agreement, then use Document Q&amp;A (RAG) on that file only. Red flags and clause gaps
                    are surfaced in chat. File is kept for 14 days, then removed. No workflows, research, or full assistant.
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => postPayfastCheckout("/api/billing/payfast/one-document/", {})}
                    className="mt-3 rounded-xl bg-amber-700 text-white px-4 py-2 text-sm font-semibold hover:bg-amber-800 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {busy ? "Redirecting…" : `Pay once — R${pf.one_document_amount_zar ?? "—"}`}
                  </button>
                </div>
              ) : oneDocumentAccessActive ? (
                <p className="mt-3 text-sm text-emerald-800">
                  Your one-document check is active until{" "}
                  {usage?.subscription_period_end ? new Date(usage.subscription_period_end).toLocaleString() : ""}. Upload
                  from Documents, then open the Assistant for Q&amp;A on that file.
                </p>
              ) : null}
              {showPayfastSubscribe ? (
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <span className="text-slate-600">Cycle:</span>
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      name="bill-cycle"
                      checked={billingCycle === "monthly"}
                      disabled={busy}
                      onChange={() => setBillingCycle("monthly")}
                    />
                    Monthly
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      name="bill-cycle"
                      checked={billingCycle === "yearly"}
                      disabled={busy}
                      onChange={() => setBillingCycle("yearly")}
                    />
                    Yearly
                  </label>
                  <span className="text-slate-500">Pro seats ({pb?.min}–{pb?.max}):</span>
                  <input
                    type="number"
                    min={pb?.min ?? 3}
                    max={pb?.max ?? 10}
                    value={proSeats}
                    disabled={busy}
                    onChange={(e) => setProSeats(e.target.value)}
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-60"
                  />
                  <span className="text-slate-500">Firm seats ({fb?.min}–{fb?.max}):</span>
                  <input
                    type="number"
                    min={fb?.min ?? 10}
                    max={fb?.max ?? 50}
                    value={firmSeats}
                    disabled={busy}
                    onChange={(e) => setFirmSeats(e.target.value)}
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-60"
                  />
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3 items-end">
                {showPayfastSubscribe ? (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => postPayfastCheckout("/api/billing/payfast/starter/", checkoutBody())}
                      className="rounded-xl bg-[#16A34A] text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-[#15803d] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {busy ? "Redirecting…" : "Starter"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        postPayfastCheckout(
                          "/api/billing/payfast/pro/",
                          checkoutBody({ seats: Math.min(pb?.max ?? 10, Math.max(pb?.min ?? 3, Number(proSeats) || 3)) }),
                        )
                      }
                      className="rounded-xl bg-[#15803d] text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-[#166534] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {busy ? "Redirecting…" : "Professional"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        postPayfastCheckout(
                          "/api/billing/payfast/firm/",
                          checkoutBody({ seats: Math.min(fb?.max ?? 50, Math.max(fb?.min ?? 10, Number(firmSeats) || 10)) }),
                        )
                      }
                      className="rounded-xl border-2 border-[#15803d] bg-white text-[#15803d] px-4 py-2 text-sm font-semibold hover:bg-emerald-50 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {busy ? "Redirecting…" : "Firm"}
                    </button>
                  </>
                ) : null}
                {canEnterprise ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={upgradePayfastEnterprise}
                    className="rounded-xl border-2 border-[#15803d] bg-white text-[#15803d] px-4 py-2 text-sm font-semibold hover:bg-emerald-50 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {busy ? "Please wait…" : "Upgrade to Enterprise (PayFast)"}
                  </button>
                ) : null}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600" htmlFor="credit-qty">
                    Credits
                  </label>
                  <input
                    id="credit-qty"
                    type="number"
                    min={1}
                    max={50000}
                    value={creditQty}
                    disabled={busy}
                    onChange={(e) => setCreditQty(e.target.value)}
                    className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm disabled:opacity-60"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={startPayfastCredits}
                    className="rounded-xl border border-[#16A34A] text-[#15803d] px-4 py-2 text-sm font-semibold hover:bg-emerald-50 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {busy ? "Redirecting…" : "Buy credits"}
                  </button>
                </div>
              </div>
              {pf.has_active_subscription ? (
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <p className="text-sm text-slate-600 mb-2">You have an active PayFast subscription.</p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setCancelModalOpen(true)}
                    className="text-sm text-red-700 font-medium hover:underline disabled:opacity-50"
                  >
                    Cancel PayFast subscription
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="card-surface-static p-5 sm:p-6 border border-slate-200/80 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-[#0F172A]">PayFast</h2>
              <p className="mt-2 text-sm text-slate-600">
                Online checkout is not configured (set <code className="bg-slate-100 px-1 rounded">PAYFAST_MERCHANT_ID</code>{" "}
                and <code className="bg-slate-100 px-1 rounded">PAYFAST_MERCHANT_KEY</code> in the server environment).
              </p>
            </div>
          )}

          <p className="text-sm text-slate-600">
            <Link to="/dashboard" className="text-[#16A34A] font-medium hover:underline">
              Back to dashboard
            </Link>
          </p>
        </div>
      )}
    </ClientLayout>
  );
}
