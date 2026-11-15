import React, { useRef, useEffect, useState, useMemo } from "react";
import { Sparkles, Radio, Layers, ArrowRight, Activity, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { travelToWorkspace } from "../../lib/journeyState";

export interface ExplorerShowcaseVisualProps {
  activeMode?: "sky" | "object" | "spectral";
}

interface CelestialTarget {
  id: string;
  name: string;
  designation: string;
  type: string;
  x: number; // Authoritative SVG viewBox coordinates (0 - 540)
  y: number; // (0 - 460)
  color: string;
  glowColor: string;
  size: number;
  raHms: string;
  decDms: string;
  fact: string;
  pmNote: string;
  pmVector?: { targetX: number; targetY: number; label: string };
  labelPlacement: {
    badgeX: number;
    badgeY: number;
    badgeW: number;
    badgeH: number;
    elbowX: number;
    elbowY: number;
  };
  bandFlux: { [bandId: string]: number }; // relative flux multiplier per band
}

/**
 * Single Authoritative Celestial Targets in unified SVG coordinate space (540 x 460).
 * Every star marker, neon connector, light pulse, leader line and reticle is derived
 * from these exact coordinates, guaranteeing 100% geometric alignment.
 */
const CELESTIAL_TARGETS: CelestialTarget[] = [
  {
    id: "rw-aurigae",
    name: "RW Aurigae",
    designation: "V* RW Aur",
    type: "Young Stellar Object Binary",
    x: 110,
    y: 115,
    color: "#FDE68A",
    glowColor: "rgba(253, 230, 138, 0.70)",
    size: 5.2,
    raHms: "05h 07m 50s",
    decDms: "+30° 24′ 05″",
    fact: "Pre-main sequence binary system with tidally disrupted circumstellar protoplanetary disk.",
    pmNote: "μ = 0.02″/yr (Pre-main sequence)",
    labelPlacement: {
      badgeX: 20,
      badgeY: 35,
      badgeW: 115,
      badgeH: 36,
      elbowX: 65,
      elbowY: 75,
    },
    bandFlux: { "075um": 1.1, "133um": 1.25, "236um": 1.35, "472um": 1.45 },
  },
  {
    id: "barnards-star",
    name: "Barnard's Star",
    designation: "GJ 699",
    type: "High Proper-Motion M4V Dwarf",
    x: 270,
    y: 190, // Central Discovery Hub of the survey network
    color: "#F4A272",
    glowColor: "rgba(244, 162, 114, 0.85)",
    size: 6.2,
    raHms: "17h 57m 48s",
    decDms: "+04° 44′ 22″",
    fact: "Fastest proper motion star known; traverses 10.223″ predicted displacement across 359-day baseline.",
    pmNote: "μ = 10.39″/yr (10.223″ / 359d baseline)",
    pmVector: { targetX: 308, targetY: 142, label: "μ = 10.39″/yr" },
    labelPlacement: {
      badgeX: 285,
      badgeY: 110,
      badgeW: 125,
      badgeH: 36,
      elbowX: 310,
      elbowY: 155,
    },
    bandFlux: { "075um": 1.3, "133um": 1.5, "236um": 1.4, "472um": 0.8 },
  },
  {
    id: "r-draconis",
    name: "R Draconis",
    designation: "V* R Dra",
    type: "Mira-type Pulsating Giant",
    x: 435,
    y: 120,
    color: "#FB7185",
    glowColor: "rgba(251, 113, 133, 0.75)",
    size: 5.6,
    raHms: "16h 32m 40s",
    decDms: "+66° 42′ 10″",
    fact: "Pulsating carbon giant with a 314-day cycle, varying by >5 magnitudes across infrared epochs.",
    pmNote: "Variable pulsator (Period: 314 days)",
    labelPlacement: {
      badgeX: 405,
      badgeY: 38,
      badgeW: 115,
      badgeH: 36,
      elbowX: 450,
      elbowY: 80,
    },
    bandFlux: { "075um": 0.6, "133um": 0.9, "236um": 1.3, "472um": 1.65 },
  },
  {
    id: "wise-0855",
    name: "WISE 0855−0714",
    designation: "WISE J0855",
    type: "Substellar ~250 K Brown Dwarf",
    x: 125,
    y: 345,
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.75)",
    size: 5.0,
    raHms: "08h 55m 11s",
    decDms: "−07° 14′ 43″",
    fact: "Coldest known brown dwarf (~250 K) with atmospheric water-ice and methane cloud signatures.",
    pmNote: "μ = 8.12″/yr (7.981″ / 359d baseline)",
    pmVector: { targetX: 95, targetY: 375, label: "μ = 8.12″/yr" },
    labelPlacement: {
      badgeX: 20,
      badgeY: 395,
      badgeW: 135,
      badgeH: 36,
      elbowX: 75,
      elbowY: 380,
    },
    bandFlux: { "075um": 0.25, "133um": 0.45, "236um": 0.95, "472um": 1.85 },
  },
  {
    id: "epsilon-indi-b",
    name: "Epsilon Indi B",
    designation: "HD 209100B",
    type: "Binary T-Dwarf System",
    x: 415,
    y: 340,
    color: "#818CF8",
    glowColor: "rgba(129, 140, 248, 0.75)",
    size: 5.2,
    raHms: "22h 04m 11s",
    decDms: "−56° 46′ 58″",
    fact: "T1 + T6 substellar binary separated by ~402″ from primary star Epsilon Indi A.",
    pmNote: "μ = 4.71″/yr (4.630″ / 359d baseline)",
    pmVector: { targetX: 445, targetY: 370, label: "μ = 4.71″/yr" },
    labelPlacement: {
      badgeX: 385,
      badgeY: 395,
      badgeW: 135,
      badgeH: 36,
      elbowX: 440,
      elbowY: 378,
    },
    bandFlux: { "075um": 0.5, "133um": 1.1, "236um": 1.4, "472um": 1.35 },
  },
];

/**
 * Intentional Constellation Discovery Network Connections:
 * Central hub connections from Barnard's Star radiating to all four frontier quadrants,
 * plus outer celestial survey perimeter arcs linking related astrophysical regimes.
 */
interface PathConnection {
  id: string;
  from: string;
  to: string;
  curvature: number; // lateral offset in SVG units for smooth Bézier arc
  isHub: boolean;
}

const DISCOVERY_CONNECTIONS: PathConnection[] = [
  // 1. Central Hub Discovery Spokes (Barnard's Star to all regimes)
  { id: "hub-rw", from: "barnards-star", to: "rw-aurigae", curvature: -16, isHub: true },
  { id: "hub-rdra", from: "barnards-star", to: "r-draconis", curvature: 16, isHub: true },
  { id: "hub-wise", from: "barnards-star", to: "wise-0855", curvature: 18, isHub: true },
  { id: "hub-eps", from: "barnards-star", to: "epsilon-indi-b", curvature: -18, isHub: true },
  // 2. Outer Astrometric Survey Arcs
  { id: "arc-rw-wise", from: "rw-aurigae", to: "wise-0855", curvature: -22, isHub: false },
  { id: "arc-rdra-eps", from: "r-draconis", to: "epsilon-indi-b", curvature: 22, isHub: false },
  { id: "arc-substellar", from: "wise-0855", to: "epsilon-indi-b", curvature: 14, isHub: false },
];

const SPECTRAL_BANDS = [
  { id: "075um", lambda: "0.75 μm", array: "Array 1 (D1)", desc: "Visible/Near-IR Boundary · Stellar Photospheres", color: "#818CF8" },
  { id: "133um", lambda: "1.33 μm", array: "Array 2 (D2)", desc: "Near-IR J-Band · Interstellar Dust Penetration", color: "#34D399" },
  { id: "236um", lambda: "2.36 μm", array: "Array 3 (D3)", desc: "Near-IR K-Band · CO & Water-Ice Absorption", color: "#FBBF24" },
  { id: "472um", lambda: "4.72 μm", array: "Array 6 (D6)", desc: "Mid-IR · Cold Brown Dwarfs & Interstellar Ices", color: "#FB7185" },
];

export const ExplorerShowcaseVisual: React.FC<ExplorerShowcaseVisualProps> = ({
  activeMode = "sky",
}) => {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState<CelestialTarget | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);
  const [activeBandIdx, setActiveBandIdx] = useState<number>(0);
  const [pulseTime, setPulseTime] = useState<number>(0);

  // Parallax spring offset
  const [mouseParallax, setMouseParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Continuous animation ticker for travelling light pulses (60fps)
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      setPulseTime((prev) => (prev + dt) % 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Synchronize active mode with parent hover
  useEffect(() => {
    if (activeMode === "object") {
      setSelectedTarget(CELESTIAL_TARGETS[1]); // Default to Barnard's Star
    } else if (activeMode === "sky") {
      setSelectedTarget(null);
    }
  }, [activeMode]);

  // Cycle spectral bands when in spectral mode
  useEffect(() => {
    if (activeMode !== "spectral") return;
    const interval = setInterval(() => {
      setActiveBandIdx((prev) => (prev + 1) % SPECTRAL_BANDS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [activeMode]);

  // Target lookups
  const targetMap = useMemo(() => {
    const map = new Map<string, CelestialTarget>();
    CELESTIAL_TARGETS.forEach((t) => map.set(t.id, t));
    return map;
  }, []);

  // Active target identifier
  const activeTargetId = selectedTarget?.id || hoveredTargetId;
  const activeBand = SPECTRAL_BANDS[activeBandIdx];

  // Compute Quadratic Bézier geometry for every connection path
  const pathsGeometry = useMemo(() => {
    return DISCOVERY_CONNECTIONS.map((conn) => {
      const nodeA = targetMap.get(conn.from);
      const nodeB = targetMap.get(conn.to);
      if (!nodeA || !nodeB) return null;

      const midX = (nodeA.x + nodeB.x) / 2;
      const midY = (nodeA.y + nodeB.y) / 2;
      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const len = Math.hypot(dx, dy) || 1;
      const normalX = -dy / len;
      const normalY = dx / len;

      const ctrlX = midX + normalX * conn.curvature;
      const ctrlY = midY + normalY * conn.curvature;

      const d = `M ${nodeA.x} ${nodeA.y} Q ${ctrlX} ${ctrlY} ${nodeB.x} ${nodeB.y}`;

      return {
        ...conn,
        nodeA,
        nodeB,
        ctrlX,
        ctrlY,
        d,
      };
    }).filter(Boolean) as Array<PathConnection & {
      nodeA: CelestialTarget;
      nodeB: CelestialTarget;
      ctrlX: number;
      ctrlY: number;
      d: string;
    }>;
  }, [targetMap]);

  // Subtle decorative background cluster motes (fixed seed for deterministic layout)
  const ambientMotes = useMemo(() => {
    const motes = [];
    for (let i = 0; i < 28; i++) {
      const angle = (i * 137.5 * Math.PI) / 180;
      const r = Math.sqrt((i + 1) / 28) * 190;
      const x = 270 + Math.cos(angle) * r;
      const y = 230 + Math.sin(angle) * r * 0.82;
      const radius = 0.8 + ((i * 17) % 12) / 10;
      const alpha = 0.2 + ((i * 23) % 40) / 100;
      motes.push({ x, y, radius, alpha });
    }
    return motes;
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setMouseParallax({ x: nx, y: ny });
  };

  const handlePointerLeave = () => {
    setMouseParallax({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[500px] mx-auto select-none">
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="explorer-showcase-visual relative w-full aspect-[54/46] flex items-center justify-center select-none overflow-visible"
        style={{ touchAction: "pan-y" }}
      >
      {/* 1. Master Responsive SVG Scene (Single Authoritative Coordinate System) */}
      <svg
        viewBox="0 0 540 460"
        className="w-full h-full overflow-visible pointer-events-none"
        style={{
          transform: `translate3d(${mouseParallax.x * 4}px, ${mouseParallax.y * 4}px, 0)`,
          transition: "transform 0.15s ease-out",
        }}
      >
        <defs>
          {/* Subtle central celestial nebula glow filter */}
          <radialGradient id="nebula-glow" cx="50%" cy="46%" r="50%">
            <stop offset="0%" stopColor={activeMode === "spectral" ? "rgba(168, 85, 247, 0.18)" : "rgba(244, 162, 114, 0.15)"} />
            <stop offset="40%" stopColor="rgba(129, 140, 248, 0.08)" />
            <stop offset="70%" stopColor="rgba(168, 85, 247, 0.02)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>

          {/* Refined Neon Luminous Filter */}
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Active Highlight Neon Filter */}
          <filter id="neon-glow-active" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Connection Linear Gradients (derived from endpoints) */}
          {pathsGeometry.map((p) => (
            <linearGradient
              key={`grad-${p.id}`}
              id={`grad-${p.id}`}
              x1={p.nodeA.x}
              y1={p.nodeA.y}
              x2={p.nodeB.x}
              y2={p.nodeB.y}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={p.nodeA.color} stopOpacity="0.85" />
              <stop offset="100%" stopColor={p.nodeB.color} stopOpacity="0.85" />
            </linearGradient>
          ))}
        </defs>

        {/* 2. Soft Underlying Celestial Core (Seamlessly blends into galaxy backdrop) */}
        <ellipse cx="270" cy="225" rx="230" ry="175" fill="url(#nebula-glow)" />

        {/* 3. Subtle Astronomical Survey Grid / Celestial Coordinates (In Sky Mode) */}
        {activeMode === "sky" && (
          <g opacity="0.45" stroke="#93C5FD" strokeWidth="0.8" strokeDasharray="3,6" fill="none">
            <ellipse cx="270" cy="225" rx="210" ry="110" />
            <ellipse cx="270" cy="225" rx="140" ry="70" />
            <line x1="60" y1="225" x2="480" y2="225" />
            <line x1="270" y1="75" x2="270" y2="375" />
          </g>
        )}

        {/* 4. Ambient Cluster Motes */}
        <g opacity="0.7">
          {ambientMotes.map((m, i) => (
            <circle
              key={i}
              cx={m.x}
              cy={m.y}
              r={m.radius}
              fill="#E2E8F0"
              opacity={m.alpha}
            />
          ))}
        </g>

        {/* 5. Refined Neon Connecting Paths (Mathematically Joined to Star Centers) */}
        <g className="neon-connectors">
          {pathsGeometry.map((p) => {
            const isConnectedToActive =
              activeTargetId && (p.nodeA.id === activeTargetId || p.nodeB.id === activeTargetId);

            // Pass A: Outer Ambient Luminous Glow Stroke
            return (
              <g key={p.id} className="transition-all duration-300">
                <path
                  d={p.d}
                  fill="none"
                  stroke={
                    isConnectedToActive
                      ? "rgba(244, 162, 114, 0.40)"
                      : p.isHub
                      ? "rgba(168, 85, 247, 0.22)"
                      : "rgba(129, 140, 248, 0.14)"
                  }
                  strokeWidth={isConnectedToActive ? 6.5 : p.isHub ? 3.5 : 2.5}
                  strokeLinecap="round"
                  filter={isConnectedToActive ? "url(#neon-glow-active)" : "url(#neon-glow)"}
                />

                {/* Pass B: Crisp Core Luminous Beam */}
                <path
                  d={p.d}
                  fill="none"
                  stroke={
                    isConnectedToActive
                      ? "#F4A272"
                      : activeMode === "spectral"
                      ? `url(#grad-${p.id})`
                      : p.isHub
                      ? "#C4B5FD"
                      : "#818CF8"
                  }
                  strokeWidth={isConnectedToActive ? 2.4 : p.isHub ? 1.4 : 1.0}
                  strokeOpacity={isConnectedToActive ? 0.95 : p.isHub ? 0.65 : 0.40}
                  strokeDasharray={isConnectedToActive || p.isHub ? "none" : "4,5"}
                  strokeLinecap="round"
                />

                {/* Pass C: Travelling Light Pulses along the True Path Geometry */}
                {(() => {
                  const pulseSpeed = isConnectedToActive ? 0.65 : 0.32;
                  const phase1 = ((pulseTime * pulseSpeed + (p.isHub ? 0.1 : 0.5)) % 1.0);
                  const t = (!isConnectedToActive || p.nodeB.id === activeTargetId) ? phase1 : 1.0 - phase1;

                  // Evaluate point on Quadratic Bézier curve B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
                  const mt = 1 - t;
                  const px = mt * mt * p.nodeA.x + 2 * mt * t * p.ctrlX + t * t * p.nodeB.x;
                  const py = mt * mt * p.nodeA.y + 2 * mt * t * p.ctrlY + t * t * p.nodeB.y;

                  return (
                    <g key={`pulse-${p.id}`} opacity={isConnectedToActive ? 1 : 0.85}>
                      {/* Pulse Halo */}
                      <circle
                        cx={px}
                        cy={py}
                        r={isConnectedToActive ? 6 : 4}
                        fill={isConnectedToActive ? "rgba(244, 162, 114, 0.8)" : "rgba(199, 210, 254, 0.65)"}
                        filter="url(#neon-glow)"
                      />
                      {/* Intense Photon Core */}
                      <circle
                        cx={px}
                        cy={py}
                        r={isConnectedToActive ? 2.2 : 1.5}
                        fill="#FFFFFF"
                      />
                    </g>
                  );
                })()}
              </g>
            );
          })}
        </g>

        {/* 6. Barnard's Star Proper Motion Vector */}
        {(() => {
          const barnard = CELESTIAL_TARGETS[1];
          const isBarnardActive = activeTargetId === "barnards-star" || activeMode === "object";
          if (!barnard.pmVector) return null;

          return (
            <g opacity={isBarnardActive ? 1 : 0.45} className="transition-opacity duration-300">
              <line
                x1={barnard.x}
                y1={barnard.y}
                x2={barnard.pmVector.targetX}
                y2={barnard.pmVector.targetY}
                stroke="#F4A272"
                strokeWidth="1.6"
                strokeDasharray="3,3"
              />
              <circle
                cx={barnard.pmVector.targetX}
                cy={barnard.pmVector.targetY}
                r="3"
                fill="#F4A272"
              />
              <text
                x={barnard.pmVector.targetX + 6}
                y={barnard.pmVector.targetY - 2}
                fill="#F4A272"
                fontSize="9"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
              >
                {barnard.pmVector.label}
              </text>
            </g>
          );
        })()}

        {/* 7. Delicate Hairline Leader Lines to Typography Badges */}
        <g className="leader-lines">
          {CELESTIAL_TARGETS.map((t) => {
            const isActive = activeTargetId === t.id;
            const lp = t.labelPlacement;
            // Leader line points: Star Center -> Elbow Point -> Badge Edge
            const badgeAnchorX = lp.badgeX < t.x ? lp.badgeX + lp.badgeW : lp.badgeX;
            const badgeAnchorY = lp.badgeY + lp.badgeH / 2;

            return (
              <g key={`leader-${t.id}`} opacity={isActive ? 1 : 0.55} className="transition-opacity duration-200">
                <polyline
                  points={`${t.x},${t.y} ${lp.elbowX},${lp.elbowY} ${badgeAnchorX},${badgeAnchorY}`}
                  fill="none"
                  stroke={isActive ? "#F4A272" : "rgba(255, 255, 255, 0.3)"}
                  strokeWidth={isActive ? 1.4 : 0.9}
                  strokeDasharray={isActive ? "none" : "2,3"}
                />
                <circle cx={t.x} cy={t.y} r="1.5" fill={isActive ? "#F4A272" : "#FFFFFF"} />
                <circle cx={badgeAnchorX} cy={badgeAnchorY} r="1.5" fill={isActive ? "#F4A272" : "rgba(255, 255, 255, 0.5)"} />
              </g>
            );
          })}
        </g>

        {/* 8. Frosted Glass Aerospace Typography Badges (Rendered directly in SVG space) */}
        <g className="badges">
          {CELESTIAL_TARGETS.map((t) => {
            const isActive = activeTargetId === t.id;
            const lp = t.labelPlacement;

            return (
              <g
                key={`badge-${t.id}`}
                className="cursor-pointer pointer-events-auto transition-transform duration-200"
                onClick={() => setSelectedTarget((prev) => (prev?.id === t.id ? null : t))}
                onMouseEnter={() => setHoveredTargetId(t.id)}
                onMouseLeave={() => setHoveredTargetId(null)}
              >
                {/* Badge Backplate */}
                <rect
                  x={lp.badgeX}
                  y={lp.badgeY}
                  width={lp.badgeW}
                  height={lp.badgeH}
                  rx="6"
                  fill={isActive ? "#111119" : "rgba(8, 8, 14, 0.85)"}
                  stroke={isActive ? "#F4A272" : "rgba(255, 255, 255, 0.12)"}
                  strokeWidth={isActive ? "1.2" : "0.8"}
                  filter={isActive ? "url(#neon-glow)" : undefined}
                />
                {/* Upper Designation Label */}
                <text
                  x={lp.badgeX + 8}
                  y={lp.badgeY + 13}
                  fill={isActive ? "#F4A272" : "rgba(255, 255, 255, 0.55)"}
                  fontSize="8.5"
                  fontFamily="ui-monospace, monospace"
                  fontWeight="600"
                  letterSpacing="0.05em"
                >
                  {t.designation}
                </text>
                {/* Star Name */}
                <text
                  x={lp.badgeX + 8}
                  y={lp.badgeY + 28}
                  fill="#F3EFE8"
                  fontSize="11"
                  fontFamily="'Inter', sans-serif"
                  fontWeight="600"
                >
                  {t.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* 9. Canonical Star Markers (Planted on Exact Coordinates) */}
        <g className="star-markers">
          {CELESTIAL_TARGETS.map((t) => {
            const isActive = activeTargetId === t.id;
            const bandMultiplier = activeMode === "spectral" ? (t.bandFlux[activeBand.id] || 1.0) : 1.0;
            const scaledRadius = t.size * bandMultiplier;

            return (
              <g
                key={`star-${t.id}`}
                className="cursor-pointer pointer-events-auto group"
                onClick={() => setSelectedTarget((prev) => (prev?.id === t.id ? null : t))}
                onMouseEnter={() => setHoveredTargetId(t.id)}
                onMouseLeave={() => setHoveredTargetId(null)}
                data-beacon-id={t.id}
                data-beacon-name={t.name}
              >
                {/* Outer Reticle Ring */}
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={isActive ? 18 : 13}
                  fill="none"
                  stroke={isActive ? "#F4A272" : "rgba(255, 255, 255, 0.25)"}
                  strokeWidth={isActive ? 1.2 : 0.8}
                  strokeDasharray={isActive ? "3,3" : "2,4"}
                />

                {/* Radiant Halo */}
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={scaledRadius * (isActive ? 3.2 : 2.0)}
                  fill={t.glowColor}
                  filter="url(#neon-glow)"
                  opacity={isActive ? 0.9 : 0.5}
                />

                {/* Star Stellar Core */}
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={scaledRadius}
                  fill={t.color}
                />

                {/* Pure White Central Core Dot */}
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={scaledRadius * 0.4}
                  fill="#FFFFFF"
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* 2. Interactive Telemetry HUD Card (When Clicked or in Object Mode) */}
      {selectedTarget && (
        <div className="absolute right-2 sm:right-3 bottom-2 max-w-[280px] sm:max-w-[310px] p-3.5 rounded-2xl bg-[#09090f]/95 backdrop-blur-2xl border border-[#2d2d42] shadow-[0_16px_40px_rgba(0,0,0,0.85)] z-40 transition-all animate-in fade-in slide-in-from-bottom-2 select-text">
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

      {/* 3. Multi-Band Spectral Wavelength Bar (Only in Spectral Mode) */}
      {activeMode === "spectral" && (
        <div className="absolute bottom-2 inset-x-2 sm:inset-x-auto sm:left-3 sm:right-3 flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl bg-black/90 backdrop-blur-2xl border border-indigo-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.8)] z-30 transition-all animate-in fade-in">
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
      </div>

      {/* 4. Minimal Discreet Status Caption with generous clear space below the picture */}
      {activeMode === "sky" && !selectedTarget && (
        <div className="mt-7 flex items-center gap-2 text-[10.5px] font-mono text-white/70 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 pointer-events-none whitespace-nowrap shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          <Activity className="w-3.5 h-3.5 text-[#F4A272] animate-pulse" />
          <span>CELESTIAL DISCOVERY PATH · 5 Connected Infrared Science Targets</span>
        </div>
      )}
    </div>
  );
};

export default ExplorerShowcaseVisual;
