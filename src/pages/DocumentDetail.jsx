import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ClientLayout from "../components/ClientLayout.jsx";
import { formatApiError } from "../utils/apiError.js";
import { authHeaders } from "../utils/authHeaders.js";
import { postAiJson } from "../utils/aiApi.js";
import { apiUrl } from "../utils/apiUrl.js";

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState(false);

  useEffect(() => {
    async function load() {
      const access = localStorage.getItem("access");
      if (!access) {
        navigate("/login", { replace: true });
        return;
      }
      const res = await fetch(apiUrl(`/api/ai/documents/${id}/`), {
        headers: authHeaders({ json: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          navigate("/login", { replace: true });
          return;
        }
        setError(formatApiError(data));
        setLoading(false);
        return;
      }
      setDoc(data);
      setLoading(false);
    }
    load();
  }, [id, navigate]);

  async function onReprocess() {
    if (!doc?.id) return;
    setError("");
    setReprocessing(true);
    try {
      const out = await postAiJson(`/api/ai/documents/${doc.id}/reprocess/`, {});
      setDoc((d) =>
        d
          ? {
              ...d,
              processing_status: out.processing_status || "pending",
              error_message: "",
              metadata: {
                ...(d.metadata || {}),
                reprocess_attempts: out.reprocess_attempts,
              },
            }
          : d,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reprocess document.");
    } finally {
      setReprocessing(false);
    }
  }

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-24">
          <p className="text-brand-600">Loading…</p>
        </div>
      </ClientLayout>
    );
  }

  if (error && !doc) {
    return (
      <ClientLayout title="Document">
        <div className="card-surface p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/documents" className="text-brand-700 font-medium underline decoration-brand-400">
            Back to documents
          </Link>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-4xl space-y-4">
        <Link
          to="/documents"
          className="inline-flex text-sm font-medium text-brand-700 hover:text-brand-900 underline decoration-brand-400"
        >
          ← Documents
        </Link>

        <div className="card-surface p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-brand-900 mb-4">{doc.title}</h1>
          <div className="mb-4 flex flex-wrap gap-2">
            <Link
              to={`/search?docIds=${doc.id}`}
              className="btn-secondary border-[#16A34A]/40 text-[#16A34A] hover:bg-[#DCFCE7]"
            >
              Ask in semantic search
            </Link>
            <Link
              to={`/assistant?docIds=${doc.id}#rag`}
              className="btn-secondary border-[#16A34A]/40 text-[#16A34A] hover:bg-[#DCFCE7]"
            >
              Ask in RAG Q&A
            </Link>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-brand-800">
            <div>
              <dt className="text-brand-600">File</dt>
              <dd className="font-mono break-all mt-0.5">{doc.file_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-brand-600">Content type</dt>
              <dd className="mt-0.5">{doc.content_type}</dd>
            </div>
            <div>
              <dt className="text-brand-600">Status</dt>
              <dd className="font-medium mt-0.5">{doc.processing_status}</dd>
            </div>
            <div>
              <dt className="text-brand-600">Chunks</dt>
              <dd className="mt-0.5">{doc.chunk_count ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-brand-600">Created</dt>
              <dd className="mt-0.5">{doc.created_at ? new Date(doc.created_at).toLocaleString() : "—"}</dd>
            </div>
            <div>
              <dt className="text-brand-600">Processed</dt>
              <dd className="mt-0.5">{doc.processed_at ? new Date(doc.processed_at).toLocaleString() : "—"}</dd>
            </div>
          </dl>

          {doc.processing_status === "failed" ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={onReprocess}
                disabled={reprocessing}
                className="btn-secondary border-amber-300 text-amber-800 hover:bg-amber-50 disabled:opacity-50"
              >
                {reprocessing ? "Reprocessing…" : "Retry processing"}
              </button>
            </div>
          ) : null}

          {doc.metadata && Object.keys(doc.metadata).length > 0 ? (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-brand-800 mb-2">Metadata</h2>
              <pre className="text-xs bg-brand-50 border border-brand-100 rounded-xl p-3 overflow-x-auto text-brand-900">
                {JSON.stringify(doc.metadata, null, 2)}
              </pre>
            </div>
          ) : null}

          {doc.error_message ? (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-800 text-sm rounded-xl">
              {doc.error_message}
            </div>
          ) : null}

          <div className="mt-8">
            <h2 className="text-sm font-semibold text-brand-800 mb-2">Extracted text</h2>
            <div className="text-sm text-brand-900 whitespace-pre-wrap border border-brand-100 rounded-xl p-4 max-h-[60vh] overflow-y-auto bg-brand-50/80">
              {doc.raw_text || (
                <span className="text-brand-600">
                  {doc.processing_status === "pending" || doc.processing_status === "processing"
                    ? "Processing… refresh in a moment."
                    : "No text yet."}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
