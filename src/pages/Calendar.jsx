import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ClientLayout from "../components/ClientLayout.jsx";
import { getAiJson, postAiJson } from "../utils/aiApi.js";
import { fetchPushStatus, subscribeWebPush } from "../utils/webPush.js";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function monthMatrix(year, month) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();
  const cells = [];
  let d = 1 - startWeekday;
  while (d <= daysInMonth || cells.length % 7 !== 0) {
    cells.push(d);
    d += 1;
  }
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

export default function Calendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [events, setEvents] = useState([]);
  const [range, setRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMsg, setPushMsg] = useState("");
  const [pushActive, setPushActive] = useState(false);
  const [vapidEnabled, setVapidEnabled] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAiJson(`/api/ai/calendar/?year=${year}&month=${month}`);
      setEvents(Array.isArray(data.events) ? data.events : []);
      setRange({ start: data.start || "", end: data.end || "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load calendar");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const refreshPushStatus = useCallback(async () => {
    try {
      const s = await fetchPushStatus();
      setVapidEnabled(!!s.vapid_enabled);
      setPushActive(!!s.push_active);
    } catch {
      setVapidEnabled(false);
      setPushActive(false);
    }
  }, []);

  useEffect(() => {
    refreshPushStatus();
  }, [refreshPushStatus]);

  const byDate = useMemo(() => {
    const m = new Map();
    for (const ev of events) {
      const d = ev.date;
      if (!m.has(d)) m.set(d, []);
      m.get(d).push(ev);
    }
    return m;
  }, [events]);

  const grid = useMemo(() => monthMatrix(year, month), [year, month]);

  function prevMonth() {
    if (month <= 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month >= 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  async function onEnablePush() {
    setPushBusy(true);
    setPushMsg("");
    setError("");
    try {
      await subscribeWebPush();
      await refreshPushStatus();
      setPushMsg("Browser notifications enabled for this device.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not enable push");
    } finally {
      setPushBusy(false);
    }
  }

  async function onTestPush() {
    setPushBusy(true);
    setPushMsg("");
    setError("");
    try {
      const data = await postAiJson("/api/ai/push/test/", {});
      await refreshPushStatus();
      setPushMsg(`Sent ${data.sent} notification(s).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test failed");
    } finally {
      setPushBusy(false);
    }
  }

  return (
    <ClientLayout title="Calendar">
      <div className="max-w-5xl space-y-6">
        <p className="text-sm text-slate-600">
          Milestone and task due dates across your cases.{" "}
          <Link to="/cases" className="text-[#16A34A] font-medium hover:underline">
            Back to cases
          </Link>
        </p>

        {!pushActive && vapidEnabled ? (
          <div className="card-surface-static p-5 border border-slate-200/80">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Push notifications (optional)</h3>
            <p className="text-xs text-slate-600 mb-3 max-w-2xl">
              Enable desktop or mobile alerts when you dispatch reminders from a case (with “include push”), or send a
              test ping. If this device is already registered, this card stays hidden — manage preferences in{" "}
              <Link to="/profile" className="text-[#16A34A] font-medium hover:underline">
                Settings
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                disabled={pushBusy}
                onClick={onEnablePush}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                {pushBusy ? "Working…" : "Enable push on this device"}
              </button>
              <button
                type="button"
                disabled={pushBusy}
                onClick={onTestPush}
                className="text-sm text-[#16A34A] font-medium hover:underline disabled:opacity-50"
              >
                Send test notification
              </button>
            </div>
            {pushMsg ? <p className="text-xs text-emerald-800 mt-2">{pushMsg}</p> : null}
          </div>
        ) : null}
        {!pushActive && !vapidEnabled ? (
          <p className="text-xs text-amber-700">
            Push is not configured on the server (VAPID keys). Calendar dates still work.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm hover:bg-white"
              aria-label="Previous month"
            >
              ←
            </button>
            <h2 className="text-lg font-semibold text-[#0F172A] min-w-[10rem]">
              {new Date(year, month - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" })}
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm hover:bg-white"
              aria-label="Next month"
            >
              →
            </button>
          </div>
          <p className="text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded bg-violet-400 mr-1 align-middle" aria-hidden /> Milestone
            <span className="inline-block w-2 h-2 rounded bg-emerald-500 ml-3 mr-1 align-middle" aria-hidden /> Task
          </p>
        </div>

        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        ) : null}

        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : (
          <div className="card-surface-static p-4 overflow-x-auto">
            <p className="text-xs text-slate-500 mb-3">
              Range {range.start} — {range.end} · {events.length} event{events.length === 1 ? "" : "s"}
            </p>
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden min-w-[640px]">
              {WEEKDAYS.map((d) => (
                <div key={d} className="bg-slate-100 text-xs font-semibold text-slate-600 px-2 py-2 text-center">
                  {d}
                </div>
              ))}
              {grid.map((row, ri) =>
                row.map((cellDay, ci) => {
                  const inMonth = cellDay >= 1 && cellDay <= new Date(year, month, 0).getDate();
                  const iso = inMonth
                    ? `${year}-${pad2(month)}-${pad2(cellDay)}`
                    : null;
                  const dayEvents = iso ? byDate.get(iso) || [] : [];
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      className={`min-h-[5.5rem] bg-white p-1.5 text-left ${!inMonth ? "opacity-40" : ""}`}
                    >
                      <div className="text-xs font-medium text-slate-700 mb-1">
                        {inMonth ? cellDay : ""}
                      </div>
                      <ul className="space-y-0.5">
                        {dayEvents.slice(0, 4).map((ev) => (
                          <li key={`${ev.kind}-${ev.id}-${ev.case_id}`}>
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 align-middle ${
                                ev.kind === "milestone" ? "bg-violet-500" : "bg-emerald-500"
                              }`}
                              aria-hidden
                            />
                            <span className="text-[10px] leading-tight text-slate-700 line-clamp-2" title={`${ev.case_title}: ${ev.title}`}>
                              {ev.title}
                            </span>
                          </li>
                        ))}
                        {dayEvents.length > 4 ? (
                          <li className="text-[10px] text-slate-500">+{dayEvents.length - 4} more</li>
                        ) : null}
                      </ul>
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
