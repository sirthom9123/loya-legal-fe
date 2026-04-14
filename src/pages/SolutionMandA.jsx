import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";

export default function SolutionMandA() {
  useEffect(() => {
    document.title = "Nomorae | M&A solution";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <h1 className="text-4xl font-bold tracking-tight text-[#0F172A]">M&A documents, faster and cleaner</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Loya helps teams spot clause risk, keep redlines consistent, and draft with precedent-aware outputs
            so you can close faster.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { t: "Clause risk signals", d: "Focus review on the terms that matter most." },
              { t: "Precedent-aware drafts", d: "Use templates and precedent to reduce variation." },
              { t: "Collaboration-ready", d: "Shared workspace outputs for multi-party work." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="font-semibold text-[#0F172A]">{x.t}</p>
                <p className="mt-2 text-sm text-slate-600">{x.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
              Start a trial
            </Link>
            <Link to="/solutions" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
              Back to solutions
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">A simple repeatable loop</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-700 list-decimal list-inside">
              <li>Run structured review on relevant sections.</li>
              <li>Use drafting workflows to generate and revise clauses.</li>
              <li>Collaborate with stakeholders until the agreement is ready.</li>
            </ol>
          </div>
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">Why it reduces rework</h2>
            <p className="mt-3 text-sm text-slate-600">
              Precedent and playbooks help keep the firm’s standards consistent across matters and versions.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Consistent clauses", "Redline acceleration", "Team alignment", "Audit-ready traces"].map((t) => (
                <span key={t} className="rounded-full border border-brand-200/90 bg-brand-50 px-3 py-1 text-xs font-semibold text-[#14532d]">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

