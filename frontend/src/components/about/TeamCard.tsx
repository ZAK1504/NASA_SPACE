import React, { useState } from "react";
import { TeamMember } from "../../data/team";
import { Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";
import DecryptedText from "../ui/DecryptedText";

interface TeamCardProps {
  member: TeamMember;
  onOpenDetail: (member: TeamMember) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ member, onOpenDetail }) => {
  const [imageError, setImageError] = useState(false);

  // Extract initials for fallback
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="team-card-wrapper h-full">
      <div className="team-card flex flex-col h-full bg-[#111117] border border-white/10 rounded-2xl overflow-hidden hover:border-[var(--accent)]/50 transition-all duration-300">
        {/* Large Portrait Image Frame with Copper Rim Lighting */}
        <div className="portrait-frame relative w-full aspect-square bg-[#0d0d12] overflow-hidden">
          {!imageError ? (
            <img
              src={member.image}
              alt={`Portrait of ${member.name}, ${member.currentRole}`}
              className="portrait-image w-full h-full object-cover object-top"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="portrait-fallback w-full h-full flex items-center justify-center font-mono text-3xl font-bold text-[var(--accent)] bg-gradient-to-b from-[#1b1b24] to-[#0d0d12]">
              {initials}
            </div>
          )}
          {/* Subtle celestial copper rim highlight */}
          <div className="portrait-copper-rim pointer-events-none" />

          {/* Member Order Pill */}
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/70">
            0{member.displayOrder}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col flex-1">
          {/* Role Badge */}
          <div className="mb-2.5">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[11px] font-mono text-[var(--accent)]">
              {member.currentRole}
            </span>
          </div>

          {/* Member Name */}
          <h3 className="text-xl font-semibold text-white tracking-tight mb-2">
            <DecryptedText text={member.name} interval={35} />
          </h3>

          {/* Short Bio */}
          <p className="text-xs sm:text-sm text-white/65 leading-relaxed mb-4 flex-1">
            {member.shortBio}
          </p>

          {/* Primary Key Contribution */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-4">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-3 h-3 text-[var(--accent)]" />
              <span>Key HORIZON Contribution</span>
            </div>
            <p className="text-xs text-white/80 line-clamp-2">
              {member.contributions[0]}
            </p>
          </div>

          {/* Skills / Expertise Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {member.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded bg-white/5 text-[10.5px] font-mono text-white/60 border border-white/5"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10.5px] font-mono text-white/40">
                +{member.skills.length - 3}
              </span>
            )}
          </div>

          {/* Action to View Detailed Profile */}
          <button
            onClick={() => onOpenDetail(member)}
            className="w-full mt-auto py-2.5 px-4 rounded-xl border border-white/10 hover:border-[var(--accent)] bg-white/[0.04] hover:bg-[var(--accent)]/10 text-white hover:text-[var(--accent)] text-xs font-mono transition-all flex items-center justify-between cursor-pointer group"
          >
            <span>VIEW FULL PROFILE & HISTORY</span>
            <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
