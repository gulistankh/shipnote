// ============================================================
// context/DataContext.jsx
// REAL data for the logged-in app, loaded from the API:
//   products, ALL their updates, and the plan usage.
// While loading it shows a spinner (so pages can assume data exists);
// if loading fails it shows a "Try again" button.
// Every action below calls the server. The server enforces the plan
// limits: when one is hit, the action THROWS an ApiError with
// code 'PLAN_LIMIT' (and kind 'updates' | 'products' | 'accent').
//
// Provides:
//   products, activeProduct, activeId, setActiveId
//   updates (all), productUpdates (active product only)
//   usage { published, maxPublished, products, maxProducts }  (Infinity = unlimited)
//   createUpdate, saveUpdate, setStatus, deleteUpdate
//   createProduct, updateProduct, reload
// ============================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, api, normalizeUsage } from '../api/client';
import { useAuth } from './AuthContext';
import Button from '../components/ui/Button';
import { colors } from '../theme/tokens';

const DataContext = createContext(null);
const ACTIVE_KEY = 'shipnote_active_product';

// --- Remember the selected product for this browser tab ---
function readActive() {
  try {
    return sessionStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}
function writeActive(id) {
  try {
    sessionStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* storage unavailable: the choice just will not be remembered */
  }
}

// --- Full-page states while loading / on error ---
function Centered({ children }) {
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
      {children}
    </div>
  );
}

function DataStore({ children }) {
  const { refresh } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [data, setData] = useState({ products: [], updates: [], usage: null });
  const [activeId, setActiveIdState] = useState(readActive);

  // --- Load products, their updates and usage. silent = no spinner (used after billing) ---
  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setStatus('loading');
      try {
        const me = await api('/me');
        const lists = await Promise.all(me.products.map((p) => api(`/products/${p.id}/updates`)));
        setData({
          products: me.products,
          updates: lists.flatMap((l) => l.updates),
          usage: normalizeUsage(me.usage),
        });
        setStatus('ready');
      } catch (err) {
        if (err.status === 401) refresh(); // login expired: the app goes back to /login
        else if (!silent) setStatus('error');
      }
    },
    [refresh]
  );

  useEffect(() => {
    load();
  }, [load]);

  // --- Run an API call; an expired login (401) sends the user to /login ---
  const call = useCallback(
    async (path, options) => {
      try {
        return await api(path, options);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) refresh();
        throw err;
      }
    },
    [refresh]
  );

  // --- Active product ---
  const activeProduct = data.products.find((p) => p.id === activeId) || data.products[0] || null;

  const setActiveId = useCallback((id) => {
    setActiveIdState(id);
    writeActive(id);
  }, []);

  // --- Updates ---
  const createUpdate = useCallback(
    async (payload) => {
      const res = await call(`/products/${activeProduct.id}/updates`, { method: 'POST', body: payload });
      setData((d) => ({ ...d, updates: [res.update, ...d.updates], usage: normalizeUsage(res.usage) }));
      return res.update;
    },
    [call, activeProduct]
  );

  const saveUpdate = useCallback(
    async (id, patch) => {
      const res = await call(`/updates/${id}`, { method: 'PATCH', body: patch });
      setData((d) => ({
        ...d,
        updates: d.updates.map((u) => (u.id === id ? res.update : u)),
        usage: normalizeUsage(res.usage),
      }));
      return res.update;
    },
    [call]
  );

  const setUpdateStatus = useCallback((id, newStatus) => saveUpdate(id, { status: newStatus }), [saveUpdate]);

  const deleteUpdate = useCallback(
    async (id) => {
      const res = await call(`/updates/${id}`, { method: 'DELETE' });
      setData((d) => ({ ...d, updates: d.updates.filter((u) => u.id !== id), usage: normalizeUsage(res.usage) }));
    },
    [call]
  );

  // --- Products ---
  const createProduct = useCallback(
    async (payload) => {
      const res = await call('/products', { method: 'POST', body: payload });
      setData((d) => ({ ...d, products: [...d.products, res.product], usage: normalizeUsage(res.usage) }));
      setActiveId(res.product.id);
      return res.product;
    },
    [call, setActiveId]
  );

  const updateProduct = useCallback(
    async (id, patch) => {
      const res = await call(`/products/${id}`, { method: 'PATCH', body: patch });
      setData((d) => ({ ...d, products: d.products.map((p) => (p.id === id ? res.product : p)) }));
      return res.product;
    },
    [call]
  );

  const value = useMemo(
    () => ({
      products: data.products,
      activeProduct,
      activeId: activeProduct?.id || null,
      setActiveId,
      updates: data.updates,
      productUpdates: data.updates.filter((u) => u.productId === activeProduct?.id),
      usage: data.usage,
      createUpdate,
      saveUpdate,
      setStatus: setUpdateStatus,
      deleteUpdate,
      createProduct,
      updateProduct,
      reload: () => load({ silent: true }),
    }),
    [data, activeProduct, setActiveId, createUpdate, saveUpdate, setUpdateStatus, deleteUpdate, createProduct, updateProduct, load]
  );

  if (status === 'loading') {
    return (
      <Centered>
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
      </Centered>
    );
  }

  if (status === 'error') {
    return (
      <Centered>
        <p style={{ color: colors.muted }}>We could not load your data.</p>
        <Button onClick={() => load()}>Try again</Button>
      </Centered>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// --- Used in App.jsx. The key reloads everything when a different user logs in ---
export function DataProvider({ children }) {
  const { user } = useAuth();
  return <DataStore key={user?.id}>{children}</DataStore>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}