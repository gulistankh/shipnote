// ============================================================
// pages/app/Products.jsx   (route: /app/products)
// Lists the user's products with counts, lets them switch the active
// product, edit one, or add a new one. Free plan = 1 product: the SERVER
// refuses a second one (PLAN_LIMIT), and the UI shows the upgrade popup.
// Errors like "page name already taken" show on the form.
// ============================================================
import { useState } from 'react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ProductForm from '../../components/app/ProductForm';
import UpgradeModal from '../../components/app/UpgradeModal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { accentPresets } from '../../data/mockData';
import { colors, fonts, radius } from '../../theme/tokens';

export default function Products() {
  const { products, activeId, setActiveId, updates, usage, createProduct, updateProduct } = useData();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null); // the product being edited
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const atLimit = usage.products >= usage.maxProducts;

  // --- "Add product": upgrade popup if over the limit, otherwise the create modal ---
  function handleAdd() {
    if (atLimit) setUpgradeOpen(true);
    else setCreateOpen(true);
  }

  // --- Create (errors are thrown to the form, except the plan limit) ---
  async function handleCreate(data) {
    try {
      await createProduct(data);
      setCreateOpen(false);
      toast('Product created');
    } catch (err) {
      if (err.code === 'PLAN_LIMIT' && err.kind === 'products') {
        setCreateOpen(false);
        setUpgradeOpen(true);
        return;
      }
      throw err; // ProductForm shows the message
    }
  }

  // --- Edit (errors are thrown to the form) ---
  async function handleEdit(data) {
    await updateProduct(editing.id, data);
    setEditing(null);
    toast('Product saved');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 34px)' }}>Products</h1>
          <p style={{ color: colors.muted, marginTop: 4 }}>
            {usage.maxProducts === Infinity
              ? `${usage.products} products. Unlimited on Pro.`
              : `${usage.products} of ${usage.maxProducts} products used on the Free plan.`}
          </p>
        </div>
        <Button onClick={handleAdd}>+ Add product</Button>
      </div>

      {/* Product cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {products.map((p) => {
          const mine = updates.filter((u) => u.productId === p.id);
          const published = mine.filter((u) => u.status === 'published').length;
          const drafts = mine.length - published;
          const isActive = p.id === activeId;

          return (
            <div
              key={p.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 16,
                padding: 18,
                background: colors.white,
                border: `1px solid ${isActive ? colors.ink : colors.line}`,
                borderRadius: radius.lg,
              }}
            >
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: p.accent, flexShrink: 0 }} />
                  <h3 style={{ fontSize: 20, overflowWrap: 'anywhere' }}>{p.name}</h3>
                  {isActive && <Badge tone="lime">Active</Badge>}
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.muted, marginTop: 6, overflowWrap: 'anywhere' }}>/p/{p.slug}</div>
                <div style={{ fontSize: 14, color: colors.muted, marginTop: 6 }}>
                  {published} published · {drafts} {drafts === 1 ? 'draft' : 'drafts'}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {!isActive && <Button variant="secondary" size="sm" onClick={() => setActiveId(p.id)}>Switch to</Button>}
                <Button variant="secondary" size="sm" onClick={() => setEditing(p)}>Edit</Button>
                <Button as="a" href={`/p/${p.slug}`} target="_blank" rel="noreferrer" variant="ghost" size="sm">View page ↗</Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add a product" width={520}>
        {createOpen && (
          <ProductForm
            initial={{ name: '', slug: '', accent: accentPresets[0].value }}
            otherSlugs={products.map((p) => p.slug)}
            submitLabel="Create product"
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        )}
      </Modal>

      {/* Edit modal */}
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit product" width={520}>
        {editing && (
          <ProductForm
            initial={{ name: editing.name, slug: editing.slug, accent: editing.accent }}
            currentSlug={editing.slug}
            otherSlugs={products.filter((p) => p.id !== editing.id).map((p) => p.slug)}
            submitLabel="Save changes"
            onSubmit={handleEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      {/* Upgrade popup */}
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason="products" />
    </div>
  );
}