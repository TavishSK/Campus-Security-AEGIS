import React from 'react';
import { SlidersHorizontal, Radio, ShieldCheck, AlertTriangle } from 'lucide-react';
import { audioFx } from '../utils/audioFx.js';

interface DoctrineBannerProps {
  azimuthDeg: number;
  frequencyGhz: number;
  onOpenFeedModal?: () => void;
}

export const DoctrineBanner: React.FC<DoctrineBannerProps> = ({
  azimuthDeg,
  frequencyGhz,
  onOpenFeedModal,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">
      {/* Left Grid Topology Matrix */}
      <div className="lg:col-span-3 hud-panel hud-corner p-2.5 rounded-sm font-mono text-[11px] flex flex-col justify-between">
        <div className="flex justify-between items-center pb-1.5 border-b border-white/10 text-[#849495] text-[10px]">
          <span className="text-[#00f0ff] font-bold">GRID TOPOLOGY MATRIX</span>
          <span className="tracking-widest">MESH_0x8C</span>
        </div>

        <div className="space-y-1.5 mt-2">
          {/* Node 1 */}
          <div className="flex justify-between items-center bg-black/40 px-2 py-1 border-l-2 border-emerald-400">
            <div>
              <span className="text-[#dde2f8] font-semibold">SECTOR_0x7A</span>
              <span className="text-[#849495] ml-1 text-[10px]">[GRID 12-K]</span>
              <div className="text-[9px] text-[#849495]">IP: 10.240.12.8</div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold">SECUR</span>
              <div className="text-[9px] text-[#849495]">LOAD: 12%</div>
            </div>
          </div>

          {/* Node 2 - Hostile Breach */}
          <div className="flex justify-between items-center bg-red-950/30 px-2 py-1 border-l-2 border-red-500 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]">
            <div>
              <span className="text-red-400 font-bold">NODE_404 //</span>
              <div className="text-[10px] text-red-300">CLUSTER_GAMMA</div>
              <div className="text-[9px] text-red-400 font-mono">PAYLOAD INJECT</div>
            </div>
            <div className="text-right">
              <span className="text-red-500 font-extrabold animate-pulse">BREACH</span>
              <div className="text-[9px] text-red-300">0x4B_ROOT</div>
            </div>
          </div>

          {/* Node 3 */}
          <div className="flex justify-between items-center bg-black/40 px-2 py-1 border-l-2 border-blue-400">
            <div>
              <span className="text-[#dde2f8] font-semibold">VECTOR_BETA</span>
              <span className="text-[#849495] ml-1 text-[10px]">// 0x8F9</span>
              <div className="text-[9px] text-[#849495]">IP: 10.240.88.2</div>
            </div>
            <div className="text-right">
              <span className="text-blue-400 font-bold">NOMINAL</span>
              <div className="text-[9px] text-[#849495]">LOAD: 41%</div>
            </div>
          </div>

          {/* Node 4 */}
          <div className="flex justify-between items-center bg-black/40 px-2 py-1 border-l-2 border-emerald-400">
            <div>
              <span className="text-[#dde2f8] font-semibold">ZONE_SIGMA</span>
              <span className="text-[#849495] ml-1 text-[10px]">// SUB_NET_03</span>
              <div className="text-[9px] text-[#849495]">AIR-GAP</div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold">SECUR</span>
              <div className="text-[9px] text-[#849495]">LOAD: 08%</div>
            </div>
          </div>

          {/* Node 5 */}
          <div className="flex justify-between items-center bg-black/40 px-2 py-1 border-l-2 border-amber-400">
            <div>
              <span className="text-[#dde2f8] font-semibold">NODE_992 //</span>
              <div className="text-[10px] text-amber-200">AIR_GAP_PROXY</div>
              <div className="text-[9px] text-[#849495]">SNIFFER: ON</div>
            </div>
            <div className="text-right">
              <span className="text-amber-400 font-bold">MONITOR</span>
              <div className="text-[9px] text-[#849495]">PKTS: 4.8M</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Center Operational Doctrine Headline */}
      <div className="lg:col-span-9 hud-panel hud-corner p-4 rounded-sm flex flex-col justify-between bg-gradient-to-r from-[#0b1120] via-[#0f172a] to-[#0b1120]">
        <div>
          <div className="text-[11px] font-mono tracking-widest text-[#00f0ff] uppercase flex items-center gap-2 mb-1.5">
            <span className="inline-block w-2 h-2 bg-[#00f0ff] rounded-xs" />
            <span>SYS_OPERATIONAL_DOCTRINE // DIRECTIVE 01-ALPHA [CYBER-OPS]</span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold tracking-tight leading-tight">
            <span className="text-[#dde2f8]">AI FINDS THE SIGNAL. </span>
            <span className="text-[#00f0ff] drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              CONTEXT GIVES IT MEANING.
            </span>{' '}
            <span className="text-emerald-400">HUMANS MAKE THE DECISION.</span>
          </h1>
        </div>

        {/* Bottom controls on banner */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs font-mono text-[#849495]">
            <span className="text-white uppercase font-bold tracking-wider">RADAR SCAN</span>
            <div className="flex items-center space-x-1.5 text-[#00f0ff] bg-[#00f0ff]/10 px-2.5 py-0.5 rounded-sm border border-[#00f0ff]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
              <span>{azimuthDeg}° AZIMUTH // {frequencyGhz.toFixed(1)} GHz</span>
            </div>
          </div>

          <button
            onClick={() => {
              audioFx.playThreatScan();
              if (onOpenFeedModal) onOpenFeedModal();
            }}
            className="px-3.5 py-1.5 rounded-sm bg-[#00f0ff]/15 hover:bg-[#00f0ff]/25 border border-[#00f0ff] text-[#00f0ff] text-xs font-mono font-bold tracking-wider flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>FEED: SYNTHETIC SIMULATION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
