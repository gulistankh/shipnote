// ============================================================
// routes/webhook.routes.js   (mounted at /api/stripe, BEFORE express.json)
//   POST /webhook  -> receives events from Stripe
// Steps: verify the signature on the RAW body -> remember the event id
// (a repeated event is skipped) -> update the plan -> answer 200.
// If anything fails the transaction is rolled back (including the saved
// event id) and Stripe retries later.
// ============================================================
import express, { Router } from 'express';
import { withTransaction } from '../db/pool.js';
import { applyBillingEvent } from '../services/billingService.js';
import { paymentProvider } from '../services/payments/stripeProvider.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post(
  '/webhook',
  express.raw({ type: 'application/json', limit: '1mb' }), // raw bytes: the signature needs them
  asyncHandler(async (req, res) => {
    const event = paymentProvider.parseWebhook(req.body, req.get('stripe-signature'));

    await withTransaction(async (client) => {
      const saved = await client.query(
        'INSERT INTO stripe_events (id, type) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [event.id, event.type]
      );
      if (saved.rowCount === 0) return; // already handled: do nothing

      await applyBillingEvent(client, event, paymentProvider);
    });

    res.json({ received: true });
  })
);

export default router;