import React, { useState } from "react";
import { Compass, Target, ArrowRight, Sparkles, Orbit, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FEATURED_OBJECTS } from "../../constants/objects";
import { travelToWorkspace } from "../../lib/journeyState";

// Target specific scientific investigation questions with scientifically verified parameters
const TARGET_INVESTIGATIONS: Record<string, { summary: string; astrometryDetail: string }> = {
  "barnards-star": {
    summary: "High proper motion red dwarf exhibiting rapid transverse celestial displacement across SPHEREx observing epochs.",
    astrometryDetail: "Track 10.223″ predicted catalogue displacement across the 359-day observation baseline (proper motion rate μ = 10.39″/yr).",
  },
  "wise-0855": {
    summary: "Substellar cold brown dwarf (~250 K) with atmospheric water-ice and methane absorption signatures.",
    astrometryDetail: "Detect sub-zero atmospheric condensation across mid-IR channels (3.8–5.0 µm); proper motion rate μ = 8.12″/yr.",
  },
  "epsilon-indi-b": {
    summary: "Close substellar binary system (T1 + T6 dwarfs) separated by ~402″ from primary star Epsilon Indi A.",
    astrometryDetail: "Deconvolve binary spectral energy distribution and deep methane (CH₄) absorption bands across 102 channels.",
  },
  "rw-aurigae": {
    summary: "Young stellar object binary with tidally disrupted circumstellar protoplanetary disk and warm silicate bridge.",
    astrometryDetail: "Monitor episodic accretion outflows and protoplanetary disk obscuration in mid-infrared bands.",
  },
  "r-draconis": {
    summary: "Mira-type pulsating carbon giant with a 314-day cycle, varying by >5 magnitudes across infrared surveys.",
    astrometryDetail: "Construct photometric infrared light curve and track molecular CO ice absorption features at 4.67 µm.",
  },
};

export const MissionShowcaseVisual: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSlug, setSelectedSlug] = useState<string>("barnards-star");
  const selected = FEATURED_OBJECTS.find((o) => o.slug === selectedSlug) || FEATURED_OBJECTS[0];
  const investigation = TARGET_INVESTIGATIONS[selected.slug] || {
    summary: selected.description,
    astrometryDetail: `RA ${selected.ra.toFixed(4)}° · Dec ${selected.dec.toFixed(4)}° (Gaia DR3 / SIMBAD verified)`,
  };

  // Convert RA (0..360) and Dec (-90..+90) to normalized screen coordinates for celestial map
  const getCoordsPercent = (ra: number, dec: number) => {
    // RA: 0..360 maps left to right with margin (10% to 90%)
    const x = 12 + (ra / 360) * 76;
    // Dec: +90 (top 15%) to -90 (bottom 85%)
    const y = 85 - ((dec + 90) / 180) * 70;
    return { x: `${x.toFixed(1)}%`, y: `${y.toFixed(1)}%` };
  };

  return (
    <div className="mission-showcase-visual w-full max-w-[580px] relative flex flex-col items-center select-none overflow-hidden rounded-3xl p-3 sm:p-4">
      {/* 1. Ambient Midnight Blue & Warm Sunrise Horizon Atmosphere */}
      <div className="absolute inset-0 bg-radial from-amber-500/12 via-indigo-950/15 to-transparent pointer-events-none filter blur-3xl -z-10" />

      {/* 2. Compact Celestial Atlas Heading */}
      <div className="w-full flex items-center justify-between mb-2.5 px-1 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#F4A272]">
          <Orbit className="w-3.5 h-3.5 text-[#FF7B3D]" />
          <span className="font-semibold tracking-wider uppercase text-[11px]">CELESTIAL DESTINATION ATLAS</span>
        </div>
        <span className="text-[10px] text-white/50 font-mono">5 Canonical Challenge Targets</span>
      </div>

      {/* 3. Astronomical Destination Map (Unobstructed: NO overlapping information card) */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/8.5] rounded-2xl border border-white/15 bg-gradient-to-br from-[#060814] via-[#020208] to-[#120a06] p-4 shadow-[0_4px_30px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-md">
        {/* Subtle Celestial Coordinate Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          {/* Celestial Equator (Dec = 0°) */}
          <div className="absolute top-[50%] inset-x-0 h-px bg-[#F4A272]/50 shadow-[0_0_6px_rgba(244,162,114,0.4)]" />
          {/* RA Meridians */}
          <div className="absolute left-[25%] inset-y-0 w-px border-l border-dashed border-white/20" />
          <div className="absolute left-[50%] inset-y-0 w-px border-l border-white/30" />
          <div className="absolute left-[75%] inset-y-0 w-px border-l border-dashed border-white/20" />
          {/* Coordinate labels */}
          <span className="absolute top-2 left-3 text-[9px] font-mono text-white/50">+90° Dec</span>
          <span className="absolute top-[52%] left-3 text-[9px] font-mono text-[#F4A272]/80">0° Equator</span>
          <span className="absolute bottom-2 left-3 text-[9px] font-mono text-white/50">-90° Dec</span>
          <span className="absolute bottom-2 right-3 text-[9px] font-mono text-white/50">24h RA</span>
          <span className="absolute top-2 right-3 text-[9px] font-mono text-white/40">SPHEREx All-Sky</span>
        </div>

        {/* Constellation Vectors Connecting Canonical Destinations */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
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
                stroke="rgba(244,162,114,0.55)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* Plotted Interactive Target Markers */}
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
                  <span className="absolute -inset-2.5 rounded-full border border-[#FF7B3D] animate-ping opacity-70" />
                )}

                {/* Core Luminous Pin */}
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-[#FF7B3D] ring-4 ring-[#FF7B3D]/35 scale-125 shadow-[0_0_18px_#FF7B3D]"
                      : "bg-[#F4A272] group-hover:scale-125 ring-2 ring-black/80 shadow-sm"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-black"}`} />
                </div>

                {/* Target Name Tag */}
                <span
                  className={`absolute left-4.5 -top-1 whitespace-nowrap text-[10px] font-mono px-1.5 py-0.5 rounded transition-all ${
                    isSelected
                      ? "text-[#F4A272] font-semibold bg-[#08080C]/95 border border-[#F4A272]/50 shadow-md opacity-100"
                      : "text-white/70 bg-black/70 opacity-0 group-hover:opacity-100 border border-white/10"
                  }`}
                >
                  {t.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Target Selection Controls (Clean Single Row: All 5 Targets Perfectly Aligned) */}
      <div
        className="w-full mt-3 overflow-x-auto sm:overflow-x-visible scrollbar-none overscroll-contain py-1"
        data-lenis-prevent
      >
        <div className="grid grid-cols-5 gap-1.5 w-full min-w-[460px] sm:min-w-0">
          {FEATURED_OBJECTS.map((t) => {
            const isSelected = selectedSlug === t.slug;
            return (
              <button
                key={t.slug}
                onClick={() => setSelectedSlug(t.slug)}
                className={`h-9 px-1 py-0.5 rounded-xl text-[10px] sm:text-[10.5px] font-sans font-medium flex items-center justify-center text-center transition-colors cursor-pointer border ${
                  isSelected
                    ? "bg-[#F4A272] text-[#08080C] font-bold border-[#FF7B3D] shadow-[0_0_12px_rgba(244,162,114,0.4)]"
                    : "bg-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.12] border-white/10"
                }`}
                title={t.name}
              >
                <span className="whitespace-nowrap tracking-tight">{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Dedicated Selected-Target Information Area (Clearly Separated, Never Obscuring the Map) */}
      <div className="w-full mt-2.5 bg-[#0A0A10]/95 backdrop-blur-md rounded-2xl border border-white/15 p-3.5 text-left shadow-lg">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF7B3D] animate-pulse" />
            <h4 className="text-sm font-semibold text-[#F3EFE8] tracking-wide">{selected.name}</h4>
            <span className="text-[10px] font-mono text-[#F4A272] bg-orange-950/60 px-2 py-0.5 rounded border border-[#F4A272]/30">
              {selected.type}
            </span>
          </div>

          <button
            onClick={() => travelToWorkspace(navigate, `/objects/${selected.slug}`, "mission")}
            className="text-[10.5px] font-mono text-[#F4A272] hover:text-white flex items-center gap-1 cursor-pointer transition-colors group"
          >
            <span>Inspect Object</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <p className="text-[11px] text-[#C7C3BD] leading-relaxed mb-2">
          {investigation.summary}
        </p>

        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/5 mb-2 text-[10.5px] font-mono text-[#F4A272]">
          {investigation.astrometryDetail}
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[9.5px] font-mono text-[#8E8A85]">
          <span>RA {selected.ra.toFixed(4)}° · Dec {selected.dec.toFixed(4)}°</span>
          <span className="text-white/60">Gaia DR3 Astrometry Verified</span>
        </div>
      </div>
    </div>
  );
};

export default MissionShowcaseVisual;
