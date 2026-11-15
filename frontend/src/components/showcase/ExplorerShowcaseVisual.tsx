import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Sparkles, Radio, Layers, Info, Compass, Eye } from "lucide-react";

export interface ExplorerShowcaseVisualProps {
  activeMode?: "sky" | "object" | "spectral";
}

interface TargetStar {
  id: string;
  name: string;
  designation: string;
  type: string;
  xPct: number; // percentage within cluster canvas (0 - 100)
  yPct: number;
  color: string;
  glowColor: string;
  size: number;
  raHms: string;
  decDms: string;
  fact: string;
  pmNote: string;
  wavelengthNote: string;
}

const CANONICAL_TARGETS: TargetStar[] = [
  {
    id: "barnards-star",
    name: "Barnard's Star",
    designation: "GJ 699",
    type: "High Proper-Motion M4V Dwarf",
    xPct: 40,
    yPct: 44,
    color: "#F4A272",
    glowColor: "rgba(244, 162, 114, 0.45)",
    size: 4.5,
    raHms: "17h 57m 48s",
    decDms: "+04° 44′ 22″",
    fact: "Fastest proper motion star known; traverses 10.223″ predicted displacement across 359-day baseline.",
    pmNote: "μ = 10.39″/yr (10.223″ / 359d baseline)",
    wavelengthNote: "Brilliant in near-IR channels (0.75–2.4 µm)",
  },
  {
    id: "wise-0855",
    name: "WISE 0855−0714",
    designation: "WISE J0855-0714",
    type: "Sub-stellar Cold Brown Dwarf",
    xPct: 26,
    yPct: 68,
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.40)",
    size: 3.8,
    raHms: "08h 55m 11s",
    decDms: "−07° 14′ 43″",
    fact: "Coldest known brown dwarf (~250 K) with atmospheric water-ice and methane cloud signatures.",
    pmNote: "μ = 8.12″/yr (7.981″ / 359d baseline)",
    wavelengthNote: "Detected in mid-IR D5/D6 arrays (3.8–5.0 µm)",
  },
  {
    id: "epsilon-indi-b",
    name: "Epsilon Indi B",
    designation: "HD 209100B",
    type: "Binary T-Dwarf System",
    xPct: 74,
    yPct: 65,
    color: "#818CF8",
    glowColor: "rgba(129, 140, 248, 0.40)",
    size: 3.8,
    raHms: "22h 04m 11s",
    decDms: "−56° 46′ 58″",
    fact: "T1 + T6 substellar binary separated by ~402″ from primary star Epsilon Indi A.",
    pmNote: "μ = 4.71″/yr (4.630″ / 359d baseline)",
    wavelengthNote: "Methane absorption bands at 1.66 µm & 2.20 µm",
  },
  {
    id: "rw-aurigae",
    name: "RW Aurigae",
    designation: "V* RW Aur",
    type: "Young Stellar Object Binary",
    xPct: 24,
    yPct: 28,
    color: "#FDE68A",
    glowColor: "rgba(253, 230, 138, 0.35)",
    size: 4.0,
    raHms: "05h 07m 50s",
    decDms: "+30° 24′ 05″",
    fact: "Pre-main sequence binary system with tidally disrupted circumstellar protoplanetary disk.",
    pmNote: "μ = 0.02″/yr (Pre-main sequence)",
    wavelengthNote: "Mid-IR excess from warm silicate dust bridge",
  },
  {
    id: "r-draconis",
    name: "R Draconis",
    designation: "V* R Dra",
    type: "Mira-type Pulsating Variable",
    xPct: 76,
    yPct: 30,
    color: "#FB7185",
    glowColor: "rgba(251, 113, 133, 0.40)",
    size: 4.2,
    raHms: "16h 32m 40s",
    decDms: "+66° 42′ 10″",
    fact: "Pulsating carbon giant with a 314-day cycle, varying by >5 magnitudes across infrared epochs.",
    pmNote: "Variable pulsator (Period: 314 days)",
    wavelengthNote: "Prominent CO ice absorption at 4.67 µm",
  },
];

// Faint artistic exhibit filament connections between neighboring cluster nodes
const EXHIBIT_FILAMENTS = [
  ["barnards-star", "rw-aurigae"],
  ["barnards-star", "wise-0855"],
  ["barnards-star", "r-draconis"],
  ["wise-0855", "epsilon-indi-b"],
  ["r-draconis", "epsilon-indi-b"],
];

const SPECTRAL_BANDS = [
  { id: "075um", lambda: "0.75 μm", array: "Array 1 (D1)", desc: "Visible/Near-IR Boundary · Stellar Photospheres" },
  { id: "133um", lambda: "1.33 μm", array: "Array 2 (D2)", desc: "Near-IR J-Band · Interstellar Dust Penetration" },
  { id: "236um", lambda: "2.36 μm", array: "Array 3 (D3)", desc: "Near-IR K-Band · CO & Water-Ice Absorption" },
  { id: "472um", lambda: "4.72 μm", array: "Array 6 (D6)", desc: "Mid-IR · Cold Brown Dwarfs & Interstellar Ices" },
];

/**
 * Interactive Celestial Star Cluster.
 * Replaces the oversized panorama with an elegant, free-floating starfield
 * that seamlessly dissolves into the surrounding cosmic environment without
 * visible rectangular boundaries or hard edges.
 */
export const ExplorerShowcaseVisual: React.FC<ExplorerShowcaseVisualProps> = ({
  activeMode = "sky",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedTarget, setSelectedTarget] = useState<TargetStar | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);
  const [activeBandIdx, setActiveBandIdx] = useState<number>(0);

  // Pointer Parallax state
  const [mouseParallax, setMouseParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const stateRef = useRef({
    time: 0,
    isVisible: true,
    activeMode: "sky" as "sky" | "object" | "spectral",
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
  });

  // Synchronize active mode with parent hover
  useEffect(() => {
    stateRef.current.activeMode = activeMode;
    if (activeMode === "object") {
      setSelectedTarget(CANONICAL_TARGETS[0]); // Barnard's Star
    } else if (activeMode === "sky") {
      setSelectedTarget(null);
    }
  }, [activeMode]);

  // Cycle spectral bands when in spectral mode
  useEffect(() => {
    if (activeMode !== "spectral") return;
    const interval = setInterval(() => {
      setActiveBandIdx((prev) => (prev + 1) % SPECTRAL_BANDS.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [activeMode]);

  // Generate 42 subtle background cluster star motes
  const clusterStars = useMemo(() => {
    const stars = [];
    const seed = 1337;
    for (let i = 0; i < 42; i++) {
      // Natural organic Gaussian-like cluster distribution centered at (50%, 48%)
      const angle = (i * 137.5 * Math.PI) / 180;
      const r = Math.sqrt((i + 1) / 42) * 38; // cluster radius ~38%
      const x = 50 + Math.cos(angle) * r + Math.sin(i * 1.7) * 3;
      const y = 48 + Math.sin(angle) * r * 0.85 + Math.cos(i * 2.3) * 3;

      const zDepth = 0.35 + ((i * 17) % 65) / 100; // 0.35 - 1.0 depth
      const radius = 0.8 + ((i * 13) % 15) / 10;
      const baseAlpha = 0.25 + ((i * 23) % 55) / 100;
      const pulseSpeed = 1.0 + ((i * 7) % 15) / 10;

      // Subtle celestial colors: cool-white, soft lavender, pale amber
      const colors = ["#F8FAFC", "#E2E8F0", "#C7D2FE", "#DDD6FE", "#FEF3C7"];
      const color = colors[i % colors.length];

      stars.push({ x, y, zDepth, radius, baseAlpha, pulseSpeed, color });
    }
    return stars;
  }, []);

  // Main Canvas Animation Loop (Completely Transparent Canvas Rendering)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    const container = containerRef.current;

    // IntersectionObserver to pause rendering when offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          stateRef.current.isVisible = e.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    if (container) observer.observe(container);

    const render = (now: number) => {
      rafId = requestAnimationFrame(render);
      if (!stateRef.current.isVisible) return;

      const dt = 0.016;
      stateRef.current.time += dt;
      const t = stateRef.current.time;

      // Smooth parallax spring interpolation
      stateRef.current.currentX += (stateRef.current.targetX - stateRef.current.currentX) * 0.08;
      stateRef.current.currentY += (stateRef.current.targetY - stateRef.current.currentY) * 0.08;

      const px = stateRef.current.currentX;
      const py = stateRef.current.currentY;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      // 100% transparent clear — leaves the global Journey galaxy starfield untouched!
      ctx.clearRect(0, 0, W, H);

      // 1. Subtle, ethereal central celestial nebula core (blends into galaxy)
      const grad = ctx.createRadialGradient(
        W * 0.5 + px * 2,
        H * 0.48 + py * 2,
        10,
        W * 0.5 + px * 2,
        H * 0.48 + py * 2,
        Math.min(W, H) * 0.48
      );
      grad.addColorStop(0, "rgba(129, 140, 248, 0.12)");
      grad.addColorStop(0.35, "rgba(168, 85, 247, 0.06)");
      grad.addColorStop(0.65, "rgba(244, 162, 114, 0.02)");
      grad.addColorStop(1, "rgba(8, 8, 12, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(W * 0.5 + px * 2, H * 0.48 + py * 2, Math.min(W, H) * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // 2. Faint, delicate exhibit filament lines connecting canonical stars
      ctx.save();
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 5]);
      EXHIBIT_FILAMENTS.forEach(([idA, idB]) => {
        const starA = CANONICAL_TARGETS.find((s) => s.id === idA);
        const starB = CANONICAL_TARGETS.find((s) => s.id === idB);
        if (!starA || !starB) return;

        const ax = (starA.xPct / 100) * W + px * 5;
        const ay = (starA.yPct / 100) * H + py * 5;
        const bx = (starB.xPct / 100) * W + px * 5;
        const by = (starB.yPct / 100) * H + py * 5;

        const isHighlighted =
          (starA.id === selectedTarget?.id || starB.id === selectedTarget?.id) ||
          (starA.id === hoveredTargetId || starB.id === hoveredTargetId);

        ctx.strokeStyle = isHighlighted
          ? "rgba(244, 162, 114, 0.35)"
          : "rgba(168, 85, 247, 0.14)";

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      });
      ctx.restore();

      // 3. Render 42 organic cluster star motes across 3 depth tiers
      clusterStars.forEach((star) => {
        const sx = (star.x / 100) * W + px * star.zDepth * 8;
        const sy = (star.y / 100) * H + py * star.zDepth * 8;

        // Subtle organic breathing twinkle
        const alpha = Math.max(
          0.1,
          star.baseAlpha + Math.sin(t * star.pulseSpeed + star.x) * 0.15
        );

        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [clusterStars, selectedTarget, hoveredTargetId]);

  // Pointer movement for gentle parallax depth
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    stateRef.current.targetX = nx;
    stateRef.current.targetY = ny;
    setMouseParallax({ x: nx, y: ny });
  };

  const handlePointerLeave = () => {
    stateRef.current.targetX = 0;
    stateRef.current.targetY = 0;
    setMouseParallax({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="explorer-showcase-visual relative w-full max-w-[480px] h-[390px] sm:h-[430px] flex items-center justify-center select-none overflow-visible mx-auto"
      style={{ touchAction: "pan-y" }}
    >
      {/* 1. Underlying Transparent Cluster Canvas */}
      <canvas
        ref={canvasRef}
        width={960}
        height={840}
        className="w-full h-full block pointer-events-none"
      />

      {/* 2. Canonical Target Beacons Positioned Harmoniously in Cluster */}
      {CANONICAL_TARGETS.map((target) => {
        const isSelected = selectedTarget?.id === target.id;
        const isHovered = hoveredTargetId === target.id;

        // Apply gentle parallax offset to interactive beacons
        const offsetX = mouseParallax.x * 5;
        const offsetY = mouseParallax.y * 5;

        return (
          <div
            key={target.id}
            data-beacon-id={target.id}
            data-beacon-name={target.name}
            style={{
              position: "absolute",
              left: `calc(${target.xPct}% + ${offsetX}px)`,
              top: `calc(${target.yPct}% + ${offsetY}px)`,
              transform: "translate(-50%, -50%)",
              transition: "transform 0.15s ease",
            }}
            className="celestial-target-star group cursor-pointer z-20 pointer-events-auto"
            onMouseEnter={() => setHoveredTargetId(target.id)}
            onMouseLeave={() => setHoveredTargetId(null)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTarget((prev) => (prev?.id === target.id ? null : target));
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* Luminous Pulsating Halo */}
              <span
                className={`absolute -inset-2.5 rounded-full border transition-all duration-300 ${
                  isSelected || isHovered
                    ? "border-[#F4A272] scale-125 opacity-90 animate-ping"
                    : "border-white/20 opacity-30 group-hover:opacity-75"
                }`}
              />

              {/* Radiant Star Pin */}
              <span
                style={{
                  backgroundColor: target.color,
                  boxShadow: isSelected || isHovered
                    ? `0 0 16px ${target.color}, 0 0 32px ${target.glowColor}`
                    : `0 0 8px ${target.glowColor}`,
                }}
                className={`rounded-full flex items-center justify-center transition-all duration-300 ${
                  isSelected || isHovered
                    ? "w-4 h-4 ring-2 ring-white/80 scale-125"
                    : "w-3 h-3 hover:scale-115"
                }`}
              >
                <span className="w-1 h-1 rounded-full bg-white" />
              </span>

              {/* Minimalist Floating Label Tag */}
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-mono font-medium backdrop-blur-md transition-all ${
                  isSelected || isHovered
                    ? "bg-[#111117]/95 text-[#F4A272] border border-[#F4A272]/50 shadow-[0_4px_16px_rgba(0,0,0,0.8)] scale-105"
                    : "bg-black/60 text-white/70 border border-white/10 opacity-70 group-hover:opacity-100"
                }`}
              >
                {target.name}
              </div>
            </div>
          </div>
        );
      })}

      {/* 3. Refined Floating Target HUD Card (When clicked or in 'object' mode) */}
      {selectedTarget && (
        <div className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 max-w-[270px] sm:max-w-[300px] p-3 sm:p-3.5 rounded-2xl bg-[#0a0a10]/95 backdrop-blur-xl border border-[#262635] shadow-[0_12px_36px_rgba(0,0,0,0.8)] z-30 transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#F4A272] font-semibold flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-[#FF7B3D] animate-pulse" />
                {selectedTarget.designation}
              </div>
              <h4 className="text-sm font-semibold text-[#F3EFE8] leading-tight">
                {selectedTarget.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedTarget(null)}
              className="text-[#8E8A85] hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="text-[10px] font-mono text-[#C7C3BD] bg-white/[0.04] p-1.5 rounded-lg border border-white/5 mb-1.5 flex items-center justify-between">
            <span>RA {selectedTarget.raHms}</span>
            <span>Dec {selectedTarget.decDms}</span>
          </div>

          <p className="text-[10.5px] text-[#C7C3BD] leading-relaxed mb-2">
            {selectedTarget.fact}
          </p>

          <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9.5px] font-mono text-[#8E8A85]">
            <span>Proper Motion:</span>
            <span className="text-[#F4A272] font-semibold">{selectedTarget.pmNote}</span>
          </div>
        </div>
      )}

      {/* 4. Compact Multi-Band Wavelength Bar (Only in 'spectral' mode) */}
      {activeMode === "spectral" && (
        <div className="absolute bottom-2 inset-x-4 sm:inset-x-auto sm:left-4 sm:right-4 flex flex-col sm:flex-row items-center justify-between gap-2 p-2 rounded-xl bg-black/85 backdrop-blur-xl border border-white/10 z-30 transition-all animate-in fade-in">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-mono font-semibold text-white">
              {SPECTRAL_BANDS[activeBandIdx].lambda} · {SPECTRAL_BANDS[activeBandIdx].array}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {SPECTRAL_BANDS.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => setActiveBandIdx(idx)}
                className={`px-2 py-0.5 rounded text-[9.5px] font-mono transition-all cursor-pointer ${
                  activeBandIdx === idx
                    ? "bg-[#F4A272] text-black font-semibold shadow-[0_0_10px_rgba(244,162,114,0.5)]"
                    : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
                }`}
              >
                {b.lambda}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Minimal Discreet Exhibit Caption (Only in 'sky' mode when no target selected) */}
      {activeMode === "sky" && !selectedTarget && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[9.5px] font-mono text-white/45 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 pointer-events-none whitespace-nowrap">
          <Sparkles className="w-3 h-3 text-[#F4A272]" />
          <span>CELESTIAL STAR CLUSTER · 5 Canonical Targets · Interactive Exhibit</span>
        </div>
      )}
    </div>
  );
};

export default ExplorerShowcaseVisual;
