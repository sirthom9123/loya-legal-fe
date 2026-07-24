import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";

function PriceCard({ name, price, subtext, highlight, points }) {
  return (
    <div
      className={
        "rounded-3xl border p-6 flex flex-col " +
        (highlight ? "border-brand-200/90 bg-brand-50" : "border-slate-200 bg-white")
      }
    >
      <p className={"text-sm font-semibold " + (highlight ? "text-[#15803D]" : "text-slate-700")}>{name}</p>
      <p className="mt-2 text-2xl font-bold text-[#0F172A]">{price}</p>
      {subtext && <p className="mt-1 text-sm font-medium text-slate-500">{subtext}</p>}
      <ul className="mt-5 space-y-2 text-sm text-slate-700 list-disc list-inside flex-1">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div className="mt-6">
        <Link
          to="/login"
          className={
            highlight
              ? "btn-primary block text-center w-full rounded-xl px-4 py-2 text-sm font-semibold"
              : "btn-secondary block text-center w-full rounded-xl px-4 py-2 text-sm font-semibold"
          }
        >
          Start a trial
        </Link>
      </div>
    </div>
  );
}

export default function PricingPage() {
  useEffect(() => {
    document.title = "Nomorae | Pricing";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="inline-flex items-center rounded-full border border-brand-200/90 bg-white px-4 py-2 text-sm font-semibold text-[#15803D]">
            Plans for solo, teams, and firms
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#0F172A]">Pricing that scales</h1>
          <p className="mt-3 text-slate-600">
            This is a public pricing preview for browsing leads. After you sign in, you can see live usage and
            subscription options.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <PriceCard
            name="Starter"
            price="R549 / month"
            subtext="1 user • Solo practitioners"
            points={["Document assistant", "Document review tools", "Case workflow & drafting", "Workspace access"]} 
          />
          <PriceCard
            name="Professional"
            price="From R1,000 / month"
            subtext="Effectively ~R333 / user (3–10 users)"
            highlight
            points={["Collaboration features", "Templates, workflows & playbooks", "Expanded usage + seats", "Priority onboarding"]}
          />
          <PriceCard
            name="Firm"
            price="From R5,000 / month"
            subtext="Effectively ~R500 / user (10–50 users)"
            points={["Workspace permissions", "Shared documents", "Advanced collaboration controls", "Audit-friendly practices"]}
          />
        </div>

        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-10">
          <h2 className="text-xl font-bold text-[#0F172A]">Hybrid Pricing Model</h2>
          <p className="mt-2 text-slate-600 max-w-3xl">
            Our plans combine a predictable base subscription with usage-based credits. This keeps cost control clear
            while your firm scales. You only pay extra for heavy compute tasks like bulk document reviews or extensive
            workflow runs.
          </p>
        </div>

        <div className="mt-12 rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-[#0F172A]">Need a tailored quote?</h2>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Prefer a guided conversation first? Use the floating <span className="font-medium">Book a demo</span>{" "}
            button — or create an account and we’ll align on matters, roles, and security when you’re ready.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/features" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
              Explore features
            </Link>
            <Link to="/register" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
              Get started
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

