import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";

export default function SolutionTax() {
  useEffect(() => {
    document.title = "Loya Legal | Tax solution";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <h1 className="text-4xl font-bold tracking-tight text-[#0F172A]">Tax research that’s faster to trust</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Find relevant rulings quickly, organize precedent, and draft with citation-backed support so your team
            can move with confidence.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { t: "Semantic discovery", d: "Search across documents by meaning and intent." },
              { t: "Precedent support", d: "Surface relevant material for your argument structure." },
              { t: "Citations", d: "Keep traceability for legal writing and review." },
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
            <h2 className="text-xl font-bold text-[#0F172A]">What your team gets</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 list-disc list-inside">
              <li>Research tools that fit into your workspace.</li>
              <li>Faster discovery and better starting points for drafting.</li>
              <li>Inputs your assistant can reference to stay aligned.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">Next best step</h2>
            <p className="mt-3 text-sm text-slate-600">
              Browse the feature pages for search, research, drafting, and collaboration — then start a trial to
              see the experience end-to-end.
            </p>
            <div className="mt-5">
              <Link to="/features" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
                Explore features
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

