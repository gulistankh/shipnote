// ============================================================
// components/app/ProductSwitcher.jsx
// Dropdown at the top of the sidebar: shows the active product,
// lets the user switch product, or add one (Free users get the upgrade popup).
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../ui/Dropdown';
import UpgradeModal from './UpgradeModal';
import { useData } from '../../context/DataContext';
import { colors, radius } from '../../theme/tokens';

export default function ProductSwitcher({ menuWidth = 232, onNavigate }) {
  const { products, activeProduct, setActiveId, usage } = useData();
  const navigate = useNavigate();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (!activeProduct) return null;

  // --- Menu items: every product, then "Add product" ---
  const items = [
    ...products.map((p) => ({
      label: `${p.id === activeProduct.id ? '✓ ' : ''}${p.name}`,
      onClick: () => {
        setActiveId(p.id);
        onNavigate?.();
      },
    })),
    { divider: true },
    {
      label: '+ Add product',
      onClick: () => {
        if (usage.products >= usage.maxProducts) setUpgradeOpen(true);
        else {
          navigate('/app/products');
          onNavigate?.();
        }
      },
    },
  ];

  return (
    <>
      <Dropdown
        fullWidth
        align="left"
        width={menuWidth}
        items={items}
        trigger={
          <button
            type="button"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: colors.paper,
              border: `1px solid ${colors.line}`,
              borderRadius: radius.md,
              textAlign: 'left',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: activeProduct.accent, flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeProduct.name}
            </span>
            <span style={{ color: colors.muted }}>▾</span>
          </button>
        }
      />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason="products" />
    </>
  );
}