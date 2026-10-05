import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { CONFIG } from './server/config/config.js';
import { authRouter } from './server/routes/authRoutes.js';
import { signalRouter } from './server/routes/signalRoutes.js';
import { threatLabRouter } from './server/routes/threatLabRoutes.js';
import { incidentRouter } from './server/routes/incidentRoutes.js';
import { caseRouter } from './server/routes/caseRoutes.js';
import { networkRouter } from './server/routes/networkRoutes.js';
import { analyticsRouter } from './server/routes/analyticsRoutes.js';
import { systemRouter } from './server/routes/systemRoutes.js';
import { simulationRouter } from './server/routes/simulationRoutes.js';
import { sourceRouter } from './server/routes/sourceRoutes.js';
import { eventStream } from './server/stream/eventStream.js';
import { simulationService } from './server/services/simulationService.js';
import { realtimeFeedService } from './server/services/realtimeFeedService.js';
import { db } from './server/db/store.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = CONFIG.PORT;

app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/signals', signalRouter);
app.use('/api/threat-lab', threatLabRouter);
app.use('/api/incidents', incidentRouter);
app.use('/api/cases', caseRouter);
app.use('/api/network', networkRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/system', systemRouter);
app.use('/api/simulation', simulationRouter);
app.use('/api/sources', sourceRouter);

// Real-time Event Stream (SSE)
app.get('/api/stream', (req, res) => {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  eventStream.addClient(clientId, res);
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: 'connected',
    services: {
      api: 'healthy',
      nlp: 'healthy',
      queue: 'healthy',
      realtime: 'healthy',
      redditConnector: 'active_realtime',
      xConnector: 'active_realtime',
      simulation: db.simulationRunning ? 'active' : 'idle',
    },
    version: CONFIG.SYSTEM.VERSION,
    timestamp: new Date().toISOString(),
  });
});

// Start real-time live social feed ingestion engine (Reddit & X)
realtimeFeedService.start();

// Mount Vite or serve static assets
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[AEGIS Cyber-Ops] Server active on port ${port} | Env: ${isProduction ? 'production' : 'development'}`);
  });
}

startServer().catch(err => {
  console.error('[AEGIS Cyber-Ops] Server boot error:', err);
});
