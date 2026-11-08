// ============================================================
// middleware/requireAuth.js
// Guards routes that need a logged-in user.
// Reads the cookie, checks the token, then loads the user from the
// database on EVERY request (so a plan or role change applies at once).
// On success: req.user = the user row. Otherwise: 401.
// requireAdmin (separate file) is used after this one.
// ============================================================
import { query } from '../db/pool.js';
import { COOKIE_NAME, clearSessionCookie, readSession } from '../services/session.js';
import { USER_COLUMNS } from '../services/mappers.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  const userId = token ? readSession(token) : null;

  if (userId) {
    const { rows } = await query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [userId]);
    if (rows[0]) {
      req.user = rows[0];
      return next();
    }
  }

  if (token) clearSessionCookie(res); // bad or stale cookie: remove it
  throw new AppError(401, 'UNAUTHENTICATED', 'Please log in.');
});