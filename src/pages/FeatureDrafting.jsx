import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";
import { IconPencilSquare } from "../components/Icons.jsx";

export default function FeatureDrafting() {
  useEffect(() => {
    document.title = "Nomorae | Draft smarter";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200/80 text-[#15803D]">
              <IconPencilSquare className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-[#15803D]">Draft smarter</p>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#0F172A]">Precedent-aware drafting + redlines</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Draft with structure and control. Loya combines templates, playbooks, precedent, and drafting workflows
            to produce consistent first drafts and targeted clause updates.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Templates</p>
              <p className="mt-2 text-sm text-slate-600">Keep formatting and required sections consistent.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Redlines</p>
              <p className="mt-2 text-sm text-slate-600">Generate tracked changes and clause-level updates.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Clause insertion</p>
              <p className="mt-2 text-sm text-slate-600">Insert or refine clauses based on your playbook rules.</p>
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
            <h2 className="text-xl font-bold text-[#0F172A]">From brief to draft, faster</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-700 list-decimal list-inside">
              <li>Provide inputs and select the right template + precedent.</li>
              <li>Run the drafting workflow (with clause risk checks).</li>
              <li>Review, edit, and export your draft outputs.</li>
            </ol>
          </div>
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">Control stays with your team</h2>
            <p className="mt-3 text-sm text-slate-600">
              Loya is designed so your team can approve changes before using outputs in client work.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Precedent-aware generation", "Redlines", "Clause insertion", "Templates + playbooks"].map((t) => (
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

