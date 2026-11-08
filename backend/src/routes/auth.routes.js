// ============================================================
// routes/auth.routes.js   (mounted at /api/auth)
//   POST /signup  -> create a Free account and log in
//   POST /login   -> check email + password and log in
//   POST /logout  -> clear the cookie
// (The demo login is added in a later batch.)
// ============================================================
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, withTransaction } from '../db/pool.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { USER_COLUMNS, toUser } from '../services/mappers.js';
import { clearSessionCookie, setSessionCookie } from '../services/session.js';
import { resetDemoAccount } from '../services/demoSeed.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// --- Input rules (messages match the frontend forms) ---
const email = z.string().trim().toLowerCase().max(254, 'Email is too long.').email('Enter a valid email address.');

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(80, 'Name is too long.'),
  email,
  password: z.string().min(8, 'Use at least 8 characters.').max(72, 'Use 72 characters or fewer.'),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.').max(72, 'Wrong email or password.'),
});

// Used to keep login timing the same when the email does not exist
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

// --- Sign up ---
router.post(
  '/signup',
  authLimiter,
  validate(signupSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);

    // A duplicate email is turned into a 409 EMAIL_TAKEN by the error handler
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING ${USER_COLUMNS}`,
      [name, email, hash]
    );

    setSessionCookie(res, rows[0].id);
    res.status(201).json({ user: toUser(rows[0]) });
  })
);

// --- Log in ---
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { rows } = await query(
      `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE lower(email) = $1`,
      [email]
    );
    const user = rows[0];

    const passwordOk = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !passwordOk) {
      // Same message for "no such email" and "wrong password"
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Wrong email or password.');
    }

    setSessionCookie(res, user.id);
    res.json({ user: toUser(user) });
  })
);

// --- Demo login: resets the chosen demo account, then logs in as it ---
const demoSchema = z.object({ kind: z.enum(['free', 'pro', 'admin'], 'Choose a demo account.') });

router.post(
  '/demo',
  authLimiter,
  validate(demoSchema),
  asyncHandler(async (req, res) => {
    const userId = await withTransaction((client) => resetDemoAccount(client, req.body.kind));
    const { rows } = await query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [userId]);

    setSessionCookie(res, userId);
    res.json({ user: toUser(rows[0]) });
  })
);

// --- Log out ---
router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

export default router;