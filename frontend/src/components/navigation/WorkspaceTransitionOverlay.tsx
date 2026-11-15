import React, { useEffect, useRef, useState, useCallback } from "react";
import { registerTransitionOverlay, TransitionPayload } from "../../lib/journeyState";

interface AtmosphericPalette {
  primary: string;       // Primary luminous color (hex/rgba)
  accent: string;        // Soft trailing atmospheric hue
  coreLight: string;     // Brightest celestial crest
  ambientGlow: string;   // Radial ambient aura
}

const CHAPTER_ATMOSPHERE_PALETTES: Record<string, AtmosphericPalette> = {
  home: {
    primary: "rgba(244, 162, 114, 0.95)",
    accent: "rgba(224, 122, 72, 0.65)",
    coreLight: "rgba(255, 235, 210, 0.98)",
    ambientGlow: "rgba(244, 162, 114, 0.40)",
  },
  explorer: {
    primary: "rgba(129, 140, 248, 0.95)",
    accent: "rgba(168, 85, 247, 0.65)",
    coreLight: "rgba(238, 242, 255, 0.98)",
    ambientGlow: "rgba(129, 140, 248, 0.42)",
  },
  "time-machine": {
    primary: "rgba(255, 123, 61, 0.95)",
    accent: "rgba(245, 158, 11, 0.65)",
    coreLight: "rgba(254, 243, 199, 0.98)",
    ambientGlow: "rgba(255, 123, 61, 0.45)",
  },
  labs: {
    primary: "rgba(148, 163, 184, 0.95)",
    accent: "rgba(203, 213, 225, 0.65)",
    coreLight: "rgba(244, 162, 114, 0.92)",
    ambientGlow: "rgba(148, 163, 184, 0.36)",
  },
  mission: {
    primary: "rgba(59, 130, 246, 0.95)",
    accent: "rgba(244, 162, 114, 0.65)",
    coreLight: "rgba(219, 234, 254, 0.98)",
    ambientGlow: "rgba(59, 130, 246, 0.40)",
  },
};

/**
 * Short Celestial Aperture & Atmospheric Light Reveal Transition.
 * A smooth, cinematic transition with chapter-specific lighting and a curved wavefront reveal.
 * Covers the route swap at midpoint (~280ms) and dissolves cleanly within ~620ms.
 */
export const WorkspaceTransitionOverlay: React.FC = () => {
  const [phase, setPhase] = useState<"idle" | "covering" | "navigating" | "revealing">("idle");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stateRef = useRef<{
    raf: number;
    startTime: number;
    totalDuration: number;
    direction: "enter" | "return";
    chapter: string;
    hasNavigated: boolean;
    onNavigate: (() => void) | null;
  }>({
    raf: 0,
    startTime: 0,
    totalDuration: 620, // ~620ms total transition
    direction: "enter",
    chapter: "home",
    hasNavigated: false,
    onNavigate: null,
  });

  const runAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (stateRef.current.raf) {
      cancelAnimationFrame(stateRef.current.raf);
    }

    const palette = CHAPTER_ATMOSPHERE_PALETTES[stateRef.current.chapter] || CHAPTER_ATMOSPHERE_PALETTES.home;
    const duration = stateRef.current.totalDuration;
    const isReturn = stateRef.current.direction === "return";

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const animate = (timestamp: number) => {
      if (!stateRef.current.startTime) {
        stateRef.current.startTime = timestamp;
      }
      const elapsed = timestamp - stateRef.current.startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Smooth ease-in-out cubic easing for natural cosmic aperture motion
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      ctx.clearRect(0, 0, W, H);

      // Midpoint route swap: at 45% progress (~280ms), veil is fully covering the viewport
      if (progress >= 0.45 && !stateRef.current.hasNavigated) {
        stateRef.current.hasNavigated = true;
        if (stateRef.current.onNavigate) {
          stateRef.current.onNavigate();
        }
        setPhase("revealing");
      }

      // 1. Ambient Atmospheric Dimming & Tint Veil
      // Peaks cleanly at midpoint (progress = 0.45) to conceal route DOM swap, then smoothly dissolves
      const ambientAlpha =
        progress < 0.45
          ? (progress / 0.45) * 0.94
          : Math.max(0, 1 - (progress - 0.45) / 0.55);

      // Gentle dark space backdrop (never pure solid black)
      ctx.fillStyle = `rgba(5, 4, 10, ${ambientAlpha * 0.92})`;
      ctx.fillRect(0, 0, W, H);

      // Radial chapter-colored atmospheric bloom
      const radGlow = ctx.createRadialGradient(W / 2, H / 2, 30, W / 2, H / 2, Math.max(W, H) * 0.75);
      radGlow.addColorStop(0, palette.ambientGlow.replace(/[\d.]+\)$/, `${ambientAlpha * 0.55})`));
      radGlow.addColorStop(0.5, palette.ambientGlow.replace(/[\d.]+\)$/, `${ambientAlpha * 0.25})`));
      radGlow.addColorStop(1, "rgba(5, 4, 10, 0)");
      ctx.fillStyle = radGlow;
      ctx.fillRect(0, 0, W, H);

      // 2. Luminous Curved Aperture Wavefront
      // Sweeps across viewport: bottom-left to top-right on enter, opposite on return
      const sweepDist = W + H * 1.5;
      const currentPos = isReturn
        ? (1 - ease) * sweepDist - H * 0.45
        : ease * sweepDist - H * 0.45;

      const bandWidth = Math.max(360, W * 0.58);
      const angle = isReturn ? 0.38 : -0.38;

      ctx.save();
      ctx.translate(currentPos, H / 2);
      ctx.rotate(angle);

      // Gradient profile across the sweeping wavefront:
      // Leading soft halo -> Brilliant celestial crest -> Trailing atmospheric scatter
      const sweepGrad = ctx.createLinearGradient(-bandWidth / 2, 0, bandWidth / 2, 0);
      const peakAlpha = Math.min(1.0, ambientAlpha * 1.25);

      sweepGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      sweepGrad.addColorStop(0.25, palette.accent.replace(/[\d.]+\)$/, `${peakAlpha * 0.42})`));
      sweepGrad.addColorStop(0.5, palette.coreLight.replace(/[\d.]+\)$/, `${peakAlpha * 0.92})`));
      sweepGrad.addColorStop(0.75, palette.primary.replace(/[\d.]+\)$/, `${peakAlpha * 0.50})`));
      sweepGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = sweepGrad;
      ctx.fillRect(-bandWidth / 2, -H * 1.5, bandWidth, H * 3);

      // Inner luminous curved arc crest (dual-pass stroke: radiant core + soft outer aura without CPU shadowBlur overhead)
      ctx.beginPath();
      ctx.moveTo(-15, -H * 1.5);
      ctx.quadraticCurveTo(isReturn ? -60 : 60, 0, -15, H * 1.5);
      ctx.lineWidth = 26;
      ctx.strokeStyle = palette.primary.replace(/[\d.]+\)$/, `${peakAlpha * 0.36})`);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-15, -H * 1.5);
      ctx.quadraticCurveTo(isReturn ? -60 : 60, 0, -15, H * 1.5);
      ctx.lineWidth = 8;
      ctx.strokeStyle = palette.coreLight.replace(/[\d.]+\)$/, `${peakAlpha * 0.98})`);
      ctx.stroke();

      ctx.restore();

      // Continue animation loop until finished
      if (progress < 1.0) {
        stateRef.current.raf = requestAnimationFrame(animate);
      } else {
        // Lifecycle completion
        ctx.clearRect(0, 0, W, H);
        setPhase("idle");
        stateRef.current.onNavigate = null;
      }
    };

    stateRef.current.raf = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const unregister = registerTransitionOverlay((payload: TransitionPayload) => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const chapterKey = (payload.originChapter || "home").toLowerCase();

      stateRef.current.direction = payload.direction;
      stateRef.current.chapter = chapterKey;
      stateRef.current.startTime = 0;
      stateRef.current.hasNavigated = false;
      stateRef.current.onNavigate = payload.onNavigate;

      if (reduceMotion) {
        // Accessibility: instantaneous gentle fade without motion sweep
        setPhase("covering");
        setTimeout(() => {
          if (!stateRef.current.hasNavigated) {
            stateRef.current.hasNavigated = true;
            payload.onNavigate();
          }
          setPhase("revealing");
          setTimeout(() => setPhase("idle"), 120);
        }, 120);
        return;
      }

      setPhase("covering");
      // The canvas element is permanently mounted in the DOM, so canvasRef.current is immediately valid!
      runAnimation();
    });

    return () => {
      unregister();
      if (stateRef.current.raf) {
        cancelAnimationFrame(stateRef.current.raf);
      }
    };
  }, [runAnimation]);

  // Safety watchdog timer: guarantees overlay never gets stuck under any error condition
  useEffect(() => {
    if (phase !== "idle") {
      const safetyTimer = setTimeout(() => {
        if (stateRef.current.onNavigate && !stateRef.current.hasNavigated) {
          stateRef.current.hasNavigated = true;
          stateRef.current.onNavigate();
        }
        setPhase("idle");
      }, 850);
      return () => clearTimeout(safetyTimer);
    }
  }, [phase]);

  // CRITICAL: The canvas is ALWAYS rendered in the DOM so canvasRef.current is never null.
  // When idle, it is fully transparent, invisible and non-interactive (pointer-events-none).
  const isVisible = phase !== "idle";

  return (
    <div
      className={`fixed inset-0 z-[100] select-none overflow-hidden transition-opacity duration-200 ${
        isVisible
          ? "opacity-100 pointer-events-auto visible"
          : "opacity-0 pointer-events-none invisible"
      }`}
      aria-hidden={!isVisible}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
};

export default WorkspaceTransitionOverlay;
