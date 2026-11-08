// ============================================================
// scripts/seed.js
// Creates (or resets) the three demo accounts with their sample data.
// Run with: npm run seed        (safe to run again any time)
// It only touches the demo accounts, never real users.
// ============================================================
import '../config/env.js';
import pool, { withTransaction } from '../db/pool.js';
import { DEMO_KINDS, resetDemoAccount } from '../services/demoSeed.js';

try {
  for (const kind of DEMO_KINDS) {
    await withTransaction((client) => resetDemoAccount(client, kind));
    console.log(`Demo account ready: ${kind}`);
  }
  console.log('Done.');
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}