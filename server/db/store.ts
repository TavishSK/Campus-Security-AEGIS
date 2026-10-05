import crypto from 'crypto';
import type { Signal, Incident, CaseFile, NetworkNode, AuditLedgerEntry } from '../types/index.js';

class DataStore {
  public signals: Signal[] = [];
  public incidents: Incident[] = [];
  public cases: CaseFile[] = [];
  public nodes: NetworkNode[] = [];
  public auditLedger: AuditLedgerEntry[] = [];
  public defconLevel = 2;
  public airgapActive = false;
  public audioFxEnabled = true;
  public simulationRunning = true;
  
  public telemetry = {
    ingestedPackets: 1482000,
    packetRatePerSec: 14000,
    analyzedToday: 24892,
    flaggedReview: 382,
    highPriority: 27,
    confidence: 98.4,
    latencyMs: 18,
    azimuthDeg: 360,
    frequencyGhz: 4.2,
    hexCoordinates: { x: '0x7F4A', y: '0x90B2' },
  };

  constructor() {
    this.seedInitialState();
  }

  private seedInitialState() {
    // 1. Seed Network Nodes matching the UI screenshot exactly
    this.nodes = [
      {
        id: 'node-sec-0x7a',
        name: 'SECTOR_0x7A',
        gridSector: 'GRID 12-K',
        ip: '10.240.12.8',
        status: 'SECUR',
        load: '12%',
        packetRate: '1.2k/s',
        threatLevel: 'LOW',
        x: 65,
        y: 35,
        angleDeg: 42,
        distanceRatio: 0.45,
      },
      {
        id: 'node-vec-beta',
        name: 'VECTOR_BETA',
        gridSector: '0x8F9',
        ip: '10.240.88.2',
        status: 'NOMINAL',
        load: '41%',
        packetRate: '3.4k/s',
        threatLevel: 'NORMAL',
        x: 75,
        y: 22,
        angleDeg: 68,
        distanceRatio: 0.65,
      },
      {
        id: 'node-zone-sigma',
        name: 'ZONE_SIGMA',
        gridSector: 'SUB_NET_03',
        ip: '10.240.99.14',
        status: 'SECUR',
        load: '08%',
        packetRate: '800/s',
        threatLevel: 'MODERATE',
        x: 82,
        y: 72,
        angleDeg: 125,
        distanceRatio: 0.78,
      },
      {
        id: 'node-404-breach',
        name: 'NODE_404',
        gridSector: 'CLUSTER_GAMMA',
        ip: '10.240.40.4',
        status: 'BREACH',
        load: '0x4B_ROOT',
        packetRate: '19.8k/s',
        threatLevel: 'CRITICAL',
        activePayload: 'Plan to execute payload exploit on node 0x9 tomorrow 2pm',
        x: 58,
        y: 62,
        angleDeg: 215,
        distanceRatio: 0.35,
      },
      {
        id: 'node-992-airgap',
        name: 'NODE_992',
        gridSector: 'AIR_GAP_PROXY',
        ip: '10.240.1.1',
        status: 'MONITOR',
        load: '4.8M PKTS',
        packetRate: '4.8k/s',
        threatLevel: 'LOW',
        x: 35,
        y: 50,
        angleDeg: 270,
        distanceRatio: 0.55,
      },
    ];

    // 2. Seed Signals matching distinct social media vectors
    this.signals = [
      {
        id: 'sig-red-001',
        source: 'reddit',
        sourceHandle: 'r/all • u/collegestudent',
        sourceChannel: 'r/all',
        timeAgo: '2m ago',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        content: '"Exam week is going to destroy me and my GPA"',
        riskScore: 8,
        riskLevel: 'LOW',
        confidence: 96.2,
        aiClassification: 'METAPHORICAL_STRESS',
        targetNode: 'SECTOR_0x7A',
        status: 'analyzed',
        factors: {
          hostileTerminology: 2,
          intentPattern: 3,
          specificTarget: 0,
          temporalProximity: 4,
          mitigatingFactors: -32,
        },
        rationale: 'Colloquial hyperbole regarding academic exam pressure. Zero hostile cybersecurity intent.',
      },
      {
        id: 'sig-red-002',
        source: 'reddit',
        sourceHandle: 'r/technology • u/cyber_scribe',
        sourceChannel: 'r/technology',
        timeAgo: '4m ago',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        content: '"Critical vulnerability in Linux core library patched after coordinated disclosure"',
        riskScore: 34,
        riskLevel: 'LOW',
        confidence: 94.0,
        aiClassification: 'SECURITY_ADVISORY',
        targetNode: 'VECTOR_BETA',
        status: 'analyzed',
        factors: {
          hostileTerminology: 8,
          intentPattern: 4,
          specificTarget: 6,
          temporalProximity: 2,
          mitigatingFactors: -14,
        },
        rationale: 'Public news thread discussing defensive patch release. Informational risk profile.',
      },
      {
        id: 'sig-red-003',
        source: 'reddit',
        sourceHandle: 'r/cybersecurity • u/soc_analyst',
        sourceChannel: 'r/cybersecurity',
        timeAgo: '8m ago',
        timestamp: new Date(Date.now() - 480000).toISOString(),
        content: '"Massive credential stuffing campaign detected targeting campus authentication portals"',
        riskScore: 74,
        riskLevel: 'CRITICAL',
        confidence: 93.8,
        aiClassification: 'CREDENTIAL_STUFFING_WARNING',
        targetNode: 'ZONE_SIGMA',
        status: 'analyzed',
        factors: {
          hostileTerminology: 22,
          intentPattern: 26,
          specificTarget: 20,
          temporalProximity: 12,
          mitigatingFactors: -6,
        },
        rationale: 'Active threat discussion documenting automated authentication attacks against campus infrastructure.',
      },
      {
        id: 'sig-x-001',
        source: 'x',
        sourceHandle: '@signal_echo',
        timeAgo: '1m ago',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        content: '"This new production deployment is the bomb bro lol no outages so far #devlife #k8s"',
        riskScore: 4,
        riskLevel: 'NORMAL',
        confidence: 97.8,
        aiClassification: 'BENIGN_SLANG',
        targetNode: 'VECTOR_BETA',
        status: 'analyzed',
        factors: {
          hostileTerminology: 1,
          intentPattern: 1,
          specificTarget: 0,
          temporalProximity: 0,
          mitigatingFactors: -38,
        },
        rationale: 'Positive developer celebration using benign slang. No malicious indicators.',
      },
      {
        id: 'sig-x-002',
        source: 'x',
        sourceHandle: '@sys_leak',
        timeAgo: '7m ago',
        timestamp: new Date(Date.now() - 420000).toISOString(),
        content: '"Someone is going to pay for what happened in the cluster today. Critical outage incoming."',
        riskScore: 62,
        riskLevel: 'MODERATE',
        confidence: 91.5,
        aiClassification: 'ELEVATED_MONITOR',
        targetNode: 'ZONE_SIGMA',
        status: 'triaged',
        factors: {
          hostileTerminology: 15,
          intentPattern: 25,
          specificTarget: 22,
          temporalProximity: 8,
          mitigatingFactors: -8,
        },
        rationale: 'Aggressive sentiment targeting infrastructure cluster. Requires elevated telemetry observation.',
      },
      {
        id: 'sig-x-003',
        source: 'x',
        sourceHandle: '@threat_vector',
        timeAgo: '10m ago',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        content: '"RT @darknet_radar: Threat actor claims unauthorized DB dump on node 0x9. Validating signatures now."',
        riskScore: 88,
        riskLevel: 'CRITICAL',
        confidence: 95.1,
        aiClassification: 'UNAUTHORIZED_EXFILTRATION',
        targetNode: 'NODE_404',
        status: 'triaged',
        factors: {
          hostileTerminology: 25,
          intentPattern: 28,
          specificTarget: 26,
          temporalProximity: 15,
          mitigatingFactors: -6,
        },
        rationale: 'Microblog report correlating to sensitive asset node 0x9. High urgency telemetry alert.',
      },
      {
        id: 'sig-9084',
        source: 'darknet',
        sourceHandle: '@anon_ops',
        timeAgo: 'INJECTED NOW',
        timestamp: new Date().toISOString(),
        content: '"[Synthetic Threat Simulation] Plan to execute payload exploit on node 0x9 tomorrow 2pm"',
        riskScore: 96,
        riskLevel: 'CRITICAL',
        confidence: 98.4,
        aiClassification: 'CRITICAL_EXPLOIT_HOSTILE',
        targetNode: 'NODE_404',
        status: 'new',
        isSynthetic: true,
        contextThread: {
          preceding: [
            { author: '@peer_node', text: 'Did anyone see the vulnerability patch notes for cluster gamma?', time: '01:12 PM' },
          ],
          target: '[Synthetic Threat Simulation] Plan to execute payload exploit on node 0x9 tomorrow 2pm',
          subsequent: [
            { author: '@peer_node', text: 'Acknowledged, checking airgap logs...', time: '01:15 PM' },
          ],
        },
        factors: {
          hostileTerminology: 28,
          intentPattern: 32,
          specificTarget: 24,
          temporalProximity: 18,
          mitigatingFactors: -6,
        },
        rationale: "Hostile terminology ('payload exploit', 'execute') targeting core server cluster 'node 0x9' with narrow temporal trigger. Ingested from darknet syndicate feed. Immediate operator confirmation required to invoke firewall airgap.",
      },
    ];

    // 3. Seed Incident matching the right Triage Terminal in screenshot
    this.incidents = [
      {
        id: 'inc-9084',
        signalId: 'sig-9084',
        ticketNumber: 'SIGNAL #9084',
        severity: 'CRITICAL',
        riskScore: 96,
        confidence: 98.4,
        classification: 'LEVEL 4 // CRITICAL_EXPLOIT_HOSTILE',
        source: 'darknet',
        sourceHandle: 'DARKNET // @anon_ops',
        payload: '[Synthetic Threat Simulation] Plan to execute payload exploit on node 0x9 tomorrow 2pm',
        targetNode: 'NODE_404 // CLUSTER_GAMMA',
        factors: {
          hostileTerminology: 28,
          intentPattern: 32,
          specificTarget: 24,
          temporalProximity: 18,
          mitigatingFactors: -6,
        },
        rationale: "Hostile terminology ('payload exploit', 'execute') targeting core server cluster 'node 0x9' with narrow temporal trigger. Ingested from darknet syndicate feed. Immediate operator confirmation required to invoke firewall airgap.",
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          {
            timestamp: new Date(Date.now() - 60000).toISOString(),
            action: 'SIGNAL_INTERCEPTED',
            actor: 'AEGIS_INGESTION_GATEWAY',
            details: 'Darknet syndicate stream sniffed payload matching exploit syntax.',
          },
          {
            timestamp: new Date(Date.now() - 55000).toISOString(),
            action: 'NEURAL_CLASSIFICATION_COMPLETE',
            actor: 'AEGIS_AST_TOKENIZER_v4',
            details: 'Confidence 98.4%, Risk 96/100. Critical alert dispatched to Operator Triage.',
          },
        ],
      },
      {
        id: 'inc-8841',
        signalId: 'sig-003',
        ticketNumber: 'SIGNAL #8841',
        severity: 'MODERATE',
        riskScore: 62,
        confidence: 91.5,
        classification: 'LEVEL 2 // ELEVATED_MONITOR',
        source: 'x',
        sourceHandle: 'X // @sys_leak',
        payload: 'Someone is going to pay for what happened in the cluster',
        targetNode: 'ZONE_SIGMA // SUB_NET_03',
        factors: {
          hostileTerminology: 15,
          intentPattern: 25,
          specificTarget: 22,
          temporalProximity: 8,
          mitigatingFactors: -8,
        },
        rationale: 'Aggressive sentiment targeting infrastructure cluster.',
        status: 'UNDER_REVIEW',
        assignedAnalyst: 'BLACK_HAT_07',
        createdAt: new Date(Date.now() - 600000).toISOString(),
        updatedAt: new Date(Date.now() - 600000).toISOString(),
        timeline: [
          {
            timestamp: new Date(Date.now() - 600000).toISOString(),
            action: 'INCIDENT_CREATED',
            actor: 'SYSTEM',
            details: 'Moderate threat score exceeded auto-triage threshold 50.',
          },
        ],
      },
    ];

    // 4. Seed Cases
    this.cases = [
      {
        id: 'case-2026-009',
        caseNumber: 'CASE-0x7F4A-09',
        title: 'Cluster Gamma Infiltration Reconnaissance',
        severity: 'CRITICAL',
        status: 'INVESTIGATING',
        incidentIds: ['inc-9084'],
        assignedAnalyst: 'BLACK_HAT_07',
        targetNode: 'NODE_404',
        summary: 'Targeted exploitation chatter targeting Node 0x9 scheduled for execution. Airgap isolation protocol prepared.',
        evidence: [
          'Payload snippet: "[Synthetic Threat Simulation] Plan to execute payload exploit on node 0x9 tomorrow 2pm"',
          'Cluster Gamma sniffer dump #0x4B_ROOT',
        ],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          {
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            action: 'CASE_OPENED',
            actor: 'BLACK_HAT_07',
            notes: 'Opened after high-frequency darknet telemetry spike.',
          },
        ],
      },
    ];

    // 5. Seed Initial Audit Log
    this.addAuditEntry('SYSTEM_INIT', 'SYS', 'INIT', 'AEGIS Cyber Engine booted. All airgap safeguards active.');
    this.addAuditEntry('SIGNALS_INGESTED', 'INGEST_PIPE', 'sig-9084', 'Synthetic threat simulation payload ingested from darknet stream.');
  }

  public addAuditEntry(action: string, actor: string, targetId: string, details: string): AuditLedgerEntry {
    const prevEntry = this.auditLedger[this.auditLedger.length - 1];
    const prevHash = prevEntry ? prevEntry.hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = new Date().toISOString();
    const payloadHash = crypto.createHash('sha256').update(details + targetId).digest('hex').slice(0, 16);
    const hash = crypto.createHash('sha256').update(`${prevHash}${timestamp}${actor}${action}${payloadHash}`).digest('hex');

    const entry: AuditLedgerEntry = {
      id: `AUD-${Date.now().toString(16)}-${this.auditLedger.length}`,
      index: this.auditLedger.length + 1,
      timestamp,
      actor,
      action,
      targetId,
      payloadHash: `0x${payloadHash}`,
      previousHash: `0x${prevHash.slice(0, 12)}...`,
      hash: `0x${hash}`,
      details,
    };

    this.auditLedger.unshift(entry);
    if (this.auditLedger.length > 200) this.auditLedger.pop();
    return entry;
  }
}

export const db = new DataStore();
