import React, { useEffect, useRef, useState } from "react";
import ClientLayout from "../components/ClientLayout.jsx";
import { pushAiActivity } from "../utils/aiActivity.js";
import { postAiJson } from "../utils/aiApi.js";

const STORAGE_KEY = "lawyer_raw_chat_thread_v1";

/** Bracket-style refs like [1], [2] for lightweight citation UX (no backend required). */
function extractBracketRefs(text) {
  if (!text || typeof text !== "string") return [];
  const seen = new Set();
  const out = [];
  const re = /\[(\d+)\]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const n = m[1];
    if (!seen.has(n)) {
      seen.add(n);
      out.push({ ref: n, label: `[${n}]` });
    }
  }
  return out;
}

function ChatMessageBody({ role, content, citations, bracketRefs }) {
  const apiCites = Array.isArray(citations) ? citations : [];
  const showApi = apiCites.length > 0;
  const showBracket = !showApi && bracketRefs && bracketRefs.length > 0;

  return (
    <>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 block mb-1">
        {role === "user" ? "You" : "Assistant"}
      </span>
      <div className="whitespace-pre-wrap">{content}</div>
      {showApi ? (
        <div className="mt-3 pt-2 border-t border-slate-200/80">
          <p className="text-xs font-semibold text-slate-600 mb-1">Sources / citations</p>
          <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
            {apiCites.map((c, i) => (
              <li key={i}>
                {typeof c === "string" ? c : c.title || c.label || c.url || JSON.stringify(c)}
                {c?.url ? (
                  <a href={c.url} className="text-[#16A34A] hover:underline ml-1" target="_blank" rel="noreferrer">
                    link
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {showBracket ? (
        <div className="mt-3 pt-2 border-t border-dashed border-slate-200">
          <p className="text-xs font-semibold text-slate-500 mb-1">Inline references detected</p>
          <p className="text-xs text-slate-500">
            {bracketRefs.map((b) => b.label).join(" · ")} — align with your own source list or paste authorities below the answer.
          </p>
        </div>
      ) : null}
    </>
  );
}

export default function RawChat() {
  const [systemText, setSystemText] = useState("You are a helpful legal assistant. Be concise and accurate.");
  const [model, setModel] = useState("");
  const [thread, setThread] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastRaw, setLastRaw] = useState(null);
  const [lastUsage, setLastUsage] = useState(null);
  const [lastMetrics, setLastMetrics] = useState(null);
  const [streamingView, setStreamingView] = useState(true);
  const [historyRestored, setHistoryRestored] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setThread(parsed);
        }
      }
    } catch {
      /* ignore */
    }
    setHistoryRestored(true);
  }, []);

  useEffect(() => {
    if (!historyRestored) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(thread));
    } catch {
      /* ignore */
    }
  }, [thread, historyRestored]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, loading]);

  async function onSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setError("");
    setLoading(true);
    setLastRaw(null);
    setLastUsage(null);
    setLastMetrics(null);

    const userMsg = { role: "user", content: text };
    const nextThread = [...thread, userMsg];
    setThread(nextThread);
    setInput("");

    const messages = [];
    if (systemText.trim()) messages.push({ role: "system", content: systemText.trim() });
    messages.push(...nextThread);

    try {
      const body = { messages };
      if (model.trim()) body.model = model.trim();
      const data = await postAiJson("/api/ai/chat/", body);
      const fullContent = typeof data.content === "string" ? data.content : "";
      const citations = Array.isArray(data.citations) ? data.citations : null;
      const assistantPayload = {
        role: "assistant",
        content: fullContent,
        ...(citations ? { citations } : {}),
      };
      if (!streamingView) {
        setThread((t) => [...t, assistantPayload]);
      } else {
        setThread((t) => [...t, { role: "assistant", content: "", citations: citations || undefined }]);
        const chunks = fullContent.match(/.{1,28}/g) || [];
        for (let i = 0; i < chunks.length; i += 1) {
          const part = chunks[i];
          setThread((t) => {
            const next = [...t];
            const idx = next.length - 1;
            if (idx >= 0) {
              next[idx] = {
                ...next[idx],
                content: `${next[idx].content || ""}${part}`,
                citations: next[idx].citations,
              };
            }
            return next;
          });
          // Visual streaming for UX; backend remains request/response.
          await new Promise((resolve) => setTimeout(resolve, 12));
        }
      }
      setLastRaw(data.raw ?? null);
      setLastUsage(data.usage ?? null);
      setLastMetrics(data.metrics ?? null);
      pushAiActivity("chat", text.slice(0, 500));
    } catch (err) {
      setThread((t) => t.slice(0, -1));
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setThread([]);
    setError("");
    setLastRaw(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <ClientLayout title="Chat">
      <p className="text-sm text-slate-600 mb-4 max-w-2xl">
        Chat completion against your configured model (no document retrieval). Conversation history is saved in this
        browser for continuity. Enable streaming-style rendering for a live feel; cite sources with{" "}
        <code className="text-xs bg-slate-100 px-1 rounded">[1]</code> or use API-provided citations when available.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] max-w-6xl">
        <div className="flex flex-col min-h-[420px] card-surface-static p-4 sm:p-5">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[min(60vh,520px)] pr-1">
            {thread.length === 0 && !loading ? (
              <p className="text-sm text-slate-500 text-center py-8">Send a message to start the conversation.</p>
            ) : null}
            {thread.map((m, i) => (
              <div
                key={`${i}-${m.role}`}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[90%] rounded-2xl bg-[#DCFCE7] border border-[#86EFAC] px-4 py-3 text-sm text-[#0F172A]"
                    : "mr-auto max-w-[90%] rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800"
                }
              >
                <ChatMessageBody
                  role={m.role}
                  content={m.content}
                  citations={m.citations}
                  bracketRefs={m.role === "assistant" ? extractBracketRefs(m.content) : []}
                />
              </div>
            ))}
            {loading ? (
              <div className="mr-auto rounded-2xl bg-slate-100 border border-slate-200 px-4 py-3 text-sm text-slate-600">
                …
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          {error ? (
            <p className="text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 px-3 py-2 mb-3">{error}</p>
          ) : null}

          <form onSubmit={onSend} className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend(e);
                }
              }}
              rows={2}
              placeholder="Message… (Enter to send, Shift+Enter for newline)"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm resize-y min-h-[44px] focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-5 py-3 shrink-0 disabled:opacity-50">
              Send
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="card-surface-static p-4">
            <label htmlFor="chat-system" className="block text-xs font-semibold text-slate-600 mb-2">
              System message
            </label>
            <textarea
              id="chat-system"
              value={systemText}
              onChange={(e) => setSystemText(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              disabled={loading}
            />
          </div>
          <div className="card-surface-static p-4">
            <label htmlFor="chat-stream" className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-3">
              <input
                id="chat-stream"
                type="checkbox"
                checked={streamingView}
                onChange={(e) => setStreamingView(e.target.checked)}
                disabled={loading}
              />
              Stream response rendering
            </label>
            <label htmlFor="chat-model" className="block text-xs font-semibold text-slate-600 mb-2">
              Model (optional)
            </label>
            <input
              id="chat-model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Server default if empty"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
              disabled={loading}
            />
          </div>
          <button
            type="button"
            onClick={clearChat}
            className="w-full btn-secondary text-sm py-2"
            disabled={loading && thread.length === 0}
          >
            Clear conversation
          </button>
          {lastUsage || lastMetrics ? (
            <div className="text-xs text-slate-600 card-surface-static p-3">
              <p className="font-semibold mb-1">Last request metrics</p>
              {lastMetrics?.latency_ms != null ? <p>Latency: {lastMetrics.latency_ms} ms</p> : null}
              {lastUsage?.total_tokens != null ? <p>Total tokens: {lastUsage.total_tokens}</p> : null}
              {lastUsage?.prompt_tokens != null ? <p>Prompt tokens: {lastUsage.prompt_tokens}</p> : null}
              {lastUsage?.completion_tokens != null ? <p>Completion tokens: {lastUsage.completion_tokens}</p> : null}
            </div>
          ) : null}
          {lastRaw ? (
            <details className="text-xs">
              <summary className="cursor-pointer text-slate-600">Last raw response</summary>
              <pre className="mt-2 p-2 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto max-h-48 overflow-y-auto">
                {JSON.stringify(lastRaw, null, 2)}
              </pre>
            </details>
          ) : null}
        </aside>
      </div>
    </ClientLayout>
  );
}
