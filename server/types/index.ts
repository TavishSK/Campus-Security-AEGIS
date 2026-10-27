/**
 * Core type definitions for AEGIS Tactical Cyber-Ops Intelligence
 */

export type RiskLevel = 'NORMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type SignalSource = 'reddit' | 'x' | 'darknet' | 'syslog' | 'simulation';

export interface Signal {
  id: string;
  source: SignalSource;
  sourceHandle: string;
  sourceChannel?: string;
  content: string;
  timestamp: string;
  timeAgo?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  aiClassification: string;
  targetNode: string;
  status: 'new' | 'analyzed' | 'triaged' | 'archived';
  isSynthetic?: boolean;
  contextThread?: {
    preceding: Array<{ author: string; text: string; time: string }>;
    target: string;
    subsequent: Array<{ author: string; text: string; time: string }>;
  };
  factors?: {
    hostileTerminology: number;
    intentPattern: number;
    specificTarget: number;
    temporalProximity: number;
    mitigatingFactors: number;
  };
  rationale?: string;
}

export interface Incident {
  id: string;
  signalId: string;
  ticketNumber: string;
  severity: RiskLevel;
  riskScore: number;
  confidence: number;
  classification: string;
  source: SignalSource;
  sourceHandle: string;
  payload: string;
  targetNode: string;
  factors: {
    hostileTerminology: number;
    intentPattern: number;
    specificTarget: number;
    temporalProximity: number;
    mitigatingFactors: number;
  };
  rationale: string;
  status: 'NEW' | 'UNDER_REVIEW' | 'ESCALATED' | 'RESOLVED' | 'FALSE_POSITIVE' | 'AIRGAPPED';
  assignedAnalyst?: string;
  analystDecision?: string;
  analystNotes?: string;
  signedKey?: string;
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    timestamp: string;
    action: string;
    actor: string;
    details: string;
  }>;
}

export interface CaseFile {
  id: string;
  caseNumber: string;
  title: string;
  severity: RiskLevel;
  status: 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'CLOSED';
  incidentIds: string[];
  assignedAnalyst: string;
  targetNode: string;
  summary: string;
  evidence: string[];
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    timestamp: string;
    action: string;
    actor: string;
    notes?: string;
  }>;
}

export interface ThreatLabAnalysisRequest {
  text: string;
  contextWindowEnabled?: boolean;
  useGemini?: boolean;
  contextThread?: {
    preceding?: Array<{ author: string; text: string; time: string }>;
    target?: string;
    subsequent?: Array<{ author: string; text: string; time: string }>;
  };
  targetCluster?: string;
}

export interface ThreatLabAnalysisResponse {
  analysisId: string;
  payload: string;
  classification: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  factors: {
    hostileTerminology: number;
    intentPattern: number;
    specificTarget: number;
    temporalProximity: number;
    mitigatingFactors: number;
  };
  rationale: string;
  intentCategory: string;
  sentiment: string;
  entities: string[];
  stages: Array<{
    id: string;
    name: string;
    status: 'PASSED' | 'EVALUATED' | 'FLAGGED';
    durationMs: number;
    outputSummary: string;
  }>;
  executionDurationMs: number;
  contextEvaluation: {
    resolution: 'VERIFIED' | 'MITIGATING' | 'ESCALATING';
    antecedentScoreModifier: number;
    threadNotes: string;
  };
  recommendedAction: 'MONITOR' | 'LOG_BENIGN' | 'OPERATOR_REVIEW' | 'DEFCON_AIRGAP';
  modelMetadata: {
    provider: string;
    model: string;
    mode: 'AI_GEMINI' | 'DETERMINISTIC_HEURISTIC';
  };
}

export interface NetworkNode {
  id: string;
  name: string;
  gridSector: string;
  ip: string;
  status: 'SECUR' | 'NOMINAL' | 'MONITOR' | 'BREACH' | 'AIRGAPPED';
  load: string;
  packetRate?: string;
  threatLevel: RiskLevel;
  activePayload?: string;
  x: number; // 0-100 radar coordinate
  y: number; // 0-100 radar coordinate
  angleDeg: number;
  distanceRatio: number; // 0-1
}

export interface AuditLedgerEntry {
  id: string;
  index: number;
  timestamp: string;
  actor: string;
  action: string;
  targetId: string;
  payloadHash: string;
  previousHash: string;
  hash: string;
  details: string;
}
