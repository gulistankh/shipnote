// ============================================================
// utils/plans.js
// The ONE place that defines what each plan allows.
// The backend will have the same table and be the real enforcer;
// the browser copy only exists so the UI can show friendly messages.
// ============================================================

// --- Limits per plan ---
export const PLAN_LIMITS = {
  free: { products: 1, publishedUpdates: 5, customAccent: false, badge: true },
  pro: { products: Infinity, publishedUpdates: Infinity, customAccent: true, badge: false },
};

export function getLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

// --- Error thrown when an action goes over the plan limit ---
// kind: 'updates' (too many published updates) or 'products' (too many products)
export class PlanLimitError extends Error {
  constructor(kind) {
    super(kind === 'products' ? 'The Free plan includes 1 product.' : 'The Free plan includes 5 published updates.');
    this.name = 'PlanLimitError';
    this.code = 'PLAN_LIMIT';
    this.kind = kind;
  }
}