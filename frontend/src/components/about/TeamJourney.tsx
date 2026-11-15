import React from "react";
import { JOURNEY_MILESTONES } from "../../data/team";
import { Award, Rocket, Telescope, CheckCircle } from "lucide-react";

export const TeamJourney: React.FC = () => {
  const getIcon = (idx: number) => {
    if (idx === 0) return <Rocket className="w-5 h-5 text-[var(--accent)]" />;
    if (idx === 1) return <Award className="w-5 h-5 text-[#f4a272]" />;
    return <Telescope className="w-5 h-5 text-[var(--accent2)]" />;
  };

  return (
    <section className="w-full py-16 sm:py-24 relative z-10 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
              EVOLUTION & MILESTONES
            </p>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white mb-4">
            The Journey That Brought Us Here<b className="text-[var(--accent)] font-normal">.</b>
          </h2>
          <p className="text-base sm:text-lg text-white/60 font-light max-w-xl">
            Every discovery begins with a question.
          </p>
        </div>

        {/* Timeline Track */}
        <div className="relative">
          {/* Glowing Copper Vertical Spine */}
          <div className="timeline-spine" aria-hidden="true" />

          {/* Milestones List */}
          <div className="space-y-12 sm:space-y-16">
            {JOURNEY_MILESTONES.map((m, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={m.year + m.title}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content Card */}
                  <div className="w-full md:w-1/2 pl-10 md:pl-0">
                    <div
                      className={`p-6 sm:p-8 rounded-2xl bg-[#111117] border border-white/10 hover:border-[var(--accent)]/40 transition-all shadow-lg ${
                        isEven ? "md:mr-8" : "md:ml-8"
                      }`}
                    >
                      {/* Badge & Year */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="px-2.5 py-0.5 rounded bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[11px] font-mono text-[var(--accent)]">
                          {m.badge}
                        </span>
                        <span className="font-mono text-xl font-bold text-white/40">
                          {m.year}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <h3 className="text-2xl font-semibold text-white tracking-tight mb-1">
                        {m.title}
                      </h3>
                      <h4 className="text-sm font-medium text-[var(--accent)] mb-4">
                        {m.subtitle}
                      </h4>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-6 font-normal">
                        {m.description}
                      </p>

                      {/* Key Highlights */}
                      <div className="space-y-2 pt-4 border-t border-white/10">
                        {m.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-white/80">
                            <CheckCircle className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Center Node (Desktop) / Left Node (Mobile) */}
                  <div className="absolute left-[13px] md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#08080C] border-2 border-[var(--accent)] shadow-[0_0_20px_rgba(244,162,114,0.4)] flex items-center justify-center z-10">
                      {getIcon(idx)}
                    </div>
                  </div>

                  {/* Empty Spacer on Opposite Side for Balanced Desktop Grid */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamJourney;
