// ============================================================
// components/layout/MarketingLayout.jsx
// Wrapper for marketing pages: nav on top, page in the middle, footer below.
// Used by the router in App.jsx.
// ============================================================
import { Outlet } from 'react-router-dom';
import MarketingNav from './MarketingNav';
import Footer from './Footer';

export default function MarketingLayout() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <MarketingNav />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}