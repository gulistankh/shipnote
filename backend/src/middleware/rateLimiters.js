// ============================================================
// middleware/rateLimiters.js
// Limits how many requests one IP can make, to slow down password
// guessing and spam. Counted per IP; limits are looser in development
// so testing does not lock you out.
//   authLimiter     -> signup and login
//   waitlistLimiter -> landing page waitlist form (used later)
// ============================================================
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const tooMany = (req, res) => {
  res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' } });
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isProd ? 10 : 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooMany,
});

export const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.isProd ? 5 : 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooMany,
});