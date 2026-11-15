import React, { useState } from "react";
import { Clock, Calendar, Activity, ArrowRight, Sparkles } from "lucide-react";

export const TimeMachineShowcaseVisual: React.FC = () => {
  const [sliderPos, setSliderPos] = useState<number>(50);

  return (
    <div className="time-machine-showcase-visual w-full relative flex items-center justify-center min-h-[440px] sm:min-h-[480px] select-none overflow-hidden rounded-3xl">
      {/* 1. Ambient Warm Orange & Gold Time-Dilation Atmosphere */}
      <div className="absolute inset-0 bg-radial from-orange-500/15 via-amber-900/10 to-transparent pointer-events-none filter blur-3xl -z-10" />

      {/* 2. Concentric Orbital Time Rings & Temporal Arcs */}
      <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
        {/* Orbital Time Rings */}
        <div className="absolute inset-2 rounded-full border border-orange-400/20 flex items-center justify-center pointer-events-none">
          <div className="w-[88%] h-[88%] rounded-full border border-dashed border-white/10 flex items-center justify-center animate-spin" style={{ animationDuration: "90s" }}>
            <div className="w-[85%] h-[85%] rounded-full border border-amber-500/15" />
          </div>
        </div>

        {/* Diagonal Relativistic Motion Line */}
        <div className="absolute w-[110%] h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent rotate-[-30deg] pointer-events-none" />

        {/* 3. Central Time-Portal Comparison Disk */}
        <div className="w-[78%] h-[78%] rounded-full border border-white/20 bg-gradient-to-br from-[#0c0d18] via-black to-[#140b06] shadow-[0_0_60px_rgba(244,162,114,0.2)] relative overflow-hidden flex items-center justify-center backdrop-blur-md">
          {/* Background Layer: Epoch 2 (2026-08-21 — Pass 2) */}
          <div className="absolute inset-0 bg-radial from-amber-950/40 via-black to-black flex items-center justify-center">
            {/* Star at Epoch 2 Position (Displaced +10.223″ Northward) */}
            <div className="absolute flex flex-col items-center translate-y-[-18px]">
              <div className="w-5 h-5 rounded-full bg-amber-100 shadow-[0_0_20px_#f59e0b] animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1.5" />
            </div>

            {/* Epoch 2 Date Label */}
            <div className="absolute top-4 right-5 text-[9.5px] font-mono text-amber-300 bg-black/80 px-2.5 py-1 rounded-full border border-amber-500/30 shadow">
              Epoch 2: 2026-08-21
            </div>
          </div>

          {/* Foreground Clipped Layer: Epoch 1 (2025-08-27 — Pass 1) */}
          <div
            className="absolute inset-0 overflow-hidden border-r-2 border-[var(--accent)] bg-radial from-cyan-950/40 via-black to-black"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="relative w-full h-full flex items-center justify-center" style={{ minWidth: "100%" }}>
              {/* Star at Epoch 1 Position (Baseline Origin) */}
              <div className="absolute flex flex-col items-center translate-y-[12px]">
                <div className="w-5 h-5 rounded-full bg-cyan-100 shadow-[0_0_20px_#38bdf8]" />
                <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1.5" />
              </div>

              {/* Epoch 1 Date Label */}
              <div className="absolute top-4 left-5 text-[9.5px] font-mono text-cyan-300 bg-black/80 px-2.5 py-1 rounded-full border border-cyan-500/30 shadow whitespace-nowrap">
                Epoch 1: 2025-08-27
              </div>
            </div>
          </div>

          {/* Draggable Divider Handle (Interactive Split Slider) */}
          <input
            type="range"
            min="5"
            max="95"
            value={sliderPos}
            onChange={(e) => setSliderPos(parseFloat(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
            title="Drag to compare Epoch 1 vs Epoch 2"
          />

          <div
            className="absolute top-0 bottom-0 pointer-events-none z-10 flex items-center justify-center"
            style={{ left: `calc(${sliderPos}% - 14px)` }}
          >
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center shadow-[0_0_15px_rgba(244,162,114,0.8)] font-mono text-xs font-bold">
              ↔
            </div>
          </div>

          {/* Bottom Astrometric Vector Callout */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none z-10">
            <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-[10px] font-mono text-white/80 shadow-lg">
              <Activity className="w-3 h-3 text-[var(--accent)]" />
              <span>Barnard's Star · Δθ = 10.223″ displacement</span>
            </div>
          </div>
        </div>

        {/* Orbiting Baseline Badge */}
        <div className="absolute -top-3 left-4 flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-400/30 text-[10.5px] font-mono text-amber-300 shadow-xl">
          <Calendar className="w-3.5 h-3.5" />
          <span>359-Day Multi-Epoch Baseline</span>
        </div>

        {/* Orbiting Drag Tip */}
        <div className="absolute -bottom-3 right-6 flex items-center gap-1.5 text-[9.5px] font-mono text-white/40 tracking-wider uppercase">
          <span>Drag slider ↔ to compare visits</span>
        </div>
      </div>
    </div>
  );
};

export default TimeMachineShowcaseVisual;
