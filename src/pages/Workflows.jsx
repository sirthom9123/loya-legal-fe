import React, { useEffect, useState } from "react";
import ClientLayout from "../components/ClientLayout.jsx";
import { getAiJson, postAiJson } from "../utils/aiApi.js";

export default function Workflows() {
  const [prompt, setPrompt] = useState("");
  const [planning, setPlanning] = useState(false);
  const [running, setRunning] = useState(false);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [plan, setPlan] = useState(null);
  const [runs, setRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [error, setError] = useState("");

  async function loadRuns() {
    setLoadingRuns(true);
    try {
      const data = await getAiJson("/api/ai/workflows/");
      setRuns(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflows");
    } finally {
      setLoadingRuns(false);
    }
  }

  useEffect(() => {
    loadRuns();
  }, []);

  async function onPlan(e) {
    e.preventDefault();
    const p = prompt.trim();
    if (!p) return;
    setPlanning(true);
    setError("");
    try {
      const data = await postAiJson("/api/ai/workflows/plan/", { prompt: p });
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to plan workflow");
    } finally {
      setPlanning(false);
    }
  }

  async function onRun(e) {
    e.preventDefault();
    const p = prompt.trim();
    if (!p) return;
    setRunning(true);
    setError("");
    setSelectedRun(null);
    try {
      const data = await postAiJson("/api/ai/workflows/", { prompt: p });
      const wid = data.workflow_id;
      if (wid) {
        setSelectedRunId(wid);
        if (data.plan && data.result) {
          setSelectedRun({
            id: wid,
            status: data.status,
            intent: data.intent,
            plan: data.plan || [],
            result: data.result || {},
            tasks: [],
          });
        } else {
          await openRun(wid);
        }
      }
      await loadRuns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Workflow run failed");
    } finally {
      setRunning(false);
    }
  }

  async function openRun(runId) {
    setSelectedRunId(runId);
    setError("");
    try {
      const data = await getAiJson(`/api/ai/workflows/${runId}/`);
      setSelectedRun(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflow detail");
    }
  }

  async function rerunSelected() {
    if (!selectedRunId) return;
    setError("");
    try {
      await postAiJson(`/api/ai/workflows/${selectedRunId}/`, {});
      await loadRuns();
      await openRun(selectedRunId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rerun workflow");
    }
  }

  function statusClass(status) {
    if (status === "completed") return "bg-emerald-100 text-emerald-700";
    if (status === "processing") return "bg-blue-100 text-blue-700";
    if (status === "failed") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  }

  return (
    <ClientLayout title="Workflows">
      <p className="text-sm text-slate-600 mb-6 max-w-4xl">
        No-code legal workflow engine. Enter a task in natural language; the planner will interpret intent, split it
        into steps, assign sub-agents (research/review/drafting/compliance), execute tasks, and aggregate results.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface-static p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">1</span>
            Input
          </div>
          <h2 className="text-base font-semibold text-[#0F172A]">Create workflow</h2>
          <form className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Workflow prompt
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                placeholder='e.g. "Review these contracts and highlight risks"'
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onPlan}
                disabled={planning || !prompt.trim()}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                {planning ? "Planning..." : "Plan workflow"}
              </button>
              <button
                type="button"
                onClick={onRun}
                disabled={running || !prompt.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {running ? "Running..." : "Run workflow"}
              </button>
            </div>
          </form>

          {plan ? (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-800">2</span>
                Planned steps
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Planner intent: <span className="font-mono text-xs">{plan.intent}</span>
              </p>
              <ol className="mt-2 space-y-2">
                {(plan.steps || []).map((s) => (
                  <li key={s.step_index} className="text-sm p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">
                        {s.step_index}. {s.title}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-violet-50 text-violet-700 font-semibold uppercase">
                        {s.agent_type}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-600">{s.instruction}</p>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>

        <div className="card-surface-static p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[#0F172A]">Recent runs</h2>
            <button
              type="button"
              onClick={loadRuns}
              className="text-xs text-[#16A34A] hover:underline disabled:opacity-50"
              disabled={loadingRuns}
            >
              {loadingRuns ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {runs.length === 0 ? <p className="text-sm text-slate-500">No workflow runs yet.</p> : null}
            {runs.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => openRun(r.id)}
                className={[
                  "w-full text-left p-3 rounded-lg border transition-colors",
                  selectedRunId === r.id ? "border-[#86EFAC] bg-[#F0FDF4]" : "border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-800 line-clamp-1">{r.prompt}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${statusClass(r.status)}`}>
                    {r.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  intent: {r.intent || "n/a"} • steps: {r.step_count} • tasks: {r.task_count}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedRun ? (
        <div className="card-surface-static p-5 sm:p-6 mt-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-800">3</span>
            Run outputs
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-[#0F172A]">Workflow #{selectedRun.id}</h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${statusClass(selectedRun.status)}`}>
                {selectedRun.status}
              </span>
              <button
                type="button"
                onClick={rerunSelected}
                className="text-xs text-[#16A34A] hover:underline"
                disabled={selectedRun.status === "processing"}
              >
                Re-run
              </button>
            </div>
          </div>

          {selectedRun.result?.summary ? (
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-1">Aggregated result</h4>
              <pre className="text-sm whitespace-pre-wrap p-3 rounded-lg border border-slate-100 bg-slate-50">
                {selectedRun.result.summary}
              </pre>
            </div>
          ) : null}

          {Array.isArray(selectedRun.tasks) && selectedRun.tasks.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Task execution</h4>
              <ul className="space-y-2">
                {selectedRun.tasks.map((t) => (
                  <li key={t.id} className="p-3 rounded-lg border border-slate-100 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800">
                        {t.step_index}. {t.title}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${statusClass(t.status)}`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">agent: {t.agent_type}</p>
                    {t.output_data?.content ? (
                      <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{t.output_data.content}</p>
                    ) : null}
                    {t.error_message ? <p className="mt-2 text-sm text-red-600">{t.error_message}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="mt-6 text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2 max-w-4xl">
          {error}
        </p>
      ) : null}
    </ClientLayout>
  );
}
