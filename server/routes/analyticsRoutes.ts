import { Router } from 'express';
import { analyticsService } from '../services/analyticsService.js';
import { db } from '../db/store.js';

export const analyticsRouter = Router();

analyticsRouter.get('/overview', (_req, res) => {
  res.json({
    success: true,
    data: analyticsService.getOverview(),
  });
});

analyticsRouter.get('/audit', (_req, res) => {
  res.json({
    success: true,
    data: db.auditLedger,
  });
});
