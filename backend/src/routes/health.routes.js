// ============================================================
// routes/health.routes.js
// GET /api/health : is the server up, and can it reach the database?
// Never returns database details.
// ============================================================
import { Router } from 'express';
import { query } from '../db/pool.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', db: 'up', time: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'down' });
  }
});

export default router;