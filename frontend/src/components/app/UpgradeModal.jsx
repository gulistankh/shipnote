// ============================================================
// components/app/UpgradeModal.jsx
// "Upgrade to Pro" popup. Opened when a Free user hits a plan limit
// or clicks an upgrade button.
// Props: open, onClose, reason ('updates' | 'products' | 'general')
// The button goes to /app/billing (built with the Stripe step).
// ============================================================
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import TestModeNotice from '../landing/TestModeNotice';
import { colors } from '../../theme/tokens';

const messages = {
  updates: 'You have reached the Free limit of 5 published updates.',
  products: 'The Free plan includes 1 product.',
  general: 'Unlock everything Shipnote can do.',
};

const perks = ['Unlimited products', 'Unlimited published updates', 'Custom accent colour', 'No "Made with Shipnote" badge'];

export default function UpgradeModal({ open, onClose, reason = 'general' }) {
  const navigate = useNavigate();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upgrade to Pro"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Not now</Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              navigate('/app/billing');
            }}
          >
            See Pro plan · $12/mo
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontWeight: 600 }}>{messages[reason] || messages.general}</p>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {perks.map((p) => (
            <li key={p} style={{ display: 'flex', gap: 10 }}>
              <span style={{ color: colors.greenText, fontWeight: 700 }}>✓</span>
              {p}
            </li>
          ))}
        </ul>
        <TestModeNotice compact />
      </div>
    </Modal>
  );
}