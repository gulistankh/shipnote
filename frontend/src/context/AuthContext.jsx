// ============================================================
// context/AuthContext.jsx
// REAL login state, backed by the API and the HttpOnly cookie.
//   On start the app asks GET /api/me: logged in? who?
//   user      -> { id, name, email, role, plan, onboarded, ... } or null
//   loading   -> true until the first /api/me answer arrives
//   product   -> the user's first product (temporary: the mock data store
//                in DataContext still reads it until Batch C2)
// Provides: user, loading, product, products, login, signup, loginDemo,
//           logout, completeOnboarding, refresh
// Login functions THROW an ApiError so the form can show the message.
// ============================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

const LOGGED_OUT = { loading: false, user: null, products: [] };

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, products: [] });

  // --- Ask the server who is logged in ---
  const refresh = useCallback(async () => {
    try {
      const me = await api('/me');
      setState({ loading: false, user: me.user, products: me.products });
    } catch (err) {
      // 401 = not logged in. Any other error: show the logged-out screens.
      setState(LOGGED_OUT);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // --- Log in / sign up / demo: the server sets the cookie, then we reload /me ---
  const login = useCallback(
    async (email, password) => {
      await api('/auth/login', { method: 'POST', body: { email, password } });
      await refresh();
    },
    [refresh]
  );

  const signup = useCallback(
    async (name, email, password) => {
      await api('/auth/signup', { method: 'POST', body: { name, email, password } });
      await refresh();
    },
    [refresh]
  );

  const loginDemo = useCallback(
    async (kind) => {
      await api('/auth/demo', { method: 'POST', body: { kind } });
      await refresh();
    },
    [refresh]
  );

  // --- Log out ---
  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      /* even if the request fails, leave the app */
    }
    setState(LOGGED_OUT);
  }, []);

  // --- Finish onboarding: creates the first product on the server ---
  const completeOnboarding = useCallback(async ({ name, slug, accent }) => {
    const data = await api('/onboarding', { method: 'POST', body: { name, slug, accent } });
    setState({ loading: false, user: data.user, products: [data.product] });
  }, []);

  const value = useMemo(
    () => ({
      user: state.user,
      loading: state.loading,
      products: state.products,
      product: state.products[0] || null,
      login,
      signup,
      loginDemo,
      logout,
      completeOnboarding,
      refresh,
    }),
    [state, login, signup, loginDemo, logout, completeOnboarding, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}