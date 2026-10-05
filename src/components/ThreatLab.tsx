import React, { useState } from 'react';
import type { ThreatLabAnalysisResponse } from '../../server/types/index.js';
import { Terminal, ShieldAlert, Cpu, Sparkles, CheckCircle2, CornerDownRight, Play } from 'lucide-react';
import { audioFx } from '../utils/audioFx.js';

interface ThreatLabProps {
  onAnalyze: (payload: {
    text: string;
    contextWindowEnabled: boolean;
    contextThread?: any;
  }) => Promise<ThreatLabAnalysisResponse>;
}

const PRESETS = [
  {
    type: 'CLEAN HYPERBOLE',
    text: 'This code is the bomb bro lol',
    btnClass: 'border-white/20 text-[#dde2f8] hover:border-[#00f0ff]',
  },
  {
    type: 'STUDENT GRIEVANCE',
    text: 'Exam week is going to destroy me',
    btnClass: 'border-white/20 text-[#dde2f8] hover:border-[#00f0ff]',
  },
  {
    type: 'AMBIGUOUS SOCIAL',
    text: 'Someone is going to pay for what happened in the cluster',
    btnClass: 'border-amber-500/40 text-amber-300 hover:border-amber-400',
  },
  {
    type: 'EXPLICIT THREAT',
    text: '[Synthetic Threat Simulation] Plan to execute payload exploit on node 0x9 tomorrow 2pm',
    btnClass: 'border-red-500 bg-red-950/20 text-red-400 hover:bg-red-950/40 font-bold',
  },
];

export const ThreatLab: React.FC<ThreatLabProps> = ({ onAnalyze }) => {
  const [inputText, setInputText] = useState(
    '[Synthetic Threat Simulation] Plan to execute payload exploit on node 0x9 tomorrow 2pm'
  );
  const [contextWindowActive, setContextWindowActive] = useState(true);
  const [loading, setLoading] = useState(false);

  // Default initial analysis state matching screenshot
  const [analysis, setAnalysis] = useState<ThreatLabAnalysisResponse>({
    analysisId: 'ANL-0X7F4A-9084',
    payload: '[Synthetic Threat Simulation] Plan to execute payload exploit on node 0x9 tomorrow 2pm',
    classification: 'CRITICAL_EXPLOIT_HOSTILE',
    riskScore: 96,
    riskLevel: 'CRITICAL',
    confidence: 98.4,
    factors: {
      hostileTerminology: 28,
      intentPattern: 32,
      specificTarget: 24,
      temporalProximity: 18,
      mitigatingFactors: -6,
    },
    rationale:
      "Hostile terminology ('payload exploit', 'execute') targeting core server cluster 'node 0x9' with narrow temporal trigger. Ingested from darknet syndicate feed. Immediate operator confirmation required to invoke firewall airgap.",
    intentCategory: 'POTENTIAL_CYBER_ATTACK',
    sentiment: 'HOSTILE_INTENT',
    entities: ['payload_exploit', 'node_0x9', 'scheduled_window_2pm'],
    stages: [
      { id: 'INGES', name: 'Ingestion Gateway', status: 'PASSED', durationMs: 2, outputSummary: 'Payload normalized & sanitized' },
      { id: 'TOKE', name: 'AST Tokenizer', status: 'PASSED', durationMs: 1, outputSummary: '10 tokens extracted' },
      { id: 'ENTIT', name: 'Entity Extraction', status: 'PASSED', durationMs: 2, outputSummary: 'payload_exploit, node_0x9' },
      { id: 'SEMANTI', name: 'Semantic Map', status: 'PASSED', durationMs: 3, outputSummary: 'Vector cluster hostile' },
      { id: 'SENTIMEN', name: 'Sentiment & Tone', status: 'PASSED', durationMs: 2, outputSummary: 'HOSTILE_INTENT' },
      { id: 'CONTE', name: 'Context Resolver', status: 'PASSED', durationMs: 4, outputSummary: 'Antecedent resolution: VERIFIED' },
      { id: 'INTEN', name: 'Intent Classifier', status: 'PASSED', durationMs: 2, outputSummary: 'CYBER_ATTACK' },
      { id: 'SCOR', name: 'Risk Scoring Matrix', status: 'FLAGGED', durationMs: 2, outputSummary: 'Risk coefficient 96/100' },
    ],
    executionDurationMs: 18,
    contextEvaluation: {
      resolution: 'VERIFIED',
      antecedentScoreModifier: -6,
      threadNotes: 'Ingested thread corroborates target cluster vulnerability reconnaissance (+2/-2 msgs).',
    },
    recommendedAction: 'DEFCON_AIRGAP',
    modelMetadata: {
      provider: 'AEGIS AST Tokenizer v4.18',
      model: 'AST_TOKENIZER_v4',
      mode: 'DETERMINISTIC_HEURISTIC',
    },
  });

  const handleRunScan = async (overrideText?: string) => {
    const textToScan = overrideText !== undefined ? overrideText : inputText;
    if (!textToScan.trim()) return;

    audioFx.playThreatScan();
    setLoading(true);

    try {
      const res = await onAnalyze({
        text: textToScan,
        contextWindowEnabled: contextWindowActive,
        contextThread: contextWindowActive ? {
          preceding: [
            { author: '@peer_node', text: 'Did anyone see the vulnerability patch notes for cluster gamma?', time: '01:12 PM' },
          ],
          target: textToScan,
          subsequent: [
            { author: '@peer_node', text: 'Acknowledged, checking airgap logs...', time: '01:15 PM' },
          ],
        } : undefined,
      });
      setAnalysis(res);
      if (res.riskScore >= 90) {
        audioFx.playAlertSiren();
      }
    } catch (err: any) {
      console.error('Threat scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#ef4444'; // Red
    if (score >= 50) return '#f59e0b'; // Amber
    return '#10b981'; // Green
  };

  // SVG Gauge calculations
  const strokeDashoffset = 314 - (314 * analysis.riskScore) / 100;
  const scoreColor = getScoreColor(analysis.riskScore);

  return (
    <section className="mb-6 font-mono">
      {/* Top Banner and Description */}
      <div className="hud-panel hud-corner p-4 rounded-sm mb-3">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-[#00f0ff] font-bold text-xs">[0X00FF]</span>
            <span className="text-[#849495] text-xs font-semibold uppercase tracking-wider">
              CYBER FORENSICS // MANUAL PROMPT & PAYLOAD ANALYZER
            </span>
          </div>

          <button
            onClick={() => {
              audioFx.playChirp();
              setContextWindowActive(!contextWindowActive);
            }}
            className={`px-3 py-1 rounded-sm text-xs font-bold tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer ${
              contextWindowActive
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                : 'border-white/20 bg-black/40 text-[#849495]'
            }`}
          >
            <span>CONTEXT WINDOW ACTIVE</span>
            <span>[{contextWindowActive ? 'ON' : 'OFF'}]</span>
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight leading-snug">
          <span className="text-white">TEST THE SIGNAL. </span>
          <span className="text-[#00f0ff]">UNDERSTAND THE CONTEXT. </span>
          <span className="text-red-500">MEASURE THE RISK.</span>
        </h2>

        <p className="text-[#849495] text-xs font-sans mt-1.5 max-w-4xl leading-relaxed">
          Inject arbitrary prompt strings or intercepted code fragments directly into the AEGIS multi-stage semantic classifier.
          Evaluate how slang disambiguation, contextual threads, and syntactic proximity isolate lethal payloads while de-escalating standard internet hyperbole.
        </p>

        {/* Quick Presets Bar */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#849495] text-[10px] uppercase font-bold tracking-wider mr-1">
            INJECT TEST PAYLOAD:
          </span>

          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                audioFx.playChirp();
                setInputText(p.text);
                handleRunScan(p.text);
              }}
              className={`px-2.5 py-1 rounded-xs border text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${p.btnClass}`}
            >
              <span className="font-bold text-[10px]">[{p.type}]</span>
              <span className="truncate max-w-[200px]">"{p.text}"</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Threat Lab Two-Column Interactive View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Interactive Input & Thread Context (7 cols) */}
        <div className="lg:col-span-8 hud-panel hud-corner p-4 rounded-sm flex flex-col justify-between">
          <div>
            {/* Input Header & Counter */}
            <div className="flex justify-between items-center text-[11px] text-[#849495] mb-1.5">
              <div className="flex items-center gap-1 text-[#00f0ff] font-semibold">
                <Terminal className="w-3.5 h-3.5" />
                <span>ENTER PROMPT / PAYLOAD TO DECODE & ANALYZE THREAT COEFFICIENT</span>
              </div>
              <span className="text-[#00f0ff] font-bold">{inputText.length} CHARS</span>
            </div>

            {/* Input Textarea */}
            <div className="relative mb-3">
              <textarea
                rows={3}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Enter raw payload string or communication fragment..."
                className="w-full bg-[#060913] border border-white/20 focus:border-[#00f0ff] focus:outline-none p-3 text-xs text-[#00f0ff] rounded-xs font-mono resize-none leading-relaxed shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Parser Status & Scan Button */}
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <div className="text-[11px] text-[#849495] flex items-center gap-2">
                <span>PARSER:</span>
                <span className="text-white font-bold">AST_TOKENIZER_v4</span>
                <span className="text-[#849495]">|</span>
                <span className="text-emerald-400 font-bold">0x00FF READY</span>
              </div>

              <button
                disabled={loading}
                onClick={() => handleRunScan()}
                className="px-4 py-2 rounded-xs bg-[#00f0ff] hover:bg-[#7df4ff] text-[#060913] text-xs font-mono font-extrabold tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'RUNNING AST NEURAL SCAN...' : 'EXECUTE NEURAL DECODE & THREAT SCAN'}</span>
              </button>
            </div>

            {/* Ingested Thread Context Box */}
            <div className="bg-black/50 border border-white/10 p-3 rounded-xs mb-4 text-xs">
              <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-white/5 text-[10px]">
                <div className="text-[#00f0ff] font-bold flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>INGESTED THREAD CONTEXT (+2 / -2 MESSAGES)</span>
                </div>
                <span className="text-emerald-400 font-bold uppercase tracking-wider">
                  {analysis.contextEvaluation.resolution}: VERIFIED
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#849495]">
                <div>
                  <span className="text-[#849495]">[01:12 PM] @peer_node:</span>{' '}
                  <span className="text-[#dde2f8]">"Did anyone see the vulnerability patch notes for cluster gamma?"</span>
                </div>

                <div className="p-1.5 bg-[#00f0ff]/5 border-l-2 border-[#00f0ff] text-white font-semibold">
                  <span className="text-[#00f0ff]">[01:14 PM] Target:</span>{' '}
                  <span className={analysis.riskScore >= 90 ? 'text-red-300' : 'text-[#00f0ff]'}>
                    "{analysis.payload}"
                  </span>
                </div>

                <div>
                  <span className="text-[#849495]">[01:15 PM] @peer_node:</span>{' '}
                  <span className="text-[#dde2f8]">"Acknowledged, checking airgap logs..."</span>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Stage Neural Pipeline Execution Stepper */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex justify-between items-center text-[10px] text-[#849495] mb-2">
              <span className="font-bold text-[#dde2f8] uppercase tracking-wider">
                MULTI-STAGE NEURAL PIPELINE EXECUTION
              </span>
              <span className="text-emerald-400 font-bold tracking-wider">
                STATUS: ALL GATES PASS
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
              {['INGES', 'TOKE', 'ENTIT', 'SEMANTI', 'SENTIMEN', 'CONTE', 'INTEN', 'SCOR'].map((gate, i) => (
                <div
                  key={gate}
                  className="bg-black/40 border border-white/10 p-1.5 rounded-xs flex flex-col items-center justify-between"
                >
                  <span className="text-[10px] text-[#849495] font-bold">{gate}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shadow-[0_0_6px_#34d399]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Computed Risk Coefficient Gauge (4 cols) */}
        <div className="lg:col-span-4 hud-panel hud-corner p-4 rounded-sm flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <div className="text-[10px] text-[#849495] uppercase font-bold tracking-widest mb-3">
              COMPUTED RISK COEFFICIENT
            </div>

            {/* Circular Risk Meter */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center mb-3">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#151b2b"
                  strokeWidth="8"
                />
                {/* Active Dynamic Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeDasharray="314"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px ${scoreColor})`,
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-4xl font-mono font-extrabold tracking-tight"
                  style={{ color: scoreColor }}
                >
                  {analysis.riskScore}
                </span>
                <span className="text-[10px] text-[#849495] font-semibold tracking-wider uppercase">
                  OUT OF 100
                </span>
              </div>
            </div>

            {/* Step Segmented Bars */}
            <div className="flex justify-center gap-1 mb-3">
              {Array.from({ length: 10 }).map((_, idx) => {
                const filled = idx < Math.round(analysis.riskScore / 10);
                return (
                  <div
                    key={idx}
                    className="w-3 h-1.5 rounded-2xs transition-all"
                    style={{
                      backgroundColor: filled ? scoreColor : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: filled ? `0 0 6px ${scoreColor}` : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Level Classification Badge */}
            <div
              className="px-3 py-1 rounded-xs font-mono font-extrabold text-xs tracking-wider inline-block mb-3 border uppercase"
              style={{
                borderColor: scoreColor,
                backgroundColor: `${scoreColor}15`,
                color: scoreColor,
              }}
            >
              LEVEL {analysis.riskScore >= 90 ? '4' : analysis.riskScore >= 70 ? '3' : '2'} // {analysis.classification}
            </div>

            {/* Forensic Rationale */}
            <p className="text-[11px] text-[#dde2f8] leading-relaxed mb-4 text-left bg-black/40 p-2.5 rounded-xs border border-white/5">
              {analysis.rationale}
            </p>
          </div>

          {/* Bottom Execution Stats */}
          <div className="w-full pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-[#849495]">
            <div>
              EXECUTION DURATION: <span className="text-white font-bold">{analysis.executionDurationMs}MS</span>
            </div>
            <div>
              CONFIDENCE: <span className="text-emerald-400 font-bold">{analysis.confidence.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
