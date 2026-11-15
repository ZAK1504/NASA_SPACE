import React, { useEffect, useRef, useState, useCallback } from "react";
import { registerTransitionOverlay, TransitionPayload } from "../../lib/journeyState";

interface LightSweepPalette {
  primary: string;       // Primary luminous color (hex/rgb)
  accent: string;        // Trailing atmospheric hue
  coreLight: string;     // Brightest spectral crest
  ambientGlow: string;   // Radial atmospheric aura
}

const CHAPTER_LIGHT_PALETTES: Record<string, LightSweepPalette> = {
  home: {
    primary: "rgba(244, 162, 114, 0.95)",
    accent: "rgba(224, 122, 72, 0.65)",
    coreLight: "rgba(255, 235, 210, 0.98)",
    ambientGlow: "rgba(244, 162, 114, 0.42)",
  },
  explorer: {
    primary: "rgba(129, 140, 248, 0.95)",
    accent: "rgba(168, 85, 247, 0.65)",
    coreLight: "rgba(238, 242, 255, 0.98)",
    ambientGlow: "rgba(129, 140, 248, 0.44)",
  },
  "time-machine": {
    primary: "rgba(255, 123, 61, 0.95)",
    accent: "rgba(245, 158, 11, 0.65)",
    coreLight: "rgba(254, 243, 199, 0.98)",
    ambientGlow: "rgba(255, 123, 61, 0.48)",
  },
  labs: {
    primary: "rgba(148, 163, 184, 0.95)",
    accent: "rgba(203, 213, 225, 0.65)",
    coreLight: "rgba(244, 162, 114, 0.92)",
    ambientGlow: "rgba(148, 163, 184, 0.38)",
  },
  mission: {
    primary: "rgba(59, 130, 246, 0.95)",
    accent: "rgba(244, 162, 114, 0.65)",
    coreLight: "rgba(219, 234, 254, 0.98)",
    ambientGlow: "rgba(59, 130, 246, 0.42)",
  },
};

/**
 * Cinematic Atmospheric Light-Sweep Reveal Transition.
 * Replaces legacy star-tunnel space flight with an art-directed luminous veil crossing the viewport.
 * Passing like a celestial wave of light, revealing the destination cleanly without fake text or star trails.
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
    totalDuration: 780, // ~780ms total transition
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

    const palette = CHAPTER_LIGHT_PALETTES[stateRef.current.chapter] || CHAPTER_LIGHT_PALETTES.home;
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

      // Smooth quintic / cubic easing for natural wave propagation
      const easeProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      ctx.clearRect(0, 0, W, H);

      // Midpoint route swap: when the luminous veil spans the screen (around 45% progress)
      if (progress >= 0.45 && !stateRef.current.hasNavigated) {
        stateRef.current.hasNavigated = true;
        setPhase("navigating");
        if (stateRef.current.onNavigate) {
          stateRef.current.onNavigate();
        }
        setPhase("revealing");
      }

      // 1. Ambient Atmospheric Background Glow (peaks around midpoint, dissolves cleanly)
      const ambientAlpha =
        progress < 0.45
          ? (progress / 0.45) * 0.95
          : Math.max(0, 1 - (progress - 0.45) / 0.55);

      const radGlow = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, Math.max(W, H) * 0.75);
      radGlow.addColorStop(0, palette.ambientGlow.replace(/[\d.]+\)$/, `${ambientAlpha * 0.45})`));
      radGlow.addColorStop(0.5, palette.ambientGlow.replace(/[\d.]+\)$/, `${ambientAlpha * 0.22})`));
      radGlow.addColorStop(1, "rgba(4, 3, 8, 0)");
      ctx.fillStyle = radGlow;
      ctx.fillRect(0, 0, W, H);

      // 2. Luminous Atmospheric Light-Sweep Band
      // Sweep diagonal: from top-left to bottom-right on 'enter', opposite on 'return'
      const sweepDistance = W + H * 1.5;
      const currentPos = isReturn
        ? (1 - easeProgress) * sweepDistance - H * 0.5
        : easeProgress * sweepDistance - H * 0.5;

      const bandWidth = Math.max(340, W * 0.55);
      const angle = isReturn ? 0.42 : -0.42;

      ctx.save();
      ctx.translate(currentPos, H / 2);
      ctx.rotate(angle);

      // Gradient profile across the luminous wavefront:
      // Leading soft halo -> Brilliant white/gold crest -> Trailing atmospheric scatter
      const sweepGrad = ctx.createLinearGradient(-bandWidth / 2, 0, bandWidth / 2, 0);
      const peakAlpha = Math.min(1.0, ambientAlpha * 1.25);

      sweepGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      sweepGrad.addColorStop(0.25, palette.accent.replace(/[\d.]+\)$/, `${peakAlpha * 0.45})`));
      sweepGrad.addColorStop(0.5, palette.coreLight.replace(/[\d.]+\)$/, `${peakAlpha * 0.92})`));
      sweepGrad.addColorStop(0.75, palette.primary.replace(/[\d.]+\)$/, `${peakAlpha * 0.55})`));
      sweepGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = sweepGrad;
      ctx.fillRect(-bandWidth / 2, -H * 1.5, bandWidth, H * 3);

      // Inner brilliant laser filament for crisp celestial feel
      const crestGrad = ctx.createLinearGradient(-30, 0, 30, 0);
      crestGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      crestGrad.addColorStop(0.5, palette.coreLight.replace(/[\d.]+\)$/, `${peakAlpha * 0.98})`));
      crestGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = crestGrad;
      ctx.fillRect(-30, -H * 1.5, 60, H * 3);

      ctx.restore();

      // Continue until complete
      if (progress < 1.0) {
        stateRef.current.raf = requestAnimationFrame(animate);
      } else {
        // Complete transition lifecycle cleanly
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
          payload.onNavigate();
          setPhase("revealing");
          setTimeout(() => setPhase("idle"), 140);
        }, 140);
        return;
      }

      setPhase("covering");
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
          stateRef.current.onNavigate();
        }
        setPhase("idle");
      }, 980);
      return () => clearTimeout(safetyTimer);
    }
  }, [phase]);

  if (phase === "idle") {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden transition-opacity duration-300"
      style={{
        opacity: phase === "covering" || phase === "navigating" ? 1 : 0.85,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
};

export default WorkspaceTransitionOverlay;
