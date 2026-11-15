import React, { useState } from "react";
import { Compass, Target, ArrowRight, Sparkles, Orbit, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FEATURED_OBJECTS } from "../../constants/objects";
import { navigateToWorkspace } from "../../lib/journeyState";

// Target specific scientific investigation questions
const TARGET_INVESTIGATIONS: Record<string, string> = {
  "barnards-star": "Track 10.223″/yr proper motion displacement across the 359-day baseline.",
  "wise-0855": "Detect methane and water-ice atmospheric clouds at sub-zero temperatures (250 K).",
  "epsilon-indi-b": "Deconvolve T1/T6 brown dwarf binary separation (~400″) at 102 spectral channels.",
  "rw-aurigae": "Analyze young stellar protoplanetary disk dimming and episodic accretion outflows.",
  "r-draconis": "Construct authentic 314-day infrared pulsation light curve across Mira cycles.",
};

export const MissionShowcaseVisual: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSlug, setSelectedSlug] = useState<string>("barnards-star");
  const selected = FEATURED_OBJECTS.find((o) => o.slug === selectedSlug) || FEATURED_OBJECTS[0];

  // Convert RA (0..360) and Dec (-90..+90) to normalized screen % for celestial atlas
  const getCoordsPercent = (ra: number, dec: number) => {
    // RA: 0..360 maps left to right with margin (10% to 90%)
    const x = 12 + (ra / 360) * 76;
    // Dec: +90 (top 15%) to -90 (bottom 85%)
    const y = 85 - ((dec + 90) / 180) * 70;
    return { x: `${x.toFixed(1)}%`, y: `${y.toFixed(1)}%` };
  };

  return (
    <div className="mission-showcase-visual w-full relative flex flex-col items-center justify-center min-h-[460px] select-none overflow-hidden rounded-3xl p-4">
      {/* 1. Ambient Midnight Blue & Warm Sunrise Horizon Atmosphere */}
      <div className="absolute inset-0 bg-radial from-amber-500/15 via-indigo-950/20 to-transparent pointer-events-none filter blur-3xl -z-10" />

      {/* 2. Top Atlas Header */}
      <div className="w-full max-w-[540px] flex items-center justify-between mb-3 px-1 text-xs font-mono">
        <div className="flex items-center gap-2 text-amber-300">
          <Orbit className="w-3.5 h-3.5" />
          <span className="font-semibold tracking-wide">CELESTIAL DESTINATION ATLAS</span>
        </div>
        <span className="text-[10px] text-white/50">5 Canonical Challenge Targets</span>
      </div>

      {/* 3. Main 3D Celestial Coordinate Atlas Box */}
      <div className="relative w-full max-w-[540px] aspect-[16/10] rounded-2xl border border-white/15 bg-gradient-to-br from-[#060814] via-[#020208] to-[#120a06] p-4 shadow-[0_0_50px_rgba(244,162,114,0.18)] flex flex-col justify-between overflow-hidden backdrop-blur-md">
        {/* Subtle Celestial Coordinate Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {/* Celestial Equator (Dec = 0°) */}
          <div className="absolute top-[50%] inset-x-0 h-px bg-cyan-400/50" />
          {/* RA Meridians */}
          <div className="absolute left-[25%] inset-y-0 w-px border-l border-dashed border-white/20" />
          <div className="absolute left-[50%] inset-y-0 w-px border-l border-white/30" />
          <div className="absolute left-[75%] inset-y-0 w-px border-l border-dashed border-white/20" />
          {/* Coordinate labels */}
          <span className="absolute top-2 left-3 text-[9px] font-mono text-white/40">+90° Dec</span>
          <span className="absolute top-[52%] left-3 text-[9px] font-mono text-cyan-300/60">0° Equator</span>
          <span className="absolute bottom-2 left-3 text-[9px] font-mono text-white/40">-90° Dec</span>
          <span className="absolute bottom-2 right-3 text-[9px] font-mono text-white/40">24h RA</span>
        </div>

        {/* Constellation Vectors Between Canonical Targets */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
          {FEATURED_OBJECTS.map((t1, idx) => {
            const next = FEATURED_OBJECTS[(idx + 1) % FEATURED_OBJECTS.length];
            const p1 = getCoordsPercent(t1.ra, t1.dec);
            const p2 = getCoordsPercent(next.ra, next.dec);
            return (
              <line
                key={t1.slug}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="rgba(244,162,114,0.5)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* 5 Plotted Target Destination Markers */}
        <div className="absolute inset-0 pointer-events-none">
          {FEATURED_OBJECTS.map((t) => {
            const pos = getCoordsPercent(t.ra, t.dec);
            const isSelected = selectedSlug === t.slug;
            return (
              <div
                key={t.slug}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSlug(t.slug);
                }}
                className="absolute pointer-events-auto cursor-pointer group -translate-x-1/2 -translate-y-1/2"
                style={{ left: pos.x, top: pos.y }}
              >
                {/* Active Selection Ring */}
                {isSelected && (
                  <span className="absolute -inset-2 rounded-full border border-orange-400 animate-ping opacity-60" />
                )}
                {/* Core Marker Node */}
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-[var(--accent)] ring-4 ring-orange-500/30 scale-125 shadow-[0_0_20px_#f4a272]"
                      : "bg-white/70 group-hover:bg-white group-hover:scale-110 shadow-sm"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-black" : "bg-black/60"}`} />
                </div>
                {/* Hover Label */}
                <span
                  className={`absolute left-4 -top-1 whitespace-nowrap text-[9.5px] font-mono px-1.5 py-0.5 rounded transition-all ${
                    isSelected
                      ? "text-orange-300 font-bold bg-black/80 border border-orange-400/40 opacity-100"
                      : "text-white/60 bg-black/60 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {t.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Destination Inspection Card */}
        <div className="mt-auto z-10 bg-black/85 backdrop-blur-md rounded-xl border border-white/15 p-3 text-left">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <h4 className="text-sm font-semibold text-white tracking-wide">{selected.name}</h4>
              <span className="text-[10px] font-mono text-[var(--accent)] bg-orange-950/50 px-2 py-0.5 rounded border border-orange-400/30">
                {selected.type}
              </span>
            </div>
            <button
              onClick={() => navigateToWorkspace(navigate, `/objects/${selected.slug}`, "mission")}
              className="text-[10px] font-mono text-orange-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Inspect Object</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <p className="text-[10px] text-white/70 mb-2 line-clamp-1">
            {TARGET_INVESTIGATIONS[selected.slug] || selected.description}
          </p>

          <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[9.5px] font-mono text-white/50">
            <span>RA {selected.ra.toFixed(4)}° · Dec {selected.dec.toFixed(4)}°</span>
            <span className="text-white/60">Gaia DR3 Astrometry Verified</span>
          </div>
        </div>
      </div>

      {/* 4. Target Quick Navigation Selector Strip */}
      <div className="w-full max-w-[540px] mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
        {FEATURED_OBJECTS.map((t) => (
          <button
            key={t.slug}
            onClick={() => setSelectedSlug(t.slug)}
            className={`px-2.5 py-1 rounded-full font-mono text-[10px] transition-all cursor-pointer ${
              selectedSlug === t.slug
                ? "bg-[var(--accent)] text-black font-semibold shadow-[0_0_12px_rgba(244,162,114,0.5)]"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MissionShowcaseVisual;
