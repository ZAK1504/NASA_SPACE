import React, { useState, useEffect } from "react";
import { FlaskConical, Layers, Sliders, CheckCircle2, Info, Maximize2 } from "lucide-react";
import { api, ComparisonResponse } from "../../services/api";

export const LabsShowcaseVisual: React.FC = () => {
  const [data, setData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeLayer, setActiveLayer] = useState<"e1" | "e2" | "diff">("diff");
  const [isExploded, setIsExploded] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    api.compareObservations({
      obsId1: "2025W35_1A_0444_3",
      obsId2: "2026W34_2A_0249_1",
      targetName: "Barnard's Star",
      centerRa: 269.452,
      centerDec: 4.694,
      cutoutSizeArcsec: 300,
      stretch: "asinh",
      colormap: "gray",
      smooth: true,
    })
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Could not load labs showcase comparison data:", err);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const formatSrc = (b64?: string | null) => {
    if (!b64) return null;
    return b64.startsWith("data:") ? b64 : `data:image/png;base64,${b64}`;
  };

  const e1Src = formatSrc(data?.epoch1_image_base64);
  const e2Src = formatSrc(data?.epoch2_image_base64);
  const diffSrc = formatSrc(data?.difference_image_base64);

  return (
    <div className="labs-showcase-visual w-full relative flex flex-col items-center justify-center min-h-[460px] select-none overflow-hidden rounded-3xl p-4">
      {/* 1. Ambient Dark Graphite & Cool-White Scientific Atmosphere */}
      <div className="absolute inset-0 bg-radial from-slate-700/10 via-slate-900/10 to-transparent pointer-events-none filter blur-3xl -z-10" />

      {/* 2. Top Controls & Mode Switcher */}
      <div className="w-full max-w-[540px] flex items-center justify-between mb-3 px-1 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <FlaskConical className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="font-semibold tracking-wide">3-PLANE RESIDUAL DECOMPOSITION</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-white/60">
          <button
            onClick={() => setIsExploded(true)}
            className={`px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
              isExploded ? "bg-[var(--accent)] text-black font-semibold" : "hover:text-white"
            }`}
          >
            3D Exploded
          </button>
          <button
            onClick={() => setIsExploded(false)}
            className={`px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
              !isExploded ? "bg-[var(--accent)] text-black font-semibold" : "hover:text-white"
            }`}
          >
            Flat Array
          </button>
        </div>
      </div>

      {/* 3. Main Exploded / Aligned Multi-Plane Scientific Viewport */}
      <div
        className="relative w-full max-w-[540px] min-h-[300px] flex items-center justify-center py-6"
        style={{ perspective: "1000px" }}
      >
        {loading ? (
          <div className="w-full h-48 flex flex-col items-center justify-center gap-3 text-white/40 font-mono text-xs">
            <div className="w-7 h-7 rounded-full border-2 border-slate-400/30 border-t-slate-200 animate-spin" />
            <span>Loading authentic difference map and frames...</span>
          </div>
        ) : (
          <div
            className={`grid gap-3 w-full transition-all duration-500 ${
              isExploded ? "grid-cols-3 transform -rotate-y-12 rotate-x-6 scale-95" : "grid-cols-3 scale-100"
            }`}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Plane 1: Epoch 1 Earlier */}
            <div
              onClick={() => setActiveLayer("e1")}
              onMouseEnter={() => setActiveLayer("e1")}
              className={`rounded-xl border transition-all duration-300 p-2.5 flex flex-col justify-between aspect-square cursor-pointer backdrop-blur-md ${
                activeLayer === "e1"
                  ? "border-cyan-400 bg-cyan-950/30 shadow-[0_0_25px_rgba(34,211,238,0.3)] z-30 translate-z-10"
                  : "border-white/10 bg-black/70 hover:border-white/30 z-10 opacity-80"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-cyan-300 font-semibold">EPOCH 1</span>
                <span className="text-white/40">2025</span>
              </div>
              <div className="flex-1 w-full flex items-center justify-center overflow-hidden rounded bg-black">
                {e1Src ? (
                  <img src={e1Src} alt="Epoch 1 observation" className="w-full h-full object-contain filter contrast-125" />
                ) : (
                  <div className="text-[9px] text-white/30">Frame 1</div>
                )}
              </div>
              <div className="text-[9px] font-mono text-white/50 mt-1 truncate">Pass 1 Baseline</div>
            </div>

            {/* Plane 2: Epoch 2 Later */}
            <div
              onClick={() => setActiveLayer("e2")}
              onMouseEnter={() => setActiveLayer("e2")}
              className={`rounded-xl border transition-all duration-300 p-2.5 flex flex-col justify-between aspect-square cursor-pointer backdrop-blur-md ${
                activeLayer === "e2"
                  ? "border-amber-400 bg-amber-950/30 shadow-[0_0_25px_rgba(245,158,11,0.3)] z-30 translate-z-10"
                  : "border-white/10 bg-black/70 hover:border-white/30 z-10 opacity-80"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-amber-300 font-semibold">EPOCH 2</span>
                <span className="text-white/40">2026</span>
              </div>
              <div className="flex-1 w-full flex items-center justify-center overflow-hidden rounded bg-black">
                {e2Src ? (
                  <img src={e2Src} alt="Epoch 2 observation" className="w-full h-full object-contain filter contrast-125" />
                ) : (
                  <div className="text-[9px] text-white/30">Frame 2</div>
                )}
              </div>
              <div className="text-[9px] font-mono text-white/50 mt-1 truncate">Pass 2 Visit</div>
            </div>

            {/* Plane 3: Signed Difference (Δ = E2 - E1) */}
            <div
              onClick={() => setActiveLayer("diff")}
              onMouseEnter={() => setActiveLayer("diff")}
              className={`rounded-xl border transition-all duration-300 p-2.5 flex flex-col justify-between aspect-square cursor-pointer backdrop-blur-md ${
                activeLayer === "diff"
                  ? "border-[var(--accent)] bg-orange-950/30 shadow-[0_0_30px_rgba(244,162,114,0.35)] z-30 translate-z-14"
                  : "border-white/10 bg-black/70 hover:border-white/30 z-10 opacity-85"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-[var(--accent)] font-semibold">Δ DIFFERENCE</span>
                <span className="text-white/40">E₂ − E₁</span>
              </div>
              <div className="flex-1 w-full flex items-center justify-center overflow-hidden rounded bg-black">
                {diffSrc ? (
                  <img src={diffSrc} alt="Signed difference residual map" className="w-full h-full object-contain filter contrast-125" />
                ) : (
                  <div className="text-[9px] text-white/30">Residual Map</div>
                )}
              </div>
              <div className="text-[9px] font-mono text-[var(--accent)] mt-1 truncate">Signed Residual</div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Signed Residual Explanation Legend */}
      <div className="w-full max-w-[540px] mt-2 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 p-3 text-[10.5px] font-mono text-white/70">
        <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-white/80">▲ Positive (E₂ brighter)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-white/80">▼ Negative (E₂ fainter)</span>
          </div>
          <span className="text-[var(--accent)] font-semibold">Dipole Motion</span>
        </div>
        <p className="text-[9.5px] text-white/50 leading-relaxed">
          Comparing aligned FITS epochs reveals the classic dipole signature (adjacent positive and negative residuals) indicative of Barnard’s Star 10.223″/yr proper motion.
        </p>
      </div>
    </div>
  );
};

export default LabsShowcaseVisual;
