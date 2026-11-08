// ============================================================
// utils/publicData.js
// MOCK "public API" for the frontend phase.
//   saveMirror()    -> called by DataContext: stores a public copy of each
//                      product's PUBLISHED updates in localStorage
//   getPublicPage() -> used by the public page: finds a product by its slug
// If the slug is not in the copy, it falls back to the demo accounts' data,
// so /p/acme, /p/northwind etc. always work for first-time visitors.
// LATER: replaced by one real endpoint, GET /api/public/:slug
// ============================================================
import { demoAccounts, demoExtraProducts, demoUpdates } from '../data/mockData';

const MIRROR_KEY = 'shipnote_public_mirror';

// --- Read the saved copy (safe if storage is empty or blocked) ---
function readMirror() {
  try {
    return JSON.parse(localStorage.getItem(MIRROR_KEY)) || {};
  } catch {
    return {};
  }
}

// --- Save a public copy of every product of the current user ---
export function saveMirror(state, plan) {
  try {
    const mirror = readMirror();
    state.products.forEach((p) => {
      mirror[p.id] = {
        product: p,
        plan,
        updates: state.updates.filter((u) => u.productId === p.id && u.status === 'published'),
      };
    });
    localStorage.setItem(MIRROR_KEY, JSON.stringify(mirror));
  } catch {
    /* storage unavailable: the public page falls back to demo data */
  }
}

// --- Find a public page by slug. Returns { product, plan, updates } or null ---
export function getPublicPage(slug) {
  const hit = Object.values(readMirror()).find((entry) => entry.product.slug === slug);
  if (hit) return hit;

  // Fallback: the built-in demo products
  for (const { user, product } of Object.values(demoAccounts)) {
    const all = [product, ...(demoExtraProducts[product.id] || [])];
    const found = all.find((p) => p.slug === slug);
    if (found) {
      return {
        product: found,
        plan: user.plan,
        updates: (demoUpdates[found.id] || []).filter((u) => u.status === 'published'),
      };
    }
  }
  return null;
}