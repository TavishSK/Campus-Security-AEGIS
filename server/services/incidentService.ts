import { db } from '../db/store.js';
import { eventStream } from '../stream/eventStream.js';
import type { Incident, RiskLevel } from '../types/index.js';

class IncidentService {
  public getAll(): Incident[] {
    return db.incidents;
  }

  public getById(id: string): Incident | undefined {
    return db.incidents.find(inc => inc.id === id);
  }

  public triggerDefconAirgap(incidentId: string, notes: string, signedKey: string): Incident {
    const incident = this.getById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    incident.status = 'AIRGAPPED';
    incident.analystDecision = 'DEFCON_AIRGAP_TRIGGERED';
    incident.analystNotes = notes || 'Operator validated critical threat signature. Hardware airgap activated.';
    incident.signedKey = signedKey || 'KEY-ROOT-0xDEAD_BEEF';
    incident.updatedAt = new Date().toISOString();

    incident.timeline.unshift({
      timestamp: new Date().toISOString(),
      action: 'DEFCON_AIRGAP_DEPLOYED',
      actor: 'BLACK_HAT_07',
      details: `Firewall isolated. Packet drop engaged on node ${incident.targetNode}. Signing key verified: ${incident.signedKey}`,
    });

    // Update global state
    db.airgapActive = true;
    db.defconLevel = 1; // DEFCON 1 maximum readiness

    // Update node status
    const node = db.nodes.find(n => incident.targetNode.includes(n.name));
    if (node) {
      node.status = 'AIRGAPPED';
      node.threatLevel = 'CRITICAL';
    }

    db.addAuditEntry(
      'DEFCON_AIRGAP_DEPLOYED',
      'BLACK_HAT_07',
      incident.id,
      `Hardware airgap engaged on target ${incident.targetNode}. Signed with ${incident.signedKey}`
    );

    eventStream.broadcast('incident:updated', incident);
    eventStream.broadcast('airgap:event', {
      airgapActive: true,
      defconLevel: 1,
      targetNode: incident.targetNode,
      timestamp: new Date().toISOString(),
    });

    return incident;
  }

  public markFalsePositive(incidentId: string, notes: string, signedKey?: string): Incident {
    const incident = this.getById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    incident.status = 'FALSE_POSITIVE';
    incident.analystDecision = 'MARKED_FALSE_POSITIVE';
    incident.analystNotes = notes || 'Analyst verified colloquial or non-threatening intent. De-escalated.';
    incident.signedKey = signedKey || 'KEY-OP-CLEARANCE-OK';
    incident.updatedAt = new Date().toISOString();

    incident.timeline.unshift({
      timestamp: new Date().toISOString(),
      action: 'FALSE_POSITIVE_OVERRIDE',
      actor: 'BLACK_HAT_07',
      details: notes || 'Analyst identified false positive. Model feedback sample recorded.',
    });

    // Reduce high priority telemetry count
    if (db.telemetry.highPriority > 0) db.telemetry.highPriority--;

    db.addAuditEntry(
      'FALSE_POSITIVE_OVERRIDE',
      'BLACK_HAT_07',
      incident.id,
      `Analyst marked ticket ${incident.ticketNumber} as false positive. Notes: ${incident.analystNotes}`
    );

    eventStream.broadcast('incident:updated', incident);
    return incident;
  }

  public adjustSeverity(incidentId: string, direction: 'UP' | 'DOWN', notes?: string): Incident {
    const incident = this.getById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const order: RiskLevel[] = ['NORMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
    const currentIdx = order.indexOf(incident.severity);
    let nextIdx = direction === 'UP' ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx < 0) nextIdx = 0;
    if (nextIdx >= order.length) nextIdx = order.length - 1;

    incident.severity = order[nextIdx];
    incident.classification = `LEVEL ${nextIdx} // ${incident.classification.split('//')[1]?.trim() || 'MANUAL_OVERRIDE'}`;
    incident.updatedAt = new Date().toISOString();

    incident.timeline.unshift({
      timestamp: new Date().toISOString(),
      action: `SEVERITY_${direction === 'UP' ? 'RAISED' : 'LOWERED'}`,
      actor: 'BLACK_HAT_07',
      details: notes || `Severity adjusted manually to ${incident.severity}.`,
    });

    db.addAuditEntry(
      'SEVERITY_OVERRIDE',
      'BLACK_HAT_07',
      incident.id,
      `Severity modified to ${incident.severity}`
    );

    eventStream.broadcast('incident:updated', incident);
    return incident;
  }
}

export const incidentService = new IncidentService();
