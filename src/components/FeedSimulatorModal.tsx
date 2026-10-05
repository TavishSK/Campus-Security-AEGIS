import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Terminal, Globe, Key, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { audioFx } from '../utils/audioFx.js';
import { api } from '../services/api.js';

interface FeedSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerTick: () => Promise<void>;
  simulationRunning: boolean;
  onToggleSimulation: () => void;
}

export const FeedSimulatorModal: React.FC<FeedSimulatorModalProps> = ({
  isOpen,
  onClose,
  onTriggerTick,
  simulationRunning,
  onToggleSimulation,
}) => {
  const [selectedSubreddit, setSelectedSubreddit] = useState('technology');
  const [xSearchQuery, setXSearchQuery] = useState('server OR code OR security');
  const [status, setStatus] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [redditClientId, setRedditClientId] = useState('');
  const [redditClientSecret, setRedditClientSecret] = useState('');
  const [xBearerToken, setXBearerToken] = useState('');

  if (!isOpen) return null;

  const handleFetchRedditNow = async () => {
    audioFx.playThreatScan();
    setLoadingAction('reddit');
    try {
      const sig = await api.fetchLiveReddit(selectedSubreddit);
      setStatus(`LIVE REDDIT POST INGESTED: "${sig.content.slice(0, 50)}..." [RISK: ${sig.riskScore}/100]`);
      setTimeout(() => setStatus(null), 5000);
    } catch (err: any) {
      setStatus(`REDDIT INGEST NOTICE: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFetchXNow = async () => {
    audioFx.playThreatScan();
    setLoadingAction('x');
    try {
      const sig = await api.fetchLiveX(xSearchQuery);
      setStatus(`LIVE X POST INGESTED: "${sig.content.slice(0, 50)}..." [RISK: ${sig.riskScore}/100]`);
      setTimeout(() => setStatus(null), 5000);
    } catch (err: any) {
      setStatus(`X INGEST NOTICE: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    audioFx.playChirp();
    await api.updateSourceCredentials({
      redditClientId,
      redditClientSecret,
      xBearerToken,
    });
    setStatus('API CREDENTIALS APPLIED TO LIVE INGESTION GATEWAY.');
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
      <div className="hud-panel p-5 rounded-sm max-w-xl w-full border border-[#00f0ff]/50 space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.2)] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00f0ff]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              REAL-TIME SOCIAL FEED CONNECTORS (REDDIT & X)
            </h3>
          </div>
          <button
            onClick={() => {
              audioFx.playChirp();
              onClose();
            }}
            className="text-[#849495] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status Overview */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-black/50 border border-emerald-500/40 rounded-xs">
            <div className="flex items-center justify-between text-emerald-400 font-bold mb-1">
              <span>REDDIT CONNECTOR</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-[#849495]">Status: CONNECTED_LIVE</div>
            <div className="text-[10px] text-white mt-0.5">r/all, r/technology, r/cybersecurity</div>
          </div>

          <div className="p-3 bg-black/50 border border-blue-500/40 rounded-xs">
            <div className="flex items-center justify-between text-blue-400 font-bold mb-1">
              <span>X (TWITTER) CONNECTOR</span>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-[#849495]">Status: CONNECTED_LIVE</div>
            <div className="text-[10px] text-white mt-0.5">Real-time public microblog firehose</div>
          </div>
        </div>

        {/* Immediate Live Ingestion Triggers */}
        <div className="p-3 bg-black/40 rounded-xs border border-white/10 space-y-3">
          <div className="text-[11px] text-[#00f0ff] uppercase font-bold flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>DISPATCH REAL-TIME CRAWL & THREAT ANALYSIS</span>
          </div>

          {/* Reddit Subreddit Selector */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#849495] uppercase">
              FETCH LATEST HUMAN COMMENT FROM SUBREDDIT:
            </label>
            <div className="flex gap-2">
              <select
                value={selectedSubreddit}
                onChange={e => setSelectedSubreddit(e.target.value)}
                className="bg-black/70 border border-white/20 text-white px-2 py-1.5 rounded-xs text-xs flex-1 font-mono"
              >
                <option value="technology">r/technology (Tech & Cyber News)</option>
                <option value="cybersecurity">r/cybersecurity (Threat Intel)</option>
                <option value="compsci">r/compsci (Algorithms & Systems)</option>
                <option value="college">r/college (Campus Discussions)</option>
                <option value="programming">r/programming (Developer Chatter)</option>
                <option value="all">r/all (Global Live Stream)</option>
              </select>

              <button
                disabled={loadingAction === 'reddit'}
                onClick={handleFetchRedditNow}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xs cursor-pointer transition-all shrink-0"
              >
                {loadingAction === 'reddit' ? 'FETCHING...' : 'INGEST REDDIT'}
              </button>
            </div>
          </div>

          {/* X / Microblog Query */}
          <div className="space-y-1 pt-2 border-t border-white/5">
            <label className="text-[10px] text-[#849495] uppercase">
              SEARCH & INGEST LIVE X / MICROBLOG KEYWORD:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={xSearchQuery}
                onChange={e => setXSearchQuery(e.target.value)}
                placeholder="e.g. server outage OR code exploit"
                className="bg-black/70 border border-white/20 text-white px-2 py-1.5 rounded-xs text-xs flex-1 font-mono"
              />

              <button
                disabled={loadingAction === 'x'}
                onClick={handleFetchXNow}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xs cursor-pointer transition-all shrink-0"
              >
                {loadingAction === 'x' ? 'FETCHING...' : 'INGEST X'}
              </button>
            </div>
          </div>
        </div>

        {/* Automated Background Poller Controls */}
        <div className="flex items-center justify-between p-3 bg-black/40 rounded-xs border border-white/10 text-xs">
          <div>
            <div className="text-white font-bold">AUTOMATED REAL-TIME INGESTION POLLER</div>
            <div className="text-[10px] text-[#849495]">Pulls genuine live web sentences every ~4.5s</div>
          </div>
          <button
            onClick={() => {
              audioFx.playChirp();
              onToggleSimulation();
            }}
            className={`px-3 py-1.5 rounded-xs font-bold text-xs uppercase cursor-pointer ${
              simulationRunning
                ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                : 'bg-yellow-950 border border-yellow-500 text-yellow-300'
            }`}
          >
            {simulationRunning ? 'POLLER ACTIVE' : 'PAUSED'}
          </button>
        </div>

        {/* Optional Official API Credentials Configuration */}
        <div className="p-3 bg-black/30 rounded-xs border border-white/5 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-white font-bold text-[11px]">
            <Key className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>OPTIONAL: DIRECT REDDIT / X API CREDENTIALS</span>
          </div>
          <p className="text-[10px] text-[#849495]">
            The system currently pulls real-time live posts via public real-time endpoints. You can optionally supply official developer tokens below for direct authenticated rate limits.
          </p>

          <form onSubmit={handleSaveCredentials} className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-[#849495] uppercase">REDDIT CLIENT ID</label>
                <input
                  type="text"
                  value={redditClientId}
                  onChange={e => setRedditClientId(e.target.value)}
                  placeholder="e.g. wXyZ_123"
                  className="w-full bg-black/80 border border-white/10 p-1.5 rounded-xs text-[11px] text-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-[#849495] uppercase">REDDIT CLIENT SECRET</label>
                <input
                  type="password"
                  value={redditClientSecret}
                  onChange={e => setRedditClientSecret(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/80 border border-white/10 p-1.5 rounded-xs text-[11px] text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] text-[#849495] uppercase">X (TWITTER) BEARER TOKEN</label>
              <input
                type="password"
                value={xBearerToken}
                onChange={e => setXBearerToken(e.target.value)}
                placeholder="AAAAAAAAAAAAAAAAAAAAA..."
                className="w-full bg-black/80 border border-white/10 p-1.5 rounded-xs text-[11px] text-white"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-3 py-1 bg-white/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 text-xs font-bold rounded-xs cursor-pointer"
              >
                SAVE CREDENTIALS
              </button>
            </div>
          </form>
        </div>

        {status && (
          <div className="p-2.5 bg-[#00f0ff]/10 border border-[#00f0ff]/50 text-[#00f0ff] text-[11px] rounded-xs text-center font-bold animate-pulse">
            {status}
          </div>
        )}
      </div>
    </div>
  );
};
