// ============================================================
// services/demoSeed.js
// The three shared demo accounts (free, pro, admin) and the function
// that RESETS one of them to its starting data:
//   resetDemoAccount(client, kind)  -> returns the demo user's id
// Used by:
//   - npm run seed          (creates all three the first time)
//   - POST /api/auth/demo   (resets the chosen one on every demo login)
// Demo users get a random password nobody knows, so they can only be
// entered through the demo button. Billing is blocked for them later.
// ============================================================
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

export const DEMO_KINDS = ['free', 'pro', 'admin'];

// Short helper to keep the data below readable
const u = (category, status, date, title, body) => ({ category, status, date, title, body });

const DEMO_ACCOUNTS = {
  // Free demo: 4 published + 2 drafts (one publish left before the Free limit)
  free: {
    name: 'Dana Free',
    email: 'free@demo.shipnote.app',
    role: 'user',
    plan: 'free',
    products: [
      {
        name: 'Acme',
        slug: 'acme',
        accent: '#2E6BFF',
        updates: [
          u('new', 'published', '2026-11-03', 'Team workspaces are here', 'Invite teammates and share one dashboard. Roles let you decide who can edit and who can only view.'),
          u('improved', 'published', '2026-10-27', 'Reports load 3x faster', 'We rebuilt the query layer behind your charts, so large reports now open in about a second.'),
          u('fixed', 'published', '2026-10-20', 'CSV export keeps your column order', 'Exports now match exactly what you see on screen, including hidden-column settings.'),
          u('new', 'published', '2026-10-12', 'Slack notifications', 'Get a message in Slack when a report finishes or a teammate leaves a comment.'),
          u('improved', 'draft', '2026-11-05', 'Faster onboarding checklist', 'A shorter checklist that gets new accounts to their first report in under two minutes.'),
          u('new', 'draft', '2026-11-05', 'Public API beta', 'Read your data programmatically with simple API keys. Docs are included in settings.'),
        ],
      },
    ],
  },

  // Pro demo: two products, more than 5 published updates
  pro: {
    name: 'Piper Pro',
    email: 'pro@demo.shipnote.app',
    role: 'user',
    plan: 'pro',
    products: [
      {
        name: 'Northwind',
        slug: 'northwind',
        accent: '#7C5CFF',
        updates: [
          u('new', 'published', '2026-11-04', 'Dark mode', 'Switch themes from the profile menu. We remember your choice on every device.'),
          u('improved', 'published', '2026-10-30', 'Smarter search', 'Search now forgives typos and ranks recent items first.'),
          u('fixed', 'published', '2026-10-24', 'Duplicate invoices no longer appear', 'A rare sync issue could show an invoice twice. It is fixed and cleaned up.'),
          u('new', 'published', '2026-10-18', 'Bulk edit', 'Select several rows and change status, owner or tags in one step.'),
          u('improved', 'published', '2026-10-09', 'Cleaner empty states', 'Every empty screen now tells you what to do next.'),
          u('fixed', 'published', '2026-10-01', 'Login works with long passwords', 'Passwords over 64 characters are now accepted.'),
          u('new', 'published', '2026-09-22', 'Audit log', 'See who changed what, and when, across your whole workspace.'),
          u('improved', 'draft', '2026-11-05', 'Export to PDF', 'One-click PDF export for any report, with your logo on top.'),
        ],
      },
      {
        name: 'Northwind Mobile',
        slug: 'northwind-mobile',
        accent: '#0E9F6E',
        updates: [
          u('new', 'published', '2026-11-01', 'Face ID login', 'Unlock the app with Face ID or your fingerprint.'),
          u('improved', 'published', '2026-10-21', 'Offline mode', 'Keep working without a connection. Changes sync when you are back online.'),
          u('fixed', 'published', '2026-10-08', 'Fixed a crash on older phones', 'The app no longer closes when you open the camera.'),
        ],
      },
    ],
  },

  // Admin demo: Pro plan + admin role
  admin: {
    name: 'Alex Admin',
    email: 'admin@demo.shipnote.app',
    role: 'admin',
    plan: 'pro',
    products: [
      {
        name: 'Shipnote HQ',
        slug: 'shipnote-hq',
        accent: '#0E1116',
        updates: [
          u('new', 'published', '2026-11-02', 'Admin dashboard', 'See every user, their plan and when they joined.'),
          u('improved', 'published', '2026-10-25', 'Faster public pages', 'Public pages now load in under a second.'),
          u('fixed', 'published', '2026-10-15', 'Waitlist emails are de-duplicated', 'Signing up twice with the same email no longer creates two rows.'),
        ],
      },
    ],
  },
};

// --- Reset one demo account (call inside a transaction) ---
export async function resetDemoAccount(client, kind) {
  const def = DEMO_ACCOUNTS[kind];
  if (!def) throw new Error(`Unknown demo account: ${kind}`);

  // Only one reset per demo account at a time
  await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`demo:${kind}`]);

  // --- The user row: create it, or restore it to its starting state ---
  const existing = await client.query('SELECT id, is_demo FROM users WHERE lower(email) = $1', [def.email]);
  let userId;

  if (existing.rows[0]) {
    if (!existing.rows[0].is_demo) {
      throw new Error(`The email ${def.email} belongs to a real account. Remove it first.`);
    }
    userId = existing.rows[0].id;
    await client.query(
      `UPDATE users
          SET name = $2, role = $3, plan = $4, onboarded = true,
              stripe_customer_id = NULL, stripe_subscription_id = NULL,
              subscription_status = NULL, current_period_end = NULL, cancel_at_period_end = false
        WHERE id = $1`,
      [userId, def.name, def.role, def.plan]
    );
    // Deleting products also deletes their updates (ON DELETE CASCADE)
    await client.query('DELETE FROM products WHERE owner_id = $1', [userId]);
  } else {
    const randomHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    const created = await client.query(
      `INSERT INTO users (name, email, password_hash, role, plan, onboarded, is_demo)
       VALUES ($1, $2, $3, $4, $5, true, true) RETURNING id`,
      [def.name, def.email, randomHash, def.role, def.plan]
    );
    userId = created.rows[0].id;
  }

  // --- Products and their updates ---
  for (const product of def.products) {
    const p = await client.query(
      'INSERT INTO products (owner_id, name, slug, accent) VALUES ($1, $2, $3, $4) RETURNING id',
      [userId, product.name, product.slug, product.accent]
    );
    for (const item of product.updates) {
      await client.query(
        `INSERT INTO updates (product_id, title, body, category, status, release_date, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, CASE WHEN $5::text = 'published' THEN $6::date::timestamptz END)`,
        [p.rows[0].id, item.title, item.body, item.category, item.status, item.date]
      );
    }
  }

  return userId;
}