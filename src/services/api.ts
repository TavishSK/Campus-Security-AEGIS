import type { Signal, Incident, CaseFile, NetworkNode, ThreatLabAnalysisResponse, AuditLedgerEntry } from '../../server/types/index.js';

export const api = {
  async getSignals(source?: string, minRisk?: number): Promise<{ data: Signal[]; meta: any }> {
    const params = new URLSearchParams();
    if (source && source !== 'ALL') params.append('source', source);
    if (minRisk) params.append('minRisk', minRisk.toString());
    const res = await fetch(`/api/signals?${params.toString()}`);
    return res.json();
  },

  async analyzeThreat(payload: {
    text: string;
    contextWindowEnabled?: boolean;
    contextThread?: any;
  }): Promise<ThreatLabAnalysisResponse> {
    const res = await fetch('/api/threat-lab/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Threat scan failed');
    return json.data;
  },

  async getIncidents(): Promise<Incident[]> {
    const res = await fetch('/api/incidents');
    const json = await res.json();
    return json.data || [];
  },

  async triggerDefconAirgap(incidentId: string, notes: string, signedKey?: string): Promise<Incident> {
    const res = await fetch(`/api/incidents/${incidentId}/airgap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, signedKey }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed to trigger airgap');
    return json.data;
  },

  async markFalsePositive(incidentId: string, notes: string, signedKey?: string): Promise<Incident> {
    const res = await fetch(`/api/incidents/${incidentId}/false-positive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, signedKey }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed to override false positive');
    return json.data;
  },

  async adjustSeverity(incidentId: string, direction: 'UP' | 'DOWN', notes?: string): Promise<Incident> {
    const res = await fetch(`/api/incidents/${incidentId}/severity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction, notes }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed to adjust severity');
    return json.data;
  },

  async getCases(): Promise<CaseFile[]> {
    const res = await fetch('/api/cases');
    const json = await res.json();
    return json.data || [];
  },

  async getNetworkNodes(): Promise<{ nodes: NetworkNode[]; meta: any }> {
    const res = await fetch('/api/network/nodes');
    const json = await res.json();
    return { nodes: json.data || [], meta: json.meta || {} };
  },

  async toggleGlobalAirgap(): Promise<{ airgapActive: boolean; defconLevel: number }> {
    const res = await fetch('/api/network/airgap/toggle', { method: 'POST' });
    const json = await res.json();
    return json.data;
  },

  async getAnalytics(): Promise<any> {
    const res = await fetch('/api/analytics/overview');
    const json = await res.json();
    return json.data || {};
  },

  async getAuditLedger(): Promise<AuditLedgerEntry[]> {
    const res = await fetch('/api/analytics/audit');
    const json = await res.json();
    return json.data || [];
  },

  async getSystemStatus(): Promise<any> {
    const res = await fetch('/api/system/status');
    const json = await res.json();
    return json.data || {};
  },

  async toggleSimulation(): Promise<{ running: boolean }> {
    const res = await fetch('/api/simulation/toggle', { method: 'POST' });
    const json = await res.json();
    return json.data;
  },

  // Real-Time Source Connectors API
  async getSourceStatus(): Promise<any> {
    const res = await fetch('/api/sources/status');
    const json = await res.json();
    return json.data || {};
  },

  async fetchLiveReddit(subreddit?: string): Promise<Signal> {
    const res = await fetch('/api/sources/fetch-live-reddit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subreddit }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch live Reddit post');
    return json.data;
  },

  async fetchLiveX(query?: string): Promise<Signal> {
    const res = await fetch('/api/sources/fetch-live-x', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch live X post');
    return json.data;
  },

  async classifySignal(id: string, level: 'LOW' | 'MOD' | 'HIGH', rationale?: string): Promise<{ signal: Signal; incident?: Incident }> {
    const res = await fetch(`/api/signals/${id}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, rationale }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Failed to classify signal');
    return json.data;
  },

  async updateSourceCredentials(creds: {
    redditClientId?: string;
    redditClientSecret?: string;
    xBearerToken?: string;
  }): Promise<void> {
    await fetch('/api/sources/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
    });
  },
};
