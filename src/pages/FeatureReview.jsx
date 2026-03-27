import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";
import { IconTable } from "../components/Icons.jsx";

export default function FeatureReview() {
  useEffect(() => {
    document.title = "Loya Legal | Review faster";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200/80 text-[#15803D]">
              <IconTable className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-[#15803D]">Review faster</p>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#0F172A]">Structured tabular review</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Turn complex documents into organized data. Loya runs structured extraction across batches, supports
            presets, and exports results for downstream use.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Presets + columns</p>
              <p className="mt-2 text-sm text-slate-600">Choose fields your team needs and keep them consistent.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Batch processing</p>
              <p className="mt-2 text-sm text-slate-600">Review large sets of docs with repeatable extraction.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Export</p>
              <p className="mt-2 text-sm text-slate-600">Move outputs to CSV-friendly workflows.</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
              Start a trial
            </Link>
            <Link to="/features" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
              Back to features
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">How it fits your workflow</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-700 list-decimal list-inside">
              <li>Pick a review preset (or build your own columns).</li>
              <li>Select documents and run structured extraction.</li>
              <li>Review the results table and export for action.</li>
            </ol>
          </div>
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">Built for control</h2>
            <p className="mt-3 text-sm text-slate-600">
              Loya’s scope is workspace-aware, and document access is enforced so each team member sees what they’re
              allowed to review.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Workspace permissions", "Audit-ready actions", "Consistent presets", "Export outputs"].map((t) => (
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

