import { useState } from 'react';
import { colors, radius } from '../../theme/tokens';

const sizes = {
  sm: { minHeight: 34, padding: '0 12px', fontSize: 13 },
  md: { minHeight: 42, padding: '0 18px', fontSize: 14 },
  lg: { minHeight: 50, padding: '0 26px', fontSize: 16 },
};

const variants = {
  primary: {
    base: { background: colors.ink, color: colors.white, border: `1px solid ${colors.ink}` },
    hover: { background: colors.inkSoft },
  },
  signal: {
    base: { background: colors.signal, color: colors.ink, border: `1px solid ${colors.signal}` },
    hover: { background: colors.signalDark, border: `1px solid ${colors.signalDark}` },
  },
  secondary: {
    base: { background: colors.white, color: colors.text, border: `1px solid ${colors.line}` },
    hover: { background: colors.paper, border: `1px solid ${colors.lineStrong}` },
  },
  ghost: {
    base: { background: 'transparent', color: colors.text, border: '1px solid transparent' },
    hover: { background: colors.hover },
  },
  danger: {
    base: { background: colors.white, color: colors.red, border: `1px solid ${colors.redLine}` },
    hover: { background: colors.redSoft },
  },
  onDark: {
    base: { background: 'transparent', color: colors.white, border: '1px solid rgba(255,255,255,0.28)' },
    hover: { background: 'rgba(255,255,255,0.08)' },
  },
};

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const v = variants[variant] || variants.primary;
  const isDisabled = disabled || loading;

  const buttonProps = Tag === 'button' ? { type: rest.type || 'button', disabled: isDisabled } : {};

  return (
    <Tag
      {...rest}
      {...buttonProps}
      aria-busy={loading || undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: radius.md,
        fontWeight: 600,
        lineHeight: 1,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s, border-color 0.15s, opacity 0.15s',
        width: fullWidth ? '100%' : undefined,
        opacity: isDisabled ? 0.55 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        ...sizes[size],
        ...v.base,
        ...(hover && !isDisabled ? v.hover : {}),
        ...style,
      }}
    >
      {loading && (
        <span
          aria-hidden="true"
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            animation: 'sn-spin 0.7s linear infinite',
          }}
        />
      )}
      {children}
    </Tag>
  );
}