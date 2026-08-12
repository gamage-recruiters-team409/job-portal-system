/**
 * Display helpers for public job data.
 * Adapted to the team's Job model field names (salaryMin/salaryMax,
 * experienceYears, createdAt).
 */

/** Format a salary band: "LKR 150,000 – 300,000" or "Negotiable" when unset. */
export function formatSalary(min, max, currency = 'LKR') {
  if (min == null && max == null) return 'Negotiable';
  const fmt = (n) => (n == null ? '' : Number(n).toLocaleString('en-US'));
  if (min != null && max != null) return `${currency} ${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `${currency} ${fmt(min)}+`;
  return `${currency} up to ${fmt(max)}`;
}

/** Compact salary: "LKR 150k–300k". */
export function formatSalaryCompact(min, max, currency = 'LKR') {
  if (min == null && max == null) return 'Negotiable';
  const k = (n) => (n == null ? '' : `${Math.round(n / 1000)}k`);
  if (min != null && max != null) return `${currency} ${k(min)}–${k(max)}`;
  if (min != null) return `${currency} ${k(min)}+`;
  return `${currency} ${k(max)}`;
}

/** Human time-ago from an ISO date, e.g. "2d ago". */
export function timeAgo(iso) {
  if (!iso) return '';
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/** Format experience years, e.g. 0 → "Entry level", 3 → "3+ yrs". */
export function formatExperience(years) {
  if (years == null) return '';
  if (years === 0) return 'Entry level';
  return `${years}+ yrs`;
}

/** Humanise enum values: "full-time" → "Full-time", "on-site" → "On-site". */
export function titleCase(value = '') {
  return String(value)
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
