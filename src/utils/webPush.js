import { getAiJson, postAiJson } from "./aiApi.js";
import { authHeaders } from "./authHeaders.js";
import { apiUrl } from "./apiUrl.js";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register service worker, request notification permission, subscribe with VAPID, POST to backend.
 * @returns {Promise<{ ok: boolean }>}
 */
export async function subscribeWebPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported in this browser.");
  }
  const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await reg.update();

  const res = await fetch(apiUrl("/api/ai/push/vapid-public-key/"), {
    headers: authHeaders({ json: false }),
  });
  const vapid = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(vapid.detail || "Could not load VAPID key");
  if (!vapid.enabled || !vapid.public_key) {
    throw new Error("Push is not configured on the server (set VAPID keys).");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapid.public_key),
  });

  await postAiJson("/api/ai/push/subscribe/", sub.toJSON());
  return { ok: true };
}

/** Server push state: vapid_enabled, subscription_count, push_notifications_enabled, push_active */
export async function fetchPushStatus() {
  return getAiJson("/api/ai/push/status/");
}

export async function unsubscribeWebPush(subscriptionJson) {
  const endpoint = subscriptionJson?.endpoint;
  if (!endpoint) return;
  await fetch(apiUrl("/api/ai/push/subscribe/"), {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ endpoint }),
  });
}
