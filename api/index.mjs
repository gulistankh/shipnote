// ============================================================
// api/index.mjs
// The entry point Vercel uses for the backend.
// Every /api/... request on the live site is answered by the SAME
// Express app that runs on your computer (backend/src/app.js).
// ============================================================
import app from '../backend/src/app.js';

export default app;