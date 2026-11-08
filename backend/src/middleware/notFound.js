// ============================================================
// middleware/notFound.js
// Answers any URL that no route matched with a JSON 404.
// ============================================================
export function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
}