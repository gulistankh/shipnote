// ============================================================
// pages/marketing/Pricing.jsx
// The dedicated pricing page ("/pricing"): short intro, plan cards
// (with test-mode notice), and a small FAQ.
// ============================================================
import PricingSection from '../../components/landing/PricingSection';
import useMediaQuery from '../../hooks/useMediaQuery';
import { colors, fonts, radius } from '../../theme/tokens';

// --- FAQ content ---
const faqs = [
  {
    q: 'What counts toward the 5 update limit?',
    a: 'Only published updates. You can keep as many drafts as you like on the Free plan.',
  },
  {
    q: 'Can I cancel Pro any time?',
    a: 'Yes. You manage or cancel your subscription from a secure billing portal. Your published updates stay online.',
  },
  {
    q: 'Is this real billing?',
    a: 'No. This is a portfolio demo that runs in Stripe test mode, so no real money is ever charged.',
  },
];

export default function Pricing() {
  const isMobile = useMediaQuery('(max-width: 799px)');

  return (
    <>
      {/* --- Intro (dark) --- */}
      <section style={{ background: colors.ink, color: colors.white }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: isMobile ? '48px 20px' : '80px 20px' }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.signal }}>PRICING</span>
          <h1 style={{ fontSize: 'clamp(34px, 6vw, 56px)', marginTop: 12, maxWidth: 640 }}>
            Start free. Upgrade when you ship more.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 14, maxWidth: 520 }}>
            One product and five updates are free forever. Go Pro for unlimited everything and your own accent colour.
          </p>
        </div>
      </section>

      {/* --- Plan cards --- */}
      <PricingSection showHeading={false} />

      {/* --- FAQ --- */}
      <section style={{ background: colors.white, borderTop: `1px solid ${colors.line}` }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: isMobile ? '48px 20px' : '80px 20px' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4.5vw, 36px)' }}>Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
            {faqs.map((f) => (
              <div
                key={f.q}
                style={{
                  padding: 20,
                  border: `1px solid ${colors.line}`,
                  borderRadius: radius.md,
                  background: colors.paper,
                }}
              >
                <div style={{ fontWeight: 600 }}>{f.q}</div>
                <p style={{ color: colors.muted, marginTop: 6 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}