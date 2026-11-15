import React from "react";
import { TECHNOLOGIES } from "../../data/team";
import { Cpu } from "lucide-react";

export const TechnologyMarquee: React.FC = () => {
  return (
    <section className="w-full py-16 sm:py-24 relative z-10 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        {/* Section Header */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
          <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
            ENGINEERED FOR DISCOVERY
          </p>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extralight tracking-tight text-white mb-3">
          Powered by Innovation<b className="text-[var(--accent)] font-normal">.</b>
        </h2>
        <p className="text-xs sm:text-sm text-white/50 font-light max-w-lg mx-auto">
          High-performance scientific computing, astrophysics processing, and WebGL rendering pipeline.
        </p>
      </div>

      {/* Seamless Infinite Marquee */}
      <div className="marquee-container w-full" aria-label="Technologies used in SPHEREx HORIZON">
        <div className="marquee-track flex gap-4">
          {/* Primary Track */}
          {TECHNOLOGIES.map((tech, i) => (
            <div key={`tech-1-${tech.name}-${i}`} className="tech-pill flex flex-col justify-center min-w-[220px]">
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="font-semibold text-sm text-white">{tech.name}</span>
                <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/20">
                  {tech.category}
                </span>
              </div>
              <span className="text-xs text-white/50 font-normal">{tech.description}</span>
            </div>
          ))}

          {/* Seamless Duplicate Track for Infinite Loop (Hidden from screen readers to prevent repetition) */}
          {TECHNOLOGIES.map((tech, i) => (
            <div
              key={`tech-2-${tech.name}-${i}`}
              aria-hidden="true"
              className="tech-pill flex flex-col justify-center min-w-[220px]"
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="font-semibold text-sm text-white">{tech.name}</span>
                <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/20">
                  {tech.category}
                </span>
              </div>
              <span className="text-xs text-white/50 font-normal">{tech.description}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologyMarquee;
