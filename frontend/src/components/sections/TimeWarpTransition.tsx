import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Compass } from "lucide-react";

export const TimeWarpTransition: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId = 0;
    const updateProgress = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Calculate progress across the transition window
      // 0.0 when top enters viewport, 1.0 when mid-screen, decaying back to 0.0 as it exits
      if (rect.bottom < 0 || rect.top > vh) {
        if (window.__horizonWarpFactor) window.__horizonWarpFactor = 0;
        return;
      }

      const totalDist = vh + rect.height;
      const current = vh - rect.top;
      const rawProgress = Math.max(0, Math.min(1, current / totalDist));

      // Peak warp factor in the middle of transition
      const peak = Math.sin(rawProgress * Math.PI);
      const warp = Math.max(0, Math.min(1, peak * 1.3));

      window.__horizonWarpFactor = warp;
      setProgress(warp);
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      window.__horizonWarpFactor = 0;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="time-warp-zone w-full py-8 my-2 relative overflow-hidden flex flex-col items-center justify-center pointer-events-none select-none"
      style={{ minHeight: "26vh" }}
      aria-hidden="true"
    >
      {/* Dynamic atmospheric warp tunnel rings */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
        style={{ opacity: Math.max(0.1, progress * 0.9) }}
      >
        <div
          className="w-96 h-96 rounded-full border border-[var(--accent)]/30 animate-ping"
          style={{ animationDuration: `${Math.max(0.8, 2.5 - progress * 1.5)}s` }}
        />
        <div
          className="w-64 h-64 rounded-full border border-dashed border-white/20 absolute"
          style={{ transform: `scale(${1 + progress * 0.6})` }}
        />
        <div
          className="w-40 h-40 rounded-full border border-orange-400/30 absolute"
          style={{ transform: `scale(${1 + progress * 0.4})` }}
        />
      </div>

      {/* Spacetime Cinematic HUD Readout */}
      <div
        className="relative z-10 text-center px-4 transition-all duration-300"
        style={{
          opacity: Math.max(0.3, progress * 1.2),
          transform: `scale(${0.95 + progress * 0.1})`,
        }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[var(--accent)]/40 text-[var(--accent)] text-[11px] font-mono tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
          <span>SPACETIME CONTINUUM · MULTI-EPOCH ACCELERATION</span>
        </div>

        <h3 className="text-2xl md:text-4xl font-light text-white tracking-tight">
          Traveling through <b className="text-[var(--accent)] font-semibold">space-time</b>...
        </h3>

        <p className="text-xs md:text-sm text-[var(--mut)] font-mono mt-2 max-w-md mx-auto">
          Traversing 2 years of NASA SPHEREx celestial visits across 102 spectral bands.
        </p>

        <div className="mt-4 flex items-center justify-center gap-6 text-[10px] font-mono text-white/50">
          <span>SURVEY BASELINE: 359 DAYS</span>
          <span>·</span>
          <span>EPOCH DRIFT: {(progress * 10.2).toFixed(2)} mas</span>
          <span>·</span>
          <span>VELOCITY: {(progress * 1.0).toFixed(2)}c</span>
        </div>
      </div>
    </div>
  );
};

export default TimeWarpTransition;
