// ============================================================
// components/app/UpdateCard.jsx
// One update in a list: category badge, date, title, short body.
// If onEdit / onToggleStatus / onDelete are passed, a "⋯" menu appears.
// Used on the dashboard (no menu) and the Updates page (with menu).
// ============================================================
import Badge from '../ui/Badge';
import Dropdown from '../ui/Dropdown';
import { formatDate } from '../../utils/dates';
import { colors, fonts, radius } from '../../theme/tokens';

export default function UpdateCard({ update, onEdit, onToggleStatus, onDelete }) {
  const hasMenu = onEdit || onToggleStatus || onDelete;
  const published = update.status === 'published';

  const items = [
    onEdit && { label: 'Edit', onClick: () => onEdit(update) },
    onToggleStatus && { label: published ? 'Unpublish (make draft)' : 'Publish', onClick: () => onToggleStatus(update) },
    onDelete && { divider: true },
    onDelete && { label: 'Delete', danger: true, onClick: () => onDelete(update) },
  ].filter(Boolean);

  return (
    <article
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 18,
        background: colors.white,
        border: `1px solid ${colors.line}`,
        borderRadius: radius.lg,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Badges + date */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <Badge category={update.category} />
          {!published && <Badge tone="amber">Draft</Badge>}
          <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.faint }}>{formatDate(update.date)}</span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 18, marginTop: 10, overflowWrap: 'anywhere' }}>{update.title}</h3>

        {/* Body (max 2 lines) */}
        <p
          style={{
            color: colors.muted,
            fontSize: 15,
            marginTop: 4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflowWrap: 'anywhere',
          }}
        >
          {update.body}
        </p>
      </div>

      {/* Actions menu */}
      {hasMenu && (
        <Dropdown
          items={items}
          width={220}
          trigger={
            <button
              type="button"
              aria-label="Update actions"
              style={{ width: 40, height: 40, border: `1px solid ${colors.line}`, borderRadius: radius.md, background: colors.white, fontSize: 18, lineHeight: 1 }}
            >
              ⋯
            </button>
          }
        />
      )}
    </article>
  );
}