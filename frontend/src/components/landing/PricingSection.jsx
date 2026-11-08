// ============================================================
// components/landing/PricingSection.jsx
// The two plan cards (Free and Pro) with the test-mode notice.
// Used on the landing page (id "pricing") and on the /pricing page.
// Prop: showHeading (false on /pricing, which has its own heading).
// ============================================================
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import TestModeNotice from './TestModeNotice';
import useMediaQuery from '../../hooks/useMediaQuery';
import { plans } from '../../data/mockData';
import { colors, fonts, radius } from '../../theme/tokens';

// --- One plan card ---
function PlanCard({ plan }) {
  const pro = plan.highlight;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: 28,
        borderRadius: radius.lg,
        background: pro ? colors.ink : colors.white,
        color: pro ? colors.white : colors.text,
        border: `1px solid ${pro ? colors.ink : colors.line}`,
      }}
    >
      {pro && (
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <Badge tone="lime" dot={false}>Most popular</Badge>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: 24 }}>{plan.name}</h3>
        <p style={{ color: pro ? 'rgba(255,255,255,0.65)' : colors.muted, marginTop: 6 }}>{plan.blurb}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: fonts.heading, fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em' }}>
          {plan.price}
        </span>
        <span style={{ color: pro ? 'rgba(255,255,255,0.6)' : colors.muted }}>{plan.period}</span>
      </div>

      <Button
        as={Link}
        to={pro ? '/signup?plan=pro' : '/signup'}
        variant={pro ? 'signal' : 'primary'}
        size="lg"
        fullWidth
      >
        {plan.cta}
      </Button>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {plan.features.map((f) => (
          <li key={f} style={{ display: 'flex', gap: 10, fontSize: 15 }}>
            <span style={{ color: pro ? colors.signal : colors.greenText, fontWeight: 700 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingSection({ showHeading = true }) {
  const isMobile = useMediaQuery('(max-width: 799px)');

  return (
    <section id="pricing" style={{ background: colors.paper, scrollMarginTop: 72 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: isMobile ? '56px 20px' : '88px 20px' }}>
        {showHeading && (
          <div style={{ maxWidth: 560, marginBottom: 32 }}>
            <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.muted }}>PRICING</span>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', marginTop: 10 }}>Simple pricing that grows with you</h2>
          </div>
        )}

        {/* --- Test mode notice (kept close to the prices) --- */}
        <div style={{ marginBottom: 24 }}>
          <TestModeNotice />
        </div>

        {/* --- Plan cards --- */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 20,
            maxWidth: 860,
          }}
        >
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      </div>
    </section>
  );
}