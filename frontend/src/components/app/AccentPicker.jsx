// ============================================================
// components/app/AccentPicker.jsx
// Accent colour chooser used by ProductForm.
// Everyone gets the 6 preset colours. A custom hex colour is Pro only.
// Props: value (hex), onChange(hex), isPro
// ============================================================
import { useState } from 'react';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { accentPresets } from '../../data/mockData';
import { colors, fonts, radius } from '../../theme/tokens';

const hexPattern = /^#[0-9a-fA-F]{6}$/;

export default function AccentPicker({ value, onChange, isPro }) {
  const [hex, setHex] = useState(value);

  // --- Custom colour (Pro only): only valid hex values are applied ---
  function handleHex(next) {
    setHex(next);
    if (hexPattern.test(next)) onChange(next);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <span style={{ fontSize: 14, fontWeight: 500 }}>Accent colour</span>

      {/* Preset circles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {accentPresets.map((c) => {
          const active = value.toLowerCase() === c.value.toLowerCase();
          return (
            <button
              key={c.value}
              type="button"
              aria-label={c.name}
              aria-pressed={active}
              onClick={() => {
                onChange(c.value);
                setHex(c.value);
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: c.value,
                border: `3px solid ${colors.white}`,
                boxShadow: active ? `0 0 0 2px ${colors.ink}` : `0 0 0 1px ${colors.line}`,
              }}
            />
          );
        })}
      </div>

      {/* Custom colour */}
      <div style={{ padding: 14, border: `1px solid ${colors.line}`, borderRadius: radius.md, background: colors.paper, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <strong style={{ fontSize: 14 }}>Custom colour</strong>
          {!isPro && <Badge tone="dark" dot={false}>PRO</Badge>}
        </div>
        {isPro ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="color"
              aria-label="Pick a colour"
              value={hexPattern.test(hex) ? hex : '#0E1116'}
              onChange={(e) => handleHex(e.target.value)}
              style={{ width: 46, height: 46, border: 'none', background: 'none', padding: 0 }}
            />
            <Input aria-label="Hex colour" value={hex} onChange={(e) => handleHex(e.target.value)} wrapperStyle={{ flex: 1 }} style={{ fontFamily: fonts.mono }} />
          </div>
        ) : (
          <p style={{ color: colors.muted, fontSize: 14 }}>Any brand colour is a Pro feature.</p>
        )}
      </div>
    </div>
  );
}