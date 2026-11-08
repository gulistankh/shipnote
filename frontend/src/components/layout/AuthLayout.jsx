// ============================================================
// components/layout/AuthLayout.jsx
// Shared look for Login and Signup.
// Desktop: dark brand panel on the left, form on the right.
// Phone: only the form, with a small logo on top.
// Props: title, subtitle, children (the form), footer (link under the form)
// ============================================================
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import useMediaQuery from '../../hooks/useMediaQuery';
import { colors, fonts } from '../../theme/tokens';

const points = [
  'One public page for every product',
  'Publish updates in a minute',
  'Free plan, no card needed',
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  const isMobile = useMediaQuery('(max-width: 899px)');

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        background: colors.paper,
      }}
    >
      {/* --- Left: brand panel (desktop only) --- */}
      {!isMobile && (
        <aside
          style={{
            background: colors.ink,
            color: colors.white,
            padding: 56,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="Shipnote home">
            <Logo onDark />
          </Link>
          <div>
            <h2 style={{ fontSize: 44, maxWidth: 420 }}>
              Ship it. <span style={{ color: colors.signal }}>Then say it.</span>
            </h2>
            <ul style={{ listStyle: 'none', margin: '28px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {points.map((p) => (
                <li key={p} style={{ display: 'flex', gap: 10, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: colors.signal, fontWeight: 700 }}>✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <span style={{ fontFamily: fonts.mono, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            Portfolio demo · test mode
          </span>
        </aside>
      )}

      {/* --- Right: the form --- */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: isMobile ? 'flex-start' : 'center',
          padding: isMobile ? '24px 20px 40px' : 48,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {isMobile && (
            <Link to="/" style={{ textDecoration: 'none' }} aria-label="Shipnote home">
              <Logo />
            </Link>
          )}
          <div>
            <h1 style={{ fontSize: 'clamp(28px, 6vw, 36px)' }}>{title}</h1>
            {subtitle && <p style={{ color: colors.muted, marginTop: 8 }}>{subtitle}</p>}
          </div>
          {children}
          {footer && <div style={{ fontSize: 14, color: colors.muted, textAlign: 'center' }}>{footer}</div>}
        </div>
      </main>
    </div>
  );
}