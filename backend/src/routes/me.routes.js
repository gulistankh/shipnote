// ============================================================
// routes/me.routes.js   (mounted at /api/me)
//   GET /  -> the logged-in user, their products and plan usage
//             in ONE call (the frontend loads this when the app opens)
// ============================================================
import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { toProduct, toUser } from '../services/mappers.js';
import { buildUsage } from '../services/planLimits.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const [productsResult, usage] = await Promise.all([
      query('SELECT * FROM products WHERE owner_id = $1 ORDER BY created_at', [req.user.id]),
      buildUsage(req.user.plan, req.user.id),
    ]);

    res.json({
      user: toUser(req.user),
      products: productsResult.rows.map(toProduct),
      usage,
    });
  })
);

export default router;