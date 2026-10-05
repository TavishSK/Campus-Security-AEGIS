import { Router } from 'express';
import { db } from '../db/store.js';
import { eventStream } from '../stream/eventStream.js';

export const networkRouter = Router();

networkRouter.get('/nodes', (_req, res) => {
  res.json({
    success: true,
    data: db.nodes,
    meta: {
      azimuth: db.telemetry.azimuthDeg,
      frequencyGhz: db.telemetry.frequencyGhz,
      hexCoordinates: db.telemetry.hexCoordinates,
      grid: 'GRID 12-K [ACTIVE]',
      range: '1,200m MESH',
      scanRate: '4.2 GHz',
    },
  });
});

networkRouter.get('/radar', (_req, res) => {
  res.json({
    success: true,
    data: {
      azimuth: db.telemetry.azimuthDeg,
      nodes: db.nodes.map(n => ({
        id: n.id,
        name: n.name,
        angleDeg: n.angleDeg,
        distanceRatio: n.distanceRatio,
        threatLevel: n.threatLevel,
        status: n.status,
      })),
    },
  });
});

networkRouter.post('/airgap/toggle', (req, res) => {
  db.airgapActive = !db.airgapActive;
  db.defconLevel = db.airgapActive ? 1 : 2;

  db.addAuditEntry(
    'AIRGAP_MANUAL_TOGGLE',
    'BLACK_HAT_07',
    'GLOBAL_AIRGAP',
    `Hardware airgap state set to ${db.airgapActive ? 'ACTIVE' : 'STANDBY'}`
  );

  eventStream.broadcast('airgap:event', {
    airgapActive: db.airgapActive,
    defconLevel: db.defconLevel,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    data: {
      airgapActive: db.airgapActive,
      defconLevel: db.defconLevel,
    },
  });
});
