import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";

export default function SolutionLitigation() {
  useEffect(() => {
    document.title = "Loya Legal | Litigation solution";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <h1 className="text-4xl font-bold tracking-tight text-[#0F172A]">Litigation that moves faster</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Review evidence and draft pleadings with consistency. Reduce manual coordination and keep the team on
            the same page through structured outputs and collaboration.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { t: "Evidence review", d: "Batch extraction for key facts and claims." },
              { t: "Draft pleadings", d: "Template-driven drafting with redlines." },
              { t: "Work together", d: "Workspace permissions and Q&A for stakeholders." },
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
            <h2 className="text-xl font-bold text-[#0F172A]">Suggested workflow</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-700 list-decimal list-inside">
              <li>Upload evidence and run a review preset.</li>
              <li>Extract structured fields and export to your drafting steps.</li>
              <li>Generate draft pleadings and refine with redlines.</li>
            </ol>
          </div>
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">Where it shines</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 list-disc list-inside">
              <li>Multi-document evidence review</li>
              <li>Consistent drafting across matters</li>
              <li>Team collaboration with access controls</li>
            </ul>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

