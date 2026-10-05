import { db } from '../db/store.js';
import type { CaseFile } from '../types/index.js';

class CaseService {
  public getAll(): CaseFile[] {
    return db.cases;
  }

  public getById(id: string): CaseFile | undefined {
    return db.cases.find(c => c.id === id);
  }

  public createCase(data: Partial<CaseFile>): CaseFile {
    const newCase: CaseFile = {
      id: `case-${Date.now().toString(16)}`,
      caseNumber: `CASE-0x${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase()}-${Math.floor(Math.random() * 90 + 10)}`,
      title: data.title || 'Untitled Threat Case',
      severity: data.severity || 'HIGH',
      status: 'OPEN',
      incidentIds: data.incidentIds || [],
      assignedAnalyst: data.assignedAnalyst || 'BLACK_HAT_07',
      targetNode: data.targetNode || 'NODE_404',
      summary: data.summary || 'Incident escalated into formal case file.',
      evidence: data.evidence || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          timestamp: new Date().toISOString(),
          action: 'CASE_OPENED',
          actor: data.assignedAnalyst || 'BLACK_HAT_07',
          notes: 'Case established with attached telemetry evidence.',
        },
      ],
    };

    db.cases.unshift(newCase);
    db.addAuditEntry('CASE_CREATED', 'BLACK_HAT_07', newCase.id, `Case ${newCase.caseNumber} opened: ${newCase.title}`);
    return newCase;
  }

  public addTimelineNote(caseId: string, actor: string, notes: string): CaseFile {
    const c = this.getById(caseId);
    if (!c) throw new Error('Case not found');
    c.timeline.unshift({
      timestamp: new Date().toISOString(),
      action: 'NOTE_APPENDED',
      actor,
      notes,
    });
    c.updatedAt = new Date().toISOString();
    return c;
  }
}

export const caseService = new CaseService();
