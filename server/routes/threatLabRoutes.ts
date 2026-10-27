import { Router } from 'express';
import { nlpEngine } from '../ai/nlpEngine.js';
import { db } from '../db/store.js';
import { eventStream } from '../stream/eventStream.js';

export const threatLabRouter = Router();

threatLabRouter.post('/analyze', async (req, res) => {
  try {
    const { text, contextWindowEnabled, contextThread, targetCluster } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'Payload text string required' },
      });
    }

    const analysis = await nlpEngine.analyze({
      text,
      useGemini: true,
      contextWindowEnabled: contextWindowEnabled !== false,
      contextThread: contextThread || {
        preceding: [
          { author: '@peer_node', text: 'Did anyone see the vulnerability patch notes for cluster gamma?', time: '01:12 PM' },
        ],
        target: text,
        subsequent: [
          { author: '@peer_node', text: 'Acknowledged, checking airgap logs...', time: '01:15 PM' },
        ],
      },
      targetCluster,
    });

    db.addAuditEntry(
      'THREAT_LAB_EXECUTE',
      'BLACK_HAT_07',
      analysis.analysisId,
      `Neural decode analyzed string [${text.slice(0, 30)}...] -> Risk ${analysis.riskScore}/100 [${analysis.classification}]`
    );

    eventStream.broadcast('threatlab:analysis', analysis);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ANALYSIS_ERROR', message: err.message },
    });
  }
});
