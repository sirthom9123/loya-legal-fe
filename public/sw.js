/* eslint-disable no-restricted-globals */
self.addEventListener("push", (event) => {
  let payload = { title: "Loya Legal", body: "You have a new notification.", data: {} };
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch {
    /* use default */
  }
  const title = payload.title || "Loya Legal";
  const options = {
    body: payload.body || "",
    data: payload.data || {},
    icon: "/favicon.ico",
    badge: "/favicon.ico",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/calendar";
  const path = url.startsWith("/") ? url : `/${url}`;
  const full = self.location.origin + path;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && client.url.startsWith(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(full);
      }
      return undefined;
    }),
  );
});
