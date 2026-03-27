import React, { useEffect, useId, useMemo, useState } from "react";

export default function BookDemoModal({ open, onClose }) {
  const titleId = useId();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
    useCase: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const canSubmit = useMemo(() => {
    const emailOk = form.email.trim().includes("@") && form.email.trim().includes(".");
    return form.fullName.trim() && emailOk && form.company.trim();
  }, [form]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Please fill in your name, work email, and company.");
      return;
    }

    // UI-only MVP: we don't have a backend "book demo" endpoint yet.
    // Capture locally for convenience and show a success state.
    try {
      window.localStorage.setItem(
        "demo_lead_last",
        JSON.stringify({
          ...form,
          submittedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore localStorage errors (e.g. privacy mode).
    }
    setSubmitted(true);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        role="presentation"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-2xl max-h-[min(90vh,720px)] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl sm:text-2xl font-semibold text-[#0F172A]">
              Book a demo
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Tell us a bit about your workflow. We’ll tailor the walkthrough to how your team reviews, drafts, and
              collaborates.
            </p>
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            aria-label="Close dialog"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {submitted ? (
          <div className="mt-6">
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
              <p className="font-semibold text-[#0F172A]">Thanks — request received.</p>
              <p className="mt-2 text-sm text-slate-600">
                This is a UI-only lead capture for now (no backend endpoint wired). In the meantime, you can explore
                the product pages or sign in to start a trial.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="/pricing"
                  className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold text-center"
                >
                  View pricing
                </a>
                <a href="/login" className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-center">
                  Sign in
                </a>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            {error ? (
              <p className="text-red-600 text-sm rounded-xl bg-red-50 border border-red-100 px-4 py-3">{error}</p>
            ) : null}

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-medium text-brand-800 mb-1.5">Full name</span>
                <input
                  className="input-field"
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  placeholder="e.g. Jane Doe"
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-brand-800 mb-1.5">Work email</span>
                <input
                  className="input-field"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="e.g. jane@firm.com"
                  type="email"
                  autoComplete="email"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-medium text-brand-800 mb-1.5">Company / firm</span>
                <input
                  className="input-field"
                  name="company"
                  value={form.company}
                  onChange={onChange}
                  placeholder="e.g. BAHR"
                  autoComplete="organization"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-brand-800 mb-1.5">Primary use case</span>
                <input
                  className="input-field"
                  name="useCase"
                  value={form.useCase}
                  onChange={onChange}
                  placeholder="e.g. drafting + review for M&A"
                />
              </label>
            </div>

            <button type="submit" className="btn-primary w-full rounded-xl px-4 py-3 text-sm font-semibold" disabled={!canSubmit}>
              Request demo
            </button>

            <p className="text-xs text-slate-500">
              By submitting, you agree to be contacted about Loya Legal. This form is captured locally until a backend
              lead endpoint is added.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

