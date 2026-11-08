// ============================================================
// middleware/originGuard.js
// Extra protection against forged requests from other websites.
// For requests that change data (POST, PUT, PATCH, DELETE): if the
// browser sends an Origin header, it must be our own site (CLIENT_URL).
// Requests without an Origin (curl, server-to-server) pass through.
// ============================================================
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const changesData = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const allowedOrigin = env.clientUrl.replace(/\/$/, '');

export function originGuard(req, res, next) {
  const origin = req.get('Origin');
  if (changesData.has(req.method) && origin && origin !== allowedOrigin) {
    throw new AppError(403, 'BAD_ORIGIN', 'Request blocked.');
  }
  next();
}