// ============================================================
// components/landing/Hero.jsx
// Dark top section of the landing page: headline, two buttons,
// and a browser-style preview of a public "What's new" page.
// ============================================================
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import useMediaQuery from '../../hooks/useMediaQuery';
import { heroPreviewUpdates } from '../../data/mockData';
import { colors, fonts, radius } from '../../theme/tokens';

// --- The fake browser window showing a public page ---
function PreviewCard() {
  return (
    <div
      style={{
        background: colors.white,
        borderRadius: radius.lg,
        overflow: 'hidden',
        border: `1px solid ${colors.inkLine}`,
        boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
        color: colors.text,
      }}
    >
      {/* Browser bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          background: colors.paper,
          borderBottom: `1px solid ${colors.line}`,
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
        <span
          style={{
            marginLeft: 8,
            flex: 1,
            minWidth: 0,
            padding: '4px 10px',
            background: colors.white,
            border: `1px solid ${colors.line}`,
            borderRadius: radius.sm,
            fontFamily: fonts.mono,
            fontSize: 12,
            color: colors.muted,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          shipnote.app/p/acme
        </span>
      </div>

      {/* Page content */}
      <div style={{ padding: 20 }}>
        <h3 style={{ fontSize: 22 }}>What's new in Acme</h3>
        <p style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>The latest product updates.</p>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column' }}>
          {heroPreviewUpdates.map((u, i) => (
            <div
              key={u.id}
              style={{
                padding: '14px 0',
                borderTop: i === 0 ? `1px solid ${colors.line}` : 'none',
                borderBottom: `1px solid ${colors.line}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <Badge category={u.category} />
                <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.faint }}>{u.date}</span>
              </div>
              <div style={{ fontWeight: 600, marginTop: 8 }}>{u.title}</div>
              <div style={{ color: colors.muted, fontSize: 14, marginTop: 2 }}>{u.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const isMobile = useMediaQuery('(max-width: 899px)');

  return (
    <section style={{ background: colors.ink, color: colors.white, overflow: 'hidden' }}>
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: isMobile ? '48px 20px 56px' : '88px 20px 96px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr',
          gap: isMobile ? 40 : 56,
          alignItems: 'center',
        }}
      >
        {/* --- Left: headline, text, buttons --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <Badge tone="lime">Changelog tool for founders</Badge>
          </div>
          <h1 style={{ fontSize: 'clamp(38px, 7vw, 64px)', fontWeight: 700 }}>
            Ship it. <span style={{ color: colors.signal }}>Then say it.</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2.4vw, 19px)', color: 'rgba(255,255,255,0.72)', maxWidth: 520 }}>
            Shipnote gives every product a clean public "What's new" page. Write an update in a minute,
            publish it, and share one link with your customers.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Button as={Link} to="/signup" variant="signal" size="lg">Start for free</Button>
            <Button as={Link} to="/pricing" variant="onDark" size="lg">See pricing</Button>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            Free plan, no card needed. Upgrade whenever you grow.
          </p>
        </div>

        {/* --- Right: preview card --- */}
        <PreviewCard />
      </div>
    </section>
  );
}