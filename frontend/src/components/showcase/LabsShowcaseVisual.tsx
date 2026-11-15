import React, { useState } from "react";
import { FlaskConical, Activity, Sparkles, TrendingUp } from "lucide-react";

export const LabsShowcaseVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"difference" | "curve">("difference");

  return (
    <div className="labs-showcase-visual w-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden shadow-2xl">
      {/* Ambient observatory glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

      {/* Top HUD Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2 text-white/60">
          <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
          <span>SCIENTIFIC OBSERVATORY INSPECTION PREVIEW</span>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setActiveTab("difference")}
            className={`px-3 py-1 rounded-md text-[10.5px] transition-all cursor-pointer ${
              activeTab === "difference"
                ? "bg-[var(--accent)] text-black font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Difference Map
          </button>
          <button
            onClick={() => setActiveTab("curve")}
            className={`px-3 py-1 rounded-md text-[10.5px] transition-all cursor-pointer ${
              activeTab === "curve"
                ? "bg-[var(--accent)] text-black font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Light Curves
          </button>
        </div>
      </div>

      {/* Visual Canvas Display */}
      <div className="relative aspect-[16/10] w-full my-4 rounded-2xl overflow-hidden border border-white/10 bg-[#06040c]">
        {activeTab === "difference" ? (
          <div className="absolute inset-0 p-4 flex flex-col justify-between animate-fadeIn">
            {/* 3-Panel Mini Inspection Display */}
            <div className="grid grid-cols-3 gap-3 flex-1 items-center">
              {/* Panel 1: Epoch 1 */}
              <div className="h-full rounded-xl border border-white/10 bg-black/60 p-2 flex flex-col justify-between relative overflow-hidden">
                <span className="text-[9px] font-mono text-white/50">EPOCH 1 (2025)</span>
                <div className="my-auto flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-cyan-400/80 shadow-[0_0_10px_cyan]" />
                </div>
                <span className="text-[8.5px] font-mono text-white/40">2025W35_1A_0444_3</span>
              </div>

              {/* Panel 2: Epoch 2 */}
              <div className="h-full rounded-xl border border-white/10 bg-black/60 p-2 flex flex-col justify-between relative overflow-hidden">
                <span className="text-[9px] font-mono text-white/50">EPOCH 2 (2026)</span>
                <div className="my-auto flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-orange-400/80 shadow-[0_0_10px_orange] translate-y-[-6px]" />
                </div>
                <span className="text-[8.5px] font-mono text-white/40">2026W34_2A_0249_1</span>
              </div>

              {/* Panel 3: Signed Residual Map */}
              <div className="h-full rounded-xl border border-purple-500/30 bg-purple-950/20 p-2 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-purple-300 font-semibold">RESIDUAL (E2 - E1)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                </div>
                <div className="my-auto flex flex-col items-center justify-center relative">
                  {/* Positive Residual (Red/Orange) & Negative Residual (Cyan/Blue) */}
                  <div className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-[0_0_8px_orange] translate-y-[-4px]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_8px_blue] translate-y-[4px]" />
                  {/* DAOStarFinder Target Reticle */}
                  <div className="absolute w-8 h-8 rounded-full border border-dashed border-white/40 pointer-events-none" />
                </div>
                <span className="text-[8.5px] font-mono text-purple-200">DAOStarFinder Detection</span>
              </div>
            </div>

            {/* Residual Legend */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-mono">
              <span className="text-white/60">Color Mapping:</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-orange-400">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Positive Residual (+Flux)
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Negative Residual (-Flux)
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Light Curves Preview */
          <div className="absolute inset-0 p-5 flex flex-col justify-between animate-fadeIn">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-white font-medium">R Draconis (Mira Pulsator)</span>
              <span className="text-[var(--accent)]">Period: 245.6 Days</span>
            </div>

            {/* Photometric Wave SVG */}
            <div className="my-auto h-24 w-full relative flex items-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path
                  d="M 0,50 Q 50,10 100,50 T 200,50 T 300,50 T 400,50"
                  fill="none"
                  stroke="rgba(244, 162, 114, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <path
                  d="M 0,50 Q 50,10 100,50 T 200,50 T 300,50 T 400,50"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                />
                {/* Observation Data Points */}
                <circle cx="50" cy="10" r="4" fill="#ff7b3d" />
                <circle cx="150" cy="90" r="4" fill="#38bdf8" />
                <circle cx="250" cy="10" r="4" fill="#ff7b3d" />
                <circle cx="350" cy="90" r="4" fill="#38bdf8" />
              </svg>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-white/40 pt-2 border-t border-white/5">
              <span>Source: AAVSO / IRAS / WISE Multi-Epoch Photometry</span>
              <span>Amplitude: Δm ~ 3.4 mag</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Technical Status Line */}
      <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-2">
        <span className="text-purple-300">Co-Addition Stacking: ×1.73 Idealized S/N Gain</span>
        <span className="text-[var(--accent)]">Persistent Discovery Journal (.md Export)</span>
      </div>
    </div>
  );
};

export default LabsShowcaseVisual;