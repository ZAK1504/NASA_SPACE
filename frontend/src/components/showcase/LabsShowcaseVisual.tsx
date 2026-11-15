import React, { useState } from "react";
import { FlaskConical, TrendingUp, Sparkles, Activity, CheckCircle2 } from "lucide-react";

export const LabsShowcaseVisual: React.FC = () => {
  const [inspectedPanel, setInspectedPanel] = useState<"e1" | "e2" | "diff">("diff");

  return (
    <div className="labs-showcase-visual w-full relative flex items-center justify-center min-h-[440px] sm:min-h-[480px] select-none overflow-hidden rounded-3xl">
      {/* 1. Ambient Observatory Atmosphere (Deep violet & amber cosmic dust) */}
      <div className="absolute inset-0 bg-radial from-purple-600/15 via-indigo-950/10 to-transparent pointer-events-none filter blur-3xl -z-10" />

      {/* 2. Floating Scientific Investigation Centerpiece */}
      <div className="relative w-full max-w-[540px] flex flex-col items-center">
        {/* Layered 3-Panel Difference Subtraction Array */}
        <div className="grid grid-cols-3 gap-3 w-full mb-4">
          {/* Panel 1: Epoch 1 Observation */}
          <div
            onMouseEnter={() => setInspectedPanel("e1")}
            className={`group rounded-2xl border transition-all p-3 flex flex-col justify-between h-48 relative overflow-hidden backdrop-blur-md cursor-pointer ${
              inspectedPanel === "e1"
                ? "border-cyan-400/50 bg-cyan-950/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                : "border-white/10 bg-black/60 hover:border-white/25"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-cyan-300 font-semibold">EPOCH 1</span>
              <span className="text-white/40">2025</span>
            </div>

            {/* Star at Epoch 1 Position */}
            <div className="my-auto flex items-center justify-center relative">
              <div className="w-16 h-16 rounded-full border border-cyan-400/15 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-cyan-200 shadow-[0_0_15px_#38bdf8]" />
              </div>
            </div>

            <div className="text-[9.5px] font-mono text-white/50 truncate">
              Pass 1: Baseline Visit
            </div>
          </div>

          {/* Panel 2: Epoch 2 Observation */}
          <div
            onMouseEnter={() => setInspectedPanel("e2")}
            className={`group rounded-2xl border transition-all p-3 flex flex-col justify-between h-48 relative overflow-hidden backdrop-blur-md cursor-pointer ${
              inspectedPanel === "e2"
                ? "border-amber-400/50 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                : "border-white/10 bg-black/60 hover:border-white/25"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-amber-300 font-semibold">EPOCH 2</span>
              <span className="text-white/40">2026</span>
            </div>

            {/* Star at Epoch 2 Position (Displaced) */}
            <div className="my-auto flex items-center justify-center relative">
              <div className="w-16 h-16 rounded-full border border-amber-400/15 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-amber-200 shadow-[0_0_15px_#f59e0b] translate-y-[-10px]" />
              </div>
            </div>

            <div className="text-[9.5px] font-mono text-white/50 truncate">
              Pass 2: +359d Cadence
            </div>
          </div>

          {/* Panel 3: Signed Residual Map (E2 - E1) */}
          <div
            onMouseEnter={() => setInspectedPanel("diff")}
            className={`group rounded-2xl border transition-all p-3 flex flex-col justify-between h-48 relative overflow-hidden backdrop-blur-md cursor-pointer ${
              inspectedPanel === "diff"
                ? "border-purple-400/60 bg-purple-950/30 shadow-[0_0_25px_rgba(168,85,247,0.3)]"
                : "border-white/10 bg-black/60 hover:border-white/25"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-purple-300 font-semibold">RESIDUAL (E2−E1)</span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            </div>

            {/* Dipole Signature: Negative deficit (blue) and positive excess (red) */}
            <div className="my-auto flex flex-col items-center justify-center relative">
              <div className="relative w-16 h-16 rounded-full border border-dashed border-purple-400/30 flex items-center justify-center">
                {/* Excess (Later) */}
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] translate-y-[-6px]" />
                {/* Deficit (Earlier) */}
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] translate-y-[6px]" />
                {/* DAOStarFinder Inspection Reticle */}
                <div className="absolute inset-0 rounded-full border border-[var(--accent)]/50 animate-pulse" />
              </div>
            </div>

            <div className="text-[9.5px] font-mono text-purple-200 truncate flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-300" />
              <span>Dipole Signature</span>
            </div>
          </div>
        </div>

        {/* 3. Color-Coded Residual Science Key */}
        <div className="w-full bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-[10.5px] font-mono shadow-lg">
          <span className="text-white/60">Astrophysical Residuals:</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Red = Later Brighter (+Signal)
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Blue = Earlier Brighter (-Signal)
            </span>
            <span className="flex items-center gap-1.5 text-white/40">
              <span className="w-2 h-2 rounded-full bg-gray-600" />
              Gray = Net Zero (Stationary)
            </span>
          </div>
        </div>

        {/* 4. Photometric Light Curve Wave Pulse Bar */}
        <div className="w-full mt-3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between text-[10.5px] font-mono text-white/70">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Time-Series Photometry</span>
          </div>
          <div className="flex items-center gap-3 text-white/50 text-[10px]">
            <span>Mira Period: 314d</span>
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              DAOStarFinder SNR &gt; 5.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabsShowcaseVisual;
