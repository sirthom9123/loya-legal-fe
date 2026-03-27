import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";

export default function SolutionBanking() {
  useEffect(() => {
    document.title = "Loya Legal | Banking solution";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <h1 className="text-4xl font-bold tracking-tight text-[#0F172A]">Banking docs, less turnaround</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Process regulated documentation and internal workflow faster. Loya helps teams review, draft, and
            collaborate with consistent outputs.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { t: "Faster review", d: "Batch extraction and consistent fields." },
              { t: "Smarter drafting", d: "Templates + precedent-aware outputs." },
              { t: "Collaboration", d: "Shared workspace with permissions." },
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
            <h2 className="text-xl font-bold text-[#0F172A]">Where you save time</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 list-disc list-inside">
              <li>Reducing repetitive review and reformatting</li>
              <li>Accelerating clause updates with consistent templates</li>
              <li>Keeping teams aligned with structured collaboration</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">Want the demo flow?</h2>
            <p className="mt-3 text-sm text-slate-600">
              Book a demo to walk through review, drafting workflow, and collaboration settings for your team.
            </p>
            <div className="mt-5">
              <Link to="/pricing" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

