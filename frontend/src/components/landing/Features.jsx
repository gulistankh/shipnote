// ============================================================
// components/landing/Features.jsx
// Two sections for the landing page:
//   1) Features  - four cards (id "features", the nav link scrolls here)
//   2) HowItWorks - three numbered steps
// ============================================================
import useMediaQuery from '../../hooks/useMediaQuery';
import { features, steps } from '../../data/mockData';
import { colors, fonts, radius } from '../../theme/tokens';

// --- Section 1: feature cards ---
export function Features() {
  const isMobile = useMediaQuery('(max-width: 799px)');

  return (
    <section id="features" style={{ background: colors.paper, scrollMarginTop: 72 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: isMobile ? '56px 20px' : '96px 20px' }}>
        <div style={{ maxWidth: 560, marginBottom: 40 }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.muted }}>FEATURES</span>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', marginTop: 10 }}>
            Everything you need to keep customers in the loop
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: colors.white,
                border: `1px solid ${colors.line}`,
                borderRadius: radius.lg,
                padding: 24,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radius.md,
                  background: colors.ink,
                  color: colors.signal,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 20,
                  marginBottom: 16,
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontSize: 20 }}>{f.title}</h3>
              <p style={{ color: colors.muted, marginTop: 8 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Section 2: how it works ---
export function HowItWorks() {
  const isMobile = useMediaQuery('(max-width: 799px)');

  return (
    <section style={{ background: colors.white, borderTop: `1px solid ${colors.line}`, borderBottom: `1px solid ${colors.line}` }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: isMobile ? '56px 20px' : '88px 20px' }}>
        <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', maxWidth: 560 }}>Live in three steps</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? 28 : 32,
            marginTop: 36,
          }}
        >
          {steps.map((s) => (
            <div key={s.number} style={{ borderTop: `2px solid ${colors.ink}`, paddingTop: 16 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.muted }}>{s.number}</span>
              <h3 style={{ fontSize: 22, marginTop: 8 }}>{s.title}</h3>
              <p style={{ color: colors.muted, marginTop: 8 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}