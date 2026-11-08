// ============================================================
// middleware/requireAdmin.js
// Use AFTER requireAuth: router.get('/x', requireAuth, requireAdmin, handler)
// Only users with role "admin" pass; everyone else gets 403.
// ============================================================
import { AppError } from '../utils/AppError.js';

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    throw new AppError(403, 'FORBIDDEN', 'Admins only.');
  }
  next();
}