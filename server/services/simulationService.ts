import { db } from '../db/store.js';
import { nlpEngine } from '../ai/nlpEngine.js';
import { eventStream } from '../stream/eventStream.js';
import type { Signal, Incident } from '../types/index.js';

const SYNTHETIC_TEMPLATES = [
  {
    source: 'reddit' as const,
    sourceHandle: 'r/compsci',
    content: '"This compiler optimization is the bomb, runtime dropped 80%"',
    targetNode: 'VECTOR_BETA',
  },
  {
    source: 'x' as const,
    sourceHandle: '@student_dev',
    content: '"Studying algorithms is going to destroy me tonight, send caffeine"',
    targetNode: 'SECTOR_0x7A',
  },
  {
    source: 'reddit' as const,
    sourceHandle: 'r/campus_life',
    content: '"Someone is going to pay for taking my reserved lab terminal again"',
    targetNode: 'ZONE_SIGMA',
  },
  {
    source: 'darknet' as const,
    sourceHandle: '@shadow_mesh',
    content: '"[Synthetic Drill] Zero-day probe targeted at sub_net_03 gateway at 03:00 UTC"',
    targetNode: 'NODE_404',
  },
  {
    source: 'x' as const,
    sourceHandle: '@cloud_admin',
    content: '"Deploying new airgap proxy patch on Node 992. All test suites green."',
    targetNode: 'NODE_992',
  },
  {
    source: 'syslog' as const,
    sourceHandle: 'sys_auth_daemon',
    content: '"SSH connection attempt from subnet 10.240.12.8: public key verified"',
    targetNode: 'SECTOR_0x7A',
  },
];

class SimulationService {
  private timer: NodeJS.Timeout | null = null;
  private templateIdx = 0;

  public start() {
    if (this.timer) return;
    db.simulationRunning = true;

    // Telemetry tick every 1.5 seconds
    setInterval(() => {
      if (db.simulationRunning) {
        db.telemetry.ingestedPackets += Math.floor(Math.random() * 80 + 30);
        db.telemetry.azimuthDeg = (db.telemetry.azimuthDeg + 6) % 360;
        eventStream.broadcast('telemetry:tick', {
          ingestedPackets: db.telemetry.ingestedPackets,
          azimuthDeg: db.telemetry.azimuthDeg,
          activeDefcon: db.defconLevel,
          airgapActive: db.airgapActive,
        });
      }
    }, 1500);

    // Ingest simulated signals every 4.5 seconds
    this.timer = setInterval(async () => {
      if (!db.simulationRunning) return;
      await this.generateNextSignal();
    }, 4500);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    db.simulationRunning = false;
    eventStream.broadcast('simulation:status', { running: false });
  }

  public async generateNextSignal(customContent?: string, customSource?: any): Promise<Signal> {
    const template = customContent
      ? {
          source: customSource || 'simulation',
          sourceHandle: '@injected_prompt',
          content: customContent,
          targetNode: 'NODE_404',
        }
      : SYNTHETIC_TEMPLATES[this.templateIdx % SYNTHETIC_TEMPLATES.length];

    this.templateIdx++;

    // Execute through standard NLP engine
    const analysis = await nlpEngine.analyze({
      text: template.content,
      contextWindowEnabled: true,
      contextThread: {
        preceding: [{ author: '@sys', text: 'Telemetry sync baseline', time: 'LIVE' }],
        target: template.content,
        subsequent: [],
      },
    });

    const newSignal: Signal = {
      id: `sig-${Date.now().toString(16)}-${Math.floor(Math.random() * 1000)}`,
      source: template.source,
      sourceHandle: template.sourceHandle,
      timeAgo: 'JUST NOW',
      timestamp: new Date().toISOString(),
      content: template.content,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      confidence: analysis.confidence,
      aiClassification: analysis.classification,
      targetNode: template.targetNode,
      status: 'analyzed',
      isSynthetic: true,
      factors: analysis.factors,
      rationale: analysis.rationale,
    };

    db.signals.unshift(newSignal);
    if (db.signals.length > 50) db.signals.pop();

    db.telemetry.analyzedToday++;
    if (newSignal.riskScore >= 50) {
      db.telemetry.flaggedReview++;
    }
    if (newSignal.riskScore >= 70) {
      db.telemetry.highPriority++;
    }

    eventStream.broadcast('signal:new', newSignal);

    // If high risk, automatically create an incident in queue
    if (newSignal.riskScore >= 60) {
      const newIncident: Incident = {
        id: `inc-${newSignal.id.slice(4)}`,
        signalId: newSignal.id,
        ticketNumber: `SIGNAL #${Math.floor(Math.random() * 8000 + 1000)}`,
        severity: newSignal.riskLevel,
        riskScore: newSignal.riskScore,
        confidence: newSignal.confidence,
        classification: `LEVEL ${newSignal.riskScore >= 90 ? '4' : '3'} // ${analysis.classification}`,
        source: newSignal.source,
        sourceHandle: newSignal.sourceHandle,
        payload: newSignal.content,
        targetNode: newSignal.targetNode,
        factors: analysis.factors,
        rationale: analysis.rationale,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          {
            timestamp: new Date().toISOString(),
            action: 'INCIDENT_AUTO_TRIAGED',
            actor: 'AEGIS_RISK_ENGINE',
            details: `Risk coefficient ${newSignal.riskScore}/100 exceeded auto-triage threshold.`,
          },
        ],
      };

      db.incidents.unshift(newIncident);
      if (db.incidents.length > 30) db.incidents.pop();

      db.addAuditEntry(
        'INCIDENT_CREATED',
        'SYSTEM_ENGINE',
        newIncident.id,
        `Auto-created priority ticket ${newIncident.ticketNumber} from source ${newIncident.sourceHandle}`
      );

      eventStream.broadcast('incident:new', newIncident);
    }

    return newSignal;
  }
}

export const simulationService = new SimulationService();
