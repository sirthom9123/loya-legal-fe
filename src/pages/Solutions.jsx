import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";

function SolutionCard({ title, description, to }) {
  return (
    <Link to={to} className="group rounded-3xl border border-brand-200/90 bg-white p-6 card-interactive">
      <p className="text-xs font-semibold text-[#15803D]">Solution</p>
      <h2 className="mt-3 text-xl font-bold text-[#0F172A] group-hover:text-[#16A34A]">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <p className="mt-5 text-sm font-semibold text-[#0F172A]">
        View details <span className="text-[#16A34A]">→</span>
      </p>
    </Link>
  );
}

export default function Solutions() {
  useEffect(() => {
    document.title = "Nomorae | Solutions";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="inline-flex items-center rounded-full border border-brand-200/90 bg-white px-4 py-2 text-sm font-semibold text-[#15803D]">
            Litigation · M&A · Tax · Banking
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#0F172A]">Built for real matters</h1>
          <p className="mt-3 text-slate-600">
            Pick a practice area to see how Loya streamlines common work: review evidence, draft agreements,
            research support, and collaborate with stakeholders.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
              Start a trial
            </Link>
            <Link to="/pricing" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
              See pricing
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SolutionCard
            to="/solutions/litigation"
            title="Litigation"
            description="Review evidence and draft pleadings with consistency."
          />
          <SolutionCard
            to="/solutions/ma"
            title="M&A"
            description="Detect clause risk and accelerate redline drafting."
          />
          <SolutionCard
            to="/solutions/tax"
            title="Tax"
            description="Research rulings and build citation-backed arguments."
          />
          <SolutionCard
            to="/solutions/banking"
            title="Banking"
            description="Stay ahead of documentation and improve turnaround time."
          />
        </div>

        <div className="mt-12 rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <h2 className="text-2xl font-bold text-[#0F172A]">Want a walkthrough tailored to your team?</h2>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Book a demo and we’ll map the product flow to your typical practice: from review and drafting to research
            and collaboration.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/features" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
              Browse features
            </Link>
            <Link to="/pricing" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
              Compare plans
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

