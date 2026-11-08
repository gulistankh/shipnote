// ============================================================
// routes/onboarding.routes.js   (mounted at /api/onboarding)
//   POST /  -> create the user's FIRST product and mark them onboarded
//              body: { name, slug, accent }
// All in one transaction: either both happen, or neither.
// ============================================================
import { Router } from 'express';
import { z } from 'zod';
import { withTransaction } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { USER_COLUMNS, toProduct, toUser } from '../services/mappers.js';
import { assertAccentAllowed, assertCanCreateProduct, buildUsage } from '../services/planLimits.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { accentSchema, nameSchema, slugSchema } from '../utils/slug.js';

const router = Router();

const schema = z.object({ name: nameSchema, slug: slugSchema, accent: accentSchema });

router.post(
  '/',
  requireAuth,
  validate(schema),
  asyncHandler(async (req, res) => {
    const { name, slug, accent } = req.body;

    const { product, user } = await withTransaction(async (client) => {
      if (req.user.onboarded) {
        throw new AppError(409, 'ALREADY_ONBOARDED', 'You have already set up your first product.');
      }

      const plan = await assertCanCreateProduct(client, req.user.id);
      assertAccentAllowed(plan, accent);

      // A taken page name is turned into 409 SLUG_TAKEN by the error handler
      const created = await client.query(
        'INSERT INTO products (owner_id, name, slug, accent) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.user.id, name, slug, accent]
      );
      const updatedUser = await client.query(
        `UPDATE users SET onboarded = true WHERE id = $1 RETURNING ${USER_COLUMNS}`,
        [req.user.id]
      );
      return { product: created.rows[0], user: updatedUser.rows[0] };
    });

    const usage = await buildUsage(user.plan, user.id);
    res.status(201).json({ user: toUser(user), product: toProduct(product), usage });
  })
);

export default router;
