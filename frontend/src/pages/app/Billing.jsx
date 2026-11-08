// ============================================================
// pages/app/Billing.jsx   (route: /app/billing)
// REAL Stripe billing (TEST MODE only):
//   Free user -> "Upgrade to Pro" asks the server for a Stripe Checkout
//                page and sends the browser there.
//   Pro user  -> "Manage billing" opens the Stripe customer portal
//                (change card, cancel, resume).
// The plan itself is changed ONLY by Stripe's webhook on the server.
// Coming back from Checkout (?checkout=success) the page checks every
// 1.5 seconds until the webhook has switched the plan to Pro.
// Demo accounts cannot use billing (the server blocks it too).
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import TestModeNotice from '../../components/landing/TestModeNotice';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/dates';
import { plans } from '../../data/mockData';
import { colors, fonts, radius } from '../../theme/tokens';

const card = { background: colors.white, border: `1px solid ${colors.line}`, borderRadius: radius.lg, padding: 22 };

export default function Billing() {
  const { user, refresh, logout } = useAuth();
  const { usage, reload } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [busy, setBusy] = useState(''); // 'checkout' | 'portal' | ''
  const [confirming, setConfirming] = useState(false);

  const isPro = user.plan === 'pro';
  const isDemo = user.isDemo;
  const sub = user.subscription;
  const proPlan = plans.find((p) => p.id === 'pro');
  const periodEnd = sub?.currentPeriodEnd ? formatDate(sub.currentPeriodEnd.slice(0, 10)) : null;

  // --- Coming back from Stripe Checkout ---
  useEffect(() => {
    const result = params.get('checkout');
    if (!result) return undefined;

    setParams({}, { replace: true }); // clean the address bar

    if (result === 'cancelled') {
      toast('Checkout cancelled. You were not charged.', 'info');
      return undefined;
    }
    if (result !== 'success') return undefined;

    // Wait for the webhook to switch the plan (up to ~15 seconds)
    let cancelled = false;
    setConfirming(true);
    (async () => {
      for (let attempt = 0; attempt < 10 && !cancelled; attempt += 1) {
        try {
          const me = await api('/me');
          if (me.user.plan === 'pro') {
            await refresh();
            await reload();
            if (!cancelled) {
              setConfirming(false);
              toast('Welcome to Pro (test mode)');
            }
            return;
          }
        } catch {
          /* try again on the next round */
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      if (!cancelled) {
        setConfirming(false);
        toast('Your payment is still being confirmed. Refresh this page in a moment.', 'info');
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Ask the server for a Stripe page and go there ---
  async function openStripe(kind) {
    setBusy(kind);
    try {
      const { url } = await api(`/billing/${kind}`, { method: 'POST' });
      window.location.assign(url);
    } catch (err) {
      toast(err.message, 'error');
      setBusy('');
    }
  }

  // --- Demo visitors: leave the demo and create a real account ---
  async function leaveDemo() {
    await logout();
    navigate('/signup');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 34px)' }}>Billing</h1>
        <p style={{ color: colors.muted, marginTop: 4 }}>Your plan and payments.</p>
      </div>

      <TestModeNotice />

      {/* Waiting for Stripe's confirmation */}
      {confirming && (
        <div role="status" style={{ padding: '14px 16px', borderRadius: radius.md, background: colors.blueSoft, color: colors.blueText, fontSize: 14 }}>
          Payment received. Confirming your Pro plan…
        </div>
      )}

      {/* Failed payment warning */}
      {sub?.status === 'past_due' && (
        <div role="alert" style={{ padding: '14px 16px', borderRadius: radius.md, background: colors.amberSoft, color: colors.amberText, fontSize: 14 }}>
          Your last payment did not go through. Open Manage billing to update your card.
        </div>
      )}

      {/* --- Current plan --- */}
      <section style={card}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ color: colors.muted, fontSize: 14 }}>Current plan</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 32, fontWeight: 700 }}>{isPro ? 'Pro' : 'Free'}</div>
          </div>
          <Badge tone={isPro ? 'dark' : 'neutral'}>{isPro ? '$12 / month' : '$0'}</Badge>
        </div>

        <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15 }}>
          <li>Products: {usage.products} of {usage.maxProducts === Infinity ? 'unlimited' : usage.maxProducts}</li>
          <li>Published updates: {usage.published} of {usage.maxPublished === Infinity ? 'unlimited' : usage.maxPublished}</li>
          {isPro && periodEnd && !sub.cancelAtPeriodEnd && <li>Renews on {periodEnd}</li>}
          {isPro && periodEnd && sub.cancelAtPeriodEnd && (
            <li>Your Pro plan ends on {periodEnd}. You can resume it in Manage billing.</li>
          )}
          {!isPro && sub?.status === 'canceled' && (
            <li>Your Pro plan has ended. Your published updates stay online.</li>
          )}
        </ul>

        {/* Buttons */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          {isDemo ? (
            <>
              <p style={{ color: colors.muted, fontSize: 14 }}>
                Billing is disabled in the demo. Create a free account to try Stripe test checkout.
              </p>
              <Button onClick={leaveDemo}>Create a free account</Button>
            </>
          ) : isPro ? (
            <Button variant="secondary" loading={busy === 'portal'} disabled={Boolean(busy)} onClick={() => openStripe('portal')}>
              Manage billing
            </Button>
          ) : (
            <Button loading={busy === 'checkout'} disabled={Boolean(busy) || confirming} onClick={() => openStripe('checkout')}>
              Upgrade to Pro
            </Button>
          )}
        </div>
      </section>

      {/* --- Pro offer (Free users only) --- */}
      {!isPro && (
        <section style={{ ...card, background: colors.ink, color: colors.white, border: 'none' }}>
          <h2 style={{ fontSize: 22 }}>Why go Pro?</h2>
          <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {proPlan.features.map((f) => (
              <li key={f} style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: colors.signal, fontWeight: 700 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}