import { colors, fonts } from '../../theme/tokens';

export default function Logo({ onDark = false, size = 28, showText = true }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={colors.signal} />
        <rect x="7" y="9" width="18" height="3" rx="1.5" fill={colors.ink} />
        <rect x="7" y="15" width="13" height="3" rx="1.5" fill={colors.ink} />
        <rect x="7" y="21" width="16" height="3" rx="1.5" fill={colors.ink} />
      </svg>
      {showText && (
        <span
          style={{
            fontFamily: fonts.heading,
            fontWeight: 700,
            fontSize: size * 0.72,
            letterSpacing: '-0.02em',
            color: onDark ? colors.white : colors.ink,
          }}
        >
          Shipnote
        </span>
      )}
    </span>
  );
}