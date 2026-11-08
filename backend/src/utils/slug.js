// ============================================================
// utils/slug.js
// Input rules shared by the product routes (zod schemas).
//   slugSchema   -> the public page name (/p/<slug>)
//   nameSchema   -> product name
//   accentSchema -> hex colour like #2E6BFF
// The RESERVED_SLUGS list must match the CHECK in schema.sql.
// ============================================================
import { z } from 'zod';

export const RESERVED_SLUGS = [
  'admin', 'api', 'app', 'login', 'signup', 'pricing', 'onboarding',
  'p', 'settings', 'billing', 'www', 'shipnote', 'demo', 'help', 'support',
];

// Messages match the ones the frontend already shows
export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Use at least 3 characters.')
  .max(30, 'Use 30 characters or fewer.')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens only.')
  .refine((s) => !RESERVED_SLUGS.includes(s), 'That name is reserved. Try another.');

export const nameSchema = z.string().trim().min(2, 'Enter a product name.').max(60, 'Name is too long.');

export const accentSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Enter a valid colour.');