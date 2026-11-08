// ============================================================
// middleware/errorHandler.js
// The ONE place where errors become JSON responses:
//   { error: { code, message, ...extra } }
// Handles: our AppError, validation errors (zod), bad JSON, and
// common database errors (duplicate email / page name, failed checks).
// Unknown errors are logged here and shown to the user as a generic message.
// ============================================================
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

// --- Database unique-constraint names -> friendly errors ---
const uniqueMessages = {
  users_email_lower_idx: { status: 409, code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' },
  products_slug_key: { status: 409, code: 'SLUG_TAKEN', message: 'That page name is already taken.' },
};

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Errors we threw on purpose
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, ...err.extra } });
  }

  // Input that failed validation
  if (err instanceof ZodError) {
    const fields = Object.fromEntries(err.issues.map((i) => [i.path.join('.') || 'form', i.message]));
    return res.status(400).json({
      error: { code: 'VALIDATION', message: err.issues[0]?.message || 'Invalid input.', fields },
    });
  }

  // Broken JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'BAD_JSON', message: 'The request body is not valid JSON.' } });
  }

  // Database: duplicate value
  if (err.code === '23505' && uniqueMessages[err.constraint]) {
    const m = uniqueMessages[err.constraint];
    return res.status(m.status).json({ error: { code: m.code, message: m.message } });
  }

  // Database: a CHECK rule from schema.sql was broken
  if (err.code === '23514') {
    return res.status(400).json({ error: { code: 'VALIDATION', message: 'Some values are not allowed.' } });
  }

  // Anything else is a real bug: log it, show a generic message
  console.error('Server error:', env.isProd ? err.message : err);
  res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' } });
}