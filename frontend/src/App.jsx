// ============================================================
// App.jsx
// The app's router: maps every URL to a page.
//   Marketing: /  and  /pricing
//   Auth:      /login  /signup  /onboarding
//   App:       /app (dashboard), /app/updates   (more in later batches)
// AuthProvider = who is logged in. DataProvider = products + updates.
// ============================================================
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import MarketingLayout from './components/layout/MarketingLayout';
import AppShell from './components/layout/AppShell';

import Landing from './pages/marketing/Landing';
import Pricing from './pages/marketing/Pricing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Onboarding from './pages/auth/Onboarding';
import Dashboard from './pages/app/Dashboard';
import Updates from './pages/app/Updates';
import UpdateEditor from './pages/app/UpdateEditor';
import Products from './pages/app/Products';
import Billing from './pages/app/Billing';
import Settings from './pages/app/Settings';
import Admin from './pages/admin/Admin';
import NotFound from './pages/public/NotFound';
import PublicPage from './pages/public/PublicPage';

// --- Scrolls to the top (or to a #hash section) on every page change ---
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollManager />
        <Routes>
          {/* Marketing pages share the same nav and footer */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>

          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute allowUnonboarded>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Logged-in app: sidebar shell + pages */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DataProvider>
                  <AppShell />
                </DataProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="updates" element={<Updates />} />
            <Route path="updates/new" element={<UpdateEditor />} />
            <Route path="updates/:id" element={<UpdateEditor />} />
            <Route path="products" element={<Products />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Public "What's new" page (no login needed) */}
          <Route path="/p/:slug" element={<PublicPage />} />

          {/* Public "What's new" page (no login needed) */}
          <Route path="/p/:slug" element={<PublicPage />} />

          {/* Anything else */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}