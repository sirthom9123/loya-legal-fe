import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";

function Badge({ children }) {
  return <span className="rounded-full border border-brand-200/90 bg-brand-50 px-4 py-2 text-xs font-semibold text-[#14532d]">{children}</span>;
}

export default function SecurityPage() {
  useEffect(() => {
    document.title = "Loya Legal | Security";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <Badge>ISO 27001 · SOC 2-ready · GDPR-aware</Badge>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#0F172A]">Security & compliance built-in</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Legal work requires trust. Loya includes permission enforcement, audit logging, and baseline security
            protections designed to reduce risk.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                t: "Workspace permissions",
                d: "Users only see documents they’re allowed to access.",
              },
              {
                t: "Audit-ready actions",
                d: "Key document and AI operations can be tracked for accountability.",
              },
              {
                t: "Transit & cookie protections",
                d: "Environment-driven secure transport and security headers.",
              },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="font-semibold text-[#0F172A]">{x.t}</p>
                <p className="mt-2 text-sm text-slate-600">{x.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/pricing" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
              Compare plans
            </Link>
            <Link to="/login" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
              Start a trial
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-2xl font-bold text-[#0F172A]">What you can verify</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 list-disc list-inside">
              <li>Permission checks on document access.</li>
              <li>Security headers middleware for baseline protections.</li>
              <li>Audit logs for key operations (including optional AI events).</li>
              <li>Retention metadata support for document lifecycle policy.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-brand-200/90 bg-white p-6">
            <h2 className="text-2xl font-bold text-[#0F172A]">Need a walkthrough?</h2>
            <p className="mt-3 text-sm text-slate-600">
              Book a demo to see how permissions, audit logging, and workspace scoping work in practice.
            </p>
            <div className="mt-5">
              <Link to="/features" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
                Browse features
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

