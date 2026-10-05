import React from 'react';
import { Wifi, Cpu, GitFork, AlertOctagon, CheckCircle2, Zap } from 'lucide-react';

interface TelemetryBarProps {
  ingestedPackets: number;
  analyzedToday: number;
  flaggedReview: number;
  highPriority: number;
  confidence: number;
  latencyMs: number;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  ingestedPackets,
  analyzedToday,
  flaggedReview,
  highPriority,
  confidence,
  latencyMs,
}) => {
  const formatPackets = (num: number) => {
    return (num / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 }) + 'k';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 mb-4">
      {/* 1. Ingested Packets */}
      <div className="hud-panel p-3 rounded-sm flex flex-col justify-between">
        <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-[#849495] uppercase">
          <span>INGESTED PACKETS</span>
          <Wifi className="w-3.5 h-3.5 text-[#00f0ff]" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            {formatPackets(ingestedPackets)}
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-medium">+14k/s</span>
        </div>
      </div>

      {/* 2. Analyzed Today */}
      <div className="hud-panel p-3 rounded-sm flex flex-col justify-between">
        <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-[#849495] uppercase">
          <span>ANALYZED TODAY</span>
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            {analyzedToday.toLocaleString()}
          </div>
          <span className="text-[11px] font-mono text-blue-400">100% OK</span>
        </div>
      </div>

      {/* 3. Flagged Review */}
      <div className="hud-panel p-3 rounded-sm flex flex-col justify-between">
        <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-[#849495] uppercase">
          <span>FLAGGED REVIEW</span>
          <GitFork className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            {flaggedReview}
          </div>
          <span className="text-[10px] font-mono text-amber-400 uppercase">QUEUED</span>
        </div>
      </div>

      {/* 4. High Priority - Red Accent */}
      <div className="hud-panel-red p-3 rounded-sm flex flex-col justify-between shadow-[0_0_15px_rgba(239,68,68,0.2)]">
        <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-red-400 uppercase font-semibold">
          <span>HIGH PRIORITY</span>
          <AlertOctagon className="w-3.5 h-3.5 text-red-500 animate-pulse" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-red-400 tracking-tight">
            {highPriority}
          </div>
          <span className="text-[10px] font-mono text-red-400 tracking-wider font-bold uppercase animate-pulse">
            TRIAGE ACTIVE
          </span>
        </div>
      </div>

      {/* 5. NL Model Confidence */}
      <div className="hud-panel p-3 rounded-sm flex flex-col justify-between">
        <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-[#849495] uppercase">
          <span>NL MODEL CONFIDENCE</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400 tracking-tight">
            {confidence.toFixed(1)}%
          </div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase">OPTIMAL</span>
        </div>
      </div>

      {/* 6. Pipeline Latency */}
      <div className="hud-panel p-3 rounded-sm flex flex-col justify-between">
        <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-[#849495] uppercase">
          <span>PIPELINE LATENCY</span>
          <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight flex items-baseline gap-1">
            {latencyMs}
            <span className="text-xs text-[#849495] font-normal">ms</span>
          </div>
          <span className="text-[10px] font-mono text-[#00f0ff] uppercase">STABLE</span>
        </div>
      </div>
    </div>
  );
};
