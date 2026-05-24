import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { validateEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import chatRoutes from './routes/chat.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import ingestRoutes from './routes/ingest.routes.js'; 
import metricsRoutes from './routes/metrics.routes.js';

// Init ingestion service (subscribes to EventBus on import)
import './services/ingestion.service.js';

validateEnv();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

// ── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', uptime: process.uptime(), env: process.env.NODE_ENV })
);

// ── API Routes ──────────────────────────────────────────────
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/metrics', metricsRoutes);

// ── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// ── Error handler ───────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () =>
    console.log(`[Server] OliveTrace backend running on port ${PORT}`)
  );
}).catch((err) => {
  console.error('[Server] Failed to start:', err.message);
  process.exit(1);
});

export default app;
