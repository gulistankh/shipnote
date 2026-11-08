import { colors, radius } from '../../theme/tokens';

export default function EmptyState({ title, text, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 12,
        padding: '48px 24px',
        background: colors.white,
        border: `1px dashed ${colors.lineStrong}`,
        borderRadius: radius.lg,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.md,
          background: colors.signalSoft,
          display: 'grid',
          placeItems: 'center',
          fontSize: 20,
        }}
      >
        ✦
      </div>
      <h3 style={{ fontSize: 20 }}>{title}</h3>
      {text && <p style={{ color: colors.muted, maxWidth: 380 }}>{text}</p>}
      {action}
    </div>
  );
}