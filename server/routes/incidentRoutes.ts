import { Router } from 'express';
import { incidentService } from '../services/incidentService.js';
import { db } from '../db/store.js';

export const incidentRouter = Router();

incidentRouter.get('/', (req, res) => {
  const { severity, status } = req.query;
  let items = incidentService.getAll();

  if (severity) {
    items = items.filter(i => i.severity === severity);
  }
  if (status) {
    items = items.filter(i => i.status === status);
  }

  res.json({
    success: true,
    data: items,
  });
});

incidentRouter.get('/:id', (req, res) => {
  const inc = incidentService.getById(req.params.id);
  if (!inc) {
    return res.status(404).json({ success: false, error: { message: 'Incident not found' } });
  }
  res.json({ success: true, data: inc });
});

incidentRouter.post('/:id/airgap', (req, res) => {
  try {
    const { notes, signedKey } = req.body;
    const updated = incidentService.triggerDefconAirgap(req.params.id, notes, signedKey);
    res.json({ success: true, data: updated, message: 'DEFCON Airgap successfully invoked.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

incidentRouter.post('/:id/false-positive', (req, res) => {
  try {
    const { notes, signedKey } = req.body;
    const updated = incidentService.markFalsePositive(req.params.id, notes, signedKey);
    res.json({ success: true, data: updated, message: 'Ticket flagged as false positive.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

incidentRouter.post('/:id/severity', (req, res) => {
  try {
    const { direction, notes } = req.body;
    const updated = incidentService.adjustSeverity(req.params.id, direction === 'UP' ? 'UP' : 'DOWN', notes);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

incidentRouter.post('/:id/notes', (req, res) => {
  try {
    const inc = incidentService.getById(req.params.id);
    if (!inc) return res.status(404).json({ success: false, error: { message: 'Incident not found' } });
    const { text, actor } = req.body;
    inc.timeline.unshift({
      timestamp: new Date().toISOString(),
      action: 'NOTE_ADDED',
      actor: actor || 'BLACK_HAT_07',
      details: text || 'Operator note appended.',
    });
    inc.updatedAt = new Date().toISOString();
    res.json({ success: true, data: inc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});
