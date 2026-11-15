import React, { useState } from "react";
import { Sparkles, Eye, Layers, Compass, Radio } from "lucide-react";

interface ExplorerShowcaseVisualProps {
  onSelectAction?: (actionKey: "sky" | "object" | "spectral") => void;
}

export const ExplorerShowcaseVisual: React.FC<ExplorerShowcaseVisualProps> = ({
  onSelectAction,
}) => {
  const [activeTab, setActiveTab] = useState<"sky" | "object" | "spectral">("sky");
  const [wavelength, setWavelength] = useState<number>(2.42);

  return (
    <div className="explorer-showcase-visual w-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden shadow-2xl">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />

      {/* Top HUD Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2 text-white/60">
          <Radio className="w-3.5 h-3.5 text-[var(--accent)] animate-pulse" />
          <span>SPHEREx DR1 · INFRARED EXPLORATION DISPLAY</span>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => {
              setActiveTab("sky");
              if (onSelectAction) onSelectAction("sky");
            }}
            className={`px-3 py-1 rounded-md text-[10.5px] transition-all cursor-pointer ${
              activeTab === "sky"
                ? "bg-[var(--accent)] text-black font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            All-Sky
          </button>
          <button
            onClick={() => {
              setActiveTab("object");
              if (onSelectAction) onSelectAction("object");
            }}
            className={`px-3 py-1 rounded-md text-[10.5px] transition-all cursor-pointer ${
              activeTab === "object"
                ? "bg-[var(--accent)] text-black font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Target
          </button>
          <button
            onClick={() => {
              setActiveTab("spectral");
              if (onSelectAction) onSelectAction("spectral");
            }}
            className={`px-3 py-1 rounded-md text-[10.5px] transition-all cursor-pointer ${
              activeTab === "spectral"
                ? "bg-[var(--accent)] text-black font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            102 Bands
          </button>
        </div>
      </div>

      {/* Visual Canvas Display */}
      <div className="relative aspect-[16/10] w-full my-4 rounded-2xl overflow-hidden border border-white/10 bg-[#04060e] flex items-center justify-center">
        {/* Layer 1: Simulated All-Sky Infrared Panorama */}
        {activeTab === "sky" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            {/* Celestial grid rings */}
            <div className="absolute inset-4 rounded-full border border-indigo-400/20 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-3/4 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                <div className="w-1/2 h-1/2 rounded-full border border-orange-400/20 animate-spin" style={{ animationDuration: "60s" }} />
              </div>
            </div>

            {/* Simulated all-sky infrared nebula projection */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-black/80 to-black pointer-events-none" />

            {/* Center target cursor and readout */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-[var(--accent)]/50 flex items-center justify-center mb-3">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
              </div>
              <span className="font-mono text-xs text-[var(--accent)] mb-1">CELESTIAL SPHERE · CDS HIERARCHICAL HiPS</span>
              <h4 className="text-lg font-light text-white mb-2">100% All-Sky Infrared Coverage</h4>
              <p className="text-xs text-white/50 font-mono max-w-sm">
                Seamless multi-resolution WebGL celestial sphere combining official SPHEREx DR1, DSS2, and AllWISE survey layers.
              </p>
            </div>
          </div>
        )}

        {/* Layer 2: Target Inspector Mode */}
        {activeTab === "object" && (
          <div className="absolute inset-0 p-5 flex flex-col justify-between animate-fadeIn bg-gradient-to-br from-black via-[#080a14] to-black">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[var(--accent)]">[CANONICAL BENCHMARK TARGET]</span>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Gaia DR3 Verified
              </span>
            </div>

            <div className="flex items-center gap-6 my-auto">
              <div className="w-24 h-24 rounded-xl border border-orange-500/30 bg-orange-950/20 relative flex items-center justify-center flex-shrink-0 overflow-hidden">
                <div className="absolute inset-0 bg-radial from-orange-400/40 to-transparent blur-md" />
                <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]" />
                <div className="absolute bottom-1 text-[9px] font-mono text-orange-200">2040×2040</div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">Barnard's Star</h4>
                <p className="text-xs font-mono text-white/60 mb-2">
                  RA: 269.4463° · Dec: +4.7682° · High Proper Motion M-Dwarf
                </p>
                <div className="flex gap-2">
                  <span className="text-[10px] font-mono bg-white/5 px-2 py-1 rounded text-white/80 border border-white/10">
                    μ_α* = -801.55 mas/yr
                  </span>
                  <span className="text-[10px] font-mono bg-white/5 px-2 py-1 rounded text-white/80 border border-white/10">
                    μ_δ = +10362.55 mas/yr
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-white/40 flex justify-between">
              <span>WCS Precision: 6.15"/pixel</span>
              <span>Baseline: 359 Days</span>
            </div>
          </div>
        )}

        {/* Layer 3: 102 Spectral Bands Mode */}
        {activeTab === "spectral" && (
          <div className="absolute inset-0 p-5 flex flex-col justify-between animate-fadeIn bg-gradient-to-br from-black via-[#0d091a] to-black">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-purple-300">102 INFRARED SPECTRAL CHANNELS</span>
              <span className="text-[var(--accent)]">{wavelength.toFixed(2)} µm</span>
            </div>

            {/* Interactive Spectral Curve Preview */}
            <div className="relative h-24 w-full flex items-end justify-between gap-1 px-2 my-auto">
              {Array.from({ length: 32 }, (_, i) => {
                const wl = 0.75 + (i / 31) * 4.25;
                const dist = Math.abs(wl - wavelength);
                const isSelected = dist < 0.15;
                // Simulated molecular feature dips (water ice at 3.05, CO2 at 4.27)
                const isWaterIce = Math.abs(wl - 3.05) < 0.2;
                const isCO2 = Math.abs(wl - 4.27) < 0.2;
                let h = 40 + Math.sin(i * 0.4) * 25;
                if (isWaterIce) h *= 0.45;
                if (isCO2) h *= 0.55;

                return (
                  <div
                    key={i}
                    onClick={() => setWavelength(wl)}
                    className="flex-1 rounded-t transition-all cursor-pointer group relative"
                    style={{
                      height: `${h}%`,
                      background: isSelected
                        ? "var(--accent)"
                        : isWaterIce || isCO2
                        ? "rgba(168, 85, 247, 0.6)"
                        : "rgba(255, 255, 255, 0.2)",
                    }}
                  />
                );
              })}
            </div>

            {/* Interactive Wavelength Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-mono text-white/40">
                <span>0.75 µm (Near-IR)</span>
                <span>3.05 µm (H₂O Ice)</span>
                <span>4.27 µm (CO₂ Ice)</span>
                <span>5.00 µm (Deep-IR)</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="5.00"
                step="0.05"
                value={wavelength}
                onChange={(e) => setWavelength(parseFloat(e.target.value))}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Technical Status Line */}
      <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Interactive Preview · Full Workspaces Available on Demand</span>
        </span>
        <span className="text-[var(--accent)]">Order 5 DR1 Resolution (12.9"/px)</span>
      </div>
    </div>
  );
};

export default ExplorerShowcaseVisual;