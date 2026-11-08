// ============================================================
// components/layout/ProtectedRoute.jsx
// Guards pages that need a logged-in user. Rules, in order:
//   0) still asking the server who is logged in -> show a spinner
//   1) not logged in                  -> /login
//   2) logged in but not onboarded    -> /onboarding (unless this IS onboarding)
//   3) onboarded user on /onboarding  -> /app
//   4) adminOnly page, user not admin -> /app
// NOTE: this only decides what to SHOW. The server checks permissions again.
// ============================================================
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/tokens';

function FullPageSpinner() {
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: colors.paper }}>
      <span
        role="status"
        aria-label="Loading"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: `3px solid ${colors.line}`,
          borderTopColor: colors.ink,
          animation: 'sn-spin 0.7s linear infinite',
        }}
      />
    </div>
  );
}

export default function ProtectedRoute({ children, adminOnly = false, allowUnonboarded = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!allowUnonboarded && !user.onboarded) return <Navigate to="/onboarding" replace />;
  if (allowUnonboarded && user.onboarded) return <Navigate to="/app" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/app" replace />;

  return children;
}