// ============================================================
// routes/billing.routes.js   (mounted at /api/billing)
//   POST /checkout  -> { url } of a Stripe Checkout page for Pro
//   POST /portal    -> { url } of the Stripe customer portal
// The browser just redirects to the url. The plan itself is changed
// ONLY by the webhook, never by these routes.
// Demo accounts cannot use billing (they are shared by all visitors).
// ============================================================
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { paymentProvider } from '../services/payments/stripeProvider.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// --- Checks shared by both routes ---
function assertBillingAllowed(user) {
  if (!paymentProvider.isConfigured()) {
    throw new AppError(503, 'BILLING_UNAVAILABLE', 'Billing is not available right now.');
  }
  if (user.is_demo) {
    throw new AppError(
      403,
      'DEMO_BILLING_DISABLED',
      'Billing is disabled in the demo. Create a free account to try Stripe test checkout.'
    );
  }
}

// --- Start a Pro subscription ---
router.post(
  '/checkout',
  requireAuth,
  asyncHandler(async (req, res) => {
    assertBillingAllowed(req.user);
    if (req.user.plan === 'pro') {
      throw new AppError(409, 'ALREADY_PRO', 'You are already on Pro. Use Manage billing to make changes.');
    }
    res.json(await paymentProvider.createCheckoutSession({ user: req.user }));
  })
);

// --- Manage or cancel the subscription ---
router.post(
  '/portal',
  requireAuth,
  asyncHandler(async (req, res) => {
    assertBillingAllowed(req.user);
    if (!req.user.stripe_customer_id) {
      throw new AppError(409, 'NO_BILLING_ACCOUNT', 'You do not have a billing account yet.');
    }
    res.json(await paymentProvider.createPortalSession({ customerId: req.user.stripe_customer_id }));
  })
);

export default router;