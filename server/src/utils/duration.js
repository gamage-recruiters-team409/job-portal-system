/**
 * Helpers to parse jsonwebtoken-style duration strings (e.g. "30m", "2h", "7d").
 * Centralised here so the reset token TTL, the email text, and any value the
 * API returns to the frontend all stay in sync with RESET_PASSWORD_EXPIRES_IN.
 */

/** Convert a duration string like "30m" to milliseconds. Defaults to 30 minutes. */
export function durationToMs(value) {
  const s = (value || '').trim();
  const n = Number.parseFloat(s);
  if (Number.isNaN(n)) return 30 * 60 * 1000;
  if (s.endsWith('s')) return n * 1000;
  if (s.endsWith('m')) return n * 60 * 1000;
  if (s.endsWith('h')) return n * 60 * 60 * 1000;
  if (s.endsWith('d')) return n * 24 * 60 * 60 * 1000;
  return n * 60 * 1000; // bare number treated as minutes (jsonwebtoken default)
}

/** Convert a duration string like "30m" to a human phrase like "30 minutes". */
export function durationToHuman(value) {
  const s = (value || '').trim();
  const n = Math.round(Number.parseFloat(s));
  if (Number.isNaN(n)) return '30 minutes';
  if (s.endsWith('s')) return `${n} second${n === 1 ? '' : 's'}`;
  if (s.endsWith('h')) return `${n} hour${n === 1 ? '' : 's'}`;
  if (s.endsWith('d')) return `${n} day${n === 1 ? '' : 's'}`;
  return `${n} minute${n === 1 ? '' : 's'}`; // minutes (and bare-number default)
}
