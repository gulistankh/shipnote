import { useId, useState } from 'react';
import { colors, radius } from '../../theme/tokens';

export default function Input({
  label,
  hint,
  error,
  as: Field = 'input',
  children,
  id,
  style,
  wrapperStyle,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const autoId = useId();
  const fieldId = id || autoId;

  const borderColor = error ? colors.red : focus ? colors.ink : colors.line;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...wrapperStyle }}>
      {label && (
        <label htmlFor={fieldId} style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>
          {label}
        </label>
      )}
      <Field
        id={fieldId}
        {...rest}
        onFocus={(e) => {
          setFocus(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          rest.onBlur?.(e);
        }}
        aria-invalid={error ? true : undefined}
        style={{
          width: '100%',
          minHeight: 46,
          padding: Field === 'textarea' ? '12px 14px' : '0 14px',
          fontSize: 16,
          background: colors.white,
          color: colors.text,
          border: `1px solid ${borderColor}`,
          borderRadius: radius.md,
          outline: 'none',
          boxShadow: focus && !error ? `0 0 0 3px ${colors.signalSoft}` : 'none',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          resize: Field === 'textarea' ? 'vertical' : undefined,
          minHeight: Field === 'textarea' ? 140 : 46,
          ...style,
        }}
      >
        {children}
      </Field>
      {error ? (
        <span style={{ fontSize: 13, color: colors.red }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 13, color: colors.muted }}>{hint}</span>
      ) : null}
    </div>
  );
}