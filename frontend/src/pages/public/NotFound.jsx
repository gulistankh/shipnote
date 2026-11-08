// ============================================================
// pages/public/NotFound.jsx
// Shown for any URL that does not match a route.
// Later it is also reused when a public page name does not exist.
// ============================================================
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import { colors } from '../../theme/tokens';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
        background: colors.paper,
      }}
    >
      <Logo />
      <h1 style={{ fontSize: 'clamp(40px, 9vw, 72px)', marginTop: 12 }}>404</h1>
      <p style={{ color: colors.muted, maxWidth: 360 }}>
        We could not find that page. It may have moved, or the address may be wrong.
      </p>
      <Button as={Link} to="/" variant="primary">Back to home</Button>
    </div>
  );
}