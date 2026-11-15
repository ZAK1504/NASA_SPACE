import React, { useState } from "react";
import { Clock, Play, Layers, Calendar, ArrowRight, Activity } from "lucide-react";

export const TimeMachineShowcaseVisual: React.FC = () => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [blinkEpoch, setBlinkEpoch] = useState<1 | 2>(1);
  const [mode, setMode] = useState<"slider" | "blink">("slider");

  return (
    <div className="time-machine-showcase-visual w-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden shadow-2xl">
      {/* Ambient warm orange time-travel glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top HUD Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2 text-white/60">
          <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>MULTI-EPOCH ASTROMETRIC PLAYBACK PREVIEW</span>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setMode("slider")}
            className={`px-3 py-1 rounded-md text-[10.5px] transition-all cursor-pointer ${
              mode === "slider"
                ? "bg-[var(--accent)] text-black font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Split Slider
          </button>
          <button
            onClick={() => setMode("blink")}
            className={`px-3 py-1 rounded-md text-[10.5px] transition-all cursor-pointer ${
              mode === "blink"
                ? "bg-[var(--accent)] text-black font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Blink Mode
          </button>
        </div>
      </div>

      {/* Interactive Visual Canvas */}
      <div className="relative aspect-[16/10] w-full my-4 rounded-2xl overflow-hidden border border-white/10 bg-[#05060b] select-none">
        {mode === "slider" ? (
          <div className="relative w-full h-full">
            {/* Background Layer: Epoch 2 (2026-08-21) */}
            <div className="absolute inset-0 bg-radial from-amber-950/30 to-black flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Simulated Star Field with Displaced Centroid for Epoch 2 */}
                <div className="absolute w-4 h-4 rounded-full bg-white/90 shadow-[0_0_12px_#ff7b3d] translate-y-[-14px]" />
                <span className="absolute bottom-3 right-4 text-[10px] font-mono text-[var(--accent)] bg-black/60 px-2 py-1 rounded border border-white/10">
                  Epoch 2: 2026-08-21 (Pass 2)
                </span>
              </div>
            </div>

            {/* Foreground Clipped Layer: Epoch 1 (2025-08-27) */}
            <div
              className="absolute inset-0 overflow-hidden border-r-2 border-[var(--accent)] bg-radial from-blue-950/30 to-black"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="relative w-full h-full flex items-center justify-center" style={{ minWidth: "100%" }}>
                {/* Centroid at Epoch 1 (Original Position) */}
                <div className="absolute w-4 h-4 rounded-full bg-white/90 shadow-[0_0_12px_#38bdf8] translate-y-[10px]" />
                <span className="absolute bottom-3 left-4 text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-1 rounded border border-white/10 whitespace-nowrap">
                  Epoch 1: 2025-08-27 (Pass 1)
                </span>
              </div>
            </div>

            {/* Draggable Divider Handle */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(parseFloat(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
            />
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-10 flex items-center justify-center"
              style={{ left: `calc(${sliderPos}% - 14px)` }}
            >
              <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center shadow-lg font-mono text-xs font-bold">
                ↔
              </div>
            </div>
          </div>
        ) : (
          /* Blink Mode */
          <div
            onClick={() => setBlinkEpoch((prev) => (prev === 1 ? 2 : 1))}
            className="w-full h-full flex items-center justify-center cursor-pointer relative bg-radial from-orange-950/20 to-black transition-colors"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                blinkEpoch === 1
                  ? "shadow-[0_0_12px_#38bdf8] translate-y-[10px]"
                  : "shadow-[0_0_12px_#ff7b3d] translate-y-[-14px]"
              }`}
            />
            <div className="absolute top-4 left-4 text-[11px] font-mono text-white/70">
              Click to toggle epoch (Simulated Blink)
            </div>
            <div className="absolute bottom-4 text-xs font-mono px-3 py-1 rounded-full bg-black/70 border border-white/10 text-[var(--accent)]">
              {blinkEpoch === 1 ? "Epoch 1: 2025-08-27" : "Epoch 2: 2026-08-21"}
            </div>
          </div>
        )}
      </div>

      {/* Astrometric Provenance HUD */}
      <div className="grid grid-cols-3 gap-3 pt-2 text-center text-[10.5px] font-mono">
        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="text-white/40 block">TARGET</span>
          <span className="text-white font-medium">Barnard's Star</span>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="text-white/40 block">BASELINE</span>
          <span className="text-[var(--accent)] font-semibold">359 Days</span>
        </div>
        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
          <span className="text-white/40 block">DISPLACEMENT</span>
          <span className="text-white font-medium">10.223" (Gaia DR3)</span>
        </div>
      </div>
    </div>
  );
};

export default TimeMachineShowcaseVisual;