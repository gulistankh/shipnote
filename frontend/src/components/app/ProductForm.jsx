// ============================================================
// components/app/ProductForm.jsx
// Form to create or edit a product: name, page name (slug), accent colour.
// Used by the Products page (inside a modal) and the Settings page.
// Server errors (page name taken, custom colour needs Pro...) are shown
// right on the form, because onSubmit may THROW an ApiError.
// Props:
//   initial      -> { name, slug, accent }
//   currentSlug  -> the product's existing slug when editing ('' when creating)
//   otherSlugs   -> slugs of the user's OTHER products (to block duplicates)
//   submitLabel  -> text on the save button
//   onSubmit(data), onCancel (optional)
// ============================================================
import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import AccentPicker from './AccentPicker';
import { useAuth } from '../../context/AuthContext';
import { slugify, validateSlug } from '../../utils/slug';
import { colors, radius } from '../../theme/tokens';

export default function ProductForm({ initial, currentSlug = '', otherSlugs = [], submitLabel = 'Save', onSubmit, onCancel }) {
  const { user } = useAuth();
  const isPro = user.plan === 'pro';
  const editing = Boolean(currentSlug);

  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugEdited, setSlugEdited] = useState(editing);
  const [accent, setAccent] = useState(initial.accent);
  const [showErrors, setShowErrors] = useState(false);
  const [server, setServer] = useState({}); // errors that came back from the API
  const [busy, setBusy] = useState(false);

  // --- Page name rules (format, reserved) + not already used by me ---
  const slugError = validateSlug(slug, currentSlug) || (otherSlugs.includes(slug) ? 'You already use this name for another product.' : '');
  const nameError = name.trim().length < 2 ? 'Enter a product name.' : '';

  // --- Typing the name suggests a page name (only for new products) ---
  function handleName(value) {
    setName(value);
    setServer({});
    if (!slugEdited) setSlug(slugify(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setShowErrors(true);
    setServer({});
    if (nameError || slugError) return;

    setBusy(true);
    try {
      await onSubmit({ name: name.trim(), slug, accent });
    } catch (err) {
      if (err.code === 'SLUG_TAKEN') setServer({ slug: err.message });
      else if (err.fields && Object.keys(err.fields).length > 0) setServer(err.fields);
      else setServer({ form: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {server.form && (
        <div
          role="alert"
          style={{
            padding: '12px 14px',
            borderRadius: radius.md,
            background: colors.redSoft,
            border: `1px solid ${colors.redLine}`,
            color: colors.red,
            fontSize: 14,
          }}
        >
          {server.form}
        </div>
      )}

      <Input
        label="Product name"
        placeholder="e.g. Acme Analytics"
        value={name}
        onChange={(e) => handleName(e.target.value)}
        error={showErrors ? nameError || server.name : server.name}
      />

      <Input
        label="Page name"
        placeholder="my-product"
        value={slug}
        onChange={(e) => {
          setSlugEdited(true);
          setServer({});
          setSlug(e.target.value.toLowerCase());
        }}
        error={showErrors || slug ? slugError || server.slug : ''}
        hint={editing ? `Public page: /p/${slug || 'your-page'}. Changing it breaks links you already shared.` : `Public page: /p/${slug || 'your-page'}`}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />

      <AccentPicker value={accent} onChange={setAccent} isPro={isPro} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <Button type="submit" size="lg" loading={busy}>{submitLabel}</Button>
        {onCancel && (
          <Button variant="ghost" size="lg" disabled={busy} onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}