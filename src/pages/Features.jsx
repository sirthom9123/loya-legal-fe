import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";
import { IconSparkles, IconTable, IconPencilSquare, IconSearch, IconUsers, IconWorkflow } from "../components/Icons.jsx";

function FeatureTile({ title, description, to, icon: Icon }) {
  return (
    <Link to={to} className="group rounded-3xl border border-brand-200/90 bg-white p-6 card-interactive">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200/80 text-[#15803D]">
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-xs font-semibold text-[#15803D]">Capability</p>
      </div>
      <h2 className="mt-3 text-xl font-bold text-[#0F172A] group-hover:text-[#16A34A]">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <div className="mt-5 text-sm font-semibold text-[#0F172A]">
        Learn more <span className="text-[#16A34A]">→</span>
      </div>
    </Link>
  );
}

export default function Features() {
  useEffect(() => {
    document.title = "Nomorae | Features";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200/90 bg-white px-4 py-2 text-sm font-semibold text-[#15803D]">
            Review · Draft · Research · Collaborate
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#0F172A]">Everything your team needs</h1>
          <p className="mt-3 text-slate-600">
            Browse the core capabilities. Each page explains what Loya does and how it fits your day-to-day
            legal workflow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/pricing" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
              See pricing
            </Link>
            <Link to="/login" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
              Start a trial
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureTile
            to="/features/review"
            icon={IconTable}
            title="Review faster"
            description="Tabular review, structured extraction, presets, and exports."
          />
          <FeatureTile
            to="/features/drafting"
            icon={IconPencilSquare}
            title="Draft smarter"
            description="Precedent-aware drafting with redlines, clause insertion, and playbooks."
          />
          <FeatureTile
            to="/features/research"
            icon={IconSearch}
            title="Research deeper"
            description="Semantic search + legal research with citations."
          />
          <FeatureTile
            to="/features/collaboration"
            icon={IconUsers}
            title="Collaborate"
            description="Workspace permissions, shared documents, invites, and Q&A."
          />
          <FeatureTile
            to="/features/workflows"
            icon={IconWorkflow}
            title="Run workflows"
            description="Planner + execution queue with run history and outputs."
          />
          <FeatureTile
            to="/features/assistant"
            icon={IconSparkles}
            title="AI assistant"
            description="RAG assistant, clause risk signals, and raw chat."
          />
        </div>

        <div className="mt-12 rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#0F172A]">Prefer to start with a walkthrough?</h2>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Book a demo and we’ll tailor the walkthrough to the legal work your team does most often.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/pricing" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
              View plans
            </a>
            <Link to="/login" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
              Start trial
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

