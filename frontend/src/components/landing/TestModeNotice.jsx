// ============================================================
// components/landing/TestModeNotice.jsx
// The "test mode, no real charges" notice. Shown near pricing
// (and reused later on the checkout / billing page).
// Props: onDark (true on dark backgrounds), compact (shorter text).
// ============================================================
import Badge from '../ui/Badge';
import { colors, radius } from '../../theme/tokens';

export default function TestModeNotice({ onDark = false, compact = false }) {
  return (
    <div
      role="note"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        borderRadius: radius.md,
        background: onDark ? 'rgba(198,244,50,0.1)' : colors.signalSoft,
        border: `1px solid ${onDark ? 'rgba(198,244,50,0.35)' : '#E2F29A'}`,
        color: onDark ? colors.white : colors.text,
        fontSize: 14,
      }}
    >
      <Badge tone="dark" dot={false}>TEST MODE</Badge>
      <span>
        {compact
          ? 'No real charges. Payments run in Stripe test mode.'
          : 'This is a portfolio demo. Payments run in Stripe test mode, so no real charges are ever made. To try checkout, use the test card 4242 4242 4242 4242 with any future date and any CVC.'}
      </span>
    </div>
  );
}