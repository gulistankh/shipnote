// ============================================================
// components/app/PlanBanner.jsx
// Free plan usage card: "X of 5 published updates" + progress bar + Upgrade button.
// Shows nothing for Pro users.
// ============================================================
import { useState } from 'react';
import Button from '../ui/Button';
import UpgradeModal from './UpgradeModal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { colors, radius } from '../../theme/tokens';

export default function PlanBanner() {
  const { user } = useAuth();
  const { usage } = useData();
  const [open, setOpen] = useState(false);

  if (user.plan === 'pro') return null;

  const percent = Math.min(100, (usage.published / usage.maxPublished) * 100);
  const atLimit = usage.published >= usage.maxPublished;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: 20,
        background: colors.white,
        border: `1px solid ${atLimit ? colors.amber : colors.line}`,
        borderRadius: radius.lg,
      }}
    >
      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <div style={{ fontWeight: 600 }}>
          {usage.published} of {usage.maxPublished} published updates used
        </div>
        <div style={{ height: 8, background: colors.hover, borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
          <div style={{ width: `${percent}%`, height: '100%', background: atLimit ? colors.amber : colors.ink, borderRadius: 4 }} />
        </div>
        <p style={{ color: colors.muted, fontSize: 14, marginTop: 8 }}>
          {atLimit
            ? 'You have reached the Free limit. Upgrade to keep publishing.'
            : 'Free plan: 1 product and 5 published updates. Drafts are unlimited.'}
        </p>
      </div>
      <Button variant={atLimit ? 'primary' : 'secondary'} onClick={() => setOpen(true)}>
        Upgrade to Pro
      </Button>
      <UpgradeModal open={open} onClose={() => setOpen(false)} reason={atLimit ? 'updates' : 'general'} />
    </div>
  );
}