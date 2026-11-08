// ============================================================
// routes/public.routes.js   (mounted at /api/public)
//   GET /:slug  -> the public "What's new" page data. NO login needed.
// Returns only what visitors may see: product name, page name, accent
// colour, whether to show the "Made with Shipnote" badge, and the
// PUBLISHED updates. Never any user details or drafts.
// ============================================================
import { Router } from 'express';
import { query } from '../db/pool.js';
import { getLimits } from '../services/planLimits.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const slug = String(req.params.slug).toLowerCase();
    if (!SLUG_PATTERN.test(slug) || slug.length > 30) {
      throw new AppError(404, 'NOT_FOUND', 'Page not found.');
    }

    const found = await query(
      `SELECT p.id, p.name, p.slug, p.accent, u.plan
         FROM products p
         JOIN users u ON u.id = p.owner_id
        WHERE p.slug = $1`,
      [slug]
    );
    const product = found.rows[0];
    if (!product) throw new AppError(404, 'NOT_FOUND', 'Page not found.');

    const updates = await query(
      `SELECT id, title, body, category, release_date
         FROM updates
        WHERE product_id = $1 AND status = 'published'
        ORDER BY release_date DESC, created_at DESC
        LIMIT 500`,
      [product.id]
    );

    res.json({
      product: { name: product.name, slug: product.slug, accent: product.accent },
      showBadge: getLimits(product.plan).badge, // the server decides, not the browser
      updates: updates.rows.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        category: r.category,
        date: r.release_date,
      })),
    });
  })
);

export default router;