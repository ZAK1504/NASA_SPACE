import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Compass, Radio } from "lucide-react";

/**
 * High-Precision Parallax Cosmic Transition from Home (Meet SPHEREx) to Explorer (All-Sky Survey).
 * Completely replaces all wavy / curly ribbons with a sleek, multi-layered aerospace parallax scene:
 * - Multi-depth drifting cosmic particles with velocity differential
 * - Luminous infrared spectrum wavefront (0.75 μm -> 5.0 μm) responding directly to scroll depth
 * - Rotating astrometric compass and celestial coordinate reticle
 * - Clean, non-curly telemetry badge with pulsing photon emitter
 */
export const HomeToExplorerParallaxTransition: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const handleScroll = () => {
      raf = 0;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress 0 when top enters bottom of viewport, 1 when bottom leaves top
      const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      setScrollProgress(p);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(handleScroll);
    };

    handleScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Parallax offsets
  const parallaxFast = (scrollProgress - 0.5) * -60;
  const parallaxSlow = (scrollProgress - 0.5) * -25;
  const rotationDeg = (scrollProgress * 90) % 360;
  const beamScaleX = 0.4 + scrollProgress * 0.6;
  const beamOpacity = Math.sin(scrollProgress * Math.PI);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="home-to-explorer-parallax relative w-full h-32 sm:h-40 my-2 overflow-hidden pointer-events-none select-none flex flex-col items-center justify-center"
    >
      {/* 1. Deep Space Cosmic Particles Layer (Moves with fast parallax) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate3d(0, ${parallaxFast}px, 0)`,
          transition: "transform 0.1s linear",
        }}
      >
        <div className="absolute left-[15%] top-[25%] w-1.5 h-1.5 rounded-full bg-amber-400/60 blur-[0.5px]" />
        <div className="absolute left-[28%] top-[65%] w-1 h-1 rounded-full bg-indigo-400/50" />
        <div className="absolute left-[45%] top-[15%] w-2 h-2 rounded-full bg-orange-400/70 blur-[1px]" />
        <div className="absolute left-[62%] top-[70%] w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
        <div className="absolute left-[78%] top-[30%] w-1 h-1 rounded-full bg-purple-400/50" />
        <div className="absolute left-[88%] top-[60%] w-2 h-2 rounded-full bg-rose-400/70 blur-[1px]" />
      </div>

      {/* 2. Astrometric Compass & Orbital Reticle (Rotates smoothly with scroll) */}
      <div
        className="absolute w-56 h-56 rounded-full border border-white/[0.08] pointer-events-none flex items-center justify-center"
        style={{
          transform: `translate3d(0, ${parallaxSlow}px, 0) rotate(${rotationDeg}deg) scale(${0.85 + scrollProgress * 0.3})`,
          opacity: 0.25 + beamOpacity * 0.45,
          transition: "transform 0.1s linear, opacity 0.15s ease-out",
        }}
      >
        <div className="w-40 h-40 rounded-full border border-dashed border-indigo-500/20" />
        <div className="w-24 h-24 rounded-full border border-amber-500/30" />
        <div className="absolute -top-1 w-2 h-2 rounded-full bg-[var(--accent)]/60" />
        <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-indigo-400/60" />
      </div>

      {/* 3. Luminous Infrared Spectrum Light Bar (Expands & shifts from optical to IR) */}
      <div
        className="absolute w-full max-w-4xl h-[1.5px] bg-gradient-to-r from-transparent via-[#f4a272] via-purple-500 to-transparent pointer-events-none"
        style={{
          transform: `scaleX(${beamScaleX})`,
          opacity: Math.max(0.2, beamOpacity * 0.9),
          boxShadow: `0 0 16px rgba(244, 162, 114, ${beamOpacity * 0.6})`,
          transition: "transform 0.1s linear, opacity 0.15s ease-out",
        }}
      />

      {/* 4. Elegant Aerospace Telemetry Transit Pill (Zero curly waves!) */}
      <div
        className="relative z-10 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0a0a12]/85 backdrop-blur-xl border border-white/15 text-xs font-mono text-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
        style={{
          transform: `translate3d(0, ${parallaxSlow * 0.6}px, 0)`,
          transition: "transform 0.1s linear",
        }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
        </span>
        <span className="text-[var(--accent)] font-semibold tracking-wider uppercase text-[11px]">
          TRANSIT 01 → 02
        </span>
        <span className="text-white/30">|</span>
        <span className="text-white/80 tracking-wide text-[11px] hidden sm:inline">
          DEPARTURE INTO INFRARED
        </span>
        <span className="text-white/30 hidden sm:inline">|</span>
        <span className="text-indigo-300 font-medium text-[10.5px]">
          102 SPECTRAL CHANNELS
        </span>
      </div>

      {/* 5. Delicate Downward Transit Pointer */}
      <div className="mt-2 text-[10px] font-mono text-white/40 flex items-center gap-1">
        <span>CELESTIAL SURVEY ENTRY</span>
        <span className="text-[var(--accent)] animate-bounce">↓</span>
      </div>
    </div>
  );
};

export default HomeToExplorerParallaxTransition;
