// ============================================================
// routes/index.js
// Collects every route file under /api. Each later batch adds its
// router here with one line.
// ============================================================
import { Router } from 'express';
import health from './health.routes.js';
import auth from './auth.routes.js';
import me from './me.routes.js';
import onboarding from './onboarding.routes.js';
import products from './products.routes.js';
import updates from './updates.routes.js';
import publicPage from './public.routes.js';
import waitlist from './waitlist.routes.js';
import admin from './admin.routes.js';
import billing from './billing.routes.js';

const router = Router();

router.use('/health', health);
router.use('/auth', auth);
router.use('/me', me);
router.use('/onboarding', onboarding);
router.use('/products', products);
router.use('/public', publicPage);
router.use('/waitlist', waitlist);
router.use('/admin', admin);
router.use('/billing', billing);
router.use('/', updates); // has full paths: /products/:id/updates and /updates/:id

export default router;