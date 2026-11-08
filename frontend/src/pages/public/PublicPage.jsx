// ============================================================
// pages/public/PublicPage.jsx   (route: /p/:slug)
// The public "What's new" page for one product. No login needed.
// Loads from the API: GET /api/public/:slug
//   - unknown page name -> the 404 page
//   - search box + category filter (done in the browser)
//   - list of PUBLISHED updates, newest first
//   - "Made with Shipnote" badge only when the server says so (Free plan)
// ============================================================
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PublicHeader from '../../components/public/PublicHeader';
import CategoryFilter from '../../components/public/CategoryFilter';
import UpdateEntry from '../../components/public/UpdateEntry';
import MadeWithBadge from '../../components/public/MadeWithBadge';
import NotFound from './NotFound';
import { api } from '../../api/client';
import { colors } from '../../theme/tokens';

export default function PublicPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: 'loading', page: null }); // loading | ready | notfound | error
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  // --- Load the page data from the server ---
  const load = useCallback(async () => {
    setState({ status: 'loading', page: null });
    try {
      const page = await api(`/public/${encodeURIComponent(slug)}`);
      setState({ status: 'ready', page });
    } catch (err) {
      setState({ status: err.status === 404 ? 'notfound' : 'error', page: null });
    }
  }, [slug]);

  useEffect(() => {
    setSearch('');
    setCategory('all');
    load();
  }, [load]);

  // --- Browser tab title ---
  const productName = state.page?.product.name;
  useEffect(() => {
    if (!productName) return undefined;
    const previous = document.title;
    document.title = `${productName}: What's new`;
    return () => {
      document.title = previous;
    };
  }, [productName]);

  // --- Loading ---
  if (state.status === 'loading') {
    return (
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: colors.white }}>
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

  // --- Unknown page name ---
  if (state.status === 'notfound') return <NotFound />;

  // --- Server or network problem ---
  if (state.status === 'error') {
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
        }}
      >
        <p style={{ color: colors.muted }}>We could not load this page right now.</p>
        <Button onClick={load}>Try again</Button>
      </div>
    );
  }

  const { product, showBadge, updates } = state.page;

  // --- Counts for the filter pills ---
  const counts = {
    all: updates.length,
    new: updates.filter((u) => u.category === 'new').length,
    improved: updates.filter((u) => u.category === 'improved').length,
    fixed: updates.filter((u) => u.category === 'fixed').length,
  };

  // --- Apply search + category (the server already sends newest first) ---
  const q = search.trim().toLowerCase();
  const visible = updates
    .filter((u) => category === 'all' || u.category === category)
    .filter((u) => !q || u.title.toLowerCase().includes(q) || u.body.toLowerCase().includes(q));

  return (
    <div style={{ minHeight: '100dvh', background: colors.white, display: 'flex', flexDirection: 'column' }}>
      <PublicHeader product={product} />

      <main style={{ flex: 1, width: '100%', maxWidth: 720, margin: '0 auto', padding: '28px 20px 48px' }}>
        {/* Search + filter */}
        {updates.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              type="search"
              aria-label="Search updates"
              placeholder="Search updates"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <CategoryFilter value={category} onChange={setCategory} accent={product.accent} counts={counts} />
          </div>
        )}

        {/* List / empty states */}
        <div style={{ marginTop: 12 }}>
          {updates.length === 0 ? (
            <p style={{ color: colors.muted, padding: '48px 0', textAlign: 'center' }}>
              No updates yet. Check back soon.
            </p>
          ) : visible.length === 0 ? (
            <p style={{ color: colors.muted, padding: '48px 0', textAlign: 'center' }}>
              No updates match your search.
            </p>
          ) : (
            visible.map((u) => <UpdateEntry key={u.id} update={u} accent={product.accent} />)
          )}
        </div>
      </main>

      {/* Free plan badge (the server decides) */}
      {showBadge && (
        <footer style={{ display: 'flex', justifyContent: 'center', padding: '0 20px calc(32px + env(safe-area-inset-bottom))' }}>
          <MadeWithBadge />
        </footer>
      )}
    </div>
  );
}