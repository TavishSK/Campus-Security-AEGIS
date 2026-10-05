import React, { useState } from 'react';
import type { Incident } from '../../server/types/index.js';
import { ShieldAlert, CheckCircle, ArrowDown, ArrowUp, FileText, Send, Sparkles, AlertTriangle } from 'lucide-react';
import { audioFx } from '../utils/audioFx.js';

interface TriageTerminalProps {
  incident: Incident | null;
  onTriggerAirgap: (id: string, notes: string, signedKey: string) => Promise<void>;
  onMarkFalsePositive: (id: string, notes: string, signedKey: string) => Promise<void>;
  onAdjustSeverity: (id: string, direction: 'UP' | 'DOWN') => Promise<void>;
  onExpandLog?: (incident: Incident) => void;
}

export const TriageTerminal: React.FC<TriageTerminalProps> = ({
  incident,
  onTriggerAirgap,
  onMarkFalsePositive,
  onAdjustSeverity,
  onExpandLog,
}) => {
  const [signingKey, setSigningKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!incident) {
    return (
      <div className="hud-panel hud-corner rounded-sm flex flex-col h-full font-mono p-4 items-center justify-center text-[#849495] text-xs">
        <ShieldAlert className="w-8 h-8 text-[#00f0ff]/40 mb-2" />
        <div>AWAITING OPERATOR DISPATCH SELECTION...</div>
      </div>
    );
  }

  const isAirgapped = incident.status === 'AIRGAPPED';
  const isFalsePositive = incident.status === 'FALSE_POSITIVE';

  const handleAirgapClick = async () => {
    audioFx.playAirgapLock();
    setSubmitting(true);
    try {
      await onTriggerAirgap(incident.id, 'Airgap protocol invoked from Triage Terminal', signingKey || '0xDEAD_BEEF');
      setFeedbackMsg('DEFCON 1 AIRGAP DEPLOYED. PACKET DROP ACTIVE.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg(`ERROR: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFalsePositiveClick = async () => {
    audioFx.playChirp();
    setSubmitting(true);
    try {
      await onMarkFalsePositive(incident.id, 'Operator classified as benign or colloquial false positive', signingKey || '0x00FF_VERIFIED');
      setFeedbackMsg('MARKED FALSE POSITIVE. FEEDBACK RECORDED.');
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg(`ERROR: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hud-panel hud-corner rounded-sm flex flex-col h-full font-mono">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span className="font-bold text-xs text-white uppercase tracking-wider">
            TRIAGE TERMINAL // OPERATOR_AUTH
          </span>
        </div>
        <div className="text-[10px] text-emerald-400 border border-emerald-500/40 px-2 py-0.5 bg-emerald-950/20 rounded-xs font-bold tracking-wider">
          HUMAN IN THE LOOP
        </div>
      </div>

      <div className="p-3.5 flex-1 overflow-y-auto space-y-3.5">
        {/* Ticket Header Line */}
        <div className="flex flex-wrap items-center justify-between text-[11px] gap-2">
          <div className="text-white font-bold tracking-wide">
            {incident.ticketNumber}
          </div>

          <div className="border border-red-500 bg-red-950/40 text-red-400 px-2 py-0.5 rounded-xs font-bold text-[10px]">
            {incident.classification}
          </div>

          <div className="text-[10px] text-[#849495]">
            SRC: <span className="text-white">{incident.sourceHandle}</span>
          </div>
        </div>

        {/* Intercepted Raw Payload */}
        <div>
          <div className="text-[10px] text-[#849495] uppercase tracking-widest mb-1">
            INTERCEPTED RAW PAYLOAD
          </div>
          <div className="p-3 rounded-xs border border-red-500/80 bg-red-950/30 text-red-400 text-xs font-bold tracking-wide leading-relaxed shadow-[inset_0_0_12px_rgba(239,68,68,0.2)]">
            "{incident.payload}"
          </div>
        </div>

        {/* Neural Factor Vector Breakdown */}
        <div>
          <div className="text-[10px] text-[#849495] uppercase tracking-widest mb-1.5 flex justify-between">
            <span>NEURAL FACTOR VECTOR BREAKDOWN</span>
            <span className="text-[#00f0ff]">RISK {incident.riskScore}/100</span>
          </div>

          <div className="space-y-1 text-[11px] bg-black/40 p-2.5 rounded-xs border border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-[#dde2f8]">Hostile Terminology ('payload exploit', 'execute')</span>
              <span className="text-red-400 font-bold">+{incident.factors.hostileTerminology}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#dde2f8]">Intent Pattern Signature</span>
              <span className="text-red-400 font-bold">+{incident.factors.intentPattern}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#dde2f8]">Specific Target Cluster ('node 0x9')</span>
              <span className="text-red-400 font-bold">+{incident.factors.specificTarget}%</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#dde2f8]">Temporal Proximity ('tomorrow 2pm')</span>
              <span className="text-red-400 font-bold">+{incident.factors.temporalProximity}%</span>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-white/5">
              <span className="text-[#849495]">Mitigating Conversational Antecedents</span>
              <span className="text-emerald-400 font-bold">
                {incident.factors.mitigatingFactors > 0 ? `+${incident.factors.mitigatingFactors}` : incident.factors.mitigatingFactors}%
              </span>
            </div>
          </div>
        </div>

        {/* AI Forensic Rationale for Operator */}
        <div className="bg-[#0f172a] p-3 rounded-xs border border-[#00f0ff]/30 text-xs">
          <div className="text-[10px] text-[#00f0ff] uppercase tracking-widest mb-1 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3 h-3 text-[#00f0ff]" />
            <span>AI FORENSIC RATIONALE FOR OPERATOR</span>
          </div>
          <p className="text-[#dde2f8] text-[11px] leading-relaxed">
            {incident.rationale}
          </p>
        </div>

        {/* Operational Feedback status */}
        {feedbackMsg && (
          <div className="p-2 bg-[#00f0ff]/10 border border-[#00f0ff] text-[#00f0ff] text-[11px] rounded-xs font-bold text-center animate-pulse">
            {feedbackMsg}
          </div>
        )}

        {/* Operator Intervention Protocol CTAs */}
        <div>
          <div className="text-[10px] text-[#849495] uppercase tracking-widest mb-1.5">
            OPERATOR INTERVENTION PROTOCOL
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Red Airgap Action */}
            <button
              disabled={submitting || isAirgapped}
              onClick={handleAirgapClick}
              className={`p-2.5 rounded-xs border text-xs font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isAirgapped
                  ? 'bg-red-950/70 border-red-500 text-red-300 opacity-80'
                  : 'bg-red-600 hover:bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] active:scale-98'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isAirgapped ? 'AIRGAP ACTIVE' : 'TRIGGER DEFCON & AIRGAP'}</span>
            </button>

            {/* False Positive Override */}
            <button
              disabled={submitting || isFalsePositive}
              onClick={handleFalsePositiveClick}
              className={`p-2.5 rounded-xs border text-xs font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isFalsePositive
                  ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                  : 'bg-white/5 hover:bg-white/10 border-white/20 text-[#dde2f8] hover:border-[#00f0ff]/50'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFalsePositive ? 'MARKED FALSE POSITIVE' : 'MARK FALSE POSITIVE'}</span>
            </button>
          </div>

          {/* Secondary Actions Row */}
          <div className="grid grid-cols-3 gap-2 mt-2 text-[10px]">
            <button
              onClick={() => {
                audioFx.playChirp();
                onAdjustSeverity(incident.id, 'DOWN');
              }}
              className="p-1.5 rounded-xs border border-white/10 bg-black/40 hover:bg-white/5 text-[#849495] hover:text-white flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowDown className="w-3 h-3 text-emerald-400" />
              <span>LOWER SEV</span>
            </button>

            <button
              onClick={() => {
                audioFx.playChirp();
                onAdjustSeverity(incident.id, 'UP');
              }}
              className="p-1.5 rounded-xs border border-white/10 bg-black/40 hover:bg-white/5 text-[#849495] hover:text-white flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowUp className="w-3 h-3 text-red-400" />
              <span>RAISE SEV</span>
            </button>

            <button
              onClick={() => {
                audioFx.playChirp();
                if (onExpandLog) onExpandLog(incident);
              }}
              className="p-1.5 rounded-xs border border-white/10 bg-black/40 hover:bg-white/5 text-[#00f0ff] hover:border-[#00f0ff]/40 flex items-center justify-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              <span>EXPAND LOG</span>
            </button>
          </div>
        </div>

        {/* Operator Signing Input Box */}
        <div className="pt-2">
          <div className="relative">
            <input
              type="text"
              value={signingKey}
              onChange={e => setSigningKey(e.target.value)}
              placeholder="Enter operator signing key & for..."
              className="w-full bg-black/70 border border-white/15 focus:border-[#00f0ff] focus:outline-none px-3 py-2 text-xs text-white placeholder-[#849495] rounded-xs font-mono pr-8"
            />
            <button
              onClick={() => {
                audioFx.playChirp();
                if (signingKey) {
                  setFeedbackMsg(`SIGNING KEY [${signingKey.slice(0, 10)}...] REGISTERED.`);
                  setTimeout(() => setFeedbackMsg(null), 3000);
                }
              }}
              className="absolute right-2 top-2.5 text-[#00f0ff] hover:text-white cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
