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
      <div className="logo-loop-container w-full" aria-label="Technologies used in SPHEREx HORIZON">
        <div className="logo-loop-track-wrapper">
          <div className="logo-loop-track">
            {/* Primary Track */}
            {TECHNOLOGIES.map((tech, i) => (
              <div key={`tech-1-${tech.name}-${i}`} className="logo-loop-item">
                <div className="logo-loop-card">
                  <div className="logo-loop-name">{tech.name}</div>
                  <div className="logo-loop-category">{tech.category}</div>
                </div>
              </div>
            ))}

            {/* Seamless Duplicate Track for Infinite 50% Loop */}
            {TECHNOLOGIES.map((tech, i) => (
              <div
                key={`tech-2-${tech.name}-${i}`}
                aria-hidden="true"
                className="logo-loop-item"
              >
                <div className="logo-loop-card">
                  <div className="logo-loop-name">{tech.name}</div>
                  <div className="logo-loop-category">{tech.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologyMarquee;
