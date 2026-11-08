// ============================================================
// config/env.js
// Loads backend/.env and exposes the settings as one object.
// If something required is missing, the server stops with a clear
// message (it only names the variable, it never prints its value).
// Stripe settings are optional: without them billing answers 503.
// Only TEST keys are accepted (sk_test_...). Live keys stop the server.
// ============================================================
import 'dotenv/config';

// --- Variables the server cannot run without ---
const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing environment variable(s): ${missing.join(', ')}. Check backend/.env`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET is too short (use at least 32 characters). Check backend/.env');
  process.exit(1);
}

// --- Stripe: test mode only ---
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
if (stripeSecretKey && !stripeSecretKey.startsWith('sk_test_')) {
  console.error('STRIPE_SECRET_KEY must be a TEST key (it starts with sk_test_). Live keys are not allowed in this project.');
  process.exit(1);
}

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
if (stripeWebhookSecret && !stripeWebhookSecret.startsWith('whsec_')) {
  console.error('STRIPE_WEBHOOK_SECRET looks wrong (it should start with whsec_). Check backend/.env');
  process.exit(1);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL),
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  stripe: {
    secretKey: stripeSecretKey,
    webhookSecret: stripeWebhookSecret,
    pricePro: process.env.STRIPE_PRICE_PRO || '',
  },
};