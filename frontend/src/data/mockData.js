// ============================================================
// data/mockData.js
// All fake data for the frontend phase. Replaced by the real API later.
// Batch 2 content: plans, landing features, hero preview, how-it-works.
// ============================================================

// --- Pricing plans (shown on landing + pricing page) ---
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

// ============================================================
// BATCH 3 additions: demo accounts + accent colours
// ============================================================

// --- Accent colour presets (onboarding + public page). Custom hex = Pro only ---
export const accentPresets = [
  { name: 'Ink', value: '#0E1116' },
  { name: 'Blue', value: '#2E6BFF' },
  { name: 'Violet', value: '#7C5CFF' },
  { name: 'Rose', value: '#E23B6A' },
  { name: 'Orange', value: '#F2700F' },
  { name: 'Emerald', value: '#0E9F6E' },
];

// --- Demo accounts for the "Try a demo" buttons on the login page ---
export const demoAccounts = {
  free: {
    user: { id: 'demo-free', name: 'Dana Free', email: 'free@demo.shipnote.app', role: 'user', plan: 'free', onboarded: true },
    product: { id: 'prod-acme', name: 'Acme', slug: 'acme', accent: '#2E6BFF' },
  },
  pro: {
    user: { id: 'demo-pro', name: 'Piper Pro', email: 'pro@demo.shipnote.app', role: 'user', plan: 'pro', onboarded: true },
    product: { id: 'prod-northwind', name: 'Northwind', slug: 'northwind', accent: '#7C5CFF' },
  },
  admin: {
    user: { id: 'demo-admin', name: 'Alex Admin', email: 'admin@demo.shipnote.app', role: 'admin', plan: 'pro', onboarded: true },
    product: { id: 'prod-hq', name: 'Shipnote HQ', slug: 'shipnote-hq', accent: '#0E1116' },
  },
};

// ============================================================
// BATCH 4 additions: demo updates + a second demo product
// Update shape: { id, productId, title, body, category, status, date }
//   category: 'new' | 'improved' | 'fixed'    status: 'published' | 'draft'
// ============================================================

// --- Extra products for demo accounts (Pro demo has two products) ---
export const demoExtraProducts = {
  'prod-northwind': [
    { id: 'prod-northwind-mobile', name: 'Northwind Mobile', slug: 'northwind-mobile', accent: '#0E9F6E' },
  ],
};

// --- Demo updates, grouped by product id ---
export const demoUpdates = {
  // Free demo: 4 published + 2 drafts (1 slot left before the Free limit)
  'prod-acme': [
    { id: 'u-acme-1', productId: 'prod-acme', category: 'new', status: 'published', date: '2026-11-03', title: 'Team workspaces are here', body: 'Invite teammates and share one dashboard. Roles let you decide who can edit and who can only view.' },
    { id: 'u-acme-2', productId: 'prod-acme', category: 'improved', status: 'published', date: '2026-10-27', title: 'Reports load 3x faster', body: 'We rebuilt the query layer behind your charts, so large reports now open in about a second.' },
    { id: 'u-acme-3', productId: 'prod-acme', category: 'fixed', status: 'published', date: '2026-10-20', title: 'CSV export keeps your column order', body: 'Exports now match exactly what you see on screen, including hidden-column settings.' },
    { id: 'u-acme-4', productId: 'prod-acme', category: 'new', status: 'published', date: '2026-10-12', title: 'Slack notifications', body: 'Get a message in Slack when a report finishes or a teammate leaves a comment.' },
    { id: 'u-acme-5', productId: 'prod-acme', category: 'improved', status: 'draft', date: '2026-11-05', title: 'Faster onboarding checklist', body: 'A shorter checklist that gets new accounts to their first report in under two minutes.' },
    { id: 'u-acme-6', productId: 'prod-acme', category: 'new', status: 'draft', date: '2026-11-05', title: 'Public API beta', body: 'Read your data programmatically with simple API keys. Docs are included in settings.' },
  ],
  // Pro demo, product 1: 7 published + 1 draft (already past the Free limit)
  'prod-northwind': [
    { id: 'u-nw-1', productId: 'prod-northwind', category: 'new', status: 'published', date: '2026-11-04', title: 'Dark mode', body: 'Switch themes from the profile menu. We remember your choice on every device.' },
    { id: 'u-nw-2', productId: 'prod-northwind', category: 'improved', status: 'published', date: '2026-10-30', title: 'Smarter search', body: 'Search now forgives typos and ranks recent items first.' },
    { id: 'u-nw-3', productId: 'prod-northwind', category: 'fixed', status: 'published', date: '2026-10-24', title: 'Duplicate invoices no longer appear', body: 'A rare sync issue could show an invoice twice. It is fixed and cleaned up.' },
    { id: 'u-nw-4', productId: 'prod-northwind', category: 'new', status: 'published', date: '2026-10-18', title: 'Bulk edit', body: 'Select several rows and change status, owner or tags in one step.' },
    { id: 'u-nw-5', productId: 'prod-northwind', category: 'improved', status: 'published', date: '2026-10-09', title: 'Cleaner empty states', body: 'Every empty screen now tells you what to do next.' },
    { id: 'u-nw-6', productId: 'prod-northwind', category: 'fixed', status: 'published', date: '2026-10-01', title: 'Login works with long passwords', body: 'Passwords over 64 characters are now accepted.' },
    { id: 'u-nw-7', productId: 'prod-northwind', category: 'new', status: 'published', date: '2026-09-22', title: 'Audit log', body: 'See who changed what, and when, across your whole workspace.' },
    { id: 'u-nw-8', productId: 'prod-northwind', category: 'improved', status: 'draft', date: '2026-11-05', title: 'Export to PDF', body: 'One-click PDF export for any report, with your logo on top.' },
  ],
  // Pro demo, product 2
  'prod-northwind-mobile': [
    { id: 'u-nwm-1', productId: 'prod-northwind-mobile', category: 'new', status: 'published', date: '2026-11-01', title: 'Face ID login', body: 'Unlock the app with Face ID or your fingerprint.' },
    { id: 'u-nwm-2', productId: 'prod-northwind-mobile', category: 'improved', status: 'published', date: '2026-10-21', title: 'Offline mode', body: 'Keep working without a connection. Changes sync when you are back online.' },
    { id: 'u-nwm-3', productId: 'prod-northwind-mobile', category: 'fixed', status: 'published', date: '2026-10-08', title: 'Fixed a crash on older phones', body: 'The app no longer closes when you open the camera.' },
  ],
  // Admin demo
  'prod-hq': [
    { id: 'u-hq-1', productId: 'prod-hq', category: 'new', status: 'published', date: '2026-11-02', title: 'Admin dashboard', body: 'See every user, their plan and when they joined.' },
    { id: 'u-hq-2', productId: 'prod-hq', category: 'improved', status: 'published', date: '2026-10-25', title: 'Faster public pages', body: 'Public pages now load in under a second.' },
    { id: 'u-hq-3', productId: 'prod-hq', category: 'fixed', status: 'published', date: '2026-10-15', title: 'Waitlist emails are de-duplicated', body: 'Signing up twice with the same email no longer creates two rows.' },
  ],
};

// ============================================================
// BATCH 6 additions: admin view mock data (users + waitlist)
// ============================================================

// --- Users table in the admin view ---
export const adminUsers = [
  { id: 'a1', name: 'Alex Admin', email: 'admin@demo.shipnote.app', plan: 'pro', role: 'admin', signedUpAt: '2026-09-01' },
  { id: 'a2', name: 'Piper Pro', email: 'pro@demo.shipnote.app', plan: 'pro', role: 'user', signedUpAt: '2026-09-04' },
  { id: 'a3', name: 'Dana Free', email: 'free@demo.shipnote.app', plan: 'free', role: 'user', signedUpAt: '2026-09-06' },
  { id: 'a4', name: 'Maya Chen', email: 'maya@brightloop.io', plan: 'pro', role: 'user', signedUpAt: '2026-09-12' },
  { id: 'a5', name: 'Tom Becker', email: 'tom@stackpilot.dev', plan: 'free', role: 'user', signedUpAt: '2026-09-18' },
  { id: 'a6', name: 'Lena Park', email: 'lena@orbitly.co', plan: 'free', role: 'user', signedUpAt: '2026-09-25' },
  { id: 'a7', name: 'Omar Haddad', email: 'omar@routely.app', plan: 'pro', role: 'user', signedUpAt: '2026-10-02' },
  { id: 'a8', name: 'Sofia Alvarez', email: 'sofia@tinycrm.io', plan: 'free', role: 'user', signedUpAt: '2026-10-09' },
  { id: 'a9', name: 'Ben Okafor', email: 'ben@launchkit.dev', plan: 'free', role: 'user', signedUpAt: '2026-10-14' },
  { id: 'a10', name: 'Ines Rossi', email: 'ines@datawell.io', plan: 'pro', role: 'user', signedUpAt: '2026-10-21' },
  { id: 'a11', name: 'Kai Nakamura', email: 'kai@pinghq.com', plan: 'free', role: 'user', signedUpAt: '2026-10-28' },
  { id: 'a12', name: 'Ava Johnson', email: 'ava@shiplane.app', plan: 'free', role: 'user', signedUpAt: '2026-11-03' },
];

// --- Waitlist list in the admin view ---
export const waitlistEntries = [
  { id: 'w1', email: 'founder@nimbusly.io', joinedAt: '2026-10-30' },
  { id: 'w2', email: 'hello@quillbase.com', joinedAt: '2026-10-31' },
  { id: 'w3', email: 'nora@fieldnotes.app', joinedAt: '2026-11-01' },
  { id: 'w4', email: 'dev@stagehand.co', joinedAt: '2026-11-02' },
  { id: 'w5', email: 'ceo@lumenstack.io', joinedAt: '2026-11-03' },
  { id: 'w6', email: 'ravi@cloudpebble.dev', joinedAt: '2026-11-04' },
  { id: 'w7', email: 'team@sparkdesk.app', joinedAt: '2026-11-05' },
];