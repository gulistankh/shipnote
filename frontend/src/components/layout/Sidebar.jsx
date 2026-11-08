// ============================================================
// components/layout/Sidebar.jsx
// The sidebar content: logo, product switcher, navigation links,
// public page link, and the user block (name, plan, log out).
// Used twice by AppShell: fixed on desktop, inside a drawer on phones.
// Prop: onNavigate (called after a click, used to close the drawer)
// ============================================================
import { Link, NavLink } from 'react-router-dom';
import Logo from '../ui/Logo';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ProductSwitcher from '../app/ProductSwitcher';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { colors, radius } from '../../theme/tokens';

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const { activeProduct } = useData();

  // --- Navigation links (admin gets one extra) ---
  const navItems = [
    { label: 'Dashboard', to: '/app', end: true, icon: '▦' },
    { label: 'Updates', to: '/app/updates', icon: '✎' },
    { label: 'Products', to: '/app/products', icon: '◎' },
    { label: 'Billing', to: '/app/billing', icon: '$' },
    { label: 'Settings', to: '/app/settings', icon: '⚙' },
  ];
  if (user.role === 'admin') navItems.push({ label: 'Admin', to: '/app/admin', icon: '★' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%', padding: 16, overflowY: 'auto' }}>
      {/* Logo */}
      <Link to="/" onClick={onNavigate} style={{ textDecoration: 'none', padding: '4px 4px 0' }} aria-label="Shipnote home">
        <Logo />
      </Link>

      {/* Product switcher */}
      <ProductSwitcher onNavigate={onNavigate} />

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 12px',
              borderRadius: radius.md,
              textDecoration: 'none',
              fontSize: 15,
              fontWeight: 500,
              color: isActive ? colors.white : colors.text,
              background: isActive ? colors.ink : 'transparent',
            })}
          >
            <span aria-hidden="true" style={{ width: 18, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Public page link */}
      {activeProduct && (
        <a
          href={`/p/${activeProduct.slug}`}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 14, color: colors.muted, padding: '0 12px', overflowWrap: 'anywhere' }}
        >
          View public page ↗
        </a>
      )}

      {/* Spacer pushes the user block to the bottom */}
      <div style={{ flex: 1 }} />

      {/* User block */}
      <div style={{ padding: 14, background: colors.paper, border: `1px solid ${colors.line}`, borderRadius: radius.md, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
          <div style={{ fontSize: 13, color: colors.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Badge tone={user.plan === 'pro' ? 'dark' : 'neutral'}>{user.plan.toUpperCase()}</Badge>
          {user.role === 'admin' && <Badge tone="lime">ADMIN</Badge>}
        </div>
        <Button variant="secondary" size="sm" fullWidth onClick={logout}>Log out</Button>
      </div>
    </div>
  );
}