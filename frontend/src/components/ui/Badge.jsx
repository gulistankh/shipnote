import { categories, colors, fonts, radius } from '../../theme/tokens';

const tones = {
  neutral: { bg: colors.hover, fg: colors.muted, dot: colors.faint },
  dark: { bg: colors.ink, fg: colors.white, dot: colors.signal },
  lime: { bg: colors.signalSoft, fg: '#4D6A00', dot: '#7DA100' },
  green: { bg: colors.greenSoft, fg: colors.greenText, dot: colors.green },
  amber: { bg: colors.amberSoft, fg: colors.amberText, dot: colors.amber },
  red: { bg: colors.redSoft, fg: colors.red, dot: colors.red },
};

export default function Badge({ category, tone = 'neutral', dot = true, children, style }) {
  const cat = category ? categories[category] : null;
  const t = cat || tones[tone] || tones.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: radius.pill,
        background: t.bg,
        color: t.fg,
        fontFamily: fonts.mono,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot }} />}
      {cat ? cat.label : children}
    </span>
  );
}