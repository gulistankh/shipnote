// ============================================================
// utils/dates.js
// Small date helpers. Dates are stored as 'YYYY-MM-DD' strings.
// ============================================================

// '2026-11-03' -> 'Nov 3, 2026'  (built from parts so time zones never shift the day)
export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Today as 'YYYY-MM-DD' in the user's own time zone
export function todayISO() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${mm}-${dd}`;
}