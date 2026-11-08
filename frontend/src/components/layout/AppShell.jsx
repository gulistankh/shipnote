// ============================================================
// components/layout/AppShell.jsx
// Frame for every logged-in page (route /app and children).
// Desktop: fixed sidebar on the left, page content on the right.
// Phone: top bar with a menu button; the sidebar opens as a drawer
// rendered through a Portal so it is never clipped.
// ============================================================
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Logo from '../ui/Logo';
import Portal from '../ui/Portal';
import useMediaQuery from '../../hooks/useMediaQuery';
import { colors, z } from '../../theme/tokens';

const SIDEBAR_WIDTH = 264;

export default function AppShell() {
  const isMobile = useMediaQuery('(max-width: 899px)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close the drawer on page change or when the screen becomes large
  useEffect(() => setDrawerOpen(false), [location.pathname]);
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  // While the drawer is open: Esc closes it and the page behind cannot scroll
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <div style={{ minHeight: '100dvh', display: isMobile ? 'block' : 'flex', background: colors.paper }}>
      {/* --- Desktop sidebar --- */}
      {!isMobile && (
        <aside
          style={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100dvh',
            background: colors.white,
            borderRight: `1px solid ${colors.line}`,
          }}
        >
          <Sidebar />
        </aside>
      )}

      {/* --- Phone top bar --- */}
      {isMobile && (
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'calc(8px + env(safe-area-inset-top)) 16px 8px',
            background: colors.white,
            borderBottom: `1px solid ${colors.line}`,
          }}
        >
          <Logo />
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            style={{ width: 44, height: 44, border: `1px solid ${colors.line}`, borderRadius: 12, background: colors.white, fontSize: 20 }}
          >
            ☰
          </button>
        </header>
      )}

      {/* --- Page content --- */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '24px 16px 56px' : '40px 32px 64px' }}>
          <Outlet />
        </div>
      </main>

      {/* --- Phone drawer (portal on document.body) --- */}
      {isMobile && drawerOpen && (
        <Portal>
          <div
            onMouseDown={(e) => e.target === e.currentTarget && setDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, height: '100dvh', zIndex: z.modal, background: 'rgba(14,17,22,0.55)', animation: 'sn-fade 0.15s ease-out' }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              style={{
                width: `min(${SIDEBAR_WIDTH}px, 85vw)`,
                height: '100dvh',
                background: colors.white,
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                animation: 'sn-rise 0.2s ease-out',
              }}
            >
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}