import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";
import { IconSparkles } from "../components/Icons.jsx";

export default function FeatureAssistant() {
  useEffect(() => {
    document.title = "Nomorae | AI assistant";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200/80 text-[#15803D]">
              <IconSparkles className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-[#15803D]">AI assistant</p>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#0F172A]">Ask. Draft. Risk-check. Iterate.</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Loya blends RAG-based assistance with clause risk signals and raw chat. You get structured outputs you
            can review and act on.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">RAG assistant</p>
              <p className="mt-2 text-sm text-slate-600">Ground answers in your workspace documents.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Clause risk</p>
              <p className="mt-2 text-sm text-slate-600">Identify concerns and focus review time.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Raw chat</p>
              <p className="mt-2 text-sm text-slate-600">Quick iterations for drafting and exploration.</p>
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
            <h2 className="text-xl font-bold text-[#0F172A]">Built for legal scope</h2>
            <p className="mt-3 text-sm text-slate-600">
              Workspace permissions and document access control keep assistance aligned with what your team can
              review.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Workspace-aware answers", "Structured outputs", "Review-first UX", "Export-friendly artifacts"].map((t) => (
                <span key={t} className="rounded-full border border-brand-200/90 bg-brand-50 px-3 py-1 text-xs font-semibold text-[#14532d]">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">Try it from your trial</h2>
            <p className="mt-3 text-sm text-slate-600">
              Once you sign in, you can explore the assistant, run research, and generate drafting workflows.
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

