import React from 'react';
import type { NetworkNode } from '../../server/types/index.js';
import { Crosshair, ShieldAlert } from 'lucide-react';
import { audioFx } from '../utils/audioFx.js';

interface TacticalAzimuthRadarProps {
  nodes: NetworkNode[];
  azimuthDeg: number;
  onSelectNode?: (nodeName: string) => void;
}

export const TacticalAzimuthRadar: React.FC<TacticalAzimuthRadarProps> = ({
  nodes,
  azimuthDeg,
  onSelectNode,
}) => {
  return (
    <div className="hud-panel hud-corner rounded-sm flex flex-col h-full font-mono">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-4 h-4 text-[#00f0ff]" />
          <span className="font-bold text-xs text-white uppercase tracking-wider">
            TACTICAL AZIMUTH RADAR & MESH
          </span>
        </div>
        <div className="text-[11px] text-emerald-400 font-semibold border border-emerald-500/40 px-2 py-0.5 bg-emerald-950/20 rounded-xs">
          GRID: 12-K [ACTIVE]
        </div>
      </div>

      {/* Subheader Coordinates Bar */}
      <div className="px-3 py-1.5 bg-black/40 border-b border-white/5 flex flex-wrap justify-between items-center text-[10px] text-[#849495]">
        <div className="flex items-center gap-3">
          <div>HEX_X: <span className="text-white font-mono">0x7F4A</span></div>
          <div>HEX_Y: <span className="text-white font-mono">0x90B2</span></div>
          <div className="text-emerald-400 font-bold">STATUS: LIVE SWEEP</div>
        </div>
        <div className="flex items-center gap-3">
          <div>RANGE: <span className="text-white">1,200m MESH</span></div>
          <div className="text-[#00f0ff]">SCAN RATE: 4.2 GHz</div>
        </div>
      </div>

      {/* Radar Scope Visual Canvas */}
      <div className="p-4 flex-1 flex items-center justify-center relative min-h-[300px] overflow-hidden cyber-grid bg-[#060913]">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-[#00f0ff]/30 shadow-[0_0_30px_rgba(0,240,255,0.08)] flex items-center justify-center">
          {/* Inner concentric range rings */}
          <div className="absolute inset-4 rounded-full border border-[#00f0ff]/20" />
          <div className="absolute inset-12 rounded-full border border-[#00f0ff]/15" />
          <div className="absolute inset-20 rounded-full border border-[#00f0ff]/10" />

          {/* Crosshair lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-[1px] bg-[#00f0ff]/20" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-[1px] bg-[#00f0ff]/20" />
          </div>

          {/* Compass / Orientation Markers */}
          <span className="absolute top-1 text-[9px] text-[#00f0ff] font-bold">000° [NORTH]</span>
          <span className="absolute right-1 text-[9px] text-[#849495]">090° [0x7F]</span>
          <span className="absolute bottom-1 text-[9px] text-[#849495]">180° [AIRGAP]</span>
          <span className="absolute left-1 text-[9px] text-[#849495]">270° [PROXY]</span>

          {/* Rotating Sweep Beam */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none animate-radar-sweep"
            style={{
              background: 'conic-gradient(from 0deg, rgba(0, 240, 255, 0.28) 0deg, rgba(0, 240, 255, 0.05) 45deg, transparent 90deg, transparent 360deg)',
            }}
          />

          {/* Center Hub */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] z-10" />

          {/* Plotted Radar Target Blips */}
          {/* 1. SECTOR_0x7A */}
          <div
            onClick={() => onSelectNode?.('SECTOR_0x7A')}
            className="absolute cursor-pointer group"
            style={{ top: '28%', right: '24%' }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <div className="absolute left-3 top-[-6px] text-[9px] text-emerald-400 font-bold whitespace-nowrap bg-black/70 px-1 rounded-xs border border-emerald-500/30">
              SECTOR_0x7A
            </div>
          </div>

          {/* 2. VECTOR_BETA */}
          <div
            onClick={() => onSelectNode?.('VECTOR_BETA')}
            className="absolute cursor-pointer group"
            style={{ top: '16%', right: '15%' }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
            <div className="absolute left-3 top-[-6px] text-[9px] text-blue-300 font-semibold whitespace-nowrap bg-black/70 px-1 rounded-xs border border-blue-500/30">
              VECTOR_BETA
            </div>
          </div>

          {/* 3. ZONE_SIGMA */}
          <div
            onClick={() => onSelectNode?.('ZONE_SIGMA')}
            className="absolute cursor-pointer group"
            style={{ bottom: '22%', right: '18%' }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
            <div className="absolute left-3 top-[-6px] text-[9px] text-[#00f0ff] font-semibold whitespace-nowrap bg-black/70 px-1 rounded-xs border border-[#00f0ff]/30">
              ZONE_SIGMA
            </div>
          </div>

          {/* 4. NODE_404 - HOSTILE BREACH */}
          <div
            onClick={() => onSelectNode?.('NODE_404')}
            className="absolute cursor-pointer group z-20"
            style={{ bottom: '34%', left: '38%' }}
          >
            <div className="relative">
              <span className="w-4 h-4 rounded-full bg-red-500/50 absolute -inset-0.5 animate-ping" />
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444]" />
            </div>
            <div className="absolute left-3 top-[-8px] text-[10px] text-red-400 font-extrabold whitespace-nowrap bg-black/90 px-1.5 py-0.5 rounded-xs border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              NODE_404 [HOSTILE]
            </div>
          </div>
        </div>
      </div>

      {/* 4 Sector Status Cards Grid */}
      <div className="p-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
        {/* Card 1 */}
        <div className="p-2 bg-black/40 border border-white/5 rounded-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">SECTOR_0x7A</span>
            <span className="text-emerald-400 font-bold text-[10px]">SECURE</span>
          </div>
          <div className="text-[10px] text-[#849495] mt-0.5">21 Nodes • Grid 12-K</div>
        </div>

        {/* Card 2 */}
        <div className="p-2 bg-black/40 border border-white/5 rounded-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">VECTOR_BETA</span>
            <span className="text-blue-400 font-bold text-[10px]">NOMINAL</span>
          </div>
          <div className="text-[10px] text-[#849495] mt-0.5">54 Nodes • 0x8F9</div>
        </div>

        {/* Card 3 */}
        <div className="p-2 bg-black/40 border border-white/5 rounded-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">ZONE_SIGMA</span>
            <span className="text-amber-400 font-bold text-[10px]">MONITOR</span>
          </div>
          <div className="text-[10px] text-[#849495] mt-0.5">112 Nodes • SUB_NET_03</div>
        </div>

        {/* Card 4 - BREACH */}
        <div className="p-2 bg-red-950/30 border border-red-500/70 rounded-xs shadow-[0_0_10px_rgba(239,68,68,0.25)]">
          <div className="flex justify-between items-center">
            <span className="font-bold text-red-400">NODE_404</span>
            <span className="text-red-500 font-extrabold text-[10px] animate-pulse">BREACH</span>
          </div>
          <div className="text-[10px] text-red-300 mt-0.5">CLUSTER_GAMMA • HOSTILE</div>
        </div>
      </div>
    </div>
  );
};
