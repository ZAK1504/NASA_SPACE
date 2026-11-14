import React, { useEffect, useRef } from "react";

const COLS = ["188,212,255", "255,255,255", "255,226,180", "200,190,255"];

interface Star {
  x: number;
  y: number;
  z: number;
  f: number;
  p: number;
  s: number;
  c: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

/** Fixed full-screen background: three parallax star layers plus shooting stars. */
export const Starfield: React.FC = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0,
      h = 0,
      stars: Star[] = [],
      raf = 0,
      shoot: ShootingStar | null = null,
      nextShoot = 2500;

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.floor(w * h * 0.00022);
      stars = Array.from({ length: n }, () => {
        const z = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          f: 0.04 + z * 0.22,
          p: Math.random() * 6.28,
          s: 0.0006 + Math.random() * 0.002,
          c: COLS[Math.floor(Math.random() * COLS.length)],
        };
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const sy = window.scrollY;
      for (const s of stars) {
        const y = (((s.y - sy * s.f) % h) + h) % h;
        const tw = 0.55 + 0.45 * Math.sin(t * s.s * 6 + s.p);
        ctx.globalAlpha = (0.25 + 0.75 * s.z) * tw;
        ctx.fillStyle = `rgb(${s.c})`;
        const size = 0.7 + s.z * 1.7;
        ctx.fillRect(s.x, y, size, size);
      }
      ctx.globalAlpha = 1;

      if (!reduce) {
        if (!shoot && t > nextShoot) {
          shoot = {
            x: Math.random() * w * 0.7 + w * 0.2,
            y: Math.random() * h * 0.4,
            vx: 9 + Math.random() * 5,
            vy: 4 + Math.random() * 3,
            life: 0,
          };
          nextShoot = t + 5000 + Math.random() * 6000;
        }
        if (shoot) {
          shoot.life += 1;
          shoot.x += shoot.vx;
          shoot.y += shoot.vy;
          const a = Math.max(0, 1 - shoot.life / 50);
          const g = ctx.createLinearGradient(
            shoot.x,
            shoot.y,
            shoot.x - shoot.vx * 9,
            shoot.y - shoot.vy * 9
          );
          g.addColorStop(0, `rgba(255,255,255,${a})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(shoot.x, shoot.y);
          ctx.lineTo(shoot.x - shoot.vx * 9, shoot.y - shoot.vy * 9);
          ctx.stroke();
          if (shoot.life > 50) shoot = null;
        }
        raf = requestAnimationFrame(draw);
      }
    };

    init();
    raf = requestAnimationFrame(draw);
    const onScroll = () => draw(0);
    if (reduce) window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(raf);
      if (reduce) window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", init);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="starfield" />;
};

export default Starfield;
