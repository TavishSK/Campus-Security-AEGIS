import { Router } from 'express';
import { caseService } from '../services/caseService.js';

export const caseRouter = Router();

caseRouter.get('/', (_req, res) => {
  res.json({ success: true, data: caseService.getAll() });
});

caseRouter.get('/:id', (req, res) => {
  const item = caseService.getById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { message: 'Case not found' } });
  res.json({ success: true, data: item });
});

caseRouter.post('/', (req, res) => {
  try {
    const item = caseService.createCase(req.body);
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});

caseRouter.post('/:id/notes', (req, res) => {
  try {
    const { actor, notes } = req.body;
    const item = caseService.addTimelineNote(req.params.id, actor || 'BLACK_HAT_07', notes);
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
});
