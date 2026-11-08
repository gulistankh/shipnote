// ============================================================
// services/session.js
// Login cookie helpers. The cookie holds a signed token (JWT) with
// only the user id inside. It is HttpOnly (JavaScript cannot read it),
// Secure in production, and SameSite=Lax.
//   setSessionCookie(res, userId)   -> log the user in
//   clearSessionCookie(res)         -> log out
//   readSession(token)              -> user id, or null if invalid/expired
// ============================================================
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'sn_session';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax',
  path: '/',
};

export function setSessionCookie(res, userId) {
  const token = jwt.sign({}, env.jwtSecret, { subject: userId, expiresIn: '7d', algorithm: 'HS256' });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: MAX_AGE_MS });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

export function readSession(token) {
  try {
    return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] }).sub || null;
  } catch {
    return null;
  }
}