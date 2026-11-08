// ============================================================
// middleware/noStore.js
// Adds "Cache-Control: no-store" to every API response, so browsers
// and proxies never keep a copy (important for logged-in data).
// ============================================================
export function noStore(req, res, next) {
  res.set('Cache-Control', 'no-store');
  next();
}