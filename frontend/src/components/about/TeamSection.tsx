import React, { useState } from "react";
import { TEAM_MEMBERS, TeamMember } from "../../data/team";
import TeamCard from "./TeamCard";
import { X, Sparkles, CheckCircle2, History, Award } from "lucide-react";

export const TeamSection: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const row1 = TEAM_MEMBERS.slice(0, 3);
  const row2 = TEAM_MEMBERS.slice(3, 5);

  return (
    <section id="creators" className="w-full py-16 sm:py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
              THE METEOR RIZZLERS ROSTER
            </p>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white mb-4">
            Meet the Creators<b className="text-[var(--accent)] font-normal">.</b>
          </h2>
          <p className="text-base sm:text-lg text-white/60 font-light max-w-xl">
            Different perspectives. Shared curiosity. One vision for discovery.
          </p>
        </div>

        {/* Desktop Balanced Editorial Arrangement: 3 on top, 2 centered below */}
        <div className="space-y-6 sm:space-y-8">
          {/* Row 1: 3 Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {row1.map((member) => (
              <TeamCard
                key={member.id}
                member={member}
                onOpenDetail={(m) => setSelectedMember(m)}
              />
            ))}
          </div>

          {/* Row 2: 2 Centered Profiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {row2.map((member) => (
              <TeamCard
                key={member.id}
                member={member}
                onOpenDetail={(m) => setSelectedMember(m)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Accessible Detail Modal */}
      {selectedMember && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-modal-title"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#111117] border border-[var(--accent)]/30 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Close profile details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6 pb-6 border-b border-white/10">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/50 border border-white/15 flex-shrink-0">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs font-mono text-[var(--accent)] mb-1.5">
                  {selectedMember.currentRole}
                </div>
                <h3 id="member-modal-title" className="text-2xl font-bold text-white tracking-tight">
                  {selectedMember.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-white/50 mt-1">
                  <History className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>2025 NEO Tracker: {selectedMember.previousProjectRole}</span>
                </div>
              </div>
            </div>

            {/* Full Biography */}
            <div className="mb-6">
              <h4 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                Mission Profile & Biography
              </h4>
              <p className="text-sm text-white/80 leading-relaxed">
                {selectedMember.fullBio}
              </p>
            </div>

            {/* Contributions to SPHEREx HORIZON */}
            <div className="mb-6">
              <h4 className="text-xs font-mono text-[var(--accent)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                <span>Key Engineering & Scientific Contributions</span>
              </h4>
              <ul className="space-y-2">
                {selectedMember.contributions.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-white/75">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Complete Skills / Expertise */}
            <div>
              <h4 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2.5">
                Technical Expertise & Domains
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedMember.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeamSection;
