// ============================================================
// db/pool.js
// The PostgreSQL connection pool + two helpers used everywhere:
//   query(sql, params)      -> run one query
//   withTransaction(work)   -> run several queries as ONE all-or-nothing step
// ============================================================
import pg from 'pg';
import { env } from '../config/env.js';

// --- Keep dates as plain 'YYYY-MM-DD' text (no time zone surprises) ---
pg.types.setTypeParser(1082, (value) => value);
// --- Counts come back as numbers instead of strings ---
pg.types.setTypeParser(20, (value) => parseInt(value, 10));

const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  max: env.isProd ? 3 : 10, // serverless: keep only a few connections per instance
  idleTimeoutMillis: 30000,
  // Hosted databases (Neon) require an encrypted connection
  ssl: env.isProd ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err.message);
});

// --- One query ---
export const query = (text, params) => pool.query(text, params);

// --- Transaction: if anything throws, every change is rolled back ---
export async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export default pool;