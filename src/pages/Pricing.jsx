import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";

function PriceCard({ name, price, highlight, points }) {
  return (
    <div
      className={
        "rounded-3xl border p-6 " +
        (highlight ? "border-brand-200/90 bg-brand-50" : "border-slate-200 bg-white")
      }
    >
      <p className={"text-sm font-semibold " + (highlight ? "text-[#15803D]" : "text-slate-700")}>{name}</p>
      <p className="mt-2 text-2xl font-bold text-[#0F172A]">{price}</p>
      <ul className="mt-5 space-y-2 text-sm text-slate-700 list-disc list-inside">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div className="mt-6">
        <Link
          to="/login"
          className={
            highlight
              ? "btn-primary w-full rounded-xl px-4 py-2 text-sm font-semibold"
              : "btn-secondary w-full rounded-xl px-4 py-2 text-sm font-semibold"
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
    document.title = "Loya Legal | Pricing";
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
            price="From $0 (trial)"
            points={["Core AI assistant", "Document review tools", "Drafting workflows", "Workspace access"]} 
          />
          <PriceCard
            name="Professional"
            price="Team pricing"
            highlight
            points={["Collaboration features", "Workflows & playbooks", "Expanded usage + seats", "Priority onboarding"]}
          />
          <PriceCard
            name="Firm"
            price="Firm pricing"
            points={["Workspace permissions", "Shared documents", "Advanced collaboration controls", "Audit-friendly practices"]}
          />
        </div>

        <div className="mt-12 rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-[#0F172A]">Need a tailored quote?</h2>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Book a demo and we’ll walk through your typical matters, team roles, and security requirements.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/features" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
              Explore features
            </Link>
            <Link to="/login" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
              Start a trial
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

