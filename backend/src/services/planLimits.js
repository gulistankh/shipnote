// ============================================================
// services/planLimits.js
// The ONE place that decides what each plan allows. The server is the
// real enforcer: the browser can hide buttons, but only these checks
// stop an action. `null` means unlimited.
//
// The assert... functions must run INSIDE a transaction. They lock the
// user's row first (SELECT ... FOR UPDATE), so two simultaneous requests
// from the same user are handled one after the other and cannot both
// slip past a limit.
//   assertCanCreateProduct(client, userId)  -> returns the plan
//   assertCanPublish(client, userId)        -> returns the plan
//   assertAccentAllowed(plan, accent)       -> custom colours are Pro only
// Over a limit: 403 with code PLAN_LIMIT and kind 'products' | 'updates' | 'accent'
// ============================================================
import { query } from '../db/pool.js';
import { AppError } from '../utils/AppError.js';

export const PLAN_LIMITS = {
  free: { products: 1, publishedUpdates: 5, customAccent: false, badge: true },
  pro: { products: null, publishedUpdates: null, customAccent: true, badge: false },
};

// The 6 colours every plan may use (same list as the frontend)
export const ACCENT_PRESETS = ['#0E1116', '#2E6BFF', '#7C5CFF', '#E23B6A', '#F2700F', '#0E9F6E'];

export const getLimits = (plan) => PLAN_LIMITS[plan] || PLAN_LIMITS.free;

// --- How much the user has used (db can be the pool or a transaction client) ---
export async function getUsage(userId, db = { query }) {
  const { rows } = await db.query(
    `SELECT
       (SELECT count(*) FROM products WHERE owner_id = $1) AS products,
       (SELECT count(*) FROM updates u
          JOIN products p ON p.id = u.product_id
         WHERE p.owner_id = $1 AND u.status = 'published') AS published`,
    [userId]
  );
  return { products: rows[0].products, published: rows[0].published };
}

// --- Usage + limits in the shape the frontend uses ---
export async function buildUsage(plan, userId, db) {
  const limits = getLimits(plan);
  const used = await getUsage(userId, db);
  return {
    published: used.published,
    maxPublished: limits.publishedUpdates,
    products: used.products,
    maxProducts: limits.products,
  };
}

// --- Lock the user row and read the CURRENT plan from the database ---
async function lockUserPlan(client, userId) {
  const { rows } = await client.query('SELECT plan FROM users WHERE id = $1 FOR UPDATE', [userId]);
  if (!rows[0]) throw new AppError(401, 'UNAUTHENTICATED', 'Please log in.');
  return rows[0].plan;
}

export async function assertCanCreateProduct(client, userId) {
  const plan = await lockUserPlan(client, userId);
  const limit = getLimits(plan).products;
  if (limit !== null) {
    const used = await getUsage(userId, client);
    if (used.products >= limit) {
      throw new AppError(403, 'PLAN_LIMIT', 'The Free plan includes 1 product.', { kind: 'products' });
    }
  }
  return plan;
}

export async function assertCanPublish(client, userId) {
  const plan = await lockUserPlan(client, userId);
  const limit = getLimits(plan).publishedUpdates;
  if (limit !== null) {
    const used = await getUsage(userId, client);
    if (used.published >= limit) {
      throw new AppError(403, 'PLAN_LIMIT', 'The Free plan includes 5 published updates.', { kind: 'updates' });
    }
  }
  return plan;
}

export function assertAccentAllowed(plan, accent) {
  if (getLimits(plan).customAccent) return;
  const isPreset = ACCENT_PRESETS.some((c) => c.toLowerCase() === accent.toLowerCase());
  if (!isPreset) {
    throw new AppError(403, 'PLAN_LIMIT', 'Custom colours are a Pro feature.', { kind: 'accent' });
  }
}