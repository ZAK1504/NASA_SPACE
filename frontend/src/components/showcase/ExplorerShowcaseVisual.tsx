import React from "react";
import { Compass, Eye, Layers, Sparkles, Radio } from "lucide-react";

export interface ExplorerShowcaseVisualProps {
  activeMode?: "sky" | "object" | "spectral";
}

const CHALLENGE_TARGETS_COORDS = [
  { name: "Barnard's Star", ra: "17h 57m", dec: "+04° 41′", type: "High PM Star", x: "32%", y: "42%" },
  { name: "WISE 0855", ra: "08h 55m", dec: "-07° 14′", type: "Cold Brown Dwarf", x: "68%", y: "55%" },
  { name: "Epsilon Indi B", ra: "22h 04m", dec: "-56° 47′", type: "T-Dwarf Binary", x: "24%", y: "72%" },
  { name: "RW Aurigae", ra: "05h 07m", dec: "+30° 24′", type: "Young Stellar Object", x: "78%", y: "30%" },
  { name: "R Draconis", ra: "16h 32m", dec: "+66° 45′", type: "Mira Variable", x: "50%", y: "22%" },
];

const MOLECULAR_BANDS = [
  { name: "Water Ice", wave: "3.05 µm", color: "#60a5fa" },
  { name: "PAH Emission", wave: "3.30 µm", color: "#f472b6" },
  { name: "CO₂ Ice", wave: "4.27 µm", color: "#34d399" },
  { name: "CO Gas / Ice", wave: "4.67 µm", color: "#fb923c" },
];

export const ExplorerShowcaseVisual: React.FC<ExplorerShowcaseVisualProps> = ({
  activeMode = "sky",
}) => {
  return (
    <div className="explorer-showcase-visual w-full relative flex items-center justify-center min-h-[440px] sm:min-h-[480px] select-none overflow-hidden rounded-3xl">
      {/* 1. Ambient Cosmic Illumination (Warm orange & indigo galactic glow) */}
      <div className="absolute inset-0 bg-radial from-[var(--accent)]/15 via-indigo-900/10 to-transparent pointer-events-none filter blur-3xl -z-10" />

      {/* 2. Floating Luminous Celestial Sphere Centerpiece */}
      <div className="relative w-full max-w-[520px] aspect-square flex items-center justify-center">
        {/* Outer Celestial Coordinate Rings */}
        <div className="absolute inset-4 rounded-full border border-white/10 flex items-center justify-center pointer-events-none">
          <div className="w-[85%] h-[85%] rounded-full border border-dashed border-indigo-400/20 flex items-center justify-center animate-spin" style={{ animationDuration: "120s" }}>
            <div className="w-[80%] h-[80%] rounded-full border border-white/5" />
          </div>
        </div>

        {/* Diagonal Ecliptic / Galactic Plane Orbital Arc */}
        <div className="absolute w-[110%] h-[40%] rounded-full border border-[var(--accent)]/20 -rotate-25 pointer-events-none shadow-[0_0_30px_rgba(244,162,114,0.1)]" />
        <div className="absolute w-[115%] h-[42%] rounded-full border border-dashed border-cyan-400/15 -rotate-25 pointer-events-none" />

        {/* Central Luminous Sphere Atmosphere */}
        <div className="w-[72%] h-[72%] rounded-full bg-radial from-indigo-950/80 via-[#060814]/90 to-black/95 border border-white/15 shadow-[0_0_60px_rgba(30,27,75,0.6)] relative overflow-hidden flex items-center justify-center backdrop-blur-md">
          {/* Subtle Galactic Dust Ribbon Projection */}
          <div className="absolute inset-0 opacity-40 mix-blend-screen bg-gradient-to-tr from-transparent via-orange-500/20 to-purple-600/30 -rotate-12 pointer-events-none" />

          {/* MODE A: All-Sky Survey Overview */}
          {activeMode === "sky" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              {/* Coordinate Grid Overlay */}
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 400">
                <circle cx="200" cy="200" r="160" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                <circle cx="200" cy="200" r="100" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="40" y1="200" x2="360" y2="200" stroke="currentColor" strokeWidth="0.5" />
                <line x1="200" y1="40" x2="200" y2="360" stroke="currentColor" strokeWidth="0.5" />
              </svg>

              {/* Challenge Target Beacons */}
              {CHALLENGE_TARGETS_COORDS.map((target, idx) => (
                <div
                  key={target.name}
                  className="absolute group/beacon cursor-default"
                  style={{ left: target.x, top: target.y }}
                >
                  <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--accent)]" />
                  </span>
                  <div className="absolute left-3.5 -top-2 opacity-0 group-hover/beacon:opacity-100 transition-opacity whitespace-nowrap bg-black/85 px-2 py-0.5 rounded border border-white/20 text-[9px] font-mono text-white pointer-events-none z-20">
                    <b className="text-[var(--accent)]">{target.name}</b> · {target.type}
                  </div>
                </div>
              ))}

              <div className="relative z-10 flex flex-col items-center max-w-xs">
                <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] mb-3 shadow-[0_0_20px_rgba(244,162,114,0.3)]">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-base font-medium text-white tracking-tight mb-1">
                  All-Sky Infrared Atlas
                </h4>
                <p className="text-xs text-white/60 font-mono leading-relaxed">
                  CDS Hierarchical HiPS Projection · 460 Million Cosmic Objects
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[var(--accent)] bg-black/60 px-3 py-1 rounded-full border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>5 Challenge Targets Mapped</span>
                </div>
              </div>
            </div>
          )}

          {/* MODE B: Object Inspector & Gaia DR3 Astrometry */}
          {activeMode === "object" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <div className="relative z-10 flex flex-col items-center max-w-xs">
                {/* Simulated Target Cutout with Proper Motion Vector */}
                <div className="relative w-28 h-28 rounded-full border border-amber-400/40 bg-black/60 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                  {/* Central Star with Diffraction Core */}
                  <div className="w-4 h-4 rounded-full bg-amber-200 shadow-[0_0_15px_#fde68a]" />
                  {/* Gaia DR3 Motion Vector Arrow */}
                  <div className="absolute w-12 h-[1.5px] bg-cyan-400 right-4 top-9 rotate-[-70deg] origin-left shadow-[0_0_8px_#22d3ee]">
                    <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-cyan-400 rotate-45" />
                  </div>
                  <span className="absolute -bottom-2 text-[9px] font-mono text-cyan-300 bg-black/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                    μ = 10.39″/yr
                  </span>
                </div>

                <span className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-wider mb-1">
                  Target Astrometry Inspector
                </span>
                <h4 className="text-base font-medium text-white mb-1">
                  Barnard's Star (GJ 699)
                </h4>
                <p className="text-xs text-white/60 font-mono leading-relaxed">
                  Gaia DR3 Proper Motion Vector · 359-Day Astrometric Baseline
                </p>
                <div className="mt-3 text-[10px] font-mono text-white/50 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                  RA 269.4521° · Dec +4.6934°
                </div>
              </div>
            </div>
          )}

          {/* MODE C: 102-Band Spectral Dispersion */}
          {activeMode === "spectral" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <div className="relative z-10 flex flex-col items-center w-full max-w-xs">
                <div className="w-10 h-10 rounded-full bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 mb-2.5 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                  <Layers className="w-5 h-5" />
                </div>

                <h4 className="text-base font-medium text-white tracking-tight mb-2">
                  102 Near-IR Spectral Channels
                </h4>

                {/* Spectral dispersion color bar (0.75 - 5.0 µm) */}
                <div className="w-full h-3 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-red-600 shadow-md mb-2 relative">
                  {/* Dichroic gap marker */}
                  <div className="absolute left-[48%] top-0 bottom-0 w-1 bg-black shadow" title="Dichroic Gap at 2.42 µm" />
                </div>
                <div className="w-full flex justify-between text-[9px] font-mono text-white/40 mb-3">
                  <span>0.75 µm</span>
                  <span className="text-[var(--accent)] font-semibold">2.42 µm (Gap)</span>
                  <span>5.00 µm</span>
                </div>

                {/* Key Molecular Diagnostic Bands */}
                <div className="grid grid-cols-2 gap-1.5 w-full text-[9.5px] font-mono text-left">
                  {MOLECULAR_BANDS.map((b) => (
                    <div key={b.name} className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="text-white/80 truncate">{b.name}</span>
                      <span className="text-white/40 ml-auto">{b.wave}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orbiting Satellite Telemetry Chip */}
        <div className="absolute -bottom-2 right-4 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-[10px] font-mono text-white/70 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>SPHEREx DR1 Level 2 Tangent Cutouts</span>
        </div>
      </div>
    </div>
  );
};

export default ExplorerShowcaseVisual;
