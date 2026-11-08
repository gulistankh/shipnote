// ============================================================
// pages/app/Dashboard.jsx   (route: /app)
// Overview: greeting, plan usage banner, three stat cards,
// the public page link (copy + view), and the 3 latest updates.
// ============================================================
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import PlanBanner from '../../components/app/PlanBanner';
import UpdateCard from '../../components/app/UpdateCard';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import { colors, fonts, radius } from '../../theme/tokens';

// --- One small number card ---
function Stat({ label, value, note }) {
  return (
    <div style={{ padding: 18, background: colors.white, border: `1px solid ${colors.line}`, borderRadius: radius.lg }}>
      <div style={{ fontSize: 13, color: colors.muted }}>{label}</div>
      <div style={{ fontFamily: fonts.heading, fontSize: 34, fontWeight: 700, marginTop: 4 }}>{value}</div>
      {note && <div style={{ fontSize: 13, color: colors.faint }}>{note}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { activeProduct, productUpdates, usage } = useData();
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 639px)');

  const published = productUpdates.filter((u) => u.status === 'published');
  const drafts = productUpdates.filter((u) => u.status === 'draft');
  const latest = [...productUpdates].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const pageUrl = `${window.location.origin}/p/${activeProduct.slug}`;

  // --- Copy the public link ---
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast('Link copied');
    } catch {
      toast('Could not copy. Select the link and copy it.', 'error');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 34px)' }}>Hello, {user.name.split(' ')[0]}</h1>
          <p style={{ color: colors.muted, marginTop: 4 }}>Here is how {activeProduct.name} is doing.</p>
        </div>
        <Button as={Link} to="/app/updates/new" variant="primary">+ New update</Button>
      </div>

      {/* Plan usage (Free only) */}
      <PlanBanner />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 12 }}>
        <Stat
          label="Published"
          value={published.length}
          note={usage.maxPublished === Infinity ? 'Unlimited on Pro' : `${usage.published} of ${usage.maxPublished} total used`}
        />
        <Stat label="Drafts" value={drafts.length} note="Not public yet" />
        <div style={{ gridColumn: isMobile ? 'span 2' : 'auto' }}>
          <Stat label="Plan" value={user.plan === 'pro' ? 'Pro' : 'Free'} note={user.plan === 'pro' ? 'All features unlocked' : 'Upgrade any time'} />
        </div>
      </div>

      {/* Public page link */}
      <div style={{ padding: 20, background: colors.ink, color: colors.white, borderRadius: radius.lg, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Your public page</div>
        <div style={{ fontFamily: fonts.mono, fontSize: 14, color: colors.signal, overflowWrap: 'anywhere' }}>{pageUrl}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Button variant="signal" size="sm" onClick={copyLink}>Copy link</Button>
          <Button as="a" href={`/p/${activeProduct.slug}`} target="_blank" rel="noreferrer" variant="onDark" size="sm">View page ↗</Button>
        </div>
      </div>

      {/* Latest updates */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h2 style={{ fontSize: 22 }}>Latest updates</h2>
          <Link to="/app/updates" style={{ color: colors.text, fontSize: 14, fontWeight: 600 }}>View all</Link>
        </div>
        {latest.length === 0 ? (
          <EmptyState
            title="No updates yet"
            text="Write your first update and it will show up on your public page once published."
            action={<Button as={Link} to="/app/updates/new">Write an update</Button>}
          />
        ) : (
          latest.map((u) => <UpdateCard key={u.id} update={u} />)
        )}
      </section>
    </div>
  );
}