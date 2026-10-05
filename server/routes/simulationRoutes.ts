import { Router } from 'express';
import { db } from '../db/store.js';
import { simulationService } from '../services/simulationService.js';

export const simulationRouter = Router();

simulationRouter.get('/status', (_req, res) => {
  res.json({
    success: true,
    data: {
      running: db.simulationRunning,
      intervalMs: 4500,
      mode: 'SYNTHETIC',
      label: 'SIMULATION: SYNTHETIC',
    },
  });
});

simulationRouter.post('/toggle', (_req, res) => {
  if (db.simulationRunning) {
    simulationService.stop();
  } else {
    simulationService.start();
  }
  res.json({
    success: true,
    data: { running: db.simulationRunning },
  });
});

simulationRouter.post('/trigger-tick', async (_req, res) => {
  const signal = await simulationService.generateNextSignal();
  res.json({ success: true, data: signal });
});
