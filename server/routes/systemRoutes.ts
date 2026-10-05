import { Router } from 'express';
import { db } from '../db/store.js';
import { CONFIG } from '../config/config.js';
import { eventStream } from '../stream/eventStream.js';

export const systemRouter = Router();

systemRouter.get('/status', (_req, res) => {
  res.json({
    success: true,
    data: {
      engineVersion: CONFIG.SYSTEM.VERSION,
      buildHash: CONFIG.SYSTEM.BUILD_HASH,
      nodesOnline: db.nodes.length + 483,
      latencyMs: db.telemetry.latencyMs,
      airgapActive: db.airgapActive,
      defconLevel: db.defconLevel,
      audioFxEnabled: db.audioFxEnabled,
      modelProvider: CONFIG.MODEL.PROVIDER,
      modelName: CONFIG.MODEL.NAME,
      connectedStreamClients: eventStream.getClientCount(),
      systemDoctrine: {
        directive: 'SYS_OPERATIONAL_DOCTRINE // DIRECTIVE 01-ALPHA [CYBER-OPS]',
        motto: 'AI FINDS THE SIGNAL. CONTEXT GIVES IT MEANING. HUMANS MAKE THE DECISION.',
      },
    },
  });
});

systemRouter.post('/audio-fx/toggle', (req, res) => {
  db.audioFxEnabled = !db.audioFxEnabled;
  res.json({ success: true, audioFxEnabled: db.audioFxEnabled });
});
