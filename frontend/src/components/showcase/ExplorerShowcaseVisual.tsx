import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Radio, Compass, Sparkles, Layers, Eye, MoveHorizontal, Info } from "lucide-react";

export interface ExplorerShowcaseVisualProps {
  activeMode?: "sky" | "object" | "spectral";
}

interface TargetBeacon {
  id: string;
  name: string;
  designation: string;
  type: string;
  raDeg: number;
  decDeg: number;
  raHms: string;
  decDms: string;
  pmRateArcsecYr: string;
  baselineDisplacementArcsec: string;
  fact: string;
  wavelengthNote: string;
}

const CANONICAL_TARGETS: TargetBeacon[] = [
  {
    id: "barnards-star",
    name: "Barnard's Star",
    designation: "GJ 699",
    type: "High Proper-Motion M4V Dwarf",
    raDeg: 269.4485,
    decDeg: 4.7394,
    raHms: "17h 57m 47.6s",
    decDms: "+04° 44′ 22″",
    pmRateArcsecYr: "10.39″/yr",
    baselineDisplacementArcsec: "10.223″ across 359-day baseline",
    fact: "Fastest proper motion star known; traverses ~10.22″ between SPHEREx annual survey epochs.",
    wavelengthNote: "Brilliant across SPHEREx near-IR channels (0.75–2.4 µm); saturated detector core.",
  },
  {
    id: "wise-0855",
    name: "WISE 0855−0714",
    designation: "WISE J0855-0714",
    type: "Sub-stellar Cold Brown Dwarf",
    raDeg: 133.7951,
    decDeg: -7.2451,
    raHms: "08h 55m 10.8s",
    decDms: "−07° 14′ 43″",
    pmRateArcsecYr: "8.12″/yr",
    baselineDisplacementArcsec: "7.981″ across 359-day baseline",
    fact: "Coldest known brown dwarf (~250 K) with atmospheric water-ice and methane cloud signatures.",
    wavelengthNote: "Invisible at λ < 3.0 µm; strongly detected in D5/D6 arrays (3.8–5.0 µm).",
  },
  {
    id: "epsilon-indi-b",
    name: "Epsilon Indi B",
    designation: "HD 209100B",
    type: "Binary T-Dwarf System",
    raDeg: 331.0441,
    decDeg: -56.7828,
    raHms: "22h 04m 10.6s",
    decDms: "−56° 46′ 58″",
    pmRateArcsecYr: "4.71″/yr",
    baselineDisplacementArcsec: "4.630″ across 359-day baseline",
    fact: "T1 + T6 substellar binary separated by ~402″ from primary star Epsilon Indi A.",
    wavelengthNote: "Deep methane (CH₄) absorption bands at 1.66 µm and 2.20 µm.",
  },
  {
    id: "rw-aurigae",
    name: "RW Aurigae",
    designation: "V* RW Aur",
    type: "Young Stellar Object Binary",
    raDeg: 76.9561,
    decDeg: 30.4013,
    raHms: "05h 07m 49.5s",
    decDms: "+30° 24′ 05″",
    pmRateArcsecYr: "0.02″/yr",
    baselineDisplacementArcsec: "0.020″ across 359-day baseline",
    fact: "Pre-main sequence binary system with tidally disrupted circumstellar protoplanetary disk.",
    wavelengthNote: "Pronounced mid-IR excess from warm silicate dust in circumstellar tidal bridge.",
  },
  {
    id: "r-draconis",
    name: "R Draconis",
    designation: "V* R Dra",
    type: "Mira-type Pulsating Variable",
    raDeg: 248.1676,
    decDeg: 66.7028,
    raHms: "16h 32m 40.2s",
    decDms: "+66° 42′ 10″",
    pmRateArcsecYr: "0.03″/yr",
    baselineDisplacementArcsec: "0.030″ across 359-day baseline",
    fact: "Pulsating carbon giant with a 314-day cycle, varying by >5 magnitudes across infrared epochs.",
    wavelengthNote: "Prominent molecular CO ice absorption bands at 4.67 µm.",
  },
];

const SPECTRAL_CHANNELS = [
  { id: "075um", lambda: "0.75 μm", array: "Array 1 (D1)", desc: "Visible/Near-IR Boundary — Stellar Photospheres", texture: "/textures/spherex_band_075um.jpg" },
  { id: "133um", lambda: "1.33 μm", array: "Array 2 (D2)", desc: "Near-IR J-Band — Interstellar Extinction Penetration", texture: "/textures/spherex_band_133um.jpg" },
  { id: "236um", lambda: "2.36 μm", array: "Array 3 (D3)", desc: "Near-IR K-Band — Molecular CO / H₂O Absorption", texture: "/textures/spherex_band_236um.jpg" },
  { id: "472um", lambda: "4.72 μm", array: "Array 6 (D6)", desc: "Mid-IR — Cool Brown Dwarfs & Interstellar Ices", texture: "/textures/spherex_band_472um.jpg" },
];

export const ExplorerShowcaseVisual: React.FC<ExplorerShowcaseVisualProps> = ({
  activeMode = "sky",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction & Pan State
  const [selectedBeacon, setSelectedBeacon] = useState<TargetBeacon | null>(null);
  const [hoveredBeaconId, setHoveredBeaconId] = useState<string | null>(null);
  const [activeChannelIdx, setActiveChannelIdx] = useState<number>(0);

  // 3D Tilt perspective state
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });

  // Panning & Animation Ref
  const stateRef = useRef({
    panOffset: 0.28, // initial pan brings Barnard's Star & R Draconis to the focal center
    targetPan: 0.28,
    isDragging: false,
    dragStartX: 0,
    dragStartPan: 0,
    lastTime: 0,
    activeMode: "sky" as "sky" | "object" | "spectral",
    activeChannelIdx: 0,
    isVisible: true,
  });

  // Cached panorama image element
  const panoramaImgRef = useRef<HTMLImageElement | null>(null);
  const bandImgRefs = useRef<Record<string, HTMLImageElement>>({});

  // Synchronize refs with props
  useEffect(() => {
    stateRef.current.activeMode = activeMode;
    if (activeMode === "object") {
      const target = CANONICAL_TARGETS[0]; // Barnard's Star
      setSelectedBeacon(target);
      // Pan to center Barnard's Star (ra = 269.45 deg)
      // center is at x = 0.5, so panOffset + raDeg/360 should be ~0.5
      stateRef.current.targetPan = ((0.5 - target.raDeg / 360) % 1 + 1) % 1;
    } else if (activeMode === "sky") {
      setSelectedBeacon(null);
    }
  }, [activeMode]);

  useEffect(() => {
    stateRef.current.activeChannelIdx = activeChannelIdx;
  }, [activeChannelIdx]);

  // Cycle spectral channels when in spectral mode
  useEffect(() => {
    if (activeMode !== "spectral") return;
    const interval = setInterval(() => {
      setActiveChannelIdx((prev) => (prev + 1) % SPECTRAL_CHANNELS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [activeMode]);

  // Preload authentic astronomical textures
  useEffect(() => {
    const mainImg = new Image();
    mainImg.src = "/textures/spherex_infrared_panorama.jpg";
    mainImg.onload = () => {
      panoramaImgRef.current = mainImg;
    };

    SPECTRAL_CHANNELS.forEach((ch) => {
      const bImg = new Image();
      bImg.src = ch.texture;
      bImg.onload = () => {
        bandImgRefs.current[ch.id] = bImg;
      };
    });
  }, []);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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

      const dt = Math.min((now - (stateRef.current.lastTime || now)) / 1000, 0.1);
      stateRef.current.lastTime = now;

      // Handle gentle idle drift when not dragging
      if (!stateRef.current.isDragging) {
        if (stateRef.current.activeMode === "object") {
          // Smooth spring interpolation toward target target
          const diff = stateRef.current.targetPan - stateRef.current.panOffset;
          stateRef.current.panOffset += diff * Math.min(dt * 3.5, 0.1);
        } else {
          // Gentle steady astronomical drift (0.015 / s)
          stateRef.current.panOffset = (stateRef.current.panOffset + 0.008 * dt) % 1;
        }
      }

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const pan = stateRef.current.panOffset;
      const mode = stateRef.current.activeMode;
      const chIdx = stateRef.current.activeChannelIdx;

      // 1. Draw Authentic Infrared Panorama with seamless wrapping
      let sourceImg = panoramaImgRef.current;
      if (mode === "spectral") {
        const activeCh = SPECTRAL_CHANNELS[chIdx];
        if (bandImgRefs.current[activeCh.id]) {
          sourceImg = bandImgRefs.current[activeCh.id];
        }
      }

      if (sourceImg && sourceImg.complete && sourceImg.naturalWidth > 0) {
        // Draw wrapped image horizontally across viewport
        const offsetX = (pan % 1) * W;
        ctx.save();
        ctx.globalAlpha = 0.95;
        // First slice
        ctx.drawImage(sourceImg, offsetX, 0, W, H);
        // Second slice to wrap seamlessly
        ctx.drawImage(sourceImg, offsetX - W, 0, W, H);
        if (offsetX < 0) {
          ctx.drawImage(sourceImg, offsetX + W, 0, W, H);
        }
        ctx.restore();
      } else {
        // High-fidelity fallback procedural infrared dust lane
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, "#080612");
        bgGrad.addColorStop(0.5, "#0d0918");
        bgGrad.addColorStop(1, "#05030a");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // 2. Celestial Coordinate Grid Lines (Equator & Parallels)
      ctx.save();
      ctx.lineWidth = 1;
      
      // Celestial Equator (Dec = 0°, y = H / 2) in luminous warm gold
      const equatorY = H / 2;
      ctx.strokeStyle = "rgba(244, 162, 114, 0.32)";
      ctx.beginPath();
      ctx.moveTo(0, equatorY);
      ctx.lineTo(W, equatorY);
      ctx.stroke();

      // Declination parallels (+30°, -30°, +60°, -60°)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.setLineDash([4, 6]);
      [H * 0.167, H * 0.333, H * 0.667, H * 0.833].forEach((py) => {
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(W, py);
        ctx.stroke();
      });

      // Ecliptic Plane (23.44° inclined wave across Right Ascension)
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = "rgba(129, 140, 248, 0.28)";
      ctx.beginPath();
      for (let sx = 0; sx <= W; sx += 8) {
        const raFrac = ((sx / W - pan) % 1 + 1) % 1;
        const decEcliptic = 23.44 * Math.sin(raFrac * 2 * Math.PI);
        const ey = (1 - (decEcliptic + 90) / 180) * H;
        if (sx === 0) ctx.moveTo(sx, ey);
        else ctx.lineTo(sx, ey);
      }
      ctx.stroke();
      ctx.restore();

      // 3. Subtle Foreground Star Motes (3-Layer Depth)
      ctx.save();
      const numMotes = 48;
      for (let i = 0; i < numMotes; i++) {
        const mx = (((i * 73.19 + pan * W * 1.5) % W) + W) % W;
        const my = (i * 37.81) % H;
        const sz = (i % 3 === 0) ? 1.6 : 0.9;
        const alpha = 0.2 + (i % 5) * 0.12;
        ctx.fillStyle = `rgba(255, 240, 225, ${alpha})`;
        ctx.beginPath();
        ctx.arc(mx, my, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // Pointer & Drag Handlers for Smooth Interactive Panning
  const handlePointerDown = (e: React.PointerEvent) => {
    stateRef.current.isDragging = true;
    stateRef.current.dragStartX = e.clientX;
    stateRef.current.dragStartPan = stateRef.current.panOffset;
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. Perspective Tilt Calculation
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      setTilt({ rx: -ny * 4.5, ry: nx * 6.5 });
    }

    // 2. Horizontal Panning
    if (stateRef.current.isDragging && containerRef.current) {
      const dx = e.clientX - stateRef.current.dragStartX;
      const width = containerRef.current.clientWidth || 600;
      stateRef.current.panOffset = (stateRef.current.dragStartPan + dx / width) % 1;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    stateRef.current.isDragging = false;
    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    stateRef.current.isDragging = false;
  };

  // Convert Celestial RA / Dec to screen coordinates on the current pan offset
  const getBeaconCoords = useCallback((raDeg: number, decDeg: number) => {
    const pan = stateRef.current.panOffset;
    const xPct = (((raDeg / 360 + pan) % 1 + 1) % 1) * 100;
    const yPct = (1 - (decDeg + 90) / 180) * 100;
    return { x: xPct, y: yPct };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className="explorer-showcase-visual relative w-full h-[460px] sm:h-[520px] flex items-center justify-center select-none overflow-visible cursor-grab active:cursor-grabbing"
      style={{
        perspective: "1200px",
        touchAction: "pan-y",
      }}
    >
      {/* Subtle Ambient Cosmic Under-Glow (matches Chapter 02 indigo atmosphere) */}
      <div className="absolute inset-0 bg-radial from-indigo-900/25 via-indigo-950/10 to-transparent pointer-events-none filter blur-3xl -z-10" />

      {/* Floating 3D Tilted Celestial Window with Soft-Dissolve Feathered Edges */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
          // Soft elliptical mask dissolving edges organically into surrounding starry background
          maskImage: "radial-gradient(ellipse 88% 80% at 50% 50%, black 52%, transparent 98%)",
          WebkitMaskImage: "radial-gradient(ellipse 88% 80% at 50% 50%, black 52%, transparent 98%)",
        }}
      >
        {/* The Panorama Canvas (No rectangular box, no hard borders) */}
        <canvas
          ref={canvasRef}
          width={1024}
          height={580}
          className="w-full h-full object-cover block"
        />

        {/* Canonical Astronomical Target Beacons */}
        {CANONICAL_TARGETS.map((target) => {
          const coords = getBeaconCoords(target.raDeg, target.decDeg);
          const isSelected = selectedBeacon?.id === target.id;
          const isHovered = hoveredBeaconId === target.id;

          return (
            <div
              key={target.id}
              data-beacon-id={target.id}
              data-beacon-name={target.name}
              style={{
                position: "absolute",
                left: `${coords.x}%`,
                top: `${coords.y}%`,
                transform: "translate(-50%, -50%)",
                transition: "transform 0.15s ease",
              }}
              className="celestial-beacon group cursor-pointer z-20 pointer-events-auto"
              onMouseEnter={() => setHoveredBeaconId(target.id)}
              onMouseLeave={() => setHoveredBeaconId(null)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBeacon((prev) => (prev?.id === target.id ? null : target));
              }}
            >
              {/* Pulsating Target Reticle & Core Pin */}
              <div className="relative flex items-center justify-center">
                {/* Luminous Pulsating Outer Halo */}
                <span
                  className={`absolute -inset-3 rounded-full border transition-all ${
                    isSelected || isHovered
                      ? "border-[#FF7B3D] scale-125 opacity-80 animate-ping"
                      : "border-[#F4A272]/30 opacity-40"
                  }`}
                />

                {/* Core Luminous Pin */}
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                    isSelected || isHovered
                      ? "bg-[#FF7B3D] ring-4 ring-[#FF7B3D]/40 scale-125 shadow-[0_0_18px_#FF7B3D]"
                      : "bg-[#F4A272] ring-2 ring-black/80 hover:scale-110"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>

                {/* Proper Motion Vector Indicator (Barnard's Star & WISE 0855) */}
                {target.id === "barnards-star" && (
                  <span
                    className="absolute w-7 h-px bg-gradient-to-r from-orange-400 to-transparent right-4 top-1/2 -rotate-12 pointer-events-none opacity-75"
                    title="Proper motion drift vector (~10.39″/yr)"
                  />
                )}

                {/* Minimalist Floating Target Tag */}
                <div
                  data-beacon-tag={target.id}
                  className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[10.5px] font-mono font-medium backdrop-blur-md transition-all ${
                    isSelected || isHovered
                      ? "bg-[#111117]/95 text-[#F4A272] border border-[#F4A272]/60 shadow-[0_4px_16px_rgba(0,0,0,0.8)] scale-105"
                      : "bg-black/60 text-white/75 border border-white/10 opacity-75 group-hover:opacity-100"
                  }`}
                >
                  {target.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Astronomical Target Card (When clicked or in 'object' mode) */}
      {selectedBeacon && (
        <div className="absolute right-3 sm:right-6 bottom-4 sm:bottom-6 max-w-[280px] sm:max-w-[320px] p-3.5 sm:p-4 rounded-2xl bg-[#08080C]/90 backdrop-blur-xl border border-[#262635] shadow-[0_12px_36px_rgba(0,0,0,0.7)] z-30 transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#F4A272] font-semibold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#FF7B3D] animate-pulse" />
                {selectedBeacon.designation}
              </div>
              <h4 className="text-sm font-semibold text-[#F3EFE8] leading-tight">{selectedBeacon.name}</h4>
            </div>
            <button
              onClick={() => setSelectedBeacon(null)}
              className="text-[#8E8A85] hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="text-[11px] font-mono text-[#C7C3BD] bg-white/[0.04] p-1.5 rounded-lg border border-white/5 mb-2 flex items-center justify-between">
            <span>RA {selectedBeacon.raHms}</span>
            <span>Dec {selectedBeacon.decDms}</span>
          </div>

          <p className="text-[11.5px] text-[#C7C3BD] leading-relaxed mb-2.5">
            {selectedBeacon.fact}
          </p>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#8E8A85]">
            <span>Proper Motion Rate:</span>
            <span className="text-[#F4A272] font-semibold">{selectedBeacon.pmRateArcsecYr}</span>
          </div>
          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#8E8A85]">
            <span>Predicted Displacement:</span>
            <span className="text-white/80">{selectedBeacon.baselineDisplacementArcsec}</span>
          </div>
        </div>
      )}

      {/* Spectral Channel Cycling Bar (Only visible in 'spectral' mode) */}
      {activeMode === "spectral" && (
        <div className="absolute bottom-4 inset-x-6 sm:inset-x-auto sm:left-6 sm:right-6 flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 z-30 transition-all animate-in fade-in">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-semibold text-white">
              {SPECTRAL_CHANNELS[activeChannelIdx].lambda} — {SPECTRAL_CHANNELS[activeChannelIdx].array}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {SPECTRAL_CHANNELS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannelIdx(idx)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                  activeChannelIdx === idx
                    ? "bg-[#F4A272] text-black font-semibold shadow-[0_0_10px_rgba(244,162,114,0.5)]"
                    : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
                }`}
              >
                {ch.lambda}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Minimal Unobtrusive Survey Caption (Non-blocking) */}
      {activeMode === "sky" && !selectedBeacon && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono text-white/45 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 pointer-events-none">
          <Sparkles className="w-3 h-3 text-[#F4A272]" />
          <span>SPHEREx DR1 · 102-Band Infrared All-Sky Panorama · Drag to Explore</span>
        </div>
      )}
    </div>
  );
};

export default ExplorerShowcaseVisual;
