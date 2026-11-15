import React, { useRef, useEffect, useCallback } from "react";

export interface ExplorerShowcaseVisualProps {
  activeMode?: "sky" | "object" | "spectral";
}

interface Star {
  x: number;   // normalized 0..1 on panorama sphere
  y: number;
  size: number;
  opacity: number;
  layer: number; // 0=far, 3=near
}

interface Beacon {
  name: string;
  type: string;
  nx: number; // normalized 0..1 position on panorama
  ny: number;
}

const BEACONS: Beacon[] = [
  { name: "Barnard's Star",  type: "High PM Red Dwarf",    nx: 0.55, ny: 0.46 },
  { name: "WISE 0855",       type: "Cold Brown Dwarf",     nx: 0.28, ny: 0.60 },
  { name: "Epsilon Indi B",  type: "T-Dwarf Binary",       nx: 0.20, ny: 0.74 },
  { name: "RW Aurigae",      type: "Young Stellar Object", nx: 0.78, ny: 0.30 },
  { name: "R Draconis",      type: "Carbon Mira Variable", nx: 0.50, ny: 0.22 },
];

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 4294967296);
  };
}

function buildStars(count: number): Star[] {
  const rand = seededRand(42);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const layer = Math.floor(rand() * 4);
    stars.push({
      x: rand(),
      y: rand(),
      size: 0.4 + rand() * (layer === 3 ? 1.6 : layer === 2 ? 1.0 : 0.6),
      opacity: 0.3 + rand() * 0.5 + layer * 0.1,
      layer,
    });
  }
  return stars;
}

const STARS = buildStars(220);

export const ExplorerShowcaseVisual: React.FC<ExplorerShowcaseVisualProps> = ({
  activeMode = "sky",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    rotation: 0,       // current panorama rotation in radians
    dragStartX: 0,
    dragStartRot: 0,
    isDragging: false,
    hoveredBeacon: -1,
    animFrame: 0,
    activeMode: "sky" as "sky" | "object" | "spectral",
    lastTime: 0,
    touchId: -1,
  });

  // Keep activeMode in ref for the rAF loop
  useEffect(() => {
    stateRef.current.activeMode = activeMode;
  }, [activeMode]);

  const draw = useCallback((ts: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { rotation, hoveredBeacon, activeMode: mode } = stateRef.current;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) / 2 - 2;

    // Auto-rotate: 1 deg/min = PI/10800 rad/ms
    const dt = ts - (stateRef.current.lastTime || ts);
    stateRef.current.lastTime = ts;
    if (!stateRef.current.isDragging) {
      stateRef.current.rotation += (Math.PI / 10800) * dt;
    }

    ctx.clearRect(0, 0, W, H);

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    // Sky background
    const bg = ctx.createRadialGradient(cx, cy - cy * 0.3, 0, cx, cy, R * 1.1);
    if (mode === "spectral") {
      bg.addColorStop(0, "#080518");
      bg.addColorStop(1, "#020108");
    } else {
      bg.addColorStop(0, "#05030f");
      bg.addColorStop(1, "#000006");
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Milky Way galactic disk & infrared dust lane (seamless rotated galactic plane)
    const rot = rotation % (Math.PI * 2);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot * 0.35 + 0.38); // Inclined galactic plane
    const mwGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, R * 0.95);
    if (mode === "spectral") {
      mwGrad.addColorStop(0, "rgba(99, 102, 241, 0.25)");
      mwGrad.addColorStop(0.35, "rgba(168, 85, 247, 0.15)");
      mwGrad.addColorStop(0.7, "rgba(59, 130, 246, 0.06)");
      mwGrad.addColorStop(1, "transparent");
    } else {
      mwGrad.addColorStop(0, "rgba(255, 175, 90, 0.24)");
      mwGrad.addColorStop(0.35, "rgba(244, 162, 114, 0.14)");
      mwGrad.addColorStop(0.7, "rgba(180, 90, 50, 0.06)");
      mwGrad.addColorStop(1, "transparent");
    }
    ctx.scale(2.2, 0.42); // Realistic elliptical disk
    ctx.fillStyle = mwGrad;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.95, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw stars
    const dimStars = mode === "object";
    STARS.forEach((star) => {
      const normX = (((star.x + rot / (Math.PI * 2)) % 1) + 1) % 1;
      const sx = normX * W;
      const sy = star.y * H;
      const alpha = dimStars ? star.opacity * 0.25 : star.opacity;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,245,235,${alpha})`;
      ctx.fill();
    });

    // Spectral wavelength band overlay
    if (mode === "spectral") {
      const spectralGrad = ctx.createLinearGradient(0, 0, W, H);
      spectralGrad.addColorStop(0.0, "rgba(60,80,255,0.09)");
      spectralGrad.addColorStop(0.4, "rgba(80,255,160,0.05)");
      spectralGrad.addColorStop(0.7, "rgba(255,160,60,0.07)");
      spectralGrad.addColorStop(1.0, "rgba(255,60,40,0.06)");
      ctx.fillStyle = spectralGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // Draw beacons
    BEACONS.forEach((beacon, idx) => {
      const bx = ((beacon.nx + (rot / (Math.PI * 2))) % 1) * W;
      const by = beacon.ny * H;
      const isHovered = hoveredBeacon === idx;
      const prominent = mode === "object";

      // Ping ring
      const pingT = (ts % 2000) / 2000;
      const pingR = (prominent ? 14 : 8) * (1 + pingT * 1.2);
      const pingAlpha = (1 - pingT) * (prominent ? 0.6 : 0.35);
      ctx.beginPath();
      ctx.arc(bx, by, pingR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,145,50,${pingAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Core dot
      const coreR = prominent ? 5 : (isHovered ? 4 : 3);
      const coreGrad = ctx.createRadialGradient(bx, by, 0, bx, by, coreR * 2.5);
      coreGrad.addColorStop(0, "rgba(255,210,120,1)");
      coreGrad.addColorStop(0.5, "rgba(255,120,40,0.8)");
      coreGrad.addColorStop(1, "rgba(255,80,20,0)");
      ctx.beginPath();
      ctx.arc(bx, by, coreR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Hover / prominent tooltip
      if (isHovered || (prominent && idx === 0)) {
        ctx.save();
        const tw = 150;
        const th = 36;
        const tx = Math.min(bx + 10, W - tw - 6);
        const ty = Math.max(by - th / 2, 4);
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.strokeStyle = "rgba(255,145,50,0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tx, ty, tw, th, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255,170,80,1)";
        ctx.font = "bold 10px 'Courier New', monospace";
        ctx.fillText(beacon.name, tx + 8, ty + 13);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = "9px 'Courier New', monospace";
        ctx.fillText(beacon.type, tx + 8, ty + 27);
        ctx.restore();
      }
    });

    // Vignette edge
    const vignette = ctx.createRadialGradient(cx, cy, R * 0.65, cx, cy, R);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.75, "rgba(0,0,0,0.1)");
    vignette.addColorStop(1, "rgba(0,0,0,0.85)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    ctx.restore(); // end clip

    stateRef.current.animFrame = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    stateRef.current.animFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(stateRef.current.animFrame);
  }, [draw]);

  // Mouse interaction
  const getCanvasPos = (canvas: HTMLCanvasElement, clientX: number) => {
    const rect = canvas.getBoundingClientRect();
    return clientX - rect.left;
  };

  const findHoveredBeacon = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const W = canvas.width;
    const H = canvas.height;
    const rot = stateRef.current.rotation % (Math.PI * 2);
    for (let i = 0; i < BEACONS.length; i++) {
      const bx = ((BEACONS[i].nx + (rot / (Math.PI * 2))) % 1) * W;
      const by = BEACONS[i].ny * H;
      const dist = Math.hypot(mx - bx, my - by);
      if (dist < 16) return i;
    }
    return -1;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    stateRef.current.isDragging = true;
    stateRef.current.dragStartX = getCanvasPos(canvas, e.clientX);
    stateRef.current.dragStartRot = stateRef.current.rotation;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (stateRef.current.isDragging) {
      const dx = getCanvasPos(canvas, e.clientX) - stateRef.current.dragStartX;
      stateRef.current.rotation = stateRef.current.dragStartRot - (dx / canvas.width) * Math.PI * 2;
    } else {
      stateRef.current.hoveredBeacon = findHoveredBeacon(canvas, e.clientX, e.clientY);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    stateRef.current.isDragging = false;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    stateRef.current.isDragging = true;
    stateRef.current.dragStartX = getCanvasPos(canvas, e.touches[0].clientX);
    stateRef.current.dragStartRot = stateRef.current.rotation;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current.isDragging || e.touches.length === 0) return;
    e.preventDefault();
    const dx = getCanvasPos(canvas, e.touches[0].clientX) - stateRef.current.dragStartX;
    stateRef.current.rotation = stateRef.current.dragStartRot - (dx / canvas.width) * Math.PI * 2;
  }, []);

  return (
    <div className="explorer-showcase-visual w-full relative flex items-center justify-center min-h-[440px] sm:min-h-[480px] select-none overflow-hidden rounded-3xl">
      {/* Ambient cosmic glow */}
      <div className="absolute inset-0 bg-radial from-indigo-900/20 via-transparent to-transparent pointer-events-none filter blur-3xl -z-10" />

      <div className="relative flex flex-col items-center gap-3">
        {/* Circular viewport */}
        <div className="relative" style={{ width: 420, height: 420 }}>
          {/* Soft outer glow ring */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              boxShadow: "0 0 60px 10px rgba(100,80,220,0.18), inset 0 0 40px 10px rgba(0,0,0,0.6)",
            }}
          />
          <canvas
            ref={canvasRef}
            width={420}
            height={420}
            className="rounded-full cursor-grab active:cursor-grabbing"
            style={{ display: "block" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          />
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center gap-4 text-[10px] font-mono text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            {activeMode === "sky" ? "All-Sky Panorama" : activeMode === "object" ? "Target Beacon Mode" : "Spectral Overlay"}
          </span>
          <span className="text-white/30">|</span>
          <span>Drag to rotate · Hover beacons</span>
        </div>
      </div>
    </div>
  );
};

export default ExplorerShowcaseVisual;
