/**
 * Repair a token copied from Django's quoted-printable console email output.
 * The literal query separator `invite_token=` is displayed as
 * `invite_token=3D...`; an actual email client normally decodes it.
 */
export function normalizeInviteToken(raw) {
  const token = (raw || "").trim();
  if (token.startsWith("3D-") && token.length > 3) return token.slice(2);
  if (token.startsWith("3D") && token.length > 2) return token.slice(2);
  return token;
}
