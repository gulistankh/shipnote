// ============================================================
// routes/admin.routes.js   (mounted at /api/admin)
//   GET /overview  -> counts, users table and waitlist (admin role only)
// The shared DEMO admin sees MASKED names and emails, because anyone
// on the internet can open the demo admin. A real admin sees everything.
// ============================================================
import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// "maya@brightloop.io" -> "m***@brightloop.io"
const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  return `${local.charAt(0)}***@${domain}`;
};
const maskName = (name) => `${name.charAt(0)}***`;

router.get(
  '/overview',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const masked = Boolean(req.user.is_demo);

    const [stats, users, waitlist] = await Promise.all([
      query(
        `SELECT count(*) AS total,
                count(*) FILTER (WHERE plan = 'free') AS free,
                count(*) FILTER (WHERE plan = 'pro') AS pro,
                (SELECT count(*) FROM waitlist) AS waitlist
           FROM users`
      ),
      query(
        `SELECT id, name, email, plan, role, is_demo, created_at::date AS signed_up_at
           FROM users ORDER BY created_at DESC LIMIT 500`
      ),
      query(`SELECT id, email, created_at::date AS joined_at FROM waitlist ORDER BY created_at DESC LIMIT 500`),
    ]);

    const s = stats.rows[0];
    res.json({
      masked,
      stats: { totalUsers: s.total, free: s.free, pro: s.pro, waitlist: s.waitlist, testMrr: s.pro * 12 },
      users: users.rows.map((r) => ({
        id: r.id,
        name: masked ? maskName(r.name) : r.name,
        email: masked ? maskEmail(r.email) : r.email,
        plan: r.plan,
        role: r.role,
        isDemo: r.is_demo,
        signedUpAt: r.signed_up_at,
      })),
      waitlist: waitlist.rows.map((r) => ({
        id: r.id,
        email: masked ? maskEmail(r.email) : r.email,
        joinedAt: r.joined_at,
      })),
    });
  })
);

export default router;