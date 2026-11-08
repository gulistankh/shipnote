// ============================================================
// components/layout/MarketingNav.jsx
// Top navigation for the marketing pages (landing, pricing).
// Desktop: links + buttons in a row. Phone: hamburger that expands
// a panel inside the nav (no fixed positioning, so it is never cut off).
// ============================================================
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import useMediaQuery from '../../hooks/useMediaQuery';
import { colors } from '../../theme/tokens';

// --- Links shown in the nav ---
const links = [
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Waitlist', to: '/#waitlist' },
];

export default function MarketingNav() {
  const isMobile = useMediaQuery('(max-width: 799px)');
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the phone menu whenever the page changes
  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  // Close the phone menu if the screen grows to desktop size
  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: colors.ink,
        borderBottom: `1px solid ${colors.inkLine}`,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* --- Main row: logo, links, buttons --- */}
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '0 20px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Link to="/" aria-label="Shipnote home" style={{ textDecoration: 'none' }}>
          <Logo onDark />
        </Link>

        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        {!isMobile ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <Button as={Link} to="/login" variant="onDark" size="sm">Log in</Button>
            <Button as={Link} to="/signup" variant="signal" size="sm">Start free</Button>
          </div>
        ) : (
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            style={{
              width: 44,
              height: 44,
              border: `1px solid ${colors.inkLine}`,
              borderRadius: 12,
              background: 'transparent',
              color: colors.white,
              fontSize: 20,
            }}
          >
            {open ? '×' : '☰'}
          </button>
        )}
      </div>

      {/* --- Phone menu panel (expands under the row) --- */}
      {isMobile && open && (
        <div
          style={{
            padding: '8px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            maxHeight: 'calc(100dvh - 64px)',
            overflowY: 'auto',
            borderTop: `1px solid ${colors.inkLine}`,
          }}
        >
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              style={{
                color: colors.white,
                textDecoration: 'none',
                fontSize: 17,
                fontWeight: 500,
                padding: '14px 0',
                borderBottom: `1px solid ${colors.inkLine}`,
              }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            <Button as={Link} to="/signup" variant="signal" fullWidth>Start free</Button>
            <Button as={Link} to="/login" variant="onDark" fullWidth>Log in</Button>
          </div>
        </div>
      )}
    </header>
  );
}