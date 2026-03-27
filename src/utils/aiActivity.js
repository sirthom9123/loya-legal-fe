const KEY = "ai_activity_log";
const MAX = 12;

/** @typedef {{ id: string, type: "query" | "summary" | "chat"; text: string; at: string }} AiActivityItem */

export function getAiActivity() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return getDefaultActivity();
}

function getDefaultActivity() {
  return [
    {
      id: "1",
      type: "query",
      text: "What is the notice period for termination?",
      at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      type: "summary",
      text: "Summary draft generated for Lease Agreement (preview).",
      at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export function pushAiActivity(type, text) {
  const list = getAiActivity().filter((x) => x.id !== "1" && x.id !== "2");
  const item = {
    id: String(Date.now()),
    type,
    text: String(text).slice(0, 500),
    at: new Date().toISOString(),
  };
  const next = [item, ...list].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}
