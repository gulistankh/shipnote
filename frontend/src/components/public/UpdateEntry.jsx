// ============================================================
// components/public/UpdateEntry.jsx
// One update on the public page.
// Desktop: date on the left, content on the right.
// Phone: date on top, content below.
// Props: update, accent
// ============================================================
import Badge from '../ui/Badge';
import useMediaQuery from '../../hooks/useMediaQuery';
import { formatDate } from '../../utils/dates';
import { colors, fonts } from '../../theme/tokens';

export default function UpdateEntry({ update, accent }) {
  const isMobile = useMediaQuery('(max-width: 639px)');

  return (
    <article
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '130px 1fr',
        gap: isMobile ? 10 : 24,
        padding: '28px 0',
        borderBottom: `1px solid ${colors.line}`,
      }}
    >
      {/* Date */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingTop: isMobile ? 0 : 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, marginTop: 6, flexShrink: 0 }} />
        <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.muted }}>{formatDate(update.date)}</span>
      </div>

      {/* Content */}
      <div style={{ minWidth: 0 }}>
        <Badge category={update.category} />
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', marginTop: 10, overflowWrap: 'anywhere' }}>{update.title}</h2>
        <p style={{ color: colors.muted, marginTop: 8, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{update.body}</p>
      </div>
    </article>
  );
}