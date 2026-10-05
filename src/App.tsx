import React, { useState, useEffect } from 'react';
import type { Signal, Incident, CaseFile, NetworkNode, AuditLedgerEntry } from '../server/types/index.js';
import { api } from './services/api.js';
import { audioFx } from './utils/audioFx.js';
import { Header } from './components/Header.js';
import { DoctrineBanner } from './components/DoctrineBanner.js';
import { TelemetryBar } from './components/TelemetryBar.js';
import { LiveIngestionPipeline } from './components/LiveIngestionPipeline.js';
import { TacticalAzimuthRadar } from './components/TacticalAzimuthRadar.js';
import { TriageTerminal } from './components/TriageTerminal.js';
import { ThreatLab } from './components/ThreatLab.js';
import { SafeguardsFooter } from './components/SafeguardsFooter.js';
import { FooterBar } from './components/FooterBar.js';
import { CasesView } from './components/CasesView.js';
import { AuditLedgerView } from './components/AuditLedgerView.js';
import { FeedSimulatorModal } from './components/FeedSimulatorModal.js';
import { SystemBootLoader } from './components/SystemBootLoader.js';

export default function App() {
  const [activeView, setActiveView] = useState<string>('hud');
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [cases, setCases] = useState<CaseFile[]>([]);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [auditLedger, setAuditLedger] = useState<AuditLedgerEntry[]>([]);

  const [selectedSignalId, setSelectedSignalId] = useState<string | null>('sig-9084');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [audioFxOn, setAudioFxOn] = useState<boolean>(true);
  const [feedModalOpen, setFeedModalOpen] = useState<boolean>(false);

  const [telemetry, setTelemetry] = useState({
    ingestedPackets: 1482000,
    analyzedToday: 24892,
    flaggedReview: 382,
    highPriority: 27,
    confidence: 98.4,
    latencyMs: 18,
    azimuthDeg: 360,
    frequencyGhz: 4.2,
  });

  const [airgapActive, setAirgapActive] = useState<boolean>(false);
  const [defconLevel, setDefconLevel] = useState<number>(2);

  // Sync Audio FX preference
  useEffect(() => {
    audioFx.enabled = audioFxOn;
  }, [audioFxOn]);

  // Keyboard shortcut: Press 'B' to trigger boot animation anytime
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.key === 'b' || e.key === 'B') {
        setIsBooting(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [sigRes, incRes, caseRes, nodeRes, auditRes, overviewRes] = await Promise.all([
          api.getSignals(),
          api.getIncidents(),
          api.getCases(),
          api.getNetworkNodes(),
          api.getAuditLedger(),
          api.getAnalytics(),
        ]);

        if (sigRes.data?.length) {
          setSignals(sigRes.data);
          const initSignal = sigRes.data.find(s => s.id === 'sig-9084') || sigRes.data[0];
          setSelectedSignalId(initSignal.id);
        }

        if (incRes?.length) {
          setIncidents(incRes);
          const targetInc = incRes.find(i => i.signalId === 'sig-9084') || incRes[0];
          setSelectedIncident(targetInc);
        }

        if (caseRes?.length) setCases(caseRes);
        if (nodeRes.nodes?.length) setNodes(nodeRes.nodes);
        if (auditRes?.length) setAuditLedger(auditRes);

        if (overviewRes?.telemetry) {
          setTelemetry(prev => ({
            ...prev,
            ...overviewRes.telemetry,
          }));
          setAirgapActive(Boolean(overviewRes.airgapActive));
          setDefconLevel(overviewRes.defconLevel || 2);
        }
      } catch (err) {
        console.error('Initial data fetch error:', err);
      }
    }

    loadInitialData();
  }, []);

  // Connect Real-Time Server-Sent Events (SSE) Stream
  useEffect(() => {
    const eventSource = new EventSource('/api/stream');

    eventSource.addEventListener('signal:new', (e: MessageEvent) => {
      try {
        const newSig: Signal = JSON.parse(e.data);
        setSignals(prev => [newSig, ...prev.slice(0, 49)]);
        setTelemetry(t => ({
          ...t,
          ingestedPackets: t.ingestedPackets + 1,
          analyzedToday: t.analyzedToday + 1,
          flaggedReview: newSig.riskScore >= 50 ? t.flaggedReview + 1 : t.flaggedReview,
          highPriority: newSig.riskScore >= 70 ? t.highPriority + 1 : t.highPriority,
        }));
      } catch (err) {
        console.error('SSE signal:new parse error:', err);
      }
    });

    eventSource.addEventListener('incident:new', (e: MessageEvent) => {
      try {
        const newInc: Incident = JSON.parse(e.data);
        setIncidents(prev => [newInc, ...prev.slice(0, 29)]);
        if (newInc.severity === 'CRITICAL' && audioFxOn) {
          audioFx.playAlertSiren();
        }
      } catch (err) {
        console.error('SSE incident:new parse error:', err);
      }
    });

    eventSource.addEventListener('incident:updated', (e: MessageEvent) => {
      try {
        const updatedInc: Incident = JSON.parse(e.data);
        setIncidents(prev => prev.map(i => (i.id === updatedInc.id ? updatedInc : i)));
        if (selectedIncident?.id === updatedInc.id) {
          setSelectedIncident(updatedInc);
        }
      } catch (err) {
        console.error('SSE incident:updated parse error:', err);
      }
    });

    eventSource.addEventListener('telemetry:tick', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setTelemetry(t => ({
          ...t,
          ingestedPackets: data.ingestedPackets || t.ingestedPackets,
          azimuthDeg: data.azimuthDeg ?? t.azimuthDeg,
        }));
        if (typeof data.airgapActive === 'boolean') setAirgapActive(data.airgapActive);
        if (data.activeDefcon) setDefconLevel(data.activeDefcon);
      } catch (err) {
        console.error('SSE telemetry:tick error:', err);
      }
    });

    eventSource.addEventListener('airgap:event', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setAirgapActive(Boolean(data.airgapActive));
        setDefconLevel(data.defconLevel || 1);
        if (data.airgapActive && audioFxOn) {
          audioFx.playAirgapLock();
        }
      } catch (err) {
        console.error('SSE airgap:event error:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [audioFxOn, selectedIncident]);

  // Handle Signal Selection in feed
  const handleSelectSignal = (sig: Signal) => {
    setSelectedSignalId(sig.id);
    const matchedInc = incidents.find(i => i.signalId === sig.id);
    if (matchedInc) {
      setSelectedIncident(matchedInc);
    } else {
      // Create temporary view in triage terminal
      setSelectedIncident({
        id: `inc-${sig.id}`,
        signalId: sig.id,
        ticketNumber: `SIGNAL #${sig.id.replace(/\D/g, '').slice(-4) || '9084'}`,
        severity: sig.riskLevel,
        riskScore: sig.riskScore,
        confidence: sig.confidence,
        classification: `LEVEL ${sig.riskScore >= 90 ? '4' : sig.riskScore >= 70 ? '3' : '2'} // ${sig.aiClassification}`,
        source: sig.source,
        sourceHandle: `${sig.source.toUpperCase()} // ${sig.sourceHandle}`,
        payload: sig.content.replace(/^"|"$/g, ''),
        targetNode: `${sig.targetNode}`,
        factors: sig.factors || {
          hostileTerminology: sig.riskScore >= 90 ? 28 : 2,
          intentPattern: sig.riskScore >= 90 ? 32 : 3,
          specificTarget: sig.riskScore >= 90 ? 24 : 0,
          temporalProximity: sig.riskScore >= 90 ? 18 : 0,
          mitigatingFactors: -6,
        },
        rationale: sig.rationale || 'Ingested telemetry packet analyzed by AEGIS semantic engine.',
        status: 'NEW',
        createdAt: sig.timestamp,
        updatedAt: sig.timestamp,
        timeline: [],
      });
    }
  };

  // Operator Triage Actions
  const handleTriggerAirgap = async (id: string, notes: string, signedKey: string) => {
    const updated = await api.triggerDefconAirgap(id, notes, signedKey);
    setAirgapActive(true);
    setDefconLevel(1);
    setSelectedIncident(updated);
    // Refresh audit ledger
    const newAudit = await api.getAuditLedger();
    setAuditLedger(newAudit);
  };

  const handleMarkFalsePositive = async (id: string, notes: string, signedKey: string) => {
    const updated = await api.markFalsePositive(id, notes, signedKey);
    setSelectedIncident(updated);
    const newAudit = await api.getAuditLedger();
    setAuditLedger(newAudit);
  };

  const handleAdjustSeverity = async (id: string, direction: 'UP' | 'DOWN') => {
    const updated = await api.adjustSeverity(id, direction);
    setSelectedIncident(updated);
  };

  const handleSignalClassified = (updatedSignal: Signal, incident?: Incident) => {
    setSignals(prev => prev.map(s => (s.id === updatedSignal.id ? updatedSignal : s)));
    if (incident) {
      setIncidents(prev => {
        const exists = prev.some(i => i.id === incident.id);
        if (exists) return prev.map(i => (i.id === incident.id ? incident : i));
        return [incident, ...prev.slice(0, 29)];
      });
      if (selectedSignalId === updatedSignal.id) {
        setSelectedIncident(incident);
      }
    } else if (selectedSignalId === updatedSignal.id) {
      handleSelectSignal(updatedSignal);
    }

    setTelemetry(t => ({
      ...t,
      flaggedReview: updatedSignal.riskScore >= 50 ? t.flaggedReview + 1 : t.flaggedReview,
      highPriority: updatedSignal.riskScore >= 70 ? t.highPriority + 1 : Math.max(0, t.highPriority - 1),
    }));
  };

  const handleToggleSimulation = async () => {
    const res = await api.toggleSimulation();
    setSimulationRunning(res.running);
  };

  const handleToggleGlobalAirgap = async () => {
    const res = await api.toggleGlobalAirgap();
    setAirgapActive(res.airgapActive);
    setDefconLevel(res.defconLevel);
    const newAudit = await api.getAuditLedger();
    setAuditLedger(newAudit);
  };

  const handleCreateCase = async (title: string, summary: string, targetNode: string) => {
    const res = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        summary,
        targetNode,
        severity: 'HIGH',
        evidence: [
          selectedIncident ? `Payload: "${selectedIncident.payload}"` : 'Target sector telemetry stream anomaly',
        ],
      }),
    });
    const json = await res.json();
    if (json.success) {
      setCases(prev => [json.data, ...prev]);
      const newAudit = await api.getAuditLedger();
      setAuditLedger(newAudit);
    }
  };

  const handleAddCaseNote = async (caseId: string, notes: string) => {
    const res = await fetch(`/api/cases/${caseId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: 'BLACK_HAT_07', notes }),
    });
    const json = await res.json();
    if (json.success) {
      setCases(prev => prev.map(c => (c.id === caseId ? json.data : c)));
    }
  };

  const handleBootComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('aegis_boot_completed', 'true');
    }
    setIsBooting(false);
  };

  const hostileCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'FALSE_POSITIVE').length || 2;

  return (
    <div className="min-h-screen bg-[#060913] text-[#dde2f8] flex flex-col selection:bg-[#00f0ff] selection:text-[#060913]">
      {/* Tactical Military Boot Sequence Animation */}
      {isBooting && <SystemBootLoader onComplete={handleBootComplete} />}

      {/* Top Header */}
      <Header
        simulationRunning={simulationRunning}
        onToggleSimulation={handleToggleSimulation}
        audioFxOn={audioFxOn}
        onToggleAudio={() => setAudioFxOn(!audioFxOn)}
        hostileCount={hostileCount}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenFeedModal={() => setFeedModalOpen(true)}
        onReboot={() => setIsBooting(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 py-3">
        {activeView === 'hud' && (
          <>
            {/* Operational Doctrine Banner */}
            <DoctrineBanner
              azimuthDeg={telemetry.azimuthDeg}
              frequencyGhz={telemetry.frequencyGhz}
              onOpenFeedModal={() => setFeedModalOpen(true)}
            />

            {/* Telemetry Metrics Bar */}
            <TelemetryBar
              ingestedPackets={telemetry.ingestedPackets}
              analyzedToday={telemetry.analyzedToday}
              flaggedReview={telemetry.flaggedReview}
              highPriority={telemetry.highPriority}
              confidence={telemetry.confidence}
              latencyMs={telemetry.latencyMs}
            />

            {/* Tri-Pane HUD Layout (Exact match to screenshot) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-6">
              {/* Left Column: Live Ingestion Pipeline (4 cols) */}
              <div className="lg:col-span-4 min-h-[580px]">
                <LiveIngestionPipeline
                  signals={signals}
                  selectedSignalId={selectedSignalId}
                  onSelectSignal={handleSelectSignal}
                  onSignalAdded={sig => setSignals(prev => [sig, ...prev.slice(0, 49)])}
                  onSignalClassified={handleSignalClassified}
                />
              </div>

              {/* Center Column: Tactical Azimuth Radar & Mesh (4 cols) */}
              <div className="lg:col-span-4 min-h-[580px]">
                <TacticalAzimuthRadar
                  nodes={nodes}
                  azimuthDeg={telemetry.azimuthDeg}
                  onSelectNode={nodeName => {
                    const match = signals.find(s => s.targetNode === nodeName);
                    if (match) handleSelectSignal(match);
                  }}
                />
              </div>

              {/* Right Column: Triage Terminal // Operator_Auth (4 cols) */}
              <div className="lg:col-span-4 min-h-[580px]">
                <TriageTerminal
                  incident={selectedIncident}
                  onTriggerAirgap={handleTriggerAirgap}
                  onMarkFalsePositive={handleMarkFalsePositive}
                  onAdjustSeverity={handleAdjustSeverity}
                  onExpandLog={inc => {
                    setActiveView('cases');
                  }}
                />
              </div>
            </div>

            {/* Cyber Forensics Threat Lab (Interactive manual prompt and payload decoder) */}
            <ThreatLab
              onAnalyze={async payload => {
                const res = await api.analyzeThreat(payload);
                const newAudit = await api.getAuditLedger();
                setAuditLedger(newAudit);
                return res;
              }}
            />

            {/* Constitutional Privacy & Airgap Safeguards */}
            <SafeguardsFooter />
          </>
        )}

        {/* Dedicated Threat Lab Tab */}
        {activeView === 'threat-lab' && (
          <div className="py-2">
            <ThreatLab
              onAnalyze={async payload => {
                const res = await api.analyzeThreat(payload);
                const newAudit = await api.getAuditLedger();
                setAuditLedger(newAudit);
                return res;
              }}
            />
            <SafeguardsFooter />
          </div>
        )}

        {/* Dedicated Cases View */}
        {activeView === 'cases' && (
          <div className="py-2">
            <CasesView
              cases={cases}
              onAddNote={handleAddCaseNote}
              onCreateCase={handleCreateCase}
            />
          </div>
        )}

        {/* Dedicated Audit Ledger View */}
        {activeView === 'audit' && (
          <div className="py-2">
            <AuditLedgerView entries={auditLedger} />
          </div>
        )}

        {/* Bottom Status Bar */}
        <FooterBar
          airgapActive={airgapActive}
          defconLevel={defconLevel}
          onToggleAirgap={handleToggleGlobalAirgap}
          latencyMs={telemetry.latencyMs}
          nodesOnline={nodes.length + 483}
        />
      </main>

      {/* Synthetic Feed Drill Simulator Modal */}
      <FeedSimulatorModal
        isOpen={feedModalOpen}
        onClose={() => setFeedModalOpen(false)}
        simulationRunning={simulationRunning}
        onToggleSimulation={handleToggleSimulation}
        onTriggerTick={async () => {
          await fetch('/api/simulation/trigger-tick', { method: 'POST' });
        }}
      />
    </div>
  );
}
