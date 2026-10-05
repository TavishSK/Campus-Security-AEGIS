import React, { useState } from 'react';
import type { CaseFile } from '../../server/types/index.js';
import { FileText, ShieldAlert, CheckCircle, Clock, Plus, Send } from 'lucide-react';
import { audioFx } from '../utils/audioFx.js';

interface CasesViewProps {
  cases: CaseFile[];
  onAddNote: (caseId: string, note: string) => Promise<void>;
  onCreateCase: (title: string, summary: string, targetNode: string) => Promise<void>;
}

export const CasesView: React.FC<CasesViewProps> = ({ cases, onAddNote, onCreateCase }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [noteText, setNoteText] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newNode, setNewNode] = useState('NODE_404');

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    audioFx.playChirp();
    await onCreateCase(newTitle, newSummary, newNode);
    setShowNewModal(false);
    setNewTitle('');
    setNewSummary('');
  };

  const handleSendNote = async () => {
    if (!noteText.trim() || !activeCase) return;
    audioFx.playChirp();
    await onAddNote(activeCase.id, noteText);
    setNoteText('');
  };

  return (
    <div className="font-mono space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-white/10">
        <div>
          <div className="text-[10px] text-[#00f0ff] uppercase tracking-widest font-bold">
            FORENSIC CASE MANAGEMENT & INVESTIGATION DOSSIERS
          </div>
          <h2 className="text-xl font-display font-extrabold text-white">
            OPERATIONAL SECURITY CASE FILES
          </h2>
        </div>

        <button
          onClick={() => {
            audioFx.playChirp();
            setShowNewModal(true);
          }}
          className="px-3.5 py-1.5 rounded-sm bg-[#00f0ff]/15 border border-[#00f0ff] text-[#00f0ff] text-xs font-bold flex items-center gap-1.5 hover:bg-[#00f0ff]/25 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>OPEN NEW CASE FILE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Cases List (4 cols) */}
        <div className="lg:col-span-4 hud-panel p-3 rounded-sm space-y-2 max-h-[650px] overflow-y-auto">
          <div className="text-[11px] text-[#849495] font-bold uppercase pb-1 border-b border-white/5">
            ACTIVE CASE DOSSIERS ({cases.length})
          </div>

          {cases.map(c => {
            const isSelected = activeCase?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  audioFx.playChirp();
                  setSelectedCaseId(c.id);
                }}
                className={`p-3 rounded-xs border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'border-white/10 bg-black/40 hover:border-white/30'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className="text-white font-bold">{c.caseNumber}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-2xs font-bold text-[9px] ${
                      c.severity === 'CRITICAL'
                        ? 'border border-red-500 bg-red-950/40 text-red-400'
                        : 'border border-amber-500 bg-amber-950/40 text-amber-300'
                    }`}
                  >
                    {c.severity}
                  </span>
                </div>

                <div className="text-xs text-[#dde2f8] font-semibold mb-1 truncate">
                  {c.title}
                </div>

                <div className="flex justify-between items-center text-[10px] text-[#849495]">
                  <span>NODE: {c.targetNode}</span>
                  <span className="text-emerald-400">{c.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Case Details (8 cols) */}
        {activeCase ? (
          <div className="lg:col-span-8 hud-panel p-4 rounded-sm space-y-4">
            <div className="flex flex-wrap justify-between items-start gap-2 pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg text-white font-bold">{activeCase.caseNumber}</span>
                  <span className="px-2 py-0.5 rounded-xs bg-red-950/50 border border-red-500 text-red-400 text-xs font-bold">
                    {activeCase.severity}
                  </span>
                  <span className="text-emerald-400 text-xs font-bold border border-emerald-500/40 px-2 py-0.5 bg-emerald-950/20">
                    STATUS: {activeCase.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#dde2f8]">{activeCase.title}</h3>
              </div>

              <div className="text-right text-[11px] text-[#849495]">
                <div>ASSIGNED ANALYST: <span className="text-white font-bold">{activeCase.assignedAnalyst}</span></div>
                <div>TARGET SECTOR: <span className="text-[#00f0ff] font-bold">{activeCase.targetNode}</span></div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-black/50 p-3 rounded-xs border border-white/10">
              <div className="text-[10px] text-[#849495] uppercase font-bold mb-1">EXECUTIVE THREAT SUMMARY</div>
              <p className="text-xs text-[#dde2f8] leading-relaxed">{activeCase.summary}</p>
            </div>

            {/* Evidence items */}
            <div>
              <div className="text-[10px] text-[#849495] uppercase font-bold mb-2">ATTACHED DIGITAL EVIDENCE</div>
              <div className="space-y-1.5 text-xs">
                {activeCase.evidence.map((ev, i) => (
                  <div key={i} className="p-2 bg-black/40 border border-white/5 rounded-xs text-[#00f0ff] flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#00f0ff]" />
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <div className="text-[10px] text-[#849495] uppercase font-bold mb-2">FORENSIC TIMELINE & AUDIT TRAIL</div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeCase.timeline.map((item, idx) => (
                  <div key={idx} className="p-2 bg-black/30 border border-white/5 rounded-xs text-xs flex justify-between items-start">
                    <div>
                      <div className="text-white font-semibold flex items-center gap-2">
                        <Clock className="w-3 h-3 text-[#00f0ff]" />
                        <span>{item.action}</span>
                        <span className="text-[10px] text-[#849495]">by {item.actor}</span>
                      </div>
                      {item.notes && <p className="text-[11px] text-[#dde2f8] mt-1">{item.notes}</p>}
                    </div>
                    <span className="text-[9px] text-[#849495]">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Append Note Input */}
            <div className="pt-2 border-t border-white/10">
              <div className="text-[10px] text-[#849495] uppercase font-bold mb-1.5">APPEND ANALYST NOTE</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendNote()}
                  placeholder="Enter analyst observation or tactical recommendation..."
                  className="flex-1 bg-black/60 border border-white/15 focus:border-[#00f0ff] focus:outline-none px-3 py-1.5 text-xs text-white rounded-xs font-mono"
                />
                <button
                  onClick={handleSendNote}
                  className="px-3 py-1.5 bg-[#00f0ff] text-[#060913] text-xs font-bold rounded-xs flex items-center gap-1.5 hover:bg-[#7df4ff] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>RECORD</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* New Case Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="hud-panel p-5 rounded-sm max-w-md w-full border border-[#00f0ff]/50 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase">INITIALIZE NEW INCIDENT DOSSIER</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-[#849495] uppercase">CASE TITLE</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Cluster Gamma Infiltration Reconnaissance"
                  className="w-full bg-black/70 border border-white/20 p-2 text-white rounded-xs mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#849495] uppercase">TARGET NODE</label>
                <select
                  value={newNode}
                  onChange={e => setNewNode(e.target.value)}
                  className="w-full bg-black/70 border border-white/20 p-2 text-white rounded-xs mt-1"
                >
                  <option value="NODE_404">NODE_404 // CLUSTER_GAMMA</option>
                  <option value="SECTOR_0x7A">SECTOR_0x7A [GRID 12-K]</option>
                  <option value="VECTOR_BETA">VECTOR_BETA // 0x8F9</option>
                  <option value="ZONE_SIGMA">ZONE_SIGMA // SUB_NET_03</option>
                  <option value="NODE_992">NODE_992 // AIR_GAP_PROXY</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#849495] uppercase">INVESTIGATION SUMMARY</label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  placeholder="Describe observed vector and target reconnaissance..."
                  className="w-full bg-black/70 border border-white/20 p-2 text-white rounded-xs mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 border border-white/20 text-[#849495] rounded-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00f0ff] text-[#060913] font-bold rounded-xs"
                >
                  CREATE CASE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
