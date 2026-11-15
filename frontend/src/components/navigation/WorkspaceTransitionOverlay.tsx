import React, { useEffect, useRef, useState } from "react";
import { registerTransitionOverlay, TransitionPayload } from "../../lib/journeyState";

interface WarpStar {
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
  color: string;
}

interface ChapterAtmospherePalette {
  glowInner: string;
  glowMid: string;
  starColors: string[];
}

const CHAPTER_PALETTES: Record<string, ChapterAtmospherePalette> = {
  home: {
    glowInner: "rgba(244, 162, 114, 0.28)",
    glowMid: "rgba(217, 119, 6, 0.12)",
    starColors: ["244,162,114", "255,123,61", "255,220,180", "255,255,255", "217,119,6"],
  },
  explorer: {
    glowInner: "rgba(129, 140, 248, 0.32)",
    glowMid: "rgba(168, 85, 247, 0.14)",
    starColors: ["129,140,248", "168,85,247", "99,102,241", "255,255,255", "199,210,254"],
  },
  "time-machine": {
    glowInner: "rgba(255, 123, 61, 0.35)",
    glowMid: "rgba(234, 88, 12, 0.16)",
    starColors: ["255,123,61", "244,162,114", "234,88,12", "255,255,255", "254,215,170"],
  },
  labs: {
    glowInner: "rgba(148, 163, 184, 0.26)",
    glowMid: "rgba(203, 213, 225, 0.12)",
    starColors: ["148,163,184", "203,213,225", "244,162,114", "255,255,255", "100,116,139"],
  },
  mission: {
    glowInner: "rgba(56, 189, 248, 0.30)",
    glowMid: "rgba(251, 191, 36, 0.14)",
    starColors: ["56,189,248", "251,191,36", "125,211,252", "255,255,255", "245,158,11"],
  },
};

export const WorkspaceTransitionOverlay: React.FC = () => {
  const [phase, setPhase] = useState<"idle" | "departing" | "navigating" | "arriving">("idle");
  const [direction, setDirection] = useState<"enter" | "return">("enter");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stateRef = useRef<{
    raf: number;
    stars: WarpStar[];
    startTime: number;
    direction: "enter" | "return";
    chapter: string;
  }>({
    raf: 0,
    stars: [],
    startTime: 0,
    direction: "enter",
    chapter: "home",
  });

  useEffect(() => {
    const unregister = registerTransitionOverlay((payload: TransitionPayload) => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const chapterKey = (payload.originChapter || "home").toLowerCase();
      const palette = CHAPTER_PALETTES[chapterKey] || CHAPTER_PALETTES.home;

      setDirection(payload.direction);
      stateRef.current.direction = payload.direction;
      stateRef.current.chapter = chapterKey;

      if (reduceMotion) {
        // Fast gentle crossfade without star streaks
        setPhase("departing");
        setTimeout(() => {
          payload.onNavigate();
          setPhase("arriving");
          setTimeout(() => setPhase("idle"), 180);
        }, 160);
        return;
      }

      // Initialize stars with chapter-specific atmospheric color palette
      const w = window.innerWidth;
      const h = window.innerHeight;
      const n = Math.floor(w * h * 0.00032);
      const cols = palette.starColors;

      stateRef.current.stars = Array.from({ length: n }, () => ({
        x: (Math.random() - 0.5) * w * 1.6,
        y: (Math.random() - 0.5) * h * 1.6,
        z: Math.random() * 1000 + 80,
        speed: 6 + Math.random() * 16,
        size: 0.9 + Math.random() * 1.9,
        color: cols[Math.floor(Math.random() * cols.length)],
      }));
      stateRef.current.startTime = performance.now();

      // Stage 1: Departure (~420ms forward or backward acceleration)
      setPhase("departing");

      // Stage 2: Execute actual route change during peak warp opacity
      const navTimer = setTimeout(() => {
        setPhase("navigating");
        try {
          payload.onNavigate();
        } catch (e) {
          console.warn("Navigation transition error:", e);
        }

        // Stage 3: Arrival & Deceleration (~380ms)
        const arriveTimer = setTimeout(() => {
          setPhase("arriving");

          // Stage 4: Settle & Idle (~150ms)
          const finishTimer = setTimeout(() => {
            setPhase("idle");
          }, 180);
          return () => clearTimeout(finishTimer);
        }, 360);
        return () => clearTimeout(arriveTimer);
      }, 420);

      // Fail-safe watchdog: force dismissal if anything hangs
      const watchdog = setTimeout(() => {
        setPhase("idle");
      }, 1400);

      return () => {
        clearTimeout(navTimer);
        clearTimeout(watchdog);
      };
    });

    return () => {
      unregister();
    };
  }, []);

  // Canvas Star-Warp Animation Loop
  useEffect(() => {
    if (phase === "idle") {
      if (stateRef.current.raf) {
        cancelAnimationFrame(stateRef.current.raf);
        stateRef.current.raf = 0;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = w / 2;
    const cy = h / 2;
    const isEnter = stateRef.current.direction === "enter";
    const palette = CHAPTER_PALETTES[stateRef.current.chapter] || CHAPTER_PALETTES.home;

    const draw = (now: number) => {
      const elapsed = now - stateRef.current.startTime;

      // Dark semi-transparent cosmic background trail
      ctx.fillStyle = "rgba(4, 3, 8, 0.24)";
      ctx.fillRect(0, 0, w, h);

      // Chapter-specific radial warp tunnel glow
      const tunnelGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.65);
      tunnelGrad.addColorStop(0, palette.glowInner);
      tunnelGrad.addColorStop(0.38, palette.glowMid);
      tunnelGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = tunnelGrad;
      ctx.fillRect(0, 0, w, h);

      const stars = stateRef.current.stars;
      // Smooth acceleration during departure, gentle deceleration during arrival
      let speedMultiplier = 1.0;
      if (elapsed < 420) {
        speedMultiplier = 1.0 + (elapsed / 420) * 2.2;
      } else {
        const arrivalProgress = Math.min(1.0, (elapsed - 420) / 450);
        speedMultiplier = 3.2 - arrivalProgress * 2.0;
      }

      for (const star of stars) {
        if (isEnter) {
          // Outward star warp: stars accelerate forward towards camera
          star.z -= star.speed * speedMultiplier;
          if (star.z <= 20) {
            star.z = 1000;
            star.x = (Math.random() - 0.5) * w * 1.6;
            star.y = (Math.random() - 0.5) * h * 1.6;
          }
        } else {
          // Inward reverse star contraction: stars pull back towards center
          star.z += star.speed * speedMultiplier;
          if (star.z >= 1000) {
            star.z = 30;
            star.x = (Math.random() - 0.5) * w * 0.45;
            star.y = (Math.random() - 0.5) * h * 0.45;
          }
        }

        const k = 400 / star.z;
        const px = cx + star.x * k;
        const py = cy + star.y * k;

        // Tail position for relativistic speed streaks
        const trailLength = Math.max(2, star.speed * speedMultiplier * 0.75 * k);
        const angle = Math.atan2(py - cy, px - cx);
        const tailX = isEnter ? px - Math.cos(angle) * trailLength : px + Math.cos(angle) * trailLength;
        const tailY = isEnter ? py - Math.sin(angle) * trailLength : py + Math.sin(angle) * trailLength;

        const alpha = Math.min(1, Math.max(0.12, (1000 - star.z) / 750));

        ctx.strokeStyle = `rgba(${star.color}, ${alpha})`;
        ctx.lineWidth = star.size * Math.min(2.8, k * 1.5);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      stateRef.current.raf = requestAnimationFrame(draw);
    };

    stateRef.current.raf = requestAnimationFrame(draw);

    return () => {
      if (stateRef.current.raf) {
        cancelAnimationFrame(stateRef.current.raf);
        stateRef.current.raf = 0;
      }
    };
  }, [phase]);

  if (phase === "idle") return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] pointer-events-none select-none transition-opacity duration-300 flex items-center justify-center ${
        phase === "departing" || phase === "navigating" ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {/* Canvas 2D Relativistic Travel Warp Canvas — 100% Text-Free Pure Cinematic Motion */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default WorkspaceTransitionOverlay;
