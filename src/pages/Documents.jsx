import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ClientLayout from "../components/ClientLayout.jsx";
import { TableSkeleton } from "../components/Skeleton.jsx";
import { formatApiError } from "../utils/apiError.js";
import { authHeaders } from "../utils/authHeaders.js";
import { postAiJson } from "../utils/aiApi.js";

export default function Documents() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [retryingId, setRetryingId] = useState(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [count, setCount] = useState(0);
  const [localQ, setLocalQ] = useState(qParam);

  useEffect(() => {
    setLocalQ(qParam);
  }, [qParam]);

  const load = useCallback(async () => {
    const access = localStorage.getItem("access");
    if (!access) {
      navigate("/login", { replace: true });
      return;
    }
    setError("");
    const res = await fetch(`/api/ai/documents/?page=${page}&page_size=20`, {
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
    setItems(data.results || []);
    setNumPages(data.num_pages || 1);
    setCount(data.count ?? 0);
    setLoading(false);
  }, [navigate, page]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = qParam.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (d) =>
        (d.title || "").toLowerCase().includes(needle) ||
        (d.file_name || "").toLowerCase().includes(needle) ||
        (d.content_type || "").toLowerCase().includes(needle)
    );
  }, [items, qParam]);

  function applySearch(e) {
    e.preventDefault();
    const v = localQ.trim();
    if (v) setSearchParams({ q: v });
    else setSearchParams({});
  }

  async function onUpload(e) {
    e.preventDefault();
    const form = e.target;
    const fileInput = form.elements.file;
    const file = fileInput?.files?.[0];
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const title = form.elements.title?.value?.trim();
    if (title) fd.append("title", title);

    const access = localStorage.getItem("access");
    const res = await fetch("/api/ai/documents/upload/", {
      method: "POST",
      headers: access ? { Authorization: `Bearer ${access}` } : {},
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      setError(formatApiError(data));
      return;
    }
    fileInput.value = "";
    form.elements.title.value = "";
    setLoading(true);
    await load();
  }

  async function onReprocess(documentId) {
    setError("");
    setRetryingId(documentId);
    try {
      await postAiJson(`/api/ai/documents/${documentId}/reprocess/`, {});
      setLoading(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reprocess document.");
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <ClientLayout title="Documents">
      <div className="max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <form onSubmit={applySearch} className="flex flex-1 gap-2 max-w-lg">
            <input
              className="input-field flex-1"
              placeholder="Filter list…"
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
            />
            <button type="submit" className="btn-secondary shrink-0">
              Filter
            </button>
          </form>
          <Link to="#upload" className="btn-primary text-center sm:inline-flex sm:items-center sm:justify-center">
            Upload document
          </Link>
        </div>

        <div id="upload" className="card-surface-static p-5 sm:p-6 scroll-mt-24">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-2">Upload</h2>
          <p className="text-sm text-slate-600 mb-4">
            PDF, Word, or text files. Processing runs in the background (or immediately when Celery eager mode is on).
          </p>
          <form onSubmit={onUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Title (optional)</label>
              <input name="title" className="input-field" placeholder="e.g. Lease agreement" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">File</label>
              <input
                name="file"
                type="file"
                required
                className="block w-full text-sm text-slate-800 file:mr-4 file:rounded-lg file:border-0 file:bg-[#DCFCE7] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#166534]"
              />
            </div>
            <button type="submit" disabled={uploading} className="btn-primary disabled:opacity-60">
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </form>
        </div>

        {error ? (
          <p className="text-red-600 text-sm whitespace-pre-wrap rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            {error}
          </p>
        ) : null}

        <div className="card-surface-static p-0 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between gap-2 items-center bg-white/80">
            <h2 className="text-lg font-semibold text-[#0F172A]">Recent documents ({count})</h2>
            {qParam ? (
              <button
                type="button"
                className="text-sm text-[#16A34A] font-medium hover:underline"
                onClick={() => {
                  setSearchParams({});
                  setLocalQ("");
                }}
              >
                Clear filter
              </button>
            ) : null}
          </div>

          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={6} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No documents match. Upload a file or adjust the filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[640px]">
                <thead className="bg-[#DCFCE7]/50 text-slate-700 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-3">Name</th>
                    <th className="px-4 py-3 whitespace-nowrap">Type</th>
                    <th className="px-4 py-3 whitespace-nowrap">Date</th>
                    <th className="px-4 py-3 whitespace-nowrap">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-[#f0fdf4]/60 transition-colors">
                      <td className="px-4 sm:px-6 py-3 font-medium text-[#0F172A]">
                        <Link to={`/documents/${d.id}`} className="hover:text-[#16A34A] hover:underline">
                          {d.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{d.content_type || "—"}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                            d.processing_status === "failed"
                              ? "bg-red-100 text-red-700"
                              : d.processing_status === "processing" || d.processing_status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-[#DCFCE7] text-[#166534]",
                          ].join(" ")}
                        >
                          {d.processing_status || "—"}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {d.processing_status === "failed" ? (
                            <button
                              type="button"
                              onClick={() => onReprocess(d.id)}
                              className="text-amber-700 font-medium hover:underline disabled:opacity-50"
                              disabled={retryingId === d.id}
                            >
                              {retryingId === d.id ? "Retrying…" : "Retry"}
                            </button>
                          ) : null}
                          <Link
                            to={`/documents/${d.id}`}
                            className="text-[#16A34A] font-medium hover:underline"
                          >
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {numPages > 1 ? (
            <div className="flex flex-wrap gap-2 px-5 sm:px-6 py-4 border-t border-slate-100 items-center bg-slate-50/80">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary text-sm py-2 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {page} / {numPages}
              </span>
              <button
                type="button"
                disabled={page >= numPages}
                onClick={() => setPage((p) => Math.min(numPages, p + 1))}
                className="btn-secondary text-sm py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </ClientLayout>
  );
}
