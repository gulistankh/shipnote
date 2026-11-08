// ============================================================
// services/payments/stripeProvider.js
// ALL Stripe-specific code lives in this one file. The rest of the app
// only uses the small `paymentProvider` object below, so another
// provider could replace Stripe without touching routes or the database logic.
//
//   isConfigured() / isWebhookConfigured()  -> are the keys set?
//   createCheckoutSession({ user })          -> { url } to send the browser to
//   createPortalSession({ customerId })      -> { url } for managing / cancelling
//   parseWebhook(rawBody, signature)         -> a small neutral event (signature checked)
//   getSubscription(subscriptionId)          -> the subscription's CURRENT state
// TEST MODE ONLY: env.js refuses any key that is not sk_test_...
// ============================================================
import Stripe from 'stripe';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';

const { secretKey, webhookSecret, pricePro } = env.stripe;
const stripe = secretKey ? new Stripe(secretKey) : null;

// Stripe sends times as unix seconds
const toDate = (seconds) => (seconds ? new Date(seconds * 1000) : null);

// --- Wrap Stripe calls: log the problem, show the user a safe message ---
async function callStripe(action) {
  try {
    return await action();
  } catch (err) {
    console.error('Stripe error:', err.type || 'unknown', err.code || '', err.message);
    throw new AppError(502, 'BILLING_ERROR', 'Could not reach the payment provider. Please try again.');
  }
}

export const paymentProvider = {
  isConfigured: () => Boolean(stripe && pricePro),
  isWebhookConfigured: () => Boolean(stripe && webhookSecret),

  // --- Stripe Checkout (hosted payment page) for the Pro subscription ---
  async createCheckoutSession({ user }) {
    const session = await callStripe(() =>
      stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: pricePro, quantity: 1 }],
        client_reference_id: user.id, // lets the webhook find our user
        subscription_data: { metadata: { userId: user.id } },
        // Returning customers keep their Stripe customer; new ones get one from their email
        ...(user.stripe_customer_id ? { customer: user.stripe_customer_id } : { customer_email: user.email }),
        success_url: `${env.clientUrl}/app/billing?checkout=success`,
        cancel_url: `${env.clientUrl}/app/billing?checkout=cancelled`,
      })
    );
    return { url: session.url };
  },

  // --- Stripe customer portal (change card, cancel, resume) ---
  async createPortalSession({ customerId }) {
    const session = await callStripe(() =>
      stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${env.clientUrl}/app/billing`,
      })
    );
    return { url: session.url };
  },

  // --- Verify the webhook signature and reduce the event to what we need ---
  parseWebhook(rawBody, signature) {
    if (!stripe || !webhookSecret) {
      throw new AppError(503, 'BILLING_UNAVAILABLE', 'Billing is not configured.');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new AppError(400, 'BAD_SIGNATURE', 'Invalid signature.');
    }

    const object = event.data.object;
    const base = { id: event.id, type: event.type };

    if (event.type === 'checkout.session.completed') {
      return {
        ...base,
        subscriptionId: typeof object.subscription === 'string' ? object.subscription : object.subscription?.id ?? null,
        customerId: typeof object.customer === 'string' ? object.customer : object.customer?.id ?? null,
        userId: object.client_reference_id || null,
      };
    }

    if (event.type.startsWith('customer.subscription.')) {
      return {
        ...base,
        subscriptionId: object.id,
        customerId: typeof object.customer === 'string' ? object.customer : object.customer?.id ?? null,
        userId: object.metadata?.userId || null,
      };
    }

    return base; // any other event type: ignored by billingService
  },

  // --- The subscription's latest state (events can arrive out of order) ---
  async getSubscription(subscriptionId) {
    const sub = await callStripe(() => stripe.subscriptions.retrieve(subscriptionId));
    // Newer Stripe API versions keep the period end on the subscription item
    const periodEnd = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end ?? null;

    return {
      id: sub.id,
      customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null,
      status: sub.status,
      currentPeriodEnd: toDate(periodEnd),
      // Newer Stripe API versions record a scheduled cancellation as `cancel_at`
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end || sub.cancel_at),
      userId: sub.metadata?.userId || null,
    };
  },
};