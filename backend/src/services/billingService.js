// ============================================================
// services/billingService.js
// Provider-neutral billing logic: turns a billing event into a change
// of the user's plan in PostgreSQL. This is the ONLY code that sets
// users.plan. Called by the webhook inside a transaction.
//
// Plan rule: active, trialing and past_due subscriptions = "pro"
// (past_due = Stripe is still retrying the card, so access continues).
// Anything else (canceled, unpaid, incomplete_expired...) = "free".
// A cancellation made in the portal keeps Pro until the period ends,
// then Stripe sends "deleted" and the plan drops back to free.
// ============================================================
export const PRO_STATUSES = ['active', 'trialing', 'past_due'];

const HANDLED_TYPES = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function applyBillingEvent(client, event, provider) {
  if (!HANDLED_TYPES.has(event.type) || !event.subscriptionId) return;

  // Always read the CURRENT subscription instead of trusting the event's snapshot
  const sub = await provider.getSubscription(event.subscriptionId);

  // Find our user: by the id we attached at checkout, otherwise by Stripe customer id
  const userId = [event.userId, sub.userId].find((id) => id && UUID_PATTERN.test(id));
  const found = userId
    ? await client.query('SELECT id, stripe_subscription_id FROM users WHERE id = $1 FOR UPDATE', [userId])
    : await client.query('SELECT id, stripe_subscription_id FROM users WHERE stripe_customer_id = $1 FOR UPDATE', [sub.customerId]);

  const user = found.rows[0];
  if (!user) {
    console.warn('Billing event for an unknown user was ignored:', event.id);
    return;
  }

  const isPro = PRO_STATUSES.includes(sub.status);

  // A late event about an OLD cancelled subscription must not undo a newer one
  if (!isPro && user.stripe_subscription_id && user.stripe_subscription_id !== sub.id) return;

  await client.query(
    `UPDATE users
        SET plan = $2,
            stripe_customer_id = $3,
            stripe_subscription_id = $4,
            subscription_status = $5,
            current_period_end = $6,
            cancel_at_period_end = $7
      WHERE id = $1`,
    [user.id, isPro ? 'pro' : 'free', sub.customerId, sub.id, sub.status, sub.currentPeriodEnd, sub.cancelAtPeriodEnd]
  );
}