// ============================================================
// utils/asyncHandler.js
// Wraps an async route so any error is passed to the error handler
// instead of crashing the request. Usage: router.get('/x', asyncHandler(async (req, res) => {...}))
// ============================================================
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};