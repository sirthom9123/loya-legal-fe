import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";

const PAYFAST_CHECKOUT = {
  starter: "/api/billing/payfast/starter/",
  professional: "/api/billing/payfast/pro/",
  firm: "/api/billing/payfast/firm/",
};

/** Map API plan_tier to catalog card id */
function tierToCardId(tier) {
  if (!tier) return null;
  const t = String(tier).toLowerCase();
  if (t === "pro") return "professional";
  return t;
}

function cardRank(cardId) {
  const m = { starter: 1, professional: 2, firm: 3, enterprise: 4 };
  return m[cardId] ?? 0;
}

const PREVIEW_KEY = {
  starter: "starter",
  professional: "pro",
  firm: "firm",
  enterprise: "enterprise",
};

function formatZar(amountStr) {
  if (amountStr == null || amountStr === "") return "—";
  const n = Number(amountStr);
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(n);
  } catch {
    return `R${n.toFixed(2)}`;
  }
}

function TierPricePreview({ block, billingCycle }) {
  if (!block) return null;
  const rec = block.recurring_amount_zar;
  const eff = block.effective_monthly_zar;
  const save = block.savings_per_month_vs_monthly_zar;
  const seatsNote =
    block.seats != null ? (
      <p className="text-xs text-slate-500 mt-1">
        for {block.seats} seat{Number(block.seats) === 1 ? "" : "s"}
      </p>
    ) : null;

  if (billingCycle === "yearly") {
    return (
      <div className="mt-3 space-y-1 text-sm">
        <p className="font-semibold text-[#0F172A]">
          {formatZar(rec)} / year
        </p>
        <p className="text-slate-600">≈ {formatZar(eff)} / month effective</p>
        {save != null && Number(save) > 0 ? (
          <p className="text-[#15803d] font-medium">
            Save {formatZar(save)} / month vs monthly
          </p>
        ) : null}
        {seatsNote}
      </div>
    );
  }

  return (
    <div className="mt-3 text-sm">
      <p className="font-semibold text-[#0F172A]">{formatZar(rec)} / month</p>
      {seatsNote}
    </div>
  );
}

export default function PlanPicker({ variant = "page", onAfterSubscribe }) {
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [proSeats, setProSeats] = useState(3);
  const [firmSeats, setFirmSeats] = useState(10);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewFetchSeq = useRef(0);

  const load = useCallback(async () => {
    setError("");
    const res = await fetch(apiUrl("/api/billing/usage/"), { headers: authHeaders({ json: false }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.detail || "Could not load plans.");
      setUsage(null);
      return;
    }
    setUsage(data);
    const pb = data?.payfast?.pro_seat_bounds;
    const fb = data?.payfast?.firm_seat_bounds;
    if (pb?.min != null) setProSeats((s) => Math.max(pb.min, Math.min(s, pb.max ?? s)));
    if (fb?.min != null) setFirmSeats((s) => Math.max(fb.min, Math.min(s, fb.max ?? s)));
    const sc = data.subscription_seat_count;
    const t = data.plan_tier;
    if (sc && (t === "pro" || t === "firm")) {
      if (t === "pro" && pb) setProSeats(Math.max(pb.min, Math.min(Number(sc), pb.max)));
      if (t === "firm" && fb) setFirmSeats(Math.max(fb.min, Math.min(Number(sc), fb.max)));
    }
    if (data.subscription_billing_cycle === "yearly" || data.subscription_billing_cycle === "monthly") {
      setBillingCycle(data.subscription_billing_cycle);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!usage) {
      setPreview(null);
      setPreviewLoading(false);
      return undefined;
    }
    const ac = new AbortController();
    const id = ++previewFetchSeq.current;
    const t = setTimeout(() => {
      setPreviewLoading(true);
      const pb = usage?.payfast?.pro_seat_bounds;
      const fb = usage?.payfast?.firm_seat_bounds;
      const rawP = Math.round(Number(proSeats) || 3);
      const rawF = Math.round(Number(firmSeats) || 10);
      const pro = pb ? Math.max(pb.min, Math.min(rawP, pb.max ?? rawP)) : rawP;
      const firm = fb ? Math.max(fb.min, Math.min(rawF, fb.max ?? rawF)) : rawF;
      const params = new URLSearchParams({
        billing_cycle: billingCycle,
        pro_seats: String(pro),
        firm_seats: String(firm),
      });
      (async () => {
        try {
          const res = await fetch(apiUrl(`/api/billing/price-preview/?${params}`), {
            headers: authHeaders({ json: false }),
            signal: ac.signal,
          });
          const data = await res.json().catch(() => ({}));
          if (id !== previewFetchSeq.current) return;
          if (!res.ok) {
            setPreview(null);
            return;
          }
          setPreview(data);
        } catch (e) {
          if (e?.name === "AbortError") return;
          if (id !== previewFetchSeq.current) return;
          setPreview(null);
        } finally {
          if (id === previewFetchSeq.current) setPreviewLoading(false);
        }
      })();
    }, 280);
    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [usage, billingCycle, proSeats, firmSeats]);

  async function startCheckout(tierKey) {
    const url = PAYFAST_CHECKOUT[tierKey];
    if (!url) return;
    setBusy(true);
    setMsg("");
    const body = { billing_cycle: billingCycle };
    if (tierKey === "professional") body.seats = Math.max(1, Number(proSeats) || 3);
    if (tierKey === "firm") body.seats = Math.max(1, Number(firmSeats) || 10);
    try {
      const res = await fetch(apiUrl(url), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.payment_url) {
        if (onAfterSubscribe) onAfterSubscribe();
        window.location.href = data.payment_url;
        return;
      }
      setMsg(data.detail || "Could not start checkout.");
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function upgradeSubscription(targetCardId) {
    const target_tier =
      targetCardId === "professional" ? "pro" : targetCardId === "enterprise" ? "enterprise" : targetCardId;
    setBusy(true);
    setMsg("");
    const body = { target_tier, billing_cycle: billingCycle };
    if (target_tier === "pro") body.seats = Math.max(1, Number(proSeats) || 3);
    if (target_tier === "firm") body.seats = Math.max(1, Number(firmSeats) || 10);
    try {
      const res = await fetch(apiUrl("/api/billing/payfast/subscription/update/"), {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg(data.detail || "Subscription updated.");
        await load();
        if (onAfterSubscribe) onAfterSubscribe();
      } else {
        setMsg(data.detail || "Could not update subscription.");
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  }

  const pf = usage?.payfast;
  const models = usage?.pricing_models;
  const tiers = models?.tiers ?? [];
  const hasSub = Boolean(pf?.has_active_subscription);
  const showCheckout = Boolean(pf?.enabled && !hasSub);
  const isModal = variant === "modal";
  const currentTier = usage?.plan_tier;
  const currentCardId = tierToCardId(currentTier);
  const currentRank = pf?.current_tier_rank ?? cardRank(currentCardId ?? "");
  const pb = pf?.pro_seat_bounds;
  const fb = pf?.firm_seat_bounds;

  return (
    <div className={isModal ? "" : "max-w-4xl"}>
      {error ? (
        <p className="text-red-600 text-sm rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-4">{error}</p>
      ) : null}
      {msg ? (
        <p className="text-sm rounded-xl bg-amber-50 border border-amber-100 text-amber-900 px-4 py-3 mb-4">{msg}</p>
      ) : null}

      {!usage ? (
        <p className="text-slate-600 text-sm">Loading plans…</p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
            <span className="text-slate-600 font-medium">Billing cycle:</span>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="billing-cycle"
                checked={billingCycle === "monthly"}
                onChange={() => setBillingCycle("monthly")}
              />
              Monthly
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="billing-cycle"
                checked={billingCycle === "yearly"}
                onChange={() => setBillingCycle("yearly")}
              />
              Yearly
              <span className="text-slate-500">(10–15% off vs monthly, tiered)</span>
            </label>
            {previewLoading ? (
              <span className="text-slate-500">Updating prices…</span>
            ) : null}
          </div>

          {models?.yearly_discount ? (
            <p className="mb-4 text-sm text-slate-600 max-w-3xl">{models.yearly_discount}</p>
          ) : null}

          {models?.hybrid ? (
            <div
              className={`mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 ${
                isModal ? "" : "max-w-3xl"
              }`}
            >
              <p className="font-medium text-[#0F172A]">Hybrid model</p>
              <p className="mt-1">{models.hybrid.summary}</p>
              {models.hybrid.usage_based?.length ? (
                <ul className="mt-2 list-disc list-inside text-slate-600">
                  {models.hybrid.usage_based.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className={`grid gap-4 ${isModal ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-2"}`}>
            {tiers.map((t) => {
              const id = t.id;
              const isPaidSelectable = id === "starter" || id === "professional" || id === "firm";
              const previewBlock = preview?.[PREVIEW_KEY[id]];
              const priceLabel =
                t.price_range_zar && t.price_range_zar.length === 2
                  ? `R${t.price_range_zar[0]}–R${t.price_range_zar[1]} / mo (guide)`
                  : t.contact_sales
                    ? "Custom pricing"
                    : "—";
              const cr = cardRank(id);
              const isDowngrade = hasSub && currentRank > 0 && cr < currentRank;
              const isUpgrade = hasSub && cr > currentRank;
              const isCurrent = hasSub && currentCardId === id;

              return (
                <div
                  key={id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col"
                >
                  <h3 className="text-lg font-semibold text-[#0F172A]">{t.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{t.audience}</p>
                  {previewBlock ? (
                    <TierPricePreview block={previewBlock} billingCycle={billingCycle} />
                  ) : previewLoading ? (
                    <p className="mt-3 text-sm text-slate-500">Calculating…</p>
                  ) : (
                    <p className="mt-3 text-sm text-slate-600">{priceLabel}</p>
                  )}
                  {t.highlights?.length ? (
                    <ul className="mt-3 space-y-1 text-sm text-slate-700 list-disc list-inside flex-1">
                      {t.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {id === "professional" && (showCheckout || (hasSub && !isDowngrade)) ? (
                    <div className="mt-3 text-sm">
                      <label className="block text-slate-600 mb-1">
                        Users / collaborators ({pb?.min ?? 3}–{pb?.max ?? 10})
                      </label>
                      <input
                        type="number"
                        min={pb?.min ?? 3}
                        max={pb?.max ?? 10}
                        value={proSeats}
                        onChange={(e) => setProSeats(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  ) : null}
                  {id === "firm" && (showCheckout || (hasSub && !isDowngrade)) ? (
                    <div className="mt-3 text-sm">
                      <label className="block text-slate-600 mb-1">
                        Users / collaborators ({fb?.min ?? 10}–{fb?.max ?? 50})
                      </label>
                      <input
                        type="number"
                        min={fb?.min ?? 10}
                        max={fb?.max ?? 50}
                        value={firmSeats}
                        onChange={(e) => setFirmSeats(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  ) : null}

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    {id === "enterprise" && t.contact_sales ? (
                      <>
                        {hasSub && currentCardId === "enterprise" ? (
                          <p className="text-sm font-medium text-[#15803d]">Your current plan</p>
                        ) : hasSub && (currentTier === "pro" || currentTier === "firm") && pf?.enabled ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => upgradeSubscription("enterprise")}
                            className="w-full rounded-xl bg-[#15803d] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#166534] disabled:opacity-50"
                          >
                            Upgrade to Enterprise
                          </button>
                        ) : (
                          <p className="text-sm text-slate-600">Contact sales for Enterprise terms and volume pricing.</p>
                        )}
                      </>
                    ) : null}

                    {!t.contact_sales && isCurrent ? (
                      <p className="text-sm font-medium text-[#15803d]">Your current plan</p>
                    ) : null}

                    {isPaidSelectable && hasSub && isDowngrade ? (
                      <p className="text-sm text-slate-600">Downgrade not allowed here — cancel in Billing first.</p>
                    ) : null}

                    {isPaidSelectable && showCheckout && !isDowngrade ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          startCheckout(id === "professional" ? "professional" : id)
                        }
                        className="w-full rounded-xl bg-[#16A34A] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#15803d] disabled:opacity-50"
                      >
                        Subscribe 
                      </button>
                    ) : null}

                    {isPaidSelectable && hasSub && isUpgrade && pf?.enabled ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => upgradeSubscription(id === "professional" ? "professional" : id)}
                        className="w-full rounded-xl bg-[#15803d] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#166534] disabled:opacity-50"
                      >
                        Upgrade plan
                      </button>
                    ) : null}

                    {isPaidSelectable && !pf?.enabled ? (
                      <p className="text-xs text-slate-500">PayFast is not configured on this server.</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <p className={`mt-6 text-sm text-slate-600 ${isModal ? "text-center" : ""}`}>
            <Link to="/billing" className="text-[#16A34A] font-medium hover:underline">
              Billing & usage
            </Link>
            {models?.whatsapp_hook ? (
              <>
                {" "}
                · <span className="text-slate-500">{models.whatsapp_hook}</span>
              </>
            ) : null}
          </p>
        </>
      )}
    </div>
  );
}
