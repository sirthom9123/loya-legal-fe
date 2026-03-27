import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";
import { IconWorkflow } from "../components/Icons.jsx";

export default function FeatureWorkflows() {
  useEffect(() => {
    document.title = "Loya Legal | Workflows";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200/80 text-[#15803D]">
              <IconWorkflow className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-[#15803D]">Workflows & playbooks</p>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#0F172A]">Turn legal work into repeatable runs</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Loya helps you plan multi-step tasks and execute them with structured inputs, reliable outputs, and
            run history for accountability.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Planner</p>
              <p className="mt-2 text-sm text-slate-600">Break work down into consistent steps.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Execution queue</p>
              <p className="mt-2 text-sm text-slate-600">Run tasks and aggregate results.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">History</p>
              <p className="mt-2 text-sm text-slate-600">Review what ran, when, and why.</p>
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
            <h2 className="text-xl font-bold text-[#0F172A]">Playbooks for consistency</h2>
            <p className="mt-3 text-sm text-slate-600">
              Capture your firm’s approach as rules. Loya uses playbooks to keep drafting and analysis aligned with
              your standards.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Rule-based analysis", "History & results", "Repeatable workflows", "Team alignment"].map((t) => (
                <span key={t} className="rounded-full border border-brand-200/90 bg-brand-50 px-3 py-1 text-xs font-semibold text-[#14532d]">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">From inputs to outcomes</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-700 list-decimal list-inside">
              <li>Provide inputs (documents, context, constraints).</li>
              <li>Run the workflow steps and collect outputs.</li>
              <li>Use results in drafting and collaboration.</li>
            </ol>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

