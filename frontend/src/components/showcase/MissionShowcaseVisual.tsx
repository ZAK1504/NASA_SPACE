import React, { useState } from "react";
import { Compass, Target, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { FEATURED_OBJECTS } from "../../constants/objects";

export const MissionShowcaseVisual: React.FC = () => {
  const [selectedSlug, setSelectedSlug] = useState<string>("barnards-star");
  const selected = FEATURED_OBJECTS.find((o) => o.slug === selectedSlug) || FEATURED_OBJECTS[0];

  return (
    <div className="mission-showcase-visual w-full relative flex items-center justify-center min-h-[440px] sm:min-h-[480px] select-none overflow-hidden rounded-3xl">
      {/* 1. Ambient Cosmic Mission Glow (Amber & deep indigo) */}
      <div className="absolute inset-0 bg-radial from-amber-500/15 via-indigo-950/10 to-transparent pointer-events-none filter blur-3xl -z-10" />

      {/* 2. Floating Orbital Network Centerpiece */}
      <div className="relative w-full max-w-[540px] flex flex-col items-center">
        {/* Orbital Target Beacons Map */}
        <div className="relative w-full aspect-[16/10] rounded-3xl border border-white/15 bg-gradient-to-br from-[#070914] via-black to-[#100b06] p-6 shadow-[0_0_60px_rgba(244,162,114,0.15)] flex flex-col justify-between overflow-hidden backdrop-blur-md">
          {/* Orbital Elliptical Coordinate Grid */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[85%] h-[85%] rounded-full border border-dashed border-white/20 animate-spin" style={{ animationDuration: "140s" }} />
            <div className="absolute w-[60%] h-[60%] rounded-full border border-orange-400/20" />
            <div className="absolute w-[110%] h-[50%] rounded-full border border-cyan-400/20 -rotate-15" />
          </div>

          {/* Top Target Selector Pills */}
          <div className="flex flex-wrap gap-1.5 z-10 relative">
            {FEATURED_OBJECTS.map((t) => (
              <button
                key={t.slug}
                onClick={() => setSelectedSlug(t.slug)}
                className={`px-3 py-1.5 rounded-full font-mono text-[10.5px] transition-all cursor-pointer ${
                  selectedSlug === t.slug
                    ? "bg-gradient-to-r from-[#ff7b3d] to-[#f4a272] text-black font-semibold shadow-[0_0_15px_rgba(244,162,114,0.5)] scale-105"
                    : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Selected Target Orbital Telemetry Display */}
          <div className="my-auto py-2 z-10 relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[var(--accent)] mb-2 shadow-sm">
              <Target className="w-3.5 h-3.5" />
              <span>{selected.type}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-1">
              {selected.name}
            </h3>

            <p className="text-xs text-white/70 leading-relaxed max-w-md mb-3 line-clamp-2">
              {selected.description}
            </p>

            {/* Coordinates & Provenance Badge Strip */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
              <span className="bg-black/60 px-2.5 py-1 rounded-md border border-white/10 text-cyan-300">
                RA {selected.ra.toFixed(4)}° · Dec {selected.dec.toFixed(4)}°
              </span>
              <span className="bg-black/60 px-2.5 py-1 rounded-md border border-white/10 text-emerald-400">
                Level 2 FITS Verified
              </span>
              {selected.properMotionDec && (
                <span className="bg-black/60 px-2.5 py-1 rounded-md border border-white/10 text-amber-300">
                  μ_δ = {selected.properMotionDec} mas/yr
                </span>
              )}
            </div>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[10px] font-mono text-white/40 z-10">
            <span>NASA Space Apps Challenge 2026 · Planet X & SPHEREx</span>
            <span className="text-[var(--accent)] flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>5 Challenge Targets Ready</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionShowcaseVisual;
