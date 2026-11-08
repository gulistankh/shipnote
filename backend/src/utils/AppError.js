// ============================================================
// utils/AppError.js
// An error we throw on purpose, with an HTTP status and a short code
// the frontend can read. Example:
//   throw new AppError(403, 'PLAN_LIMIT', 'The Free plan includes 5 published updates.', { kind: 'updates' })
// The error handler turns it into { error: { code, message, ...extra } }.
// ============================================================
export class AppError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}