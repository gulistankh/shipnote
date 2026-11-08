// ============================================================
// components/layout/Footer.jsx
// Footer for the marketing pages: logo, short pitch, link columns, test-mode note.
// ============================================================
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import useMediaQuery from '../../hooks/useMediaQuery';
import { colors } from '../../theme/tokens';

// --- Link columns ---
const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/#features' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Join the waitlist', to: '/#waitlist' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Log in', to: '/login' },
      { label: 'Sign up', to: '/signup' },
    ],
  },
];

export default function Footer() {
  const isMobile = useMediaQuery('(max-width: 799px)');

  return (
    <footer style={{ background: colors.ink, color: colors.white, borderTop: `1px solid ${colors.inkLine}` }}>
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '48px 20px 32px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr',
          gap: isMobile ? 32 : 48,
        }}
      >
        {/* --- Brand block --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
          <Logo onDark />
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
            Changelogs founders actually publish. Write an update, share one link.
          </p>
        </div>

        {/* --- Link columns --- */}
        {columns.map((col) => (
          <div key={col.title} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {col.title}
            </span>
            {col.links.map((l) => (
              <Link key={l.label} to={l.to} style={{ color: colors.white, textDecoration: 'none', fontSize: 15 }}>
                {l.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* --- Bottom bar --- */}
      <div style={{ borderTop: `1px solid ${colors.inkLine}` }}>
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '18px 20px calc(18px + env(safe-area-inset-bottom))',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          <span>© 2026 Shipnote. A portfolio project.</span>
          <span>Test mode only. No real charges.</span>
        </div>
      </div>
    </footer>
  );
}