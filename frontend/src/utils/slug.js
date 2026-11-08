// ============================================================
// utils/slug.js
// Helpers for the public page name (the "slug" in /p/your-name).
// slugify()      -> turns "My Cool App" into "my-cool-app"
// validateSlug() -> returns an error message, or '' when valid
// This only checks the FORMAT and reserved names. Whether a name is
// already taken is decided by the server (GET /api/products/slug-check).
// ============================================================

// --- Names nobody can claim (they clash with our own routes) ---
export const reservedSlugs = [
  'admin', 'api', 'app', 'login', 'signup', 'pricing', 'onboarding',
  'p', 'settings', 'billing', 'www', 'shipnote', 'demo', 'help', 'support',
];

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

// currentSlug = the product's own existing name when editing (always allowed)
export function validateSlug(slug, currentSlug = '') {
  if (currentSlug && slug === currentSlug) return '';
  if (!slug) return 'Choose a page name.';
  if (slug.length < 3) return 'Use at least 3 characters.';
  if (slug.length > 30) return 'Use 30 characters or fewer.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return 'Use lowercase letters, numbers and single hyphens only.';
  if (reservedSlugs.includes(slug)) return 'That name is reserved. Try another.';
  return '';
}