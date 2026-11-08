// ============================================================
// server.js
// Starts the API on the configured port and closes the database
// connections cleanly when the process is stopped.
// Run with: npm run dev
// ============================================================
import { env } from './config/env.js';
import app from './app.js';
import pool from './db/pool.js';

const server = app.listen(env.port, () => {
  console.log(`Shipnote API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

// --- Clean shutdown (Ctrl+C or the host stopping the app) ---
function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);