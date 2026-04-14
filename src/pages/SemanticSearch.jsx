import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ClientLayout from "../components/ClientLayout.jsx";
import { FormattedChunk } from "../components/FormattedAnswer.jsx";
import { pushAiActivity } from "../utils/aiActivity.js";
import { postAiJson } from "../utils/aiApi.js";
import { authHeaders } from "../utils/authHeaders.js";
import { apiUrl } from "../utils/apiUrl.js";

export default function SemanticSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
    const docIdsParam = searchParams.get("docIds");
    if (docIdsParam) {
      const ids = docIdsParam
        .split(",")
        .map((x) => Number(x))
        .filter((x) => Number.isInteger(x) && x > 0);
      setSelectedDocIds(Array.from(new Set(ids)));
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const res = await fetch(apiUrl("/api/ai/documents/?page=1&page_size=200"), {
          headers: authHeaders({ json: false }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setDocuments(Array.isArray(data.results) ? data.results : []);
        }
      } catch {
        // Ignore doc list failures; search can still run unscoped.
      }
    }
    loadDocuments();
  }, []);

  function toggleDocument(id) {
    setSelectedDocIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setSearchParams((sp) => {
        const p = new URLSearchParams(sp);
        if (next.length) p.set("docIds", next.join(","));
        else p.delete("docIds");
        return p;
      });
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError("");
    setLoading(true);
    setResults([]);
    try {
      const data = await postAiJson("/api/ai/search/", {
        query: q,
        document_ids: selectedDocIds.length ? selectedDocIds : undefined,
      });
      setResults(Array.isArray(data.results) ? data.results : []);
      pushAiActivity("query", `Search: ${q}`);
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set("q", q);
        if (selectedDocIds.length) p.set("docIds", selectedDocIds.join(","));
        else p.delete("docIds");
        return p;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ClientLayout title="Semantic search">
      <p className="text-sm text-slate-600 mb-6 max-w-2xl">
        Ask questions against your uploaded documents using semantic similarity. You can target all documents or select
        specific ones below.
      </p>

      <form onSubmit={onSubmit} className="card-surface-static p-5 sm:p-6 mb-8 max-w-3xl space-y-4">
        <div>
          <label htmlFor="sem-query" className="block text-sm font-medium text-slate-700 mb-1.5">
            Query
          </label>
          <textarea
            id="sem-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder="e.g. termination clause notice period"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30"
          />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-primary px-6 py-2.5 disabled:opacity-50"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
        <div>
          <p className="block text-sm font-medium text-slate-700 mb-1.5">
            Documents scope {selectedDocIds.length ? `(${selectedDocIds.length} selected)` : "(all uploaded documents)"}
          </p>
          {documents.length === 0 ? (
            <p className="text-xs text-slate-500">No documents found yet. Upload documents first.</p>
          ) : (
            <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
              {documents.map((doc) => (
                <label key={doc.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selectedDocIds.includes(doc.id)}
                    onChange={() => toggleDocument(doc.id)}
                    className="rounded border-slate-300 text-[#16A34A] focus:ring-[#22C55E]/40"
                  />
                  <span className="truncate">{doc.title || doc.file_name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2">{error}</p>
        ) : null}
      </form>

      {results.length > 0 ? (
        <div className="space-y-6 max-w-4xl">
          <h2 className="text-lg font-semibold text-[#0F172A]">Results ({results.length})</h2>
          <ul className="space-y-6">
            {results.map((r, i) => (
              <li
                key={`${r.chunk_id ?? i}-${r.document_id ?? ""}`}
                className="card-surface-static p-5 sm:p-6 border-l-4 border-l-[#16A34A]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-[#0F172A]">{r.document_title || "Document"}</span>
                    {r.document_id != null ? (
                      <Link
                        to={`/documents/${r.document_id}`}
                        className="text-[#16A34A] hover:underline text-sm font-medium"
                      >
                        Open document →
                      </Link>
                    ) : null}
                  </div>
                  {typeof r.score === "number" ? (
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                      score {r.score.toFixed(4)}
                    </span>
                  ) : null}
                </div>
                <div className="text-slate-700">
                  <FormattedChunk text={r.content} />
                </div>
                {/* {r.metadata && Object.keys(r.metadata).length > 0 ? (
                  <details className="mt-3 text-xs text-slate-500">
                    <summary className="cursor-pointer hover:text-slate-700">Metadata</summary>
                    <pre className="mt-1 p-2 bg-slate-50 rounded-lg overflow-x-auto">{JSON.stringify(r.metadata, null, 2)}</pre>
                  </details>
                ) : null} */}
              </li>
            ))}
          </ul>
        </div>
      ) : !loading && !error ? (
        <p className="text-sm text-slate-500">Run a search to see matching chunks.</p>
      ) : null}
    </ClientLayout>
  );
}
