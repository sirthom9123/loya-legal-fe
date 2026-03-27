/** Persist minimal user from login/register/profile for theme + admin gating. */
const KEY = "user";

export function persistSessionUser(user) {
  if (user && typeof user === "object") {
    localStorage.setItem(KEY, JSON.stringify(user));
  }
}

export function getSessionUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSessionUser() {
  localStorage.removeItem(KEY);
}
