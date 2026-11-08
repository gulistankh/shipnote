// ============================================================
// components/public/MadeWithBadge.jsx
// The "Made with Shipnote" badge shown at the bottom of public pages
// of FREE accounts. Links back to the landing page. Pro pages hide it.
// ============================================================
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import { colors, radius } from '../../theme/tokens';

export default function MadeWithBadge() {
  return (
    <Link
      to="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 14px',
        border: `1px solid ${colors.line}`,
        borderRadius: radius.pill,
        background: colors.white,
        textDecoration: 'none',
        color: colors.muted,
        fontSize: 13,
      }}
    >
      Made with <Logo size={20} />
    </Link>
  );
}