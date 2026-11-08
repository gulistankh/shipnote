// ============================================================
// components/landing/WaitlistForm.jsx
// Dark "join the waitlist" section at the bottom of the landing page.
// Validates the email, then saves it in PostgreSQL through
// POST /api/waitlist (rate limited on the server).
// ============================================================
import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import { colors, radius } from '../../theme/tokens';

export default function WaitlistForm() {
  const isMobile = useMediaQuery('(max-width: 799px)');
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // --- Validate, then save on the server ---
  async function handleSubmit(e) {
    e.preventDefault();
    const value = email.trim();

    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api('/waitlist', { method: 'POST', body: { email: value } });
      setDone(true);
      toast("You're on the waitlist");
    } catch (err) {
      setError(err.fields?.email || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="waitlist" style={{ background: colors.ink, color: colors.white, scrollMarginTop: 64 }}>
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: isMobile ? '56px 20px' : '96px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)' }}>
          Get early access to <span style={{ color: colors.signal }}>new features</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 480 }}>
          Join the waitlist and we will email you when new Shipnote features go live. No spam.
        </p>

        {done ? (
          <div
            role="status"
            style={{
              padding: '16px 20px',
              borderRadius: radius.md,
              background: 'rgba(198,244,50,0.12)',
              border: '1px solid rgba(198,244,50,0.4)',
              color: colors.signal,
              fontWeight: 600,
            }}
          >
            Thanks! You are on the list.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{
              width: '100%',
              maxWidth: 520,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'flex-start',
              gap: 10,
              textAlign: 'left',
            }}
          >
            <Input
              type="email"
              placeholder="you@startup.com"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              wrapperStyle={{ flex: 1 }}
            />
            <Button type="submit" variant="signal" size="lg" loading={loading} style={{ minHeight: 46 }}>
              Join waitlist
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}