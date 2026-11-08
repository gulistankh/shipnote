// ============================================================
// routes/products.routes.js   (mounted at /api/products)
//   GET   /slug-check?slug=...&productId=...  -> is this page name usable?
//   POST  /                                    -> create a product (PLAN LIMIT)
//   PATCH /:id                                 -> edit name, page name, accent
// Every product query checks owner_id, so nobody can touch another
// user's product by guessing its id (they just get 404).
// ============================================================
import { Router } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { parseUuid, validate } from '../middleware/validate.js';
import { toProduct } from '../services/mappers.js';
import { assertAccentAllowed, assertCanCreateProduct, buildUsage } from '../services/planLimits.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { accentSchema, nameSchema, slugSchema } from '../utils/slug.js';

const router = Router();

const createSchema = z.object({ name: nameSchema, slug: slugSchema, accent: accentSchema });

const patchSchema = z
  .object({ name: nameSchema.optional(), slug: slugSchema.optional(), accent: accentSchema.optional() })
  .refine((o) => Object.keys(o).length > 0, 'Nothing to update.');

// --- Is a page name free? (productId = the product being edited, so it may keep its own name) ---
router.get(
  '/slug-check',
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = slugSchema.safeParse(String(req.query.slug ?? ''));
    if (!parsed.success) {
      return res.json({ available: false, reason: parsed.error.issues[0].message });
    }

    const { rows } = await query('SELECT id FROM products WHERE slug = $1', [parsed.data]);
    const ownId = req.query.productId ? String(req.query.productId) : null;
    const taken = rows.length > 0 && rows[0].id !== ownId;

    res.json({ available: !taken, reason: taken ? 'That name is already taken.' : null });
  })
);

// --- Create a product ---
router.post(
  '/',
  requireAuth,
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const { name, slug, accent } = req.body;

    const product = await withTransaction(async (client) => {
      const plan = await assertCanCreateProduct(client, req.user.id); // locks the user row
      assertAccentAllowed(plan, accent);
      const { rows } = await client.query(
        'INSERT INTO products (owner_id, name, slug, accent) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.user.id, name, slug, accent]
      );
      return rows[0];
    });

    const usage = await buildUsage(req.user.plan, req.user.id);
    res.status(201).json({ product: toProduct(product), usage });
  })
);

// --- Edit a product ---
router.patch(
  '/:id',
  requireAuth,
  validate(patchSchema),
  asyncHandler(async (req, res) => {
    const id = parseUuid(req.params.id);
    const { name, slug, accent } = req.body;

    const { rows: found } = await query('SELECT * FROM products WHERE id = $1 AND owner_id = $2', [id, req.user.id]);
    if (!found[0]) throw new AppError(404, 'NOT_FOUND', 'Product not found.');

    // A custom colour needs Pro (keeping the colour it already has is always fine)
    if (accent && accent.toLowerCase() !== found[0].accent.toLowerCase()) {
      assertAccentAllowed(req.user.plan, accent);
    }

    const { rows } = await query(
      `UPDATE products
          SET name   = COALESCE($3, name),
              slug   = COALESCE($4, slug),
              accent = COALESCE($5, accent)
        WHERE id = $1 AND owner_id = $2
        RETURNING *`,
      [id, req.user.id, name ?? null, slug ?? null, accent ?? null]
    );

    res.json({ product: toProduct(rows[0]) });
  })
);

export default router;