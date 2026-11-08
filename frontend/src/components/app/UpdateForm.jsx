// ============================================================
// components/app/UpdateForm.jsx
// The form + live preview used by the editor page.
// Fields: title, category, date, body.
// Buttons depend on the update's state (the "mode" prop):
//   new / draft -> [Save draft] [Publish]
//   published   -> [Save changes] [Move to drafts]
// Props:
//   initial   -> { title, body, category, date }
//   mode      -> 'new' | 'draft' | 'published'
//   onSubmit  -> called with { title, body, category, date, status }
//   onCancel  -> called when the user clicks Cancel
// ============================================================
import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Badge from '../ui/Badge';
import { useData } from '../../context/DataContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import { formatDate } from '../../utils/dates';
import { colors, fonts, radius } from '../../theme/tokens';

const TITLE_MAX = 80;
const BODY_MAX = 1000;

const categoryOptions = [
  { value: 'new', label: 'New' },
  { value: 'improved', label: 'Improved' },
  { value: 'fixed', label: 'Fixed' },
];

// --- Live preview: how the update will look on the public page ---
function UpdatePreview({ title, body, category, date }) {
  const { activeProduct } = useData();

  return (
    <div style={{ background: colors.white, border: `1px solid ${colors.line}`, borderRadius: radius.lg, overflow: 'hidden' }}>
      <div style={{ height: 6, background: activeProduct.accent }} />
      <div style={{ padding: 20 }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.faint, overflowWrap: 'anywhere' }}>
          /p/{activeProduct.slug}
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <Badge category={category} />
          <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.faint }}>{formatDate(date)}</span>
        </div>
        <h3 style={{ fontSize: 22, marginTop: 10, overflowWrap: 'anywhere' }}>
          {title.trim() || 'Your update title'}
        </h3>
        <p style={{ color: colors.muted, marginTop: 6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {body.trim() || 'What changed? Write a short, clear note for your customers.'}
        </p>
      </div>
    </div>
  );
}

export default function UpdateForm({ initial, mode, onSubmit, onCancel }) {
  const isMobile = useMediaQuery('(max-width: 899px)');
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [category, setCategory] = useState(initial.category);
  const [date, setDate] = useState(initial.date);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState('');

  // --- Validate, then send the data to the page with the chosen status ---
  async function submit(status) {
    const next = {};
    if (title.trim().length < 3) next.title = 'Write a title (at least 3 characters).';
    if (body.trim().length < 10) next.body = 'Add a short description (at least 10 characters).';
    if (!date) next.date = 'Choose a date.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(status);
    await onSubmit({ title: title.trim(), body: body.trim(), category, date, status });
    setBusy('');
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
        gap: isMobile ? 28 : 40,
        alignItems: 'start',
      }}
    >
      {/* --- Left: the form --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Input
          label="Title"
          placeholder="e.g. Team workspaces are here"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          hint={`${title.length}/${TITLE_MAX}`}
        />

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          <Select label="Category" value={category} onChange={setCategory} options={categoryOptions} />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
        </div>

        <Input
          label="Description"
          as="textarea"
          placeholder="What changed and why it matters to your customers."
          value={body}
          maxLength={BODY_MAX}
          onChange={(e) => setBody(e.target.value)}
          error={errors.body}
          hint={`${body.length}/${BODY_MAX}`}
          style={{ minHeight: 200 }}
        />

        {/* --- Buttons --- */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 10 }}>
          {mode === 'published' ? (
            <>
              <Button size="lg" loading={busy === 'published'} disabled={Boolean(busy)} onClick={() => submit('published')}>
                Save changes
              </Button>
              <Button variant="secondary" size="lg" loading={busy === 'draft'} disabled={Boolean(busy)} onClick={() => submit('draft')}>
                Move to drafts
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" loading={busy === 'published'} disabled={Boolean(busy)} onClick={() => submit('published')}>
                Publish
              </Button>
              <Button variant="secondary" size="lg" loading={busy === 'draft'} disabled={Boolean(busy)} onClick={() => submit('draft')}>
                Save draft
              </Button>
            </>
          )}
          <Button variant="ghost" size="lg" disabled={Boolean(busy)} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* --- Right: live preview --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.muted }}>LIVE PREVIEW</span>
        <UpdatePreview title={title} body={body} category={category} date={date} />
      </div>
    </div>
  );
}