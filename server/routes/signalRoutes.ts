import { Router } from 'express';
import { db } from '../db/store.js';
import { simulationService } from '../services/simulationService.js';

export const signalRouter = Router();

signalRouter.get('/', (req, res) => {
  const { source, minRisk, limit } = req.query;
  let result = [...db.signals];

  if (source && source !== 'ALL') {
    result = result.filter(s => s.source.toLowerCase() === (source as string).toLowerCase());
  }

  if (minRisk) {
    const min = parseInt(minRisk as string, 10);
    if (!isNaN(min)) {
      result = result.filter(s => s.riskScore >= min);
    }
  }

  const max = limit ? parseInt(limit as string, 10) : 50;
  res.json({
    success: true,
    data: result.slice(0, max),
    meta: {
      total: result.length,
      bufferReady: '99.8%',
      endpointsIngesting: 34,
    },
  });
});

signalRouter.post('/inject', async (req, res) => {
  try {
    const { content, source } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: { message: 'Signal content required' } });
    }
    const signal = await simulationService.generateNextSignal(content, source);
    res.json({ success: true, data: signal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

signalRouter.post('/:id/classify', (req, res) => {
  try {
    const { id } = req.params;
    const { level, rationale } = req.body; // 'LOW' | 'MOD' | 'HIGH'

    const signal = db.signals.find(s => s.id === id);
    if (!signal) {
      return res.status(404).json({ success: false, error: { message: 'Signal not found' } });
    }

    if (level === 'LOW') {
      signal.riskScore = 8;
      signal.riskLevel = 'LOW';
      signal.aiClassification = 'OPERATOR_CLASSIFIED_LOW';
      signal.rationale = rationale || 'Operator classified signal threat vector as benign/low.';
    } else if (level === 'MOD') {
      signal.riskScore = 58;
      signal.riskLevel = 'MODERATE';
      signal.aiClassification = 'OPERATOR_CLASSIFIED_MOD';
      signal.rationale = rationale || 'Operator classified signal threat vector as elevated/moderate.';
    } else if (level === 'HIGH') {
      signal.riskScore = 94;
      signal.riskLevel = 'CRITICAL';
      signal.aiClassification = 'OPERATOR_CLASSIFIED_HIGH';
      signal.rationale = rationale || 'Operator classified signal threat vector as critical/high priority.';
    }

    signal.status = 'analyzed';

    // Find or update matching incident
    let incident = db.incidents.find(i => i.signalId === signal.id);
    if (incident) {
      incident.severity = signal.riskLevel;
      incident.riskScore = signal.riskScore;
      incident.classification = `LEVEL ${level === 'HIGH' ? '4' : level === 'MOD' ? '3' : '1'} // ${signal.aiClassification}`;
      incident.rationale = signal.rationale || '';
      incident.updatedAt = new Date().toISOString();
      incident.timeline.unshift({
        timestamp: new Date().toISOString(),
        action: `OPERATOR_CLASSIFIED_${level}`,
        actor: 'BLACK_HAT_07',
        details: `Manual classification set to ${level} (score: ${signal.riskScore}/100)`,
      });
    } else if (signal.riskScore >= 50) {
      incident = {
        id: `inc-${signal.id.replace(/\D/g, '').slice(-6) || Math.floor(Math.random() * 9000 + 1000)}`,
        signalId: signal.id,
        ticketNumber: `SIGNAL #${Math.floor(Math.random() * 8000 + 1000)}`,
        severity: signal.riskLevel,
        riskScore: signal.riskScore,
        confidence: 99.0,
        classification: `LEVEL ${level === 'HIGH' ? '4' : '3'} // ${signal.aiClassification}`,
        source: signal.source,
        sourceHandle: signal.sourceHandle,
        payload: signal.content.replace(/^"|"$/g, ''),
        targetNode: signal.targetNode,
        factors: signal.factors || {
          hostileTerminology: level === 'HIGH' ? 28 : 12,
          intentPattern: level === 'HIGH' ? 32 : 15,
          specificTarget: level === 'HIGH' ? 24 : 10,
          temporalProximity: level === 'HIGH' ? 18 : 5,
          mitigatingFactors: -6,
        },
        rationale: signal.rationale || '',
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          {
            timestamp: new Date().toISOString(),
            action: `OPERATOR_CLASSIFIED_${level}`,
            actor: 'BLACK_HAT_07',
            details: `Manually classified to ${level} from Ingestion Pipeline`,
          },
        ],
      };
      if (incident) {
        db.incidents.unshift(incident);
      }
    }

    db.addAuditEntry(
      'OPERATOR_CLASSIFY_SIGNAL',
      'BLACK_HAT_07',
      signal.id,
      `Operator manually classified signal "${signal.content.slice(0, 30)}..." to ${level} (${signal.riskScore}/100)`
    );

    res.json({
      success: true,
      data: { signal, incident },
      message: `Signal classified as ${level}`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});
