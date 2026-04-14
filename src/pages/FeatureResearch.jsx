import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";
import { IconSearch } from "../components/Icons.jsx";

export default function FeatureResearch() {
  useEffect(() => {
    document.title = "Nomorae | Research deeper";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200/80 text-[#15803D]">
              <IconSearch className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-[#15803D]">Research deeper</p>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#0F172A]">Search and research with citations</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Loya connects semantic search to legal research so you can find relevant precedent quickly and cite
            sources with confidence.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Workspace-aware search</p>
              <p className="mt-2 text-sm text-slate-600">Search content you can access (owned + shared).</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Precedent finder</p>
              <p className="mt-2 text-sm text-slate-600">Surface relevant documents and supporting material.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-semibold text-[#0F172A]">Citation support</p>
              <p className="mt-2 text-sm text-slate-600">Maintain traceability for your legal writing.</p>
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
            <h2 className="text-xl font-bold text-[#0F172A]">Two ways to research</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-[#0F172A]">Semantic search</p>
                <p className="mt-2 text-sm text-slate-600">Find relevant documents by meaning, not keywords.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-[#0F172A]">Legal research workflows</p>
                <p className="mt-2 text-sm text-slate-600">Gather support with structured, citation-backed outputs.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">Designed for legal judgment</h2>
            <p className="mt-3 text-sm text-slate-600">
              Loya is not a replacement for review. It speeds up discovery and drafting so your team can spend more time
              on legal strategy and less time searching.
            </p>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

