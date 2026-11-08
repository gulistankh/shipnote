// ============================================================
// pages/admin/Admin.jsx   (route: /app/admin, admin role only)
// Admin view loaded from GET /api/admin/overview:
//   - stat cards: total users, free, Pro, waitlist, test MRR
//   - users table (name, email, plan, role, signup date) with a plan filter
//   - waitlist list
// In the shared DEMO admin, names and emails arrive MASKED from the server.
// On narrow screens the users table scrolls sideways inside its card.
// To make that obvious: a fade + arrow on the right edge, a "swipe" hint,
// and the first column (name) stays pinned while you scroll.
// ============================================================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { api } from '../../api/client';
import { formatDate } from '../../utils/dates';
import useMediaQuery from '../../hooks/useMediaQuery';
import { colors, fonts, radius } from '../../theme/tokens';

const card = { background: colors.white, border: `1px solid ${colors.line}`, borderRadius: radius.lg };
const th = { textAlign: 'left', padding: '12px 16px', fontSize: 12, fontFamily: fonts.mono, color: colors.muted, fontWeight: 500, borderBottom: `1px solid ${colors.line}`, whiteSpace: 'nowrap', background: colors.white };
const td = { padding: '12px 16px', fontSize: 14, borderBottom: `1px solid ${colors.line}`, whiteSpace: 'nowrap', background: colors.white };

// First column stays visible while the rest scrolls sideways
const pinned = { position: 'sticky', left: 0, zIndex: 1 };

// --- One number card ---
function Stat({ label, value }) {
  return (
    <div style={{ ...card, padding: 18 }}>
      <div style={{ fontSize: 13, color: colors.muted }}>{label}</div>
      <div style={{ fontFamily: fonts.heading, fontSize: 30, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}

export default function Admin() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const [state, setState] = useState({ status: 'loading', data: null }); // loading | ready | error
  const [planFilter, setPlanFilter] = useState('all');

  // more = there are columns hidden on the right; scrolled = the user already scrolled sideways
  const scrollRef = useRef(null);
  const [edge, setEdge] = useState({ more: false, scrolled: false });

  // --- Load the overview from the server (admins only) ---
  const load = useCallback(async () => {
    setState({ status: 'loading', data: null });
    try {
      const data = await api('/admin/overview');
      setState({ status: 'ready', data });
    } catch {
      setState({ status: 'error', data: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // --- Filtered users (the server already sends newest first) ---
  const rows = useMemo(() => {
    const users = state.data?.users ?? [];
    return users.filter((u) => planFilter === 'all' || u.plan === planFilter);
  }, [state.data, planFilter]);

  // --- Is there more table to the right of what is visible? ---
  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const more = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setEdge((e) => (e.more === more ? e : { ...e, more }));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, state.status, rows.length]);

  function handleScroll(e) {
    measure();
    if (e.currentTarget.scrollLeft > 8) {
      setEdge((s) => (s.scrolled ? s : { ...s, scrolled: true }));
    }
  }

  if (state.status === 'loading') {
    return <p style={{ color: colors.muted }}>Loading admin data…</p>;
  }

  if (state.status === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <p style={{ color: colors.muted }}>We could not load the admin data.</p>
        <Button onClick={load}>Try again</Button>
      </div>
    );
  }

  const { masked, stats, waitlist } = state.data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 34px)' }}>Admin</h1>
        <p style={{ color: colors.muted, marginTop: 4 }}>Users, plans and the waitlist. Visible to admins only.</p>
      </div>

      {/* Notice in the shared demo admin */}
      {masked && (
        <div
          role="note"
          style={{ padding: '12px 14px', borderRadius: radius.md, background: colors.signalSoft, border: '1px solid #E2F29A', fontSize: 14 }}
        >
          Demo admin: names and emails are masked to protect real visitors' privacy.
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 12 }}>
        <Stat label="Total users" value={stats.totalUsers} />
        <Stat label="Free" value={stats.free} />
        <Stat label="Pro" value={stats.pro} />
        <Stat label="Waitlist" value={stats.waitlist} />
        <div style={{ gridColumn: isMobile ? 'span 2' : 'auto' }}>
          <Stat label="Test MRR" value={`$${stats.testMrr}`} />
        </div>
      </div>

      {/* Users table */}
      <section style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 16 }}>
          <h2 style={{ fontSize: 20 }}>Users</h2>
          <Select
            ariaLabel="Filter users by plan"
            value={planFilter}
            onChange={setPlanFilter}
            options={[
              { value: 'all', label: 'All plans' },
              { value: 'free', label: 'Free' },
              { value: 'pro', label: 'Pro' },
            ]}
            wrapperStyle={{ width: isMobile ? '100%' : 180 }}
          />
        </div>

        {/* Hint: only while columns are hidden and the user has not scrolled yet */}
        {edge.more && !edge.scrolled && (
          <p style={{ padding: '0 16px 12px', fontSize: 13, color: colors.muted }}>
            Swipe sideways to see more columns →
          </p>
        )}

        {/* The table scrolls sideways inside this box. The fade + arrow shows there is more. */}
        <div style={{ position: 'relative' }}>
          <div ref={scrollRef} onScroll={handleScroll} style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 680, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...th, ...pinned }}>NAME</th>
                  <th style={th}>EMAIL</th>
                  <th style={th}>PLAN</th>
                  <th style={th}>ROLE</th>
                  <th style={th}>SIGNED UP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td style={{ ...td, ...pinned, fontWeight: 500 }}>
                      {u.name} {u.isDemo && <Badge tone="neutral" dot={false} style={{ marginLeft: 6 }}>demo</Badge>}
                    </td>
                    <td style={{ ...td, color: colors.muted }}>{u.email}</td>
                    <td style={td}><Badge tone={u.plan === 'pro' ? 'dark' : 'neutral'}>{u.plan.toUpperCase()}</Badge></td>
                    <td style={td}>{u.role === 'admin' ? <Badge tone="lime">ADMIN</Badge> : 'User'}</td>
                    <td style={{ ...td, fontFamily: fonts.mono, fontSize: 13 }}>{formatDate(u.signedUpAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {edge.more && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: 56,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 10,
                fontSize: 26,
                color: colors.muted,
                background: 'linear-gradient(to left, rgba(255,255,255,1) 25%, rgba(255,255,255,0))',
              }}
            >
              ›
            </div>
          )}
        </div>
      </section>

      {/* Waitlist */}
      <section style={{ ...card, padding: 16 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Waitlist ({stats.waitlist})</h2>
        {waitlist.length === 0 && <p style={{ color: colors.muted, fontSize: 14 }}>Nobody has joined yet.</p>}
        {waitlist.map((w, i) => (
          <div
            key={w.id}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 6,
              padding: '12px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${colors.line}`,
              fontSize: 14,
            }}
          >
            <span style={{ overflowWrap: 'anywhere' }}>{w.email}</span>
            <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.muted }}>{formatDate(w.joinedAt)}</span>
          </div>
        ))}
      </section>
    </div>
  );
}