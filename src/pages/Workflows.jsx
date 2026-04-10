import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ClientLayout from "../components/ClientLayout.jsx";
import { getAiJson, patchAiJson, postAiJson } from "../utils/aiApi.js";

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

  async function patchRunMetadata(body) {
    if (!selectedRunId) return;
    setError("");
    try {
      const data = await patchAiJson(`/api/ai/workflows/${selectedRunId}/`, body);
      setSelectedRun(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update workflow preferences");
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
              <ol className="mt-2 space-y-2 list-none pl-0">
                {(plan.steps || []).map((s) => (
                  <li
                    key={s.step_index}
                    className="text-sm p-3 rounded-lg bg-slate-50 border border-slate-100 flex gap-3 items-start"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-slate-300 text-xs">
                      ○
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-slate-800">
                          {s.step_index}. {s.title}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-violet-50 text-violet-700 font-semibold uppercase">
                          {s.agent_type}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600">{s.instruction}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Checkboxes for this list appear after you run a workflow (saved on the run record).
                      </p>
                    </div>
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
            <div>
              <h3 className="text-base font-semibold text-[#0F172A]">Workflow #{selectedRun.id}</h3>
              {selectedRun.metadata?.legal_case_public_id ? (
                <p className="mt-1 text-xs text-slate-600">
                  Linked case:{" "}
                  <Link
                    to={`/cases`}
                    className="text-[#16A34A] font-medium hover:underline font-mono"
                    title="Open Cases and select this case from the list"
                  >
                    {selectedRun.metadata.legal_case_public_id}
                  </Link>
                </p>
              ) : null}
            </div>
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

          {Array.isArray(selectedRun.plan) && selectedRun.plan.length > 0 ? (
            <div className="rounded-lg border border-slate-100 bg-white p-4">
              <h4 className="text-sm font-semibold text-slate-800 mb-1">Planner checklist (your progress)</h4>
              <p className="text-xs text-slate-600 mb-3">
                Optional — tick steps as you review them. Stored on this run only; does not call the AI. For fuller step
                output on the next run, enable &quot;Detailed LLM steps&quot; below, then re-run.
              </p>
              <ul className="space-y-2 list-none pl-0">
                {selectedRun.plan.map((s) => {
                  const key = String(s.step_index);
                  const checked = !!selectedRun.metadata?.user_plan_checks?.[key];
                  return (
                    <li
                      key={key}
                      className="flex gap-3 items-start p-2 rounded-lg border border-slate-100 bg-slate-50/80"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A]"
                        checked={checked}
                        onChange={(e) =>
                          patchRunMetadata({ user_plan_checks: { [key]: e.target.checked } })
                        }
                        disabled={selectedRun.status === "processing"}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-medium text-slate-800">
                            {s.step_index}. {s.title}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-violet-50 text-violet-700">
                            {s.agent_type}
                          </span>
                        </div>
                        {s.instruction ? <p className="text-xs text-slate-600 mt-1">{s.instruction}</p> : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-slate-800">Assistant style (applies on next run)</h4>
            <p className="text-xs text-slate-600">
              All AI assistance stays optional — these flags only change how verbose a future execution is.
            </p>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={selectedRun.metadata?.concise_llm !== false}
                onChange={(e) => patchRunMetadata({ concise_llm: e.target.checked })}
                disabled={selectedRun.status === "processing"}
              />
              Concise step responses
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={selectedRun.metadata?.brief_summary_only !== false}
                onChange={(e) => patchRunMetadata({ brief_summary_only: e.target.checked })}
                disabled={selectedRun.status === "processing"}
              />
              Short aggregated summary (title bullets only — avoids repeating task bodies)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={!!selectedRun.metadata?.detailed_llm_steps}
                onChange={(e) => patchRunMetadata({ detailed_llm_steps: e.target.checked })}
                disabled={selectedRun.status === "processing"}
              />
              Detailed LLM per step (longer outputs; uses more tokens)
            </label>
          </div>

          {selectedRun.result?.summary ? (
            <details
              className="group rounded-lg border border-slate-100 bg-slate-50/80"
              open={!(Array.isArray(selectedRun.tasks) && selectedRun.tasks.length > 0)}
            >
              <summary className="cursor-pointer text-sm font-semibold text-slate-800 px-3 py-2 list-none [&::-webkit-details-marker]:hidden flex items-center gap-2">
                <span className="text-slate-400 group-open:rotate-90 transition-transform">›</span>
                Aggregated summary {selectedRun.result?.summary_style ? `(${selectedRun.result.summary_style})` : ""}
              </summary>
              <pre className="text-sm whitespace-pre-wrap px-3 pb-3 text-slate-700">{selectedRun.result.summary}</pre>
            </details>
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
