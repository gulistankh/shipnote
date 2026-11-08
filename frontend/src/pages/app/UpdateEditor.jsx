// ============================================================
// pages/app/UpdateEditor.jsx
// Routes: /app/updates/new  (create)   and   /app/updates/:id  (edit)
// Loads the update when editing, shows UpdateForm, and saves through
// the data store (the API). If publishing goes over the Free limit, the
// SERVER answers PLAN_LIMIT and we show the upgrade popup instead.
// ============================================================
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import UpdateForm from '../../components/app/UpdateForm';
import UpgradeModal from '../../components/app/UpgradeModal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { todayISO } from '../../utils/dates';
import { colors } from '../../theme/tokens';

export default function UpdateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updates, createUpdate, saveUpdate } = useData();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const editing = Boolean(id);
  const existing = editing ? updates.find((u) => u.id === id) : null;

  // --- Editing an update that does not exist ---
  if (editing && !existing) {
    return (
      <EmptyState
        title="Update not found"
        text="It may have been deleted."
        action={<Button as={Link} to="/app/updates">Back to updates</Button>}
      />
    );
  }

  // --- Starting values for the form ---
  const initial = existing
    ? { title: existing.title, body: existing.body, category: existing.category, date: existing.date }
    : { title: '', body: '', category: 'new', date: todayISO() };
  const mode = existing ? existing.status : 'new';

  // --- Save (create or edit) through the API ---
  async function handleSubmit(data) {
    try {
      if (editing) {
        await saveUpdate(id, data);
        toast(data.status === 'published' ? 'Changes saved' : 'Saved as draft');
      } else {
        await createUpdate(data);
        toast(data.status === 'published' ? 'Update published' : 'Draft saved');
      }
      navigate('/app/updates');
    } catch (err) {
      if (err.code === 'PLAN_LIMIT') setUpgradeOpen(true);
      else toast(err.message, 'error');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <Link to="/app/updates" style={{ color: colors.muted, fontSize: 14, textDecoration: 'none' }}>
          ← Back to updates
        </Link>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 34px)', marginTop: 8 }}>
          {editing ? 'Edit update' : 'New update'}
        </h1>
      </div>

      {/* Form (key resets it when switching between updates) */}
      <UpdateForm
        key={id || 'new'}
        initial={initial}
        mode={mode}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/app/updates')}
      />

      {/* Plan limit popup */}
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason="updates" />
    </div>
  );
}