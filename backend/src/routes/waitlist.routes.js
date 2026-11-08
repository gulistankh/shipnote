// ============================================================
// routes/waitlist.routes.js   (mounted at /api/waitlist)
//   POST /  -> save an email from the landing page form
// Rate limited. A repeated email is silently ignored and the answer
// is the same, so nobody can use this to check who is on the list.
// ============================================================
import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { waitlistLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const schema = z.object({
  email: z.string().trim().toLowerCase().max(254, 'Email is too long.').email('Please enter a valid email address.'),
});

router.post(
  '/',
  waitlistLimiter,
  validate(schema),
  asyncHandler(async (req, res) => {
    await query('INSERT INTO waitlist (email) VALUES ($1) ON CONFLICT DO NOTHING', [req.body.email]);
    res.status(201).json({ ok: true });
  })
);

export default router;