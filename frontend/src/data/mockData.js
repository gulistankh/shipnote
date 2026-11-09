// ============================================================
// data/mockData.js
// Static content used by the marketing pages and the colour pickers:
//   plans, features, steps, heroPreviewUpdates, accentPresets
// (Real user data comes from the API, not from this file.)
// ============================================================

// --- Pricing plans (shown on landing + pricing page + billing) ---
export const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    blurb: 'For a side project or your first launch.',
    cta: 'Start for free',
    highlight: false,
    features: [
      '1 product',
      'Up to 5 published updates',
      'Public What\'s new page',
      'Category filter and search',
      '"Made with Shipnote" badge',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12',
    period: 'per month',
    blurb: 'For founders shipping every week.',
    cta: 'Go Pro',
    highlight: true,
    features: [
      'Unlimited products',
      'Unlimited published updates',
      'Custom accent colour',
      'No Shipnote badge',
      'Manage or cancel any time',
    ],
  },
];

// --- Feature cards on the landing page ---
export const features = [
  {
    icon: '✎',
    title: 'Write once, publish in a click',
    text: 'A focused editor with New, Improved and Fixed tags. Save drafts, then publish when it is ready.',
  },
  {
    icon: '◎',
    title: 'A public page for every product',
    text: 'Each product gets a clean page at a short link like /p/acme. No login needed to read it.',
  },
  {
    icon: '◐',
    title: 'Looks like your brand',
    text: 'Pick an accent colour in onboarding and your page matches your product from day one.',
  },
  {
    icon: '⌕',
    title: 'Easy to scan',
    text: 'Visitors can search updates or filter by category to find exactly what changed.',
  },
];

// --- Three steps shown under "How it works" ---
export const steps = [
  { number: '01', title: 'Create your product', text: 'Name it, choose your page address and pick an accent colour.' },
  { number: '02', title: 'Write your updates', text: 'Add a title, a short note and a category tag. Publish when ready.' },
  { number: '03', title: 'Share one link', text: 'Send customers to your What\'s new page from your app or your emails.' },
];

// --- Sample updates shown inside the hero preview card ---
export const heroPreviewUpdates = [
  {
    id: 'h1',
    category: 'new',
    date: 'Nov 3, 2026',
    title: 'Team workspaces are here',
    body: 'Invite teammates and share one dashboard.',
  },
  {
    id: 'h2',
    category: 'improved',
    date: 'Oct 27, 2026',
    title: 'Reports load 3x faster',
    body: 'We rebuilt the query layer behind your charts.',
  },
  {
    id: 'h3',
    category: 'fixed',
    date: 'Oct 20, 2026',
    title: 'CSV export keeps your column order',
    body: 'Exports now match what you see on screen.',
  },
];

// --- Accent colour presets (onboarding, products, settings). Custom hex = Pro only ---
export const accentPresets = [
  { name: 'Ink', value: '#0E1116' },
  { name: 'Blue', value: '#2E6BFF' },
  { name: 'Violet', value: '#7C5CFF' },
  { name: 'Rose', value: '#E23B6A' },
  { name: 'Orange', value: '#F2700F' },
  { name: 'Emerald', value: '#0E9F6E' },
];