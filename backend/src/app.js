// ============================================================
// app.js
// Builds the Express app (middleware order matters) but does NOT
// start listening. server.js starts it locally; the hosting step
// (Vercel) will import this same app.
// ============================================================
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { noStore } from './middleware/noStore.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { originGuard } from './middleware/originGuard.js';
import webhookRoutes from './routes/webhook.routes.js';

const app = express();

app.disable('x-powered-by');
// We run behind a proxy (Vercel / dev proxy): trust it for real IPs and HTTPS detection
app.set('trust proxy', 1);

app.use(helmet());
app.use(noStore);

// The Stripe webhook is mounted BEFORE express.json(), because Stripe's
// signature check needs the raw request body.
app.use('/api/stripe', webhookRoutes);

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(originGuard);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;