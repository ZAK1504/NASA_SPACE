import React, { useRef, useEffect, useState, useMemo } from "react";
import { Sparkles, Radio, Layers, Compass, Eye, ArrowRight, Target, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { travelToWorkspace } from "../../lib/journeyState";

export interface ExplorerShowcaseVisualProps {
  activeMode?: "sky" | "object" | "spectral";
}

interface TargetStar {
  id: string;
  name: string;
  designation: string;
  type: string;
  xPct: number; // percentage within canvas (0 - 100)
  yPct: number;
  labelPlacement: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color: string;
  glowColor: string;
  size: number;
  raHms: string;
  decDms: string;
  fact: string;
  pmNote: string;
  pmVector?: { dx: number; dy: number; label: string };
  wavelengthNote: string;
  bandBrightness: { [bandId: string]: number }; // relative flux multiplier per band (0.2 to 1.5)
}

const CANONICAL_TARGETS: TargetStar[] = [
  {
    id: "rw-aurigae",
    name: "RW Aurigae",
    designation: "V* RW Aur",
    type: "Young Stellar Object Binary",
    xPct: 22,
    yPct: 24,
    labelPlacement: "top-left",
    color: "#FDE68A",
    glowColor: "rgba(253, 230, 138, 0.55)",
    size: 4.8,
    raHms: "05h 07m 50s",
    decDms: "+30° 24′ 05″",
    fact: "Pre-main sequence binary system with tidally disrupted circumstellar protoplanetary disk.",
    pmNote: "μ = 0.02″/yr (Pre-main sequence)",
    wavelengthNote: "Mid-IR excess from warm silicate dust bridge",
    bandBrightness: { "075um": 1.1, "133um": 1.2, "236um": 1.3, "472um": 1.4 },
  },
  {
    id: "barnards-star",
    name: "Barnard's Star",
    designation: "GJ 699",
    type: "High Proper-Motion M4V Dwarf",
    xPct: 48,
    yPct: 40,
    labelPlacement: "top-right",
    color: "#F4A272",
    glowColor: "rgba(244, 162, 114, 0.65)",
    size: 5.4,
    raHms: "17h 57m 48s",
    decDms: "+04° 44′ 22″",
    fact: "Fastest proper motion star known; traverses 10.223″ predicted displacement across 359-day baseline.",
    pmNote: "μ = 10.39″/yr (10.223″ / 359d baseline)",
    pmVector: { dx: 14, dy: -18, label: "μ = 10.39″/yr" },
    wavelengthNote: "Brilliant in near-IR channels (0.75–2.4 µm)",
    bandBrightness: { "075um": 1.3, "133um": 1.5, "236um": 1.4, "472um": 0.8 },
  },
  {
    id: "r-draconis",
    name: "R Draconis",
    designation: "V* R Dra",
    type: "Mira-type Pulsating Variable",
    xPct: 78,
    yPct: 28,
    labelPlacement: "top-right",
    color: "#FB7185",
    glowColor: "rgba(251, 113, 133, 0.60)",
    size: 5.0,
    raHms: "16h 32m 40s",
    decDms: "+66° 42′ 10″",
    fact: "Pulsating carbon giant with a 314-day cycle, varying by >5 magnitudes across infrared epochs.",
    pmNote: "Variable pulsator (Period: 314 days)",
    wavelengthNote: "Prominent CO ice absorption at 4.67 µm",
    bandBrightness: { "075um": 0.6, "133um": 0.9, "236um": 1.3, "472um": 1.6 },
  },
  {
    id: "wise-0855",
    name: "WISE 0855−0714",
    designation: "WISE J0855-0714",
    type: "Sub-stellar Cold Brown Dwarf",
    xPct: 25,
    yPct: 72,
    labelPlacement: "bottom-left",
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.60)",
    size: 4.4,
    raHms: "08h 55m 11s",
    decDms: "−07° 14′ 43″",
    fact: "Coldest known brown dwarf (~250 K) with atmospheric water-ice and methane cloud signatures.",
    pmNote: "μ = 8.12″/yr (7.981″ / 359d baseline)",
    pmVector: { dx: -12, dy: 8, label: "μ = 8.12″/yr" },
    wavelengthNote: "Detected in mid-IR D5/D6 arrays (3.8–5.0 µm)",
    bandBrightness: { "075um": 0.2, "133um": 0.4, "236um": 0.9, "472um": 1.8 },
  },
  {
    id: "epsilon-indi-b",
    name: "Epsilon Indi B",
    designation: "HD 209100B",
    type: "Binary T-Dwarf System",
    xPct: 72,
    yPct: 70,
    labelPlacement: "bottom-right",
    color: "#818CF8",
    glowColor: "rgba(129, 140, 248, 0.60)",
    size: 4.6,
    raHms: "22h 04m 11s",
    decDms: "−56° 46′ 58″",
    fact: "T1 + T6 substellar binary separated by ~402″ from primary star Epsilon Indi A.",
    pmNote: "μ = 4.71″/yr (4.630″ / 359d baseline)",
    pmVector: { dx: 10, dy: 10, label: "μ = 4.71″/yr" },
    wavelengthNote: "Methane absorption bands at 1.66 µm & 2.20 µm",
    bandBrightness: { "075um": 0.5, "133um": 1.1, "236um": 1.4, "472um": 1.3 },
  },
];

// Primary Celestial Discovery Path Trajectory + Survey Asterism
const DISCOVERY_PATH_SEGMENTS: Array<[string, string, boolean]> = [
  // [NodeA, NodeB, isPrimaryTrajectory]
  ["rw-aurigae", "barnards-star", true],
  ["barnards-star", "r-draconis", true],
  ["r-draconis", "epsilon-indi-b", true],
  ["epsilon-indi-b", "wise-0855", true],
  ["wise-0855", "rw-aurigae", true],
  // Central Survey Interlinks
  ["barnards-star", "wise-0855", false],
  ["barnards-star", "epsilon-indi-b", false],
];

const SPECTRAL_BANDS = [
  { id: "075um", lambda: "0.75 μm", array: "Array 1 (D1)", desc: "Visible/Near-IR Boundary · Stellar Photospheres", color: "#818CF8" },
  { id: "133um", lambda: "1.33 μm", array: "Array 2 (D2)", desc: "Near-IR J-Band · Interstellar Dust Penetration", color: "#34D399" },
  { id: "236um", lambda: "2.36 μm", array: "Array 3 (D3)", desc: "Near-IR K-Band · CO & Water-Ice Absorption", color: "#FBBF24" },
  { id: "472um", lambda: "4.72 μm", array: "Array 6 (D6)", desc: "Mid-IR · Cold Brown Dwarfs & Interstellar Ices", color: "#FB7185" },
];

/**
 * Celestial Discovery Path.
 * Replaces scattered dots with an intentional, connected astronomical survey asterism:
 * - Visibly refined, glowing celestial connection trajectories with dual-pass rendering
 * - Travelling light pulses / quantum photon wavepackets continuously traversing segments
 * - Selected-target illumination with pulse acceleration toward the active celestial node
 * - Elegant leader lines connecting star nodes to aerospace-grade typography labels
 * - Seamless, 100% transparent footprint that harmonizes with the Journey galaxy background
 */
export const ExplorerShowcaseVisual: React.FC<ExplorerShowcaseVisualProps> = ({
  activeMode = "sky",
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedTarget, setSelectedTarget] = useState<TargetStar | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);
  const [activeBandIdx, setActiveBandIdx] = useState<number>(0);

  // Parallax spring state
  const [mouseParallax, setMouseParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const stateRef = useRef({
    time: 0,
    isVisible: true,
    activeMode: "sky" as "sky" | "object" | "spectral",
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    selectedId: null as string | null,
    hoveredId: null as string | null,
    activeBandId: "075um",
  });

  // Keep stateRef in sync for smooth 60fps RAF access
  stateRef.current.activeMode = activeMode;
  stateRef.current.selectedId = selectedTarget?.id || null;
  stateRef.current.hoveredId = hoveredTargetId;
  stateRef.current.activeBandId = SPECTRAL_BANDS[activeBandIdx].id;

  // Mode changes from parent CTA hover
  useEffect(() => {
    if (activeMode === "object") {
      setSelectedTarget(CANONICAL_TARGETS[1]); // Default to Barnard's Star
    } else if (activeMode === "sky") {
      setSelectedTarget(null);
    }
  }, [activeMode]);

  // Spectral band cycle when in spectral mode
  useEffect(() => {
    if (activeMode !== "spectral") return;
    const interval = setInterval(() => {
      setActiveBandIdx((prev) => (prev + 1) % SPECTRAL_BANDS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [activeMode]);

  // Subtle ambient celestial background motes
  const ambientStars = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 36; i++) {
      const angle = (i * 137.5 * Math.PI) / 180;
      const r = Math.sqrt((i + 1) / 36) * 44;
      const x = 50 + Math.cos(angle) * r + Math.sin(i * 1.3) * 2;
      const y = 50 + Math.sin(angle) * r * 0.85 + Math.cos(i * 1.9) * 2;
      const zDepth = 0.3 + ((i * 19) % 70) / 100;
      const radius = 0.7 + ((i * 11) % 14) / 10;
      const baseAlpha = 0.18 + ((i * 29) % 45) / 100;
      const pulseSpeed = 0.8 + ((i * 13) % 15) / 10;
      const colors = ["#F8FAFC", "#E2E8F0", "#C7D2FE", "#DDD6FE", "#FEF3C7"];
      stars.push({ x, y, zDepth, radius, baseAlpha, pulseSpeed, color: colors[i % colors.length] });
    }
    return stars;
  }, []);

  // Main Canvas Render Loop (Luminous Pathways & Travelling Light Pulses)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    const container = containerRef.current;

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

      // Smooth parallax spring
      stateRef.current.currentX += (stateRef.current.targetX - stateRef.current.currentX) * 0.08;
      stateRef.current.currentY += (stateRef.current.targetY - stateRef.current.currentY) * 0.08;

      const px = stateRef.current.currentX;
      const py = stateRef.current.currentY;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      // 100% transparent clear — leaves the global Journey galaxy starfield untouched!
      ctx.clearRect(0, 0, W, H);

      const activeTargetId = stateRef.current.selectedId || stateRef.current.hoveredId;
      const currentMode = stateRef.current.activeMode;
      const currentBand = stateRef.current.activeBandId;

      // 1. Ethereal Central Celestial Survey Core Glow
      const centerGrad = ctx.createRadialGradient(
        W * 0.5 + px * 3,
        H * 0.48 + py * 3,
        20,
        W * 0.5 + px * 3,
        H * 0.48 + py * 3,
        Math.min(W, H) * 0.5
      );
      if (currentMode === "spectral") {
        centerGrad.addColorStop(0, "rgba(168, 85, 247, 0.16)");
        centerGrad.addColorStop(0.4, "rgba(129, 140, 248, 0.08)");
        centerGrad.addColorStop(0.7, "rgba(244, 162, 114, 0.03)");
        centerGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        centerGrad.addColorStop(0, "rgba(244, 162, 114, 0.12)");
        centerGrad.addColorStop(0.35, "rgba(129, 140, 248, 0.07)");
        centerGrad.addColorStop(0.7, "rgba(168, 85, 247, 0.02)");
        centerGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      }
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(W * 0.5 + px * 3, H * 0.48 + py * 3, Math.min(W, H) * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Faint Astronomical Survey Grid / Celestial Meridian (In Sky Mode)
      if (currentMode === "sky") {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.strokeStyle = "rgba(147, 197, 253, 0.10)";
        
        // Horizontal Declination Parallel
        ctx.beginPath();
        ctx.ellipse(W * 0.5 + px * 2, H * 0.48 + py * 2, W * 0.44, H * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Diagonal Survey Sweep
        ctx.beginPath();
        ctx.moveTo(W * 0.1 + px * 2, H * 0.82 + py * 2);
        ctx.lineTo(W * 0.9 + px * 2, H * 0.18 + py * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Render Luminous Connection Trajectories (Dual-Pass Stroke)
      DISCOVERY_PATH_SEGMENTS.forEach(([idA, idB, isPrimary], segIdx) => {
        const starA = CANONICAL_TARGETS.find((s) => s.id === idA);
        const starB = CANONICAL_TARGETS.find((s) => s.id === idB);
        if (!starA || !starB) return;

        const ax = (starA.xPct / 100) * W + px * 6;
        const ay = (starA.yPct / 100) * H + py * 6;
        const bx = (starB.xPct / 100) * W + px * 6;
        const by = (starB.yPct / 100) * H + py * 6;

        const isConnectedToActive =
          activeTargetId && (starA.id === activeTargetId || starB.id === activeTargetId);

        ctx.save();

        // Pass A: Outer Ambient Luminous Glow
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);

        if (isConnectedToActive) {
          ctx.lineWidth = 6;
          ctx.strokeStyle = "rgba(244, 162, 114, 0.35)";
          ctx.stroke();
        } else if (isPrimary) {
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = currentMode === "spectral"
            ? "rgba(168, 85, 247, 0.18)"
            : "rgba(244, 162, 114, 0.15)";
          ctx.stroke();
        } else {
          ctx.lineWidth = 2;
          ctx.strokeStyle = "rgba(129, 140, 248, 0.10)";
          ctx.stroke();
        }

        // Pass B: Inner Crisp Core Beam
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);

        if (isConnectedToActive) {
          ctx.lineWidth = 2.4;
          ctx.strokeStyle = "rgba(244, 162, 114, 0.95)";
          ctx.stroke();
        } else if (currentMode === "spectral") {
          // Dynamic spectral dispersion gradient
          const segGrad = ctx.createLinearGradient(ax, ay, bx, by);
          segGrad.addColorStop(0, starA.color);
          segGrad.addColorStop(1, starB.color);
          ctx.lineWidth = isPrimary ? 1.8 : 1.2;
          ctx.strokeStyle = segGrad;
          ctx.setLineDash(isPrimary ? [] : [3, 4]);
          ctx.stroke();
        } else if (isPrimary) {
          ctx.lineWidth = 1.6;
          // Ethereal golden-amber survey trajectory line
          ctx.strokeStyle = "rgba(244, 162, 114, 0.55)";
          ctx.stroke();
        } else {
          ctx.lineWidth = 1.0;
          ctx.strokeStyle = "rgba(129, 140, 248, 0.30)";
          ctx.setLineDash([4, 6]);
          ctx.stroke();
        }

        ctx.restore();

        // 4. Travelling Light Pulses / Quantum Photon Wavepackets along Segments
        const pulseSpeed = isConnectedToActive ? 0.65 : 0.35;
        const pulseCount = isPrimary ? 2 : 1;

        for (let p = 0; p < pulseCount; p++) {
          const phaseOffset = (segIdx * 0.23 + p * 0.5) % 1.0;
          const progress = (t * pulseSpeed + phaseOffset) % 1.0;

          // If connected to active star and starB is active, pulse flows towards it
          const forward = (!isConnectedToActive || starB.id === activeTargetId);
          const actualProgress = forward ? progress : 1.0 - progress;

          const lx = ax + (bx - ax) * actualProgress;
          const ly = ay + (by - ay) * actualProgress;

          ctx.save();
          // Outer pulse glow
          const pGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, isConnectedToActive ? 8 : 5);
          pGrad.addColorStop(0, "#FFFFFF");
          pGrad.addColorStop(0.4, isConnectedToActive ? "rgba(244, 162, 114, 0.85)" : "rgba(199, 210, 254, 0.7)");
          pGrad.addColorStop(1, "rgba(244, 162, 114, 0)");

          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(lx, ly, isConnectedToActive ? 8 : 5, 0, Math.PI * 2);
          ctx.fill();

          // Intense photon head
          ctx.fillStyle = "#FFFFFF";
          ctx.beginPath();
          ctx.arc(lx, ly, isConnectedToActive ? 2.2 : 1.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      // 5. Render Barnard's Star Proper Motion Vector (When Active/Hovered or Object Mode)
      const barnard = CANONICAL_TARGETS.find((s) => s.id === "barnards-star");
      if (barnard && (currentMode === "object" || activeTargetId === "barnards-star")) {
        const bx = (barnard.xPct / 100) * W + px * 6;
        const by = (barnard.yPct / 100) * H + py * 6;
        const vecDx = 28;
        const vecDy = -36;

        ctx.save();
        ctx.strokeStyle = "#F4A272";
        ctx.lineWidth = 1.8;
        ctx.setLineDash([3, 3]);

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + vecDx, by + vecDy);
        ctx.stroke();

        // Arrow head
        ctx.setLineDash([]);
        ctx.fillStyle = "#F4A272";
        ctx.beginPath();
        ctx.arc(bx + vecDx, by + vecDy, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillStyle = "#F4A272";
        ctx.fillText("μ = 10.39″/yr", bx + vecDx + 6, by + vecDy + 3);
        ctx.restore();
      }

      // 6. Ambient background star motes
      ambientStars.forEach((star) => {
        const sx = (star.x / 100) * W + px * star.zDepth * 8;
        const sy = (star.y / 100) * H + py * star.zDepth * 8;

        const alpha = Math.max(
          0.08,
          star.baseAlpha + Math.sin(t * star.pulseSpeed + star.x) * 0.12
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
  }, [ambientStars]);

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

  const activeBand = SPECTRAL_BANDS[activeBandIdx];

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="explorer-showcase-visual relative w-full max-w-[480px] h-[400px] sm:h-[440px] flex items-center justify-center select-none overflow-visible mx-auto"
      style={{ touchAction: "pan-y" }}
    >
      {/* 1. Underlying 100% Transparent Pathway & Pulse Canvas */}
      <canvas
        ref={canvasRef}
        width={960}
        height={880}
        className="w-full h-full block pointer-events-none"
      />

      {/* 2. Canonical Target Beacons with Aerospace Reticles & Leader Lines */}
      {CANONICAL_TARGETS.map((target) => {
        const isSelected = selectedTarget?.id === target.id;
        const isHovered = hoveredTargetId === target.id;
        const isActive = isSelected || isHovered;

        // Band brightness flux scaling in spectral mode
        const bandMultiplier = activeMode === "spectral" ? (target.bandBrightness[activeBand.id] || 1.0) : 1.0;

        const offsetX = mouseParallax.x * 6;
        const offsetY = mouseParallax.y * 6;

        // Smart leader line and label placement configurations
        const isTop = target.labelPlacement.startsWith("top");
        const isLeft = target.labelPlacement.endsWith("left");

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
              {/* Outer Survey Radar Reticle Ring (Slowly rotating) */}
              <div
                className={`absolute rounded-full border border-dashed transition-all duration-500 pointer-events-none ${
                  isActive
                    ? "w-11 h-11 border-[#F4A272]/80 animate-[spin_8s_linear_infinite]"
                    : "w-8 h-8 border-white/20 group-hover:border-white/50"
                }`}
              />

              {/* Pulsing Target Aura */}
              <div
                className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
                  isActive
                    ? "w-9 h-9 border border-[#F4A272] animate-ping opacity-75"
                    : "w-6 h-6 border border-white/10 opacity-30 group-hover:opacity-60"
                }`}
              />

              {/* Radiant Star Core */}
              <div
                style={{
                  backgroundColor: target.color,
                  transform: `scale(${bandMultiplier})`,
                  boxShadow: isActive
                    ? `0 0 16px ${target.color}, 0 0 32px ${target.glowColor}, 0 0 48px ${target.glowColor}`
                    : `0 0 10px ${target.glowColor}`,
                }}
                className={`rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive ? "w-4 h-4 ring-2 ring-white scale-125" : "w-3 h-3 group-hover:scale-115"
                }`}
              >
                <span className="w-1 h-1 rounded-full bg-white shadow-sm" />
              </div>

              {/* Elegant Hairline Leader Line Connecting Star to Label */}
              <svg
                className={`absolute pointer-events-none transition-all duration-300 overflow-visible ${
                  isTop ? "bottom-full" : "top-full"
                } ${isLeft ? "right-full" : "left-full"}`}
                style={{
                  width: "28px",
                  height: "22px",
                }}
              >
                <polyline
                  points={
                    isTop
                      ? isLeft
                        ? "28,22 14,8 0,8"
                        : "0,22 14,8 28,8"
                      : isLeft
                      ? "28,0 14,14 0,14"
                      : "0,0 14,14 28,14"
                  }
                  fill="none"
                  stroke={isActive ? "#F4A272" : "rgba(255, 255, 255, 0.25)"}
                  strokeWidth="1.2"
                  strokeDasharray={isActive ? "none" : "2,2"}
                />
              </svg>

              {/* Aerospace-Grade Typography Label Pill */}
              <div
                style={{
                  position: "absolute",
                  ...(isTop ? { bottom: "calc(100% + 14px)" } : { top: "calc(100% + 14px)" }),
                  ...(isLeft ? { right: "calc(100% + 14px)" } : { left: "calc(100% + 14px)" }),
                }}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg backdrop-blur-md transition-all duration-300 ${
                  isActive
                    ? "bg-[#11111a]/95 border border-[#F4A272]/70 shadow-[0_4px_20px_rgba(244,162,114,0.35)] scale-105 z-30"
                    : "bg-black/65 border border-white/10 opacity-75 group-hover:opacity-100 group-hover:border-white/30"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: target.color }}
                  />
                  <div className="flex flex-col text-left">
                    <span
                      className={`text-[9px] font-mono uppercase tracking-wider font-semibold leading-tight ${
                        isActive ? "text-[#F4A272]" : "text-white/60"
                      }`}
                    >
                      {target.designation}
                    </span>
                    <span className="text-[11px] font-semibold text-white leading-tight">
                      {target.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* 3. Refined Floating Target HUD Card (When Clicked or in Object Mode) */}
      {selectedTarget && (
        <div className="absolute right-2 sm:right-4 bottom-2 sm:bottom-3 max-w-[280px] sm:max-w-[320px] p-3.5 rounded-2xl bg-[#09090f]/95 backdrop-blur-2xl border border-[#2d2d42] shadow-[0_16px_40px_rgba(0,0,0,0.85)] z-40 transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#F4A272] font-semibold flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-[#FF7B3D] animate-pulse" />
                <span>{selectedTarget.designation} · {selectedTarget.type}</span>
              </div>
              <h4 className="text-sm font-semibold text-[#F3EFE8] leading-tight mt-0.5">
                {selectedTarget.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedTarget(null)}
              className="text-[#8E8A85] hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
              title="Close card"
            >
              ✕
            </button>
          </div>

          <div className="text-[10px] font-mono text-[#C7C3BD] bg-white/[0.04] p-1.5 rounded-lg border border-white/5 mb-2 flex items-center justify-between">
            <span>RA: {selectedTarget.raHms}</span>
            <span>Dec: {selectedTarget.decDms}</span>
          </div>

          <p className="text-[10.5px] text-[#C7C3BD] leading-relaxed mb-2.5">
            {selectedTarget.fact}
          </p>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#8E8A85] mb-2.5">
            <span>Proper Motion:</span>
            <span className="text-[#F4A272] font-semibold">{selectedTarget.pmNote}</span>
          </div>

          <button
            onClick={() => travelToWorkspace(navigate, "/objects", "explorer")}
            className="w-full py-1.5 px-3 rounded-lg bg-[var(--accent)] hover:bg-[#ff9055] text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open in Object Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Multi-Band Spectral Wavelength Bar (Only in Spectral Mode) */}
      {activeMode === "spectral" && (
        <div className="absolute bottom-2 inset-x-3 sm:inset-x-auto sm:left-4 sm:right-4 flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl bg-black/90 backdrop-blur-2xl border border-indigo-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.8)] z-30 transition-all animate-in fade-in">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <div className="text-left">
              <div className="text-[11px] font-mono font-semibold text-white flex items-center gap-1.5">
                <span>{activeBand.lambda}</span>
                <span className="text-white/40">·</span>
                <span className="text-indigo-300">{activeBand.array}</span>
              </div>
              <div className="text-[9.5px] text-white/50">{activeBand.desc}</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {SPECTRAL_BANDS.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => setActiveBandIdx(idx)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                  activeBandIdx === idx
                    ? "bg-[#F4A272] text-black font-semibold shadow-[0_0_12px_rgba(244,162,114,0.6)]"
                    : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
                }`}
              >
                {b.lambda}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Minimal Discreet Survey Track Caption (Only in Sky Mode When No Target Selected) */}
      {activeMode === "sky" && !selectedTarget && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono text-white/60 bg-black/60 backdrop-blur-lg px-3 py-1 rounded-full border border-white/15 pointer-events-none whitespace-nowrap shadow-lg">
          <Activity className="w-3.5 h-3.5 text-[#F4A272] animate-pulse" />
          <span>CELESTIAL DISCOVERY PATH · 5 Connected Infrared Science Targets</span>
        </div>
      )}
    </div>
  );
};

export default ExplorerShowcaseVisual;
