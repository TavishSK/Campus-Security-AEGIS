import React, { useState } from 'react';
import type { Signal, Incident } from '../../server/types/index.js';
import { Radio, ShieldAlert, MessageSquare, Download, RefreshCw, Globe, CheckCircle2, Sliders, AlertTriangle } from 'lucide-react';
import { audioFx } from '../utils/audioFx.js';
import { api } from '../services/api.js';

interface LiveIngestionPipelineProps {
  signals: Signal[];
  selectedSignalId: string | null;
  onSelectSignal: (signal: Signal) => void;
  onSignalAdded?: (signal: Signal) => void;
  onSignalClassified?: (signal: Signal, incident?: Incident) => void;
}

export const LiveIngestionPipeline: React.FC<LiveIngestionPipelineProps> = ({
  signals,
  selectedSignalId,
  onSelectSignal,
  onSignalAdded,
  onSignalClassified,
}) => {
  const [filterSource, setFilterSource] = useState<'ALL' | 'REDDIT' | 'X' | 'DARKNET'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'LOW' | 'MOD' | 'HIGH'>('ALL');
  const [fetchingReddit, setFetchingReddit] = useState(false);
  const [fetchingX, setFetchingX] = useState(false);
  const [classifyingId, setClassifyingId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Filter signals based on source AND severity tier
  const filteredSignals = signals.filter(sig => {
    // 1. Source filter
    if (filterSource === 'REDDIT' && sig.source !== 'reddit') return false;
    if (filterSource === 'X' && sig.source !== 'x') return false;
    if (filterSource === 'DARKNET' && sig.source !== 'darknet' && sig.source !== 'simulation') return false;

    // 2. Severity tier filter
    if (filterSeverity === 'LOW' && sig.riskScore >= 50) return false;
    if (filterSeverity === 'MOD' && (sig.riskScore < 50 || sig.riskScore >= 70)) return false;
    if (filterSeverity === 'HIGH' && sig.riskScore < 70) return false;

    return true;
  });

  const getRiskBadge = (score: number) => {
    if (score >= 70) {
      return {
        text: `RISK: ${score}/100`,
        classes: 'border-red-500 bg-red-950/60 text-red-400 font-bold',
      };
    }
    if (score >= 50) {
      return {
        text: `RISK: ${score}/100`,
        classes: 'border-amber-500/80 bg-amber-950/40 text-amber-300 font-semibold',
      };
    }
    return {
      text: `RISK: ${score < 10 ? `0${score}` : score}/100`,
      classes: 'border-emerald-500/60 bg-emerald-950/30 text-emerald-400 font-medium',
    };
  };

  const handleFetchLiveReddit = async () => {
    audioFx.playThreatScan();
    setFetchingReddit(true);
    try {
      const sig = await api.fetchLiveReddit();
      if (onSignalAdded) onSignalAdded(sig);
      onSelectSignal(sig);
      showFeedback(`LIVE REDDIT POST INGESTED`);
    } catch (err: any) {
      console.warn('Reddit fetch notice:', err.message);
    } finally {
      setFetchingReddit(false);
    }
  };

  const handleFetchLiveX = async () => {
    audioFx.playThreatScan();
    setFetchingX(true);
    try {
      const sig = await api.fetchLiveX();
      if (onSignalAdded) onSignalAdded(sig);
      onSelectSignal(sig);
      showFeedback(`LIVE X POST INGESTED`);
    } catch (err: any) {
      console.warn('X fetch notice:', err.message);
    } finally {
      setFetchingX(false);
    }
  };

  const handleClassify = async (signalId: string, level: 'LOW' | 'MOD' | 'HIGH', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (level === 'LOW') audioFx.playChirp();
    else if (level === 'MOD') audioFx.playThreatScan();
    else audioFx.playAlertSiren();

    setClassifyingId(signalId);
    try {
      const result = await api.classifySignal(signalId, level);
      if (onSignalClassified) {
        onSignalClassified(result.signal, result.incident);
      }
      showFeedback(`SIGNAL CLASSIFIED AS ${level}`);
    } catch (err: any) {
      console.error('Classification error:', err);
    } finally {
      setClassifyingId(null);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Severity counts
  const lowCount = signals.filter(s => s.riskScore < 50).length;
  const modCount = signals.filter(s => s.riskScore >= 50 && s.riskScore < 70).length;
  const highCount = signals.filter(s => s.riskScore >= 70).length;

  const redditCount = signals.filter(s => s.source === 'reddit').length;
  const xCount = signals.filter(s => s.source === 'x').length;

  const activeSelectedSignal = signals.find(s => s.id === selectedSignalId);

  const handleSelectSource = (src: 'ALL' | 'REDDIT' | 'X') => {
    audioFx.playChirp();
    setFilterSource(src);

    // If selected source has low items, fetch live items automatically
    if (src === 'REDDIT' && redditCount < 2 && !fetchingReddit) {
      handleFetchLiveReddit();
    } else if (src === 'X' && xCount < 2 && !fetchingX) {
      handleFetchLiveX();
    }
  };

  return (
    <div className="hud-panel hud-corner rounded-sm flex flex-col h-full font-mono">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-[#00f0ff]" />
          <span className="font-bold text-xs text-white uppercase tracking-wider">
            LIVE INGESTION PIPELINE
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>REAL-TIME: 1s</span>
        </div>
      </div>

      {/* Filter Tabs & Real-Time Ingest Actions */}
      <div className="px-3 pt-2.5 pb-2 flex flex-wrap items-center justify-between gap-1.5 border-b border-white/5 text-[11px]">
        <div className="flex gap-1.5">
          <button
            onClick={() => handleSelectSource('ALL')}
            className={`px-2.5 py-1 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
              filterSource === 'ALL'
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 font-bold'
                : 'text-[#849495] hover:text-white bg-black/40 border border-transparent'
            }`}
          >
            ALL SIGNALS ({signals.length})
          </button>

          <button
            onClick={() => handleSelectSource('REDDIT')}
            className={`px-2.5 py-1 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
              filterSource === 'REDDIT'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/60 font-bold shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'text-[#849495] hover:text-white bg-black/40 border border-transparent'
            }`}
          >
            REDDIT ({redditCount})
          </button>

          <button
            onClick={() => handleSelectSource('X')}
            className={`px-2.5 py-1 rounded-sm uppercase tracking-wider transition-all cursor-pointer ${
              filterSource === 'X'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/60 font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                : 'text-[#849495] hover:text-white bg-black/40 border border-transparent'
            }`}
          >
            X (TWITTER) ({xCount})
          </button>
        </div>

        {/* Quick Instant Ingest Triggers */}
        <div className="flex items-center gap-1.5">
          <button
            disabled={fetchingReddit}
            onClick={handleFetchLiveReddit}
            title="Fetch an actual live comment from Reddit right now"
            className="px-2 py-0.5 rounded-xs border border-orange-500/50 bg-orange-950/30 text-orange-400 hover:bg-orange-900/50 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
          >
            <Download className="w-3 h-3" />
            <span>{fetchingReddit ? 'POLLING...' : '+ REDDIT LIVE'}</span>
          </button>

          <button
            disabled={fetchingX}
            onClick={handleFetchLiveX}
            title="Fetch an actual live post from X / microblog stream right now"
            className="px-2 py-0.5 rounded-xs border border-blue-500/50 bg-blue-950/30 text-blue-400 hover:bg-blue-900/50 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
          >
            <Download className="w-3 h-3" />
            <span>{fetchingX ? 'POLLING...' : '+ X LIVE'}</span>
          </button>
        </div>
      </div>

      {/* Stream Socket & Interactive Clickable Legend / Classifier Bar */}
      <div className="px-3 py-1.5 bg-black/50 border-b border-white/5 flex flex-wrap justify-between items-center text-[10px] text-[#849495] gap-2">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Globe className="w-3 h-3" />
            LIVE WEB FEED ACTIVE
          </span>
          <span className="text-[#849495] hidden sm:inline">// STREAMING SOCKET: 0x904f</span>
        </div>

        {/* CLICKABLE LOW | MOD | HIGH BUTTONS */}
        <div className="flex items-center gap-1.5 tracking-wider text-[10px]">
          <span className="text-[9px] text-[#849495] uppercase font-bold mr-0.5 hidden xs:inline">
            FILTER / CLASSIFY:
          </span>

          {/* GREEN: LOW Clickable Button */}
          <button
            onClick={() => {
              audioFx.playChirp();
              setFilterSeverity(prev => (prev === 'LOW' ? 'ALL' : 'LOW'));
            }}
            title="Filter by LOW severity or toggle filter"
            className={`px-2 py-0.5 rounded-2xs border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              filterSeverity === 'LOW'
                ? 'border-emerald-400 bg-emerald-950 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/50 hover:border-emerald-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>GREEN: LOW ({lowCount})</span>
          </button>

          <span className="text-[#849495]">|</span>

          {/* AMBER: MOD Clickable Button */}
          <button
            onClick={() => {
              audioFx.playChirp();
              setFilterSeverity(prev => (prev === 'MOD' ? 'ALL' : 'MOD'));
            }}
            title="Filter by MOD severity or toggle filter"
            className={`px-2 py-0.5 rounded-2xs border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              filterSeverity === 'MOD'
                ? 'border-amber-400 bg-amber-950 text-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                : 'border-amber-500/40 bg-amber-950/20 text-amber-400 hover:bg-amber-950/50 hover:border-amber-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>AMBER: MOD ({modCount})</span>
          </button>

          <span className="text-[#849495]">|</span>

          {/* RED: HIGH Clickable Button */}
          <button
            onClick={() => {
              audioFx.playChirp();
              setFilterSeverity(prev => (prev === 'HIGH' ? 'ALL' : 'HIGH'));
            }}
            title="Filter by HIGH severity or toggle filter"
            className={`px-2 py-0.5 rounded-2xs border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              filterSeverity === 'HIGH'
                ? 'border-red-400 bg-red-950 text-red-200 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                : 'border-red-500/40 bg-red-950/20 text-red-400 hover:bg-red-950/50 hover:border-red-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>RED: HIGH ({highCount})</span>
          </button>

          {/* Clear filter button if active */}
          {filterSeverity !== 'ALL' && (
            <button
              onClick={() => {
                audioFx.playChirp();
                setFilterSeverity('ALL');
              }}
              className="text-[9px] text-[#00f0ff] hover:underline uppercase ml-1 cursor-pointer"
            >
              [RESET]
            </button>
          )}
        </div>
      </div>

      {/* Quick Action Bar for currently selected signal */}
      {activeSelectedSignal && (
        <div className="px-3 py-1.5 bg-[#00f0ff]/10 border-b border-[#00f0ff]/30 flex flex-wrap justify-between items-center text-[10px] gap-2">
          <div className="flex items-center gap-1.5 text-white">
            <span className="text-[#00f0ff] font-bold">CLASSIFY SELECTED:</span>
            <span className="truncate max-w-[140px] text-[#dde2f8]">"{activeSelectedSignal.content.replace(/^"|"$/g, '').slice(0, 25)}..."</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={classifyingId === activeSelectedSignal.id}
              onClick={() => handleClassify(activeSelectedSignal.id, 'LOW')}
              className="px-2 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 font-bold rounded-2xs transition-all cursor-pointer"
            >
              SET LOW
            </button>
            <button
              disabled={classifyingId === activeSelectedSignal.id}
              onClick={() => handleClassify(activeSelectedSignal.id, 'MOD')}
              className="px-2 py-0.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-500 text-amber-200 font-bold rounded-2xs transition-all cursor-pointer"
            >
              SET MOD
            </button>
            <button
              disabled={classifyingId === activeSelectedSignal.id}
              onClick={() => handleClassify(activeSelectedSignal.id, 'HIGH')}
              className="px-2 py-0.5 bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-200 font-bold rounded-2xs transition-all cursor-pointer"
            >
              SET HIGH
            </button>
          </div>
        </div>
      )}

      {/* Floating feedback toast */}
      {feedbackToast && (
        <div className="px-3 py-1 bg-[#00f0ff]/20 border-b border-[#00f0ff] text-[#00f0ff] text-[10px] font-bold text-center animate-pulse">
          {feedbackToast}
        </div>
      )}

      {/* Ingestion Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[560px]">
        {filteredSignals.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#849495] flex flex-col items-center justify-center">
            <Sliders className="w-6 h-6 text-[#00f0ff]/40 mb-2" />
            <div>NO SIGNALS MATCHING CURRENT SEVERITY FILTER [{filterSeverity}]</div>
            <button
              onClick={() => setFilterSeverity('ALL')}
              className="mt-2 text-[#00f0ff] underline text-[11px] cursor-pointer"
            >
              SHOW ALL SIGNALS
            </button>
          </div>
        ) : (
          filteredSignals.map(sig => {
            const badge = getRiskBadge(sig.riskScore);
            const isSelected = selectedSignalId === sig.id;
            const isCritical = sig.riskScore >= 70;

            return (
              <div
                key={sig.id}
                onClick={() => {
                  audioFx.playChirp();
                  onSelectSignal(sig);
                }}
                className={`p-2.5 rounded-sm border cursor-pointer transition-all relative ${
                  isCritical
                    ? isSelected
                      ? 'border-red-500 bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'border-red-500/60 bg-red-950/25 hover:border-red-400'
                    : isSelected
                    ? 'border-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'border-white/10 bg-black/30 hover:border-[#00f0ff]/40 hover:bg-black/50'
                }`}
              >
                {/* Top metadata */}
                <div className="flex justify-between items-center mb-1.5 text-[10px]">
                  <div className="flex items-center gap-1.5 text-[#849495] truncate max-w-[65%]">
                    {sig.source === 'darknet' || isCritical ? (
                      <ShieldAlert className="w-3 h-3 text-red-500 shrink-0" />
                    ) : (
                      <MessageSquare className="w-3 h-3 text-[#00f0ff] shrink-0" />
                    )}
                    <span className="text-white uppercase font-bold">
                      {sig.source === 'x' ? 'X (TWITTER)' : sig.source.toUpperCase()}
                    </span>
                    <span className="truncate">// {sig.sourceHandle}</span>
                    <span className="shrink-0">• {sig.timeAgo || 'JUST NOW'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {sig.isSynthetic === false && (
                      <span className="text-[9px] px-1 py-0.5 rounded-2xs bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 font-bold uppercase">
                        REAL-TIME WEB
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-xs border text-[10px] ${badge.classes}`}>
                      {badge.text}
                    </span>
                  </div>
                </div>

                {/* Signal Content Payload */}
                <div
                  className={`text-xs font-mono mb-2 tracking-wide leading-relaxed ${
                    isCritical ? 'text-red-300 font-semibold' : 'text-[#dde2f8]'
                  }`}
                >
                  {sig.content}
                </div>

                {/* Bottom Classification & Quick Reclassification Bar */}
                <div className="flex flex-wrap justify-between items-center text-[10px] pt-1.5 border-t border-white/5 gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[#849495]">AI:</span>
                    <span
                      className={`font-semibold ${
                        isCritical
                          ? 'text-red-400 font-mono'
                          : sig.riskScore >= 50
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {sig.aiClassification}
                    </span>
                  </div>

                  {/* QUICK CLASSIFICATION PILL BUTTONS */}
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-[#849495] uppercase mr-0.5">SET:</span>
                    <button
                      onClick={e => handleClassify(sig.id, 'LOW', e)}
                      title="Classify sentence as LOW risk"
                      className={`px-1.5 py-0.5 rounded-2xs border text-[9px] font-bold transition-all cursor-pointer ${
                        sig.riskScore < 50
                          ? 'border-emerald-400 bg-emerald-950 text-emerald-300'
                          : 'border-white/10 hover:border-emerald-500/60 text-[#849495] hover:text-emerald-400'
                      }`}
                    >
                      LOW
                    </button>

                    <button
                      onClick={e => handleClassify(sig.id, 'MOD', e)}
                      title="Classify sentence as MODERATE risk"
                      className={`px-1.5 py-0.5 rounded-2xs border text-[9px] font-bold transition-all cursor-pointer ${
                        sig.riskScore >= 50 && sig.riskScore < 70
                          ? 'border-amber-400 bg-amber-950 text-amber-200'
                          : 'border-white/10 hover:border-amber-500/60 text-[#849495] hover:text-amber-400'
                      }`}
                    >
                      MOD
                    </button>

                    <button
                      onClick={e => handleClassify(sig.id, 'HIGH', e)}
                      title="Classify sentence as HIGH risk"
                      className={`px-1.5 py-0.5 rounded-2xs border text-[9px] font-bold transition-all cursor-pointer ${
                        sig.riskScore >= 70
                          ? 'border-red-400 bg-red-950 text-red-200 shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                          : 'border-white/10 hover:border-red-500/60 text-[#849495] hover:text-red-400'
                      }`}
                    >
                      HIGH
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-black/60 border-t border-white/10 text-[10px] text-[#849495] flex justify-between items-center">
        <span>LIVE INGESTION: REDDIT & X PUBLIC FEEDS</span>
        <span className="text-[#00f0ff] font-semibold">BUFFER: 99.8% READY</span>
      </div>
    </div>
  );
};
