import React from 'react';
import { Globe, UserCheck, ShieldCheck, UserX, CheckCircle } from 'lucide-react';

export const SafeguardsFooter: React.FC = () => {
  return (
    <section className="mb-6 font-mono">
      <div className="flex flex-wrap justify-between items-baseline gap-2 mb-3">
        <div>
          <div className="text-[10px] text-[#00f0ff] uppercase tracking-widest font-bold">
            ETHICAL GOVERNANCE & CRYPTOGRAPHIC PRIVACY FRAMEWORK
          </div>
          <h3 className="text-lg sm:text-xl font-display font-extrabold text-white">
            CONSTITUTIONAL PRIVACY & AIRGAP SAFEGUARDS
          </h3>
        </div>

        <div className="text-[10px] text-[#849495] tracking-wider uppercase">
          COMPLIANCE CERTIFIED // FERPA, GDPR & STATE DATA ETHICS LEVEL 4
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Card 1 */}
        <div className="hud-panel hud-corner p-4 rounded-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xs border border-[#00f0ff]/30 bg-[#00f0ff]/10 flex items-center justify-center text-[#00f0ff] mb-3">
              <Globe className="w-4 h-4" />
            </div>

            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-2">
              PUBLIC INGESTION ONLY
            </h4>

            <p className="text-[11px] text-[#849495] leading-relaxed">
              AEGIS strictly monitors unencrypted, publicly broadcast forums, open subreddits, and public X microblogs.
              Zero packet sniffing of private messages, encrypted DMs, SMS, or personal student credentials.
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>PUBLIC BROADCAST PROTOCOL</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="hud-panel hud-corner p-4 rounded-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xs border border-[#00f0ff]/30 bg-[#00f0ff]/10 flex items-center justify-center text-[#00f0ff] mb-3">
              <UserCheck className="w-4 h-4" />
            </div>

            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-2">
              HUMAN IN THE LOOP ALWAYS
            </h4>

            <p className="text-[11px] text-[#849495] leading-relaxed">
              Zero autonomous physical lockdowns, security dispatches, or emergency paging may execute without affirmative human operator cryptographic sign-off and explicit rationale logging.
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>OPERATOR CLEARANCE REQ</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="hud-panel hud-corner p-4 rounded-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xs border border-[#00f0ff]/30 bg-[#00f0ff]/10 flex items-center justify-center text-[#00f0ff] mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>

            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-2">
              CRYPTOGRAPHIC AUDIT LEDGER
            </h4>

            <p className="text-[11px] text-[#849495] leading-relaxed">
              Every ingested signal, classification change, and operator override is appended to an immutable, time-stamped SHA-256 hash chain for full civil liberties oversight and post-incident verification.
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>SHA-256 HASH VERIFIED</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="hud-panel hud-corner p-4 rounded-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xs border border-[#00f0ff]/30 bg-[#00f0ff]/10 flex items-center justify-center text-[#00f0ff] mb-3">
              <UserX className="w-4 h-4" />
            </div>

            <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-2">
              ZERO BIOMETRIC RECOGNITION
            </h4>

            <p className="text-[11px] text-[#849495] leading-relaxed">
              System architecture permanently excludes facial recognition modules, biometric identity clustering, and predictive individual profiling. Focus remains purely on macroscopic digital and network vectors.
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>HARDWARE BLOCK ACTIVE</span>
          </div>
        </div>
      </div>
    </section>
  );
};
