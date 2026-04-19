import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";
import MarketingPreviewVideo from "../components/MarketingPreviewVideo.jsx";
import { publicAsset } from "../utils/publicAsset.js";

function FeatureCard({ title, description, href }) {
  return (
    <Link to={href} className="group rounded-2xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 card-interactive">
      <p className="text-sm font-semibold text-[#16A34A]">Feature</p>
      <h3 className="mt-2 text-lg font-semibold text-[#0F172A] group-hover:text-[#16A34A]">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      <p className="mt-4 text-sm font-semibold text-[#0F172A] group-hover:text-[#16A34A]">
        Explore →
      </p>
    </Link>
  );
}

function StatPill({ value, label }) {
  return (
    <div className="rounded-2xl border border-brand-200/90 bg-white px-5 py-4 shadow-sm">
      <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (access) navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <MarketingLayout enableDemoButton>
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100 via-white to-white"
        />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-200/90 bg-white px-4 py-2 text-sm font-semibold text-[#15803D] shadow-sm">
                Legal work, without limits
              </p>
              <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-[#0F172A]">
                The AI workspace built for legal teams.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-xl">
                Speed up review, drafting, and research. Move from admin to expertise with workflows, citations, and
                collaboration designed for real matters.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/features" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
                  Explore features
                </Link>
                <Link to="/login" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
                  Start a trial
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-xl border border-brand-200/90 bg-white px-3 py-2">ISO 27001-ready practices</span>
                <span className="rounded-xl border border-brand-200/90 bg-white px-3 py-2">POPIA-aware workflow</span>
                <span className="rounded-xl border border-brand-200/90 bg-white px-3 py-2">Workspace permissions</span>
              </div>
            </div>

            <div className="lg:pl-6 space-y-5">
              <MarketingPreviewVideo
                src={publicAsset("case-workflow-preview.mp4")}
                title="Case workflow preview"
                caption="See how matters and structured workflows come together—then explore every capability below."
              />
              <div className="rounded-3xl border border-brand-200/90 bg-white p-5 sm:p-6 shadow-soft">
                <p className="text-sm font-semibold text-[#0F172A]">Built for outcomes</p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <StatPill value="Faster" label="Review & drafting" />
                  <StatPill value="Smarter" label="Workflows & playbooks" />
                  <StatPill value="Safer" label="Permissions & audit" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Built for legal workflows — not generic chat.</p>
            </div>
          </div>

          <div className="mt-16">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">All features, in one place</h2>
                <p className="mt-2 text-slate-600 max-w-2xl">
                  Browse capability pages below. Each one maps to the client-facing tools your team can use after
                  sign-up.
                </p>
              </div>
              <Link to="/features" className="text-sm font-semibold text-[#16A34A] hover:underline">
                See everything →
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                href="/features/review"
                title="Review faster"
                description="Tabular document review with structured extraction and presets."
              />
              <FeatureCard
                href="/features/drafting"
                title="Draft smarter"
                description="Clause-focused drafting with precedent, templates, and redlines."
              />
              <FeatureCard
                href="/features/research"
                title="Research deeper"
                description="Semantic search and legal research with citations."
              />
              <FeatureCard
                href="/features/collaboration"
                title="Collaborate"
                description="Shared documents, permissions, and workspace Q&A."
              />
              <FeatureCard
                href="/features/workflows"
                title="Run workflows"
                description="Planner + execution queue and run history."
              />
              <FeatureCard
                href="/features/assistant"
                title="AI assistant"
                description="RAG support, clause risk signals, and raw chat."
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/80 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Built for the way lawyers work</h2>
                <p className="mt-3 text-slate-600">
                  Nomorae helps teams shift from repetitive admin to expert judgment, with tools designed around the
                  review → draft → research → collaborate loop.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/solutions" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
                    Browse solutions
                  </Link>
                  <Link to="/security" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
                    Security & compliance
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-7 shadow-soft">
                <p className="text-sm font-semibold text-[#16A34A]">Common workflows</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-[#0F172A] text-sm">Litigation</p>
                    <p className="mt-1 text-sm text-slate-600">Review evidence, draft pleadings, stay consistent.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-[#0F172A] text-sm">M&A</p>
                    <p className="mt-1 text-sm text-slate-600">Clause risk signals + fast redline drafts.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-[#0F172A] text-sm">Tax</p>
                    <p className="mt-1 text-sm text-slate-600">Research quickly with citation-backed references.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-[#0F172A] text-sm">Banking</p>
                    <p className="mt-1 text-sm text-slate-600">Process docs faster and reduce turnaround time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/80 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Pricing that scales with your matters</h2>
            <p className="mt-3 text-slate-600 max-w-2xl">
              Start with a trial, then choose a plan built for solo practice or full firm collaboration.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "From R0 (trial)",
                  points: ["Core AI assistant", "Document review tools", "Drafting workflows"],
                },
                {
                  name: "Professional",
                  price: "Team pricing",
                  points: ["Collaboration features", "Workflows & playbooks", "Expanded usage + seats"],
                  highlight: true,
                },
                {
                  name: "Firm",
                  price: "Firm pricing",
                  points: ["Workspace permissions", "Shared documents", "Priority onboarding"],
                },
              ].map((c) => (
                <div
                  key={c.name}
                  className={
                    "rounded-3xl border p-6 " +
                    (c.highlight
                      ? "border-brand-200/90 bg-brand-50"
                      : "border-slate-200 bg-white")
                  }
                >
                  <p className={"text-sm font-semibold " + (c.highlight ? "text-[#15803D]" : "text-slate-700")}>{c.name}</p>
                  <p className="mt-2 text-2xl font-bold text-[#0F172A]">{c.price}</p>
                  <ul className="mt-5 space-y-2 text-sm text-slate-700 list-disc list-inside">
                    {c.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link
                      to="/login"
                      className={c.highlight ? "btn-primary w-full rounded-xl px-4 py-2 text-sm font-semibold" : "btn-secondary w-full rounded-xl px-4 py-2 text-sm font-semibold"}
                    >
                      Start trial
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link to="/pricing" className="text-sm font-semibold text-[#16A34A] hover:underline">
                View full pricing details →
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/80 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Frequently asked questions</h2>
            <p className="mt-3 text-slate-600 max-w-2xl">Quick answers for browsing leads.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                {
                  q: "Is this a generic chatbot?",
                  a: "No. Nomorae is built around legal workflows: review and drafting tools, research with citations, and workspace collaboration.",
                },
                {
                  q: "How does permissions work?",
                  a: "Documents live inside workspaces. Users only see content they have access to, with workspace-scoped enforcement in the backend.",
                },
                {
                  q: "Can we collaborate with colleagues and clients?",
                  a: "Yes. Shared documents, invites, and workspace Q&A are designed for multi-party legal work.",
                },
                {
                  q: "What about security and compliance?",
                  a: "The app includes baseline security headers, audit logging, and environment-driven transport protections. See the Security page for details.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <summary className="cursor-pointer font-semibold text-[#0F172A]">{item.q}</summary>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/80 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
            <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
              <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Ready to get started?</h2>
                  <p className="mt-3 text-slate-600">
                    Create your account and see how your team can review faster, draft with precedent, and collaborate
                    with confidence.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/features" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
                    Explore first
                  </Link>
                  <Link to="/register" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
                    Get started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

