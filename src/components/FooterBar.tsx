import React from 'react';
import { ShieldAlert, Server } from 'lucide-react';
import { audioFx } from '../utils/audioFx.js';

interface FooterBarProps {
  airgapActive: boolean;
  defconLevel: number;
  onToggleAirgap: () => void;
  latencyMs: number;
  nodesOnline: number;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  airgapActive,
  defconLevel,
  onToggleAirgap,
  latencyMs,
  nodesOnline,
}) => {
  return (
    <footer className="mt-8 pt-4 pb-6 border-t border-white/10 font-mono text-xs">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left Hardware Airgap Control Box */}
        <button
          onClick={() => {
            audioFx.playAirgapLock();
            onToggleAirgap();
          }}
          className={`px-3 py-2 rounded-xs border text-left flex items-center gap-3 transition-all cursor-pointer ${
            airgapActive
              ? 'border-red-500 bg-red-950/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
              : 'border-[#00f0ff]/40 bg-[#0b1120] hover:border-[#00f0ff]'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xs flex items-center justify-center ${
              airgapActive ? 'bg-red-600 text-white animate-pulse' : 'bg-[#00f0ff]/10 text-[#00f0ff]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#849495] uppercase font-bold">HARDWARE AIRGAP</span>
              <span
                className={`text-[9px] px-1 rounded-2xs font-extrabold ${
                  airgapActive ? 'bg-red-500 text-white' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                DEFCON {defconLevel} // {airgapActive ? 'ISOLATION ENGAGED' : 'AUTOMATED PACKET DROP ACTIVE'}
              </span>
            </div>
            <div className="text-[10px] text-[#00f0ff] font-bold">
              STATUS: {airgapActive ? 'ACTIVE // 0xDEAD_BEEF' : 'STANDBY // 0x00FF_OK'}
            </div>
          </div>
        </button>

        {/* Right Engine Status Bar */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-4 gap-y-1 text-[11px] text-[#849495]">
          <div className="flex items-center gap-1.5 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>AEGIS CYBER ENGINE v4.18.2 [BLACK-HAT PROXY]</span>
          </div>
          <div>
            NODES ONLINE: <span className="text-white font-bold">{nodesOnline}</span>
          </div>
          <div>
            LATENCY: <span className="text-emerald-400 font-bold">{latencyMs}ms</span>
          </div>
          <div>
            BUILD HASH: <span className="text-[#00f0ff] font-mono">0x9f38a7c1c4</span>
          </div>
          <div className="text-[#849495]/80">
            AEGIS CYBER COMMAND CONSORTIUM © 2026
          </div>
        </div>
      </div>
    </footer>
  );
};
