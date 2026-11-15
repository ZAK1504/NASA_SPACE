import React, { useState, useEffect } from "react";
import { Clock, Calendar, Activity, Play, Pause, Layers, Eye } from "lucide-react";
import { api, ComparisonResponse } from "../../services/api";

export const TimeMachineShowcaseVisual: React.FC = () => {
  const [data, setData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"split" | "blink">("split");
  const [splitPos, setSplitPos] = useState<number>(50);
  const [activeEpoch, setActiveEpoch] = useState<1 | 2>(1);
  const [blinking, setBlinking] = useState<boolean>(false);

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
        console.warn("Could not fetch comparison frames for showcase:", err);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Blink animation timer
  useEffect(() => {
    if (!blinking) return;
    const interval = setInterval(() => {
      setActiveEpoch((prev) => (prev === 1 ? 2 : 1));
    }, 700);
    return () => clearInterval(interval);
  }, [blinking]);

  const epoch1Src = data?.epoch1_image_base64
    ? `data:image/png;base64,${data.epoch1_image_base64}`
    : null;
  const epoch2Src = data?.epoch2_image_base64
    ? `data:image/png;base64,${data.epoch2_image_base64}`
    : null;

  return (
    <div className="time-machine-showcase-visual w-full relative flex flex-col items-center justify-center min-h-[460px] select-none overflow-hidden rounded-3xl p-4">
      {/* 1. Ambient Warm Amber Time-Travel Atmosphere */}
      <div className="absolute inset-0 bg-radial from-amber-600/15 via-orange-950/10 to-transparent pointer-events-none filter blur-3xl -z-10" />

      {/* 2. Top Header Telemetry Strip */}
      <div className="w-full max-w-[500px] flex items-center justify-between mb-3 px-1 text-xs font-mono">
        <div className="flex items-center gap-2 text-amber-300">
          <Calendar className="w-3.5 h-3.5" />
          <span className="font-semibold tracking-wide">359-DAY TEMPORAL BASELINE</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-white/60">
          <button
            onClick={() => {
              setViewMode("split");
              setBlinking(false);
            }}
            className={`px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
              viewMode === "split" ? "bg-[var(--accent)] text-black font-semibold" : "hover:text-white"
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => {
              setViewMode("blink");
              setBlinking(true);
            }}
            className={`px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
              viewMode === "blink" ? "bg-[var(--accent)] text-black font-semibold" : "hover:text-white"
            }`}
          >
            Blink Mode
          </button>
        </div>
      </div>

      {/* 3. Main Observation Viewer Box (Preserving Aspect Ratio & Real Star Fields) */}
      <div className="relative w-full max-w-[500px] aspect-[4/3] rounded-2xl border border-white/15 bg-black/90 shadow-[0_0_50px_rgba(244,162,114,0.15)] overflow-hidden flex flex-col justify-between backdrop-blur-md">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/40 font-mono text-xs">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
            <span>Loading genuine Level 2 SPHEREx frames...</span>
          </div>
        ) : (
          <>
            {viewMode === "split" ? (
              /* Split-Slider Mode */
              <div className="relative w-full h-full overflow-hidden">
                {/* Epoch 2 (Background Right Layer) */}
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  {epoch2Src ? (
                    <img
                      src={epoch2Src}
                      alt="SPHEREx Epoch 2 Barnard's Star"
                      className="w-full h-full object-contain filter contrast-125"
                    />
                  ) : (
                    <div className="text-xs text-white/40 font-mono">Frame 2 Loading...</div>
                  )}
                  <div className="absolute top-3 right-3 text-[10px] font-mono text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-400/30 shadow">
                    Epoch 2 · 2026-08-21
                  </div>
                </div>

                {/* Epoch 1 (Foreground Left Clipped Layer) */}
                <div
                  className="absolute inset-0 overflow-hidden border-r-2 border-[var(--accent)] bg-black"
                  style={{ width: `${splitPos}%` }}
                >
                  <div className="relative w-full h-full flex items-center justify-center" style={{ minWidth: "100%" }}>
                    {epoch1Src ? (
                      <img
                        src={epoch1Src}
                        alt="SPHEREx Epoch 1 Barnard's Star"
                        className="w-full h-full object-contain filter contrast-125"
                      />
                    ) : (
                      <div className="text-xs text-white/40 font-mono">Frame 1 Loading...</div>
                    )}
                    <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-300 bg-black/80 px-2 py-0.5 rounded border border-cyan-400/30 shadow whitespace-nowrap">
                      Epoch 1 · 2025-08-27
                    </div>
                  </div>
                </div>

                {/* Draggable Divider Handle */}
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={splitPos}
                  onChange={(e) => setSplitPos(parseFloat(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20"
                  title="Drag slider left/right to compare observation visits"
                />

                <div
                  className="absolute top-0 bottom-0 pointer-events-none z-10 flex items-center justify-center"
                  style={{ left: `calc(${splitPos}% - 14px)` }}
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-black flex items-center justify-center shadow-[0_0_15px_rgba(244,162,114,0.8)] font-mono text-xs font-bold">
                    ↔
                  </div>
                </div>
              </div>
            ) : (
              /* Blink Mode */
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img
                  src={activeEpoch === 1 ? epoch1Src || "" : epoch2Src || ""}
                  alt={`SPHEREx Epoch ${activeEpoch}`}
                  className="w-full h-full object-contain filter contrast-125 transition-opacity duration-150"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border shadow ${
                      activeEpoch === 1
                        ? "text-cyan-300 bg-cyan-950/80 border-cyan-400/40"
                        : "text-amber-300 bg-amber-950/80 border-amber-400/40"
                    }`}
                  >
                    {activeEpoch === 1 ? "Epoch 1 · 2025-08-27" : "Epoch 2 · 2026-08-21"}
                  </span>
                  <button
                    onClick={() => setBlinking(!blinking)}
                    className="p-1 rounded bg-black/80 border border-white/20 text-white hover:text-[var(--accent)] cursor-pointer"
                  >
                    {blinking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom Astrometric Vector Callout Footer */}
        <div className="p-2.5 bg-black/85 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/70">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-white font-medium">Barnard's Star</span>
            <span className="text-white/40">·</span>
            <span className="text-amber-300 font-semibold">Δθ = 10.223″ displacement</span>
          </div>
          <span className="text-white/40 hidden sm:inline">Genuine SPHEREx Level 2 FITS</span>
        </div>
      </div>

      {/* 4. Bottom Controls / Info Bar */}
      <div className="w-full max-w-[500px] mt-2.5 flex items-center justify-between px-1 text-[10px] font-mono text-white/50">
        <span>{viewMode === "split" ? "Drag ↔ to wipe between epochs" : "Alternating epochs (700ms cadence)"}</span>
        <span className="text-amber-400/80">Band 1 (0.75–1.11 µm)</span>
      </div>
    </div>
  );
};

export default TimeMachineShowcaseVisual;
