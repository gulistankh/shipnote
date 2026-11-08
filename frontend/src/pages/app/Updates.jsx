// ============================================================
// pages/app/Updates.jsx   (route: /app/updates)
// All updates of the active product, with:
//   - search box, status tabs (All / Published / Drafts), category filter
//   - per-update menu: Edit, Publish / Unpublish, Delete
//   - delete confirmation modal
//   - upgrade popup when the SERVER refuses a publish (plan limit)
// ============================================================
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import PlanBanner from '../../components/app/PlanBanner';
import UpdateCard from '../../components/app/UpdateCard';
import UpgradeModal from '../../components/app/UpgradeModal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import { colors, radius } from '../../theme/tokens';

export default function Updates() {
  const { productUpdates, setStatus, deleteUpdate, activeProduct } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 639px)');

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all'); // all | published | draft
  const [category, setCategory] = useState('all');
  const [toDelete, setToDelete] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // --- Counts for the tabs ---
  const counts = {
    all: productUpdates.length,
    published: productUpdates.filter((u) => u.status === 'published').length,
    draft: productUpdates.filter((u) => u.status === 'draft').length,
  };

  // --- Apply search + filters, newest first ---
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productUpdates
      .filter((u) => (tab === 'all' ? true : u.status === tab))
      .filter((u) => (category === 'all' ? true : u.category === category))
      .filter((u) => !q || u.title.toLowerCase().includes(q) || u.body.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [productUpdates, search, tab, category]);

  // --- Publish / unpublish (the server decides; over the limit -> upgrade popup) ---
  async function handleToggleStatus(update) {
    const next = update.status === 'published' ? 'draft' : 'published';
    try {
      await setStatus(update.id, next);
      toast(next === 'published' ? 'Update published' : 'Moved back to drafts', 'success');
    } catch (err) {
      if (err.code === 'PLAN_LIMIT') setUpgradeOpen(true);
      else toast(err.message, 'error');
    }
  }

  // --- Confirm delete ---
  async function confirmDelete() {
    try {
      await deleteUpdate(toDelete.id);
      toast('Update deleted', 'error');
    } catch (err) {
      toast(err.message, 'error');
    }
    setToDelete(null);
  }

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'published', label: 'Published' },
    { id: 'draft', label: 'Drafts' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 34px)' }}>Updates</h1>
          <p style={{ color: colors.muted, marginTop: 4 }}>Everything you have written for {activeProduct.name}.</p>
        </div>
        <Button as={Link} to="/app/updates/new" variant="primary">+ New update</Button>
      </div>

      <PlanBanner />

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, alignItems: isMobile ? 'stretch' : 'center' }}>
        <Input
          type="search"
          aria-label="Search updates"
          placeholder="Search updates"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          wrapperStyle={{ flex: 1 }}
        />
        <Select
          ariaLabel="Filter by category"
          value={category}
          onChange={setCategory}
          options={[
            { value: 'all', label: 'All categories' },
            { value: 'new', label: 'New' },
            { value: 'improved', label: 'Improved' },
            { value: 'fixed', label: 'Fixed' },
          ]}
          wrapperStyle={{ width: isMobile ? '100%' : 200 }}
        />
      </div>

      {/* Status tabs */}
      <div role="tablist" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              style={{
                minHeight: 38,
                padding: '0 14px',
                borderRadius: radius.pill,
                border: `1px solid ${active ? colors.ink : colors.line}`,
                background: active ? colors.ink : colors.white,
                color: active ? colors.white : colors.text,
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              {t.label} · {counts[t.id]}
            </button>
          );
        })}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <EmptyState
          title={productUpdates.length === 0 ? 'No updates yet' : 'Nothing matches'}
          text={productUpdates.length === 0 ? 'Write your first update to get started.' : 'Try a different search or filter.'}
          action={productUpdates.length === 0 ? <Button as={Link} to="/app/updates/new">Write an update</Button> : null}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map((u) => (
            <UpdateCard
              key={u.id}
              update={u}
              onEdit={(item) => navigate(`/app/updates/${item.id}`)}
              onToggleStatus={handleToggleStatus}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete this update?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
            <Button variant="primary" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p style={{ color: colors.muted }}>
          "{toDelete?.title}" will be removed from your public page. This cannot be undone.
        </p>
      </Modal>

      {/* Upgrade popup */}
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason="updates" />
    </div>
  );
}