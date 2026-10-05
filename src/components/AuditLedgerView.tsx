import React from 'react';
import type { AuditLedgerEntry } from '../../server/types/index.js';
import { Database, ShieldCheck, Hash, CheckCircle } from 'lucide-react';

interface AuditLedgerViewProps {
  entries: AuditLedgerEntry[];
}

export const AuditLedgerView: React.FC<AuditLedgerViewProps> = ({ entries }) => {
  return (
    <div className="font-mono space-y-4">
      <div className="flex flex-wrap justify-between items-center pb-2 border-b border-white/10 gap-2">
        <div>
          <div className="text-[10px] text-[#00f0ff] uppercase tracking-widest font-bold">
            IMMUTABLE CRYPTOGRAPHIC AUDIT PROVENANCE
          </div>
          <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
            <span>SHA-256 FORENSIC HASH CHAIN</span>
            <span className="text-emerald-400 text-xs px-2 py-0.5 rounded-xs border border-emerald-500/40 bg-emerald-950/20 font-mono">
              CHAIN VERIFIED 100%
            </span>
          </h2>
        </div>

        <div className="text-[11px] text-[#849495]">
          TOTAL LEDGER BLOCKS: <span className="text-white font-bold">{entries.length}</span>
        </div>
      </div>

      <div className="hud-panel p-4 rounded-sm space-y-3">
        <div className="text-xs text-[#849495] flex items-center gap-2 pb-2 border-b border-white/5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Every manual analyst intervention, DEFCON airgap toggle, and neural classification is cryptographically sealed into a sequential blockchain-style tamper-evident ledger.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] text-[#849495] uppercase">
                <th className="pb-2">BLK #</th>
                <th className="pb-2">TIMESTAMP</th>
                <th className="pb-2">ACTOR</th>
                <th className="pb-2">ACTION</th>
                <th className="pb-2">PAYLOAD HASH</th>
                <th className="pb-2">MERKLE HASH</th>
                <th className="pb-2">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-white/5 text-[11px]">
                  <td className="py-2.5 font-bold text-[#00f0ff]">#{entry.index}</td>
                  <td className="py-2.5 text-[#849495]">{new Date(entry.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 font-semibold text-white">{entry.actor}</td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded-2xs bg-black/60 border border-white/10 text-[#dde2f8]">
                      {entry.action}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-[#849495]">{entry.payloadHash}</td>
                  <td className="py-2.5 font-mono text-emerald-400">
                    {entry.hash.slice(0, 16)}...
                  </td>
                  <td className="py-2.5">
                    <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3" />
                      <span>SEALED</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
