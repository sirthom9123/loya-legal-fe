import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";
import { IconUsers } from "../components/Icons.jsx";

export default function FeatureCollaboration() {
  useEffect(() => {
    document.title = "Loya Legal | Collaboration";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200/80 text-[#15803D]">
              <IconUsers className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-[#15803D]">Collaborative workspace</p>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#0F172A]">Work together, stay aligned</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Shared documents, workspace Q&A, and collaboration built around permissions so your team (and clients)
            can move faster with confidence.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { t: "Shared docs", d: "Invite collaborators and keep work in one place." },
              { t: "Presence & Q&A", d: "Ask questions inside the workspace context." },
              { t: "Versioned outputs", d: "Track changes and keep versions consistent." },
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
              Browse solutions
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">Designed around access</h2>
            <p className="mt-3 text-sm text-slate-600">
              Collaboration is scoped to workspaces. Users only see documents they have access to, with enforcement
              in the backend.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Workspace permissions", "Document-level enforcement", "Audit-ready actions"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-brand-200/90 bg-brand-50 px-3 py-1 text-xs font-semibold text-[#14532d]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-xl font-bold text-[#0F172A]">From review to final draft</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-700 list-decimal list-inside">
              <li>Upload documents and run review presets.</li>
              <li>Draft clauses and generate tracked outputs.</li>
              <li>Collaborate, ask questions, and finalize.</li>
            </ol>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

