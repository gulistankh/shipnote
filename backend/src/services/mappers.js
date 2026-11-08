// ============================================================
// services/mappers.js
// Turns database rows (snake_case) into the camelCase JSON the
// frontend expects. Also never exposes private columns
// (password hash, Stripe ids).
// USER_COLUMNS = the user columns that are safe to load for a request.
// ============================================================
export const USER_COLUMNS = `id, name, email, role, plan, onboarded, is_demo,
  stripe_customer_id, stripe_subscription_id,
  subscription_status, current_period_end, cancel_at_period_end`;

export const toUser = (r) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  role: r.role,
  plan: r.plan,
  onboarded: r.onboarded,
  isDemo: r.is_demo,
  subscription: {
    status: r.subscription_status,
    currentPeriodEnd: r.current_period_end,
    cancelAtPeriodEnd: r.cancel_at_period_end,
  },
});

export const toProduct = (r) => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  accent: r.accent,
  createdAt: r.created_at,
});

// release_date is sent as "date"
export const toUpdate = (r) => ({
  id: r.id,
  productId: r.product_id,
  title: r.title,
  body: r.body,
  category: r.category,
  status: r.status,
  date: r.release_date,
  publishedAt: r.published_at,
  createdAt: r.created_at,
});