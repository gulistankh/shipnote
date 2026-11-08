// ============================================================
// components/public/PublicHeader.jsx
// Top of a public page: accent colour bar, product initial,
// "What's new in <product>" heading and a short subtitle.
// Prop: product ({ name, accent })
// ============================================================
import { colors, fonts } from '../../theme/tokens';

export default function PublicHeader({ product }) {
  return (
    <header style={{ background: colors.paper, borderBottom: `1px solid ${colors.line}` }}>
      {/* Accent bar */}
      <div style={{ height: 6, background: product.accent }} />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: product.accent,
              color: colors.white,
              display: 'grid',
              placeItems: 'center',
              fontFamily: fonts.heading,
              fontWeight: 700,
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {product.name.charAt(0).toUpperCase()}
          </span>
          <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.muted, overflowWrap: 'anywhere' }}>
            {product.name}
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(30px, 6vw, 46px)', marginTop: 20, overflowWrap: 'anywhere' }}>
          What's new in {product.name}
        </h1>
        <p style={{ color: colors.muted, marginTop: 8 }}>The latest product updates, newest first.</p>
      </div>
    </header>
  );
}