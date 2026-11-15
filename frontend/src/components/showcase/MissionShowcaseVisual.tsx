import React, { useState } from "react";
import { Compass, Target, ShieldCheck, Zap } from "lucide-react";

interface ChallengeTarget {
  name: string;
  type: string;
  ra: string;
  dec: string;
  metric: string;
}

const TARGETS: ChallengeTarget[] = [
  {
    name: "Barnard's Star",
    type: "High Proper Motion M-Dwarf",
    ra: "269.4463°",
    dec: "+4.7682°",
    metric: "10.223\"/359d astrometric displacement",
  },
  {
    name: "WISE 0855-0714",
    type: "Sub-Zero Brown Dwarf (250 K)",
    ra: "133.7862°",
    dec: "-7.2444°",
    metric: "Water ice cloud absorption candidate",
  },
  {
    name: "Epsilon Indi B",
    type: "Binary T-Dwarf System",
    ra: "331.0604°",
    dec: "-56.7865°",
    metric: "~400\" separation from primary",
  },
  {
    name: "RW Aurigae",
    type: "Young Stellar Object (T Tauri)",
    ra: "77.4642°",
    dec: "+30.4014°",
    metric: "Circumstellar dust disk occultation",
  },
  {
    name: "R Draconis",
    type: "Mira Variable Pulsator",
    ra: "248.3304°",
    dec: "+66.7042°",
    metric: "245.6-day radial pulsation cycle",
  },
];

export const MissionShowcaseVisual: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const selected = TARGETS[selectedIndex];

  return (
    <div className="mission-showcase-visual w-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden shadow-2xl">
      {/* Ambient mission glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      {/* Top HUD Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2 text-white/60">
          <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>NASA SPACE APPS CHALLENGE TARGET NODES</span>
        </div>
        <span className="text-[var(--accent)] font-mono text-[10.5px]">5 Canonical Benchmarks</span>
      </div>

      {/* Interactive Orbital Target Selector */}
      <div className="relative aspect-[16/10] w-full my-4 rounded-2xl overflow-hidden border border-white/10 bg-[#05060d] p-5 flex flex-col justify-between">
        {/* Target Buttons Stripe */}
        <div className="flex flex-wrap gap-1.5 z-10">
          {TARGETS.map((t, idx) => (
            <button
              key={t.name}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3 py-1 rounded-lg font-mono text-[10.5px] transition-all cursor-pointer ${
                selectedIndex === idx
                  ? "bg-gradient-to-r from-[#ff7b3d] to-[#f4a272] text-black font-semibold shadow-md"
                  : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Selected Target Deep Telemetry Display */}
        <div className="my-auto py-2 z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-[var(--accent)] mb-2">
            <Target className="w-3 h-3" />
            <span>{selected.type}</span>
          </div>

          <h3 className="text-2xl font-light text-white tracking-tight">{selected.name}</h3>

          <p className="text-xs font-mono text-emerald-400 mt-1">
            {selected.metric}
          </p>

          <div className="flex gap-4 mt-3 text-[11px] font-mono text-white/60">
            <span>RA: <b className="text-white font-normal">{selected.ra}</b></span>
            <span>Dec: <b className="text-white font-normal">{selected.dec}</b></span>
          </div>
        </div>

        {/* Mission Specifications Footer */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10 text-[10px] font-mono text-white/50 text-center">
          <div><b className="text-white block font-medium">102</b> CHANNELS</div>
          <div><b className="text-white block font-medium">0.75–5.0</b> µm RANGE</div>
          <div><b className="text-white block font-medium">4</b> SURVEYS</div>
          <div><b className="text-white block font-medium">2 YRS</b> PRIME</div>
        </div>
      </div>

      {/* Bottom Technical Status Line */}
      <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-2">
        <span className="flex items-center gap-1.5 text-amber-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Interactive Training Simulation & Science Missions Active</span>
        </span>
        <span className="text-[var(--accent)]">Citizen Science Ready</span>
      </div>
    </div>
  );
};

export default MissionShowcaseVisual;