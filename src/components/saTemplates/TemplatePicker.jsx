import React, { useMemo } from "react";

const categoryColors = {
  labour: "bg-blue-100 text-blue-700",
  corporate: "bg-violet-100 text-violet-700",
  conveyancing: "bg-amber-100 text-amber-700",
  litigation: "bg-rose-100 text-rose-700",
};

function TemplateCard({ t, onSelect }) {
  return (
    <button
      key={t.slug}
      type="button"
      onClick={() => onSelect(t.slug)}
      className="text-left card-surface-static p-5 rounded-xl border border-slate-200 hover:border-[#86EFAC] hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <h3 className="text-sm font-semibold text-[#0F172A]">{t.title}</h3>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
            categoryColors[t.category] || "bg-slate-100 text-slate-600"
          }`}
        >
          {t.category}
        </span>
        {t.is_pilot ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
            AI full draft
          </span>
        ) : null}
      </div>
      <p className="text-xs text-slate-600 mb-3">{t.description}</p>
      <div className="flex gap-3 text-xs text-slate-500">
        <span>{t.variable_count} fields</span>
        <span>{t.clause_count} clauses</span>
        {t.instrument_type ? <span>{t.instrument_type}</span> : null}
      </div>
      {Array.isArray(t.applicable_legislation) && t.applicable_legislation.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-2">
          {t.applicable_legislation.map((leg, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium"
            >
              {leg}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}

export default function TemplatePicker({ templates, search, onSearchChange, onSelect }) {
  const q = search.trim().toLowerCase();

  const { pilots, others } = useMemo(() => {
    const filtered = !q
      ? templates
      : templates.filter((t) => {
          const haystack = [
            t.title,
            t.description,
            t.category,
            t.instrument_type,
            ...(Array.isArray(t.applicable_legislation) ? t.applicable_legislation : []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        });

    const pilotList = [];
    const otherList = [];
    for (const t of filtered) {
      if (t.is_pilot) pilotList.push(t);
      else otherList.push(t);
    }
    return { pilots: pilotList, others: otherList };
  }, [templates, q]);

  const empty = pilots.length === 0 && others.length === 0;

  return (
    <>
      <div className="mb-4 max-w-md">
        <label className="sr-only" htmlFor="sa-templates-search">
          Search templates
        </label>
        <input
          id="sa-templates-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, category, or legislation…"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
        />
      </div>
      {empty ? (
        <p className="text-sm text-slate-500 max-w-md">
          {templates.length === 0 ? "No templates available." : "No templates match your search."}
        </p>
      ) : (
        <div className="space-y-8 max-w-5xl">
          {pilots.length > 0 ? (
            <section>
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-[#0F172A]">AI full draft (pilot)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comprehensive clause-by-clause generation with statute grounding, in-app editing, and DOCX export.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {pilots.map((t) => (
                  <TemplateCard key={t.slug} t={t} onSelect={onSelect} />
                ))}
              </div>
            </section>
          ) : null}

          {others.length > 0 ? (
            <section>
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-[#0F172A]">More templates</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Outline preview available now; full AI drafting rolls out next.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {others.map((t) => (
                  <TemplateCard key={t.slug} t={t} onSelect={onSelect} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </>
  );
}
