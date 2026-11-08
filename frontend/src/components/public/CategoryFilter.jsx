// ============================================================
// components/public/CategoryFilter.jsx
// Row of pill buttons: All / New / Improved / Fixed, with counts.
// The selected pill uses the product's accent colour.
// Props: value, onChange(newValue), accent, counts ({ all, new, improved, fixed })
// ============================================================
import { colors, radius } from '../../theme/tokens';

const options = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'improved', label: 'Improved' },
  { value: 'fixed', label: 'Fixed' },
];

export default function CategoryFilter({ value, onChange, accent, counts }) {
  return (
    <div role="tablist" aria-label="Filter by category" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            style={{
              minHeight: 38,
              padding: '0 14px',
              borderRadius: radius.pill,
              border: `1px solid ${active ? accent : colors.line}`,
              background: active ? accent : colors.white,
              color: active ? colors.white : colors.text,
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {o.label} · {counts[o.value]}
          </button>
        );
      })}
    </div>
  );
}