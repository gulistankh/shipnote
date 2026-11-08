// ============================================================
// components/ui/Select.jsx
// A styled replacement for the browser's <select>.
// The menu is our portal Dropdown, so it matches the app and is
// never cut off on phones. It measures its own width so the menu
// is exactly as wide as the button.
// Props:
//   value, onChange(newValue)  -> controlled value
//   options: [{ value, label }]
//   label (optional), hint (optional), ariaLabel (when there is no label)
//   wrapperStyle (optional)
// ============================================================
import { useId, useLayoutEffect, useRef, useState } from 'react';
import Dropdown from './Dropdown';
import { colors, radius } from '../../theme/tokens';

export default function Select({ value, onChange, options, label, hint, ariaLabel, wrapperStyle }) {
  const id = useId();
  const boxRef = useRef(null);
  const [width, setWidth] = useState(200);

  // --- Keep the menu width equal to the button width ---
  useLayoutEffect(() => {
    const measure = () => {
      if (boxRef.current) setWidth(boxRef.current.getBoundingClientRect().width);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const current = options.find((o) => o.value === value) || options[0];

  // --- Menu items (the selected one gets a check mark) ---
  const items = options.map((o) => ({
    label: `${o.value === value ? '✓ ' : '\u00A0\u00A0\u00A0'}${o.label}`,
    onClick: () => onChange(o.value),
  }));

  return (
    <div ref={boxRef} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...wrapperStyle }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>
          {label}
        </label>
      )}

      <Dropdown
        fullWidth
        align="left"
        width={width}
        items={items}
        trigger={
          <button
            id={id}
            type="button"
            aria-label={label ? undefined : ariaLabel}
            aria-haspopup="menu"
            style={{
              width: '100%',
              minHeight: 46,
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              background: colors.white,
              border: `1px solid ${colors.line}`,
              borderRadius: radius.md,
              fontSize: 16,
              color: colors.text,
              textAlign: 'left',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current?.label}</span>
            <span aria-hidden="true" style={{ color: colors.muted, fontSize: 12 }}>▾</span>
          </button>
        }
      />

      {hint && <span style={{ fontSize: 13, color: colors.muted }}>{hint}</span>}
    </div>
  );
}