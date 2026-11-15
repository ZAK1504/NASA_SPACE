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

export const WorkspaceTransitionOverlay: React.FC = () => {
  const [phase, setPhase] = useState<"idle" | "departing" | "navigating" | "arriving">("idle");
  const [direction, setDirection] = useState<"enter" | "return">("enter");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<{
    raf: number;
    stars: WarpStar[];
    startTime: number;
    direction: "enter" | "return";
  }>({
    raf: 0,
    stars: [],
    startTime: 0,
    direction: "enter",
  });

  useEffect(() => {
    const unregister = registerTransitionOverlay((payload: TransitionPayload) => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      setDirection(payload.direction);
      stateRef.current.direction = payload.direction;

      if (reduceMotion) {
        // Fast gentle crossfade without star streaks
        setPhase("departing");
        setTimeout(() => {
          payload.onNavigate();
          setPhase("arriving");
          setTimeout(() => setPhase("idle"), 140);
        }, 120);
        return;
      }

      // Initialize stars
      const w = window.innerWidth;
      const h = window.innerHeight;
      const n = Math.floor(w * h * 0.00028);
      const cols = ["244,162,114", "255,123,61", "255,255,255", "255,220,180", "125,211,252"];
      stateRef.current.stars = Array.from({ length: n }, () => ({
        x: (Math.random() - 0.5) * w * 1.5,
        y: (Math.random() - 0.5) * h * 1.5,
        z: Math.random() * 1000 + 100,
        speed: 8 + Math.random() * 18,
        size: 0.8 + Math.random() * 1.8,
        color: cols[Math.floor(Math.random() * cols.length)],
      }));
      stateRef.current.startTime = performance.now();

      // Begin Stage 1: Departure
      setPhase("departing");

      // Stage 2: Execute actual route change during peak coverage
      const navTimer = setTimeout(() => {
        setPhase("navigating");
        try {
          payload.onNavigate();
        } catch (e) {
          console.warn("Navigation transition error:", e);
        }

        // Stage 3: Arrival & Dissolve
        const arriveTimer = setTimeout(() => {
          setPhase("arriving");

          // Stage 4: Idle & Complete
          const finishTimer = setTimeout(() => {
            setPhase("idle");
          }, 200);
          return () => clearTimeout(finishTimer);
        }, 180);
        return () => clearTimeout(arriveTimer);
      }, 220);

      // Fail-safe watchdog: force dismissal if anything hangs
      const watchdog = setTimeout(() => {
        setPhase("idle");
      }, 850);

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

    const draw = (now: number) => {
      const elapsed = now - stateRef.current.startTime;

      // Dark semi-transparent cosmic background
      ctx.fillStyle = "rgba(4, 3, 8, 0.28)";
      ctx.fillRect(0, 0, w, h);

      // Radial warp tunnel glow
      const tunnelGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.6);
      tunnelGrad.addColorStop(0, "rgba(244, 162, 114, 0.18)");
      tunnelGrad.addColorStop(0.35, "rgba(255, 123, 61, 0.08)");
      tunnelGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = tunnelGrad;
      ctx.fillRect(0, 0, w, h);

      const stars = stateRef.current.stars;
      const speedMultiplier = Math.min(2.8, 1 + elapsed * 0.0035);

      for (const star of stars) {
        if (isEnter) {
          // Outward star warp
          star.z -= star.speed * speedMultiplier;
          if (star.z <= 20) {
            star.z = 1000;
            star.x = (Math.random() - 0.5) * w * 1.5;
            star.y = (Math.random() - 0.5) * h * 1.5;
          }
        } else {
          // Inward reverse star contraction
          star.z += star.speed * speedMultiplier;
          if (star.z >= 1000) {
            star.z = 30;
            star.x = (Math.random() - 0.5) * w * 0.4;
            star.y = (Math.random() - 0.5) * h * 0.4;
          }
        }

        const k = 400 / star.z;
        const px = cx + star.x * k;
        const py = cy + star.y * k;

        // Calculate tail position for relativistic speed streaks
        const trailLength = Math.max(2, star.speed * speedMultiplier * 0.8 * k);
        const angle = Math.atan2(py - cy, px - cx);
        const tailX = isEnter ? px - Math.cos(angle) * trailLength : px + Math.cos(angle) * trailLength;
        const tailY = isEnter ? py - Math.sin(angle) * trailLength : py + Math.sin(angle) * trailLength;

        const alpha = Math.min(1, Math.max(0.1, (1000 - star.z) / 800));

        ctx.strokeStyle = `rgba(${star.color}, ${alpha})`;
        ctx.lineWidth = star.size * Math.min(2.5, k * 1.4);
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
      className={`fixed inset-0 z-[99999] pointer-events-none select-none transition-opacity duration-200 flex items-center justify-center ${
        phase === "departing" || phase === "navigating" ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {/* Canvas 2D Relativistic Travel Warp Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle Central Navigation Reticle / Direction Badge */}
      <div className="relative z-10 flex flex-col items-center gap-2 pointer-events-none">
        <div className="w-12 h-12 rounded-full border border-[var(--accent)]/50 flex items-center justify-center shadow-[0_0_25px_rgba(244,162,114,0.4)] animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--accent)] bg-black/60 px-3 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
          {direction === "enter" ? "Approaching Instrument Coordinates..." : "Returning to Horizon Sky..."}
        </span>
      </div>
    </div>
  );
};

export default WorkspaceTransitionOverlay;
