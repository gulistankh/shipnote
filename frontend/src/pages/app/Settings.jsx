// ============================================================
// pages/app/Settings.jsx   (route: /app/settings)
// Two cards:
//   1) Account (read-only for now): name, email, plan, role
//   2) Product settings: edit the ACTIVE product (name, page name, accent colour)
// ============================================================
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProductForm from '../../components/app/ProductForm';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { colors, radius } from '../../theme/tokens';

// --- One row inside the account card ---
function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, padding: '12px 0', borderBottom: `1px solid ${colors.line}` }}>
      <span style={{ color: colors.muted }}>{label}</span>
      <span style={{ fontWeight: 500, overflowWrap: 'anywhere' }}>{children}</span>
    </div>
  );
}

const card = { background: colors.white, border: `1px solid ${colors.line}`, borderRadius: radius.lg, padding: 22 };

export default function Settings() {
  const { user } = useAuth();
  const { activeProduct, products, updateProduct } = useData();
  const { toast } = useToast();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 34px)' }}>Settings</h1>
        <p style={{ color: colors.muted, marginTop: 4 }}>Manage your account and your public page.</p>
      </div>

      {/* --- Account --- */}
      <section style={card}>
        <h2 style={{ fontSize: 20, marginBottom: 6 }}>Account</h2>
        <Row label="Name">{user.name}</Row>
        <Row label="Email">{user.email}</Row>
        <Row label="Plan">
          <Badge tone={user.plan === 'pro' ? 'dark' : 'neutral'}>{user.plan.toUpperCase()}</Badge>
        </Row>
        <div style={{ marginTop: 16 }}>
          <Button as={Link} to="/app/billing" variant="secondary" size="sm">
            {user.plan === 'pro' ? 'Manage billing' : 'Upgrade to Pro'}
          </Button>
        </div>
      </section>

      {/* --- Active product --- */}
      <section style={card}>
        <h2 style={{ fontSize: 20 }}>Product: {activeProduct.name}</h2>
        <p style={{ color: colors.muted, margin: '6px 0 18px' }}>
          {user.plan === 'pro'
            ? 'Your public page has no Shipnote badge.'
            : 'Your public page shows a small "Made with Shipnote" badge on the Free plan.'}
        </p>
        <ProductForm
          key={activeProduct.id}
          initial={{ name: activeProduct.name, slug: activeProduct.slug, accent: activeProduct.accent }}
          currentSlug={activeProduct.slug}
          otherSlugs={products.filter((p) => p.id !== activeProduct.id).map((p) => p.slug)}
          submitLabel="Save product"
          onSubmit={async (data) => {
            await updateProduct(activeProduct.id, data);
            toast('Product saved');
          }}
        />
      </section>
    </div>
  );
}