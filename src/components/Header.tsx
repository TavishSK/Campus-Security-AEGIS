import React, { useState } from 'react';
import { Volume2, VolumeX, ShieldAlert, Cpu, Terminal, Radio, Database, Activity, FileText, Globe, Play } from 'lucide-react';
import { audioFx } from '../utils/audioFx.js';

interface HeaderProps {
  simulationRunning: boolean;
  onToggleSimulation: () => void;
  audioFxOn: boolean;
  onToggleAudio: () => void;
  hostileCount: number;
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenFeedModal?: () => void;
  onReboot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  simulationRunning,
  onToggleSimulation,
  audioFxOn,
  onToggleAudio,
  hostileCount,
  activeView,
  onSelectView,
  onOpenFeedModal,
  onReboot,
}) => {
  const [operatorMenuOpen, setOperatorMenuOpen] = useState(false);

  return (
    <header className="border-b border-[#00f0ff]/20 bg-[#060913]/90 backdrop-blur-md sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (onReboot) {
                audioFx.playThreatScan();
                onReboot();
              }
            }}
            title="Click to replay AEGIS tactical boot sequence"
            className="border border-[#00f0ff] bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] px-2 py-0.5 text-xs font-mono font-bold tracking-wider rounded-sm flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.3)] cursor-pointer transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
            [0X7F]
          </button>
          <div>
            <div className="text-sm font-display font-extrabold tracking-wide text-white flex items-center gap-2">
              <span>AEGIS</span>
              <span className="text-[#00f0ff] font-mono font-normal text-xs">// CYBER-OPS COMMAND CENTER</span>
            </div>
            <div className="text-[10px] font-mono tracking-widest text-[#849495] uppercase">
              DIGITAL FORENSICS & THREAT VECTOR INTEL
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 font-mono text-xs">
          {[
            { id: 'hud', label: 'COMMAND CENTER', icon: Radio },
            { id: 'threat-lab', label: 'THREAT LAB', icon: Terminal },
            { id: 'cases', label: 'CASES & DOSSIERS', icon: FileText },
            { id: 'audit', label: 'AUDIT LEDGER', icon: Database },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  audioFx.playChirp();
                  onSelectView(tab.id);
                }}
                className={`px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-all uppercase tracking-wider ${
                  isActive
                    ? 'bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-semibold'
                    : 'text-[#849495] hover:text-[#dde2f8] hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Real-time Status Controls & Badges */}
        <div className="flex items-center space-x-2.5">
          {/* Replay Tactical Boot Sequence */}
          {onReboot && (
            <button
              onClick={() => {
                audioFx.playThreatScan();
                onReboot();
              }}
              title="Replay full 3D Tactical MIL-SPEC Boot Animation (or press 'B')"
              className="flex items-center space-x-1.5 text-[11px] font-mono text-[#00f0ff] border border-[#00f0ff]/50 px-2.5 py-1 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/25 rounded-sm cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all font-bold tracking-wider"
            >
              <Play className="w-3 h-3 text-[#00f0ff] fill-[#00f0ff]" />
              <span>REPLAY BOOT FX</span>
            </button>
          )}

          {/* Live Web Stream Badge */}
          <button
            onClick={() => {
              audioFx.playChirp();
              if (onOpenFeedModal) onOpenFeedModal();
            }}
            title="Configure live real-time Reddit & X streams"
            className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400 border border-emerald-500/40 px-2.5 py-1 bg-emerald-950/30 rounded-sm hover:bg-emerald-950/50 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          >
            <Globe className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider">LIVE: REAL-TIME (REDDIT & X)</span>
          </button>

          {/* Stream Pause/Resume Toggle */}
          <button
            onClick={() => {
              audioFx.playChirp();
              onToggleSimulation();
            }}
            title="Toggle background live ingestion pipeline"
            className={`text-[11px] font-mono px-2.5 py-1 rounded-sm border transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${
              simulationRunning
                ? 'border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20'
                : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>INGESTION: {simulationRunning ? 'RUNNING' : 'PAUSED'}</span>
          </button>

          {/* Audio FX Toggle */}
          <button
            onClick={() => {
              onToggleAudio();
              if (!audioFxOn) audioFx.playChirp();
            }}
            title="Toggle tactical audio synthesis"
            className={`text-[11px] font-mono px-2.5 py-1 rounded-sm border transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${
              audioFxOn
                ? 'border-[#00f0ff]/40 bg-[#00f0ff]/10 text-[#00f0ff]'
                : 'border-[#3b494b] bg-transparent text-[#849495]'
            }`}
          >
            {audioFxOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            <span>AUDIO FX [{audioFxOn ? 'ON' : 'OFF'}]</span>
          </button>

          {/* Hostile Vector Badge */}
          <div className="text-[11px] font-mono px-2.5 py-1 rounded-sm border border-red-500/50 bg-red-950/40 text-red-400 flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.25)] font-bold tracking-wider">
            <ShieldAlert className="w-3 h-3 text-red-400 animate-pulse" />
            <span>HOSTILE: {hostileCount < 10 ? `0${hostileCount}` : hostileCount} VECTOR</span>
          </div>

          {/* Operator Badge */}
          <div className="relative">
            <button
              onClick={() => {
                audioFx.playChirp();
                setOperatorMenuOpen(!operatorMenuOpen);
              }}
              className="text-[11px] font-mono px-2.5 py-1 rounded-sm border border-[#00f0ff]/40 bg-[#0f172a] text-white hover:border-[#00f0ff] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Cpu className="w-3 h-3 text-[#00f0ff]" />
              <span className="font-semibold text-[#00f0ff]">BLACK_HAT_07</span>
              <span className="text-[#849495] text-[10px]">ROOT // 0X00FF</span>
            </button>

            {operatorMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-[#0b1120] border border-[#00f0ff]/40 p-3 rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-50 font-mono text-xs">
                <div className="text-[#00f0ff] font-bold pb-1 border-b border-white/10 flex justify-between">
                  <span>OPERATOR STATUS</span>
                  <span className="text-emerald-400">AUTHENTICATED</span>
                </div>
                <div className="mt-2 space-y-1 text-[#849495] text-[11px]">
                  <div>CALLSIGN: <span className="text-white">BLACK_HAT_07</span></div>
                  <div>FEED SOURCE: <span className="text-emerald-400 font-bold">REAL-TIME WEB (REDDIT & X)</span></div>
                  <div>CLEARANCE: <span className="text-white">ROOT // DEFCON 1 AUTHORIZED</span></div>
                  <div>SESSION CIPHER: <span className="text-white">AES-256-GCM / 0x904F</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
