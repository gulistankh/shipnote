// ============================================================
// routes/updates.routes.js   (mounted at /api, so the paths below are full)
//   GET    /products/:productId/updates  -> all updates of a product
//   POST   /products/:productId/updates  -> create (PLAN LIMIT if published)
//   GET    /updates/:id                  -> one update (for the editor)
//   PATCH  /updates/:id                  -> edit / publish / unpublish (PLAN LIMIT on publish)
//   DELETE /updates/:id                  -> delete
// requireAuth is added on each route (not router-wide) so later public
// routes mounted after this router are never blocked by it.
// Ownership is always checked through the product's owner_id.
// ============================================================
import { Router } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { parseUuid, validate } from '../middleware/validate.js';
import { toUpdate } from '../services/mappers.js';
import { assertCanPublish, buildUsage } from '../services/planLimits.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// --- Input rules (messages match the editor form) ---
const title = z.string().trim().min(3, 'Write a title (at least 3 characters).').max(80, 'Title is too long.');
const body = z.string().trim().min(10, 'Add a short description (at least 10 characters).').max(1000, 'Description is too long.');
const category = z.enum(['new', 'improved', 'fixed'], 'Choose a category.');
const status = z.enum(['draft', 'published'], 'Status must be draft or published.');
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date.')
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, 'Choose a valid date.');

const createSchema = z.object({ title, body, category, date, status: status.default('draft') });
const patchSchema = z
  .object({
    title: title.optional(),
    body: body.optional(),
    category: category.optional(),
    date: date.optional(),
    status: status.optional(),
  })
  .refine((o) => Object.keys(o).length > 0, 'Nothing to update.');

// --- Helper: load an update only if it belongs to this user ---
const OWNED_UPDATE_SQL = `
  SELECT u.* FROM updates u
    JOIN products p ON p.id = u.product_id
   WHERE u.id = $1 AND p.owner_id = $2`;

// --- List a product's updates ---
router.get(
  '/products/:productId/updates',
  requireAuth,
  asyncHandler(async (req, res) => {
    const productId = parseUuid(req.params.productId);
    const owned = await query('SELECT id FROM products WHERE id = $1 AND owner_id = $2', [productId, req.user.id]);
    if (!owned.rows[0]) throw new AppError(404, 'NOT_FOUND', 'Product not found.');

    const { rows } = await query(
      'SELECT * FROM updates WHERE product_id = $1 ORDER BY release_date DESC, created_at DESC',
      [productId]
    );
    res.json({ updates: rows.map(toUpdate) });
  })
);

// --- Create an update ---
router.post(
  '/products/:productId/updates',
  requireAuth,
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const productId = parseUuid(req.params.productId);
    const data = req.body;

    const created = await withTransaction(async (client) => {
      const owned = await client.query('SELECT id FROM products WHERE id = $1 AND owner_id = $2', [productId, req.user.id]);
      if (!owned.rows[0]) throw new AppError(404, 'NOT_FOUND', 'Product not found.');

      if (data.status === 'published') await assertCanPublish(client, req.user.id); // PLAN LIMIT

      const { rows } = await client.query(
        `INSERT INTO updates (product_id, title, body, category, status, release_date, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $5::text = 'published' THEN now() END)
         RETURNING *`,
        [productId, data.title, data.body, data.category, data.status, data.date]
      );
      return rows[0];
    });

    const usage = await buildUsage(req.user.plan, req.user.id);
    res.status(201).json({ update: toUpdate(created), usage });
  })
);

// --- Get one update ---
router.get(
  '/updates/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseUuid(req.params.id);
    const { rows } = await query(OWNED_UPDATE_SQL, [id, req.user.id]);
    if (!rows[0]) throw new AppError(404, 'NOT_FOUND', 'Update not found.');
    res.json({ update: toUpdate(rows[0]) });
  })
);

// --- Edit / publish / unpublish ---
router.patch(
  '/updates/:id',
  requireAuth,
  validate(patchSchema),
  asyncHandler(async (req, res) => {
    const id = parseUuid(req.params.id);
    const patch = req.body;

    const saved = await withTransaction(async (client) => {
      const found = await client.query(`${OWNED_UPDATE_SQL} FOR UPDATE OF u`, [id, req.user.id]);
      if (!found.rows[0]) throw new AppError(404, 'NOT_FOUND', 'Update not found.');

      // PLAN LIMIT only matters when a draft BECOMES published
      const becomingPublished = patch.status === 'published' && found.rows[0].status !== 'published';
      if (becomingPublished) await assertCanPublish(client, req.user.id);

      const { rows } = await client.query(
        `UPDATE updates
            SET title        = COALESCE($2, title),
                body         = COALESCE($3, body),
                category     = COALESCE($4, category),
                release_date = COALESCE($5::date, release_date),
                status       = COALESCE($6::text, status),
                published_at = CASE
                                 WHEN $6::text = 'published' AND status <> 'published' THEN now()
                                 WHEN $6::text = 'draft' THEN NULL
                                 ELSE published_at
                               END
          WHERE id = $1
          RETURNING *`,
        [id, patch.title ?? null, patch.body ?? null, patch.category ?? null, patch.date ?? null, patch.status ?? null]
      );
      return rows[0];
    });

    const usage = await buildUsage(req.user.plan, req.user.id);
    res.json({ update: toUpdate(saved), usage });
  })
);

// --- Delete ---
router.delete(
  '/updates/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = parseUuid(req.params.id);
    const { rowCount } = await query(
      `DELETE FROM updates
        WHERE id = $1 AND product_id IN (SELECT id FROM products WHERE owner_id = $2)`,
      [id, req.user.id]
    );
    if (rowCount === 0) throw new AppError(404, 'NOT_FOUND', 'Update not found.');

    const usage = await buildUsage(req.user.plan, req.user.id);
    res.json({ ok: true, usage });
  })
);

export default router;