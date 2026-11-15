import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sparkles, Radio, Layers, Compass, ExternalLink } from "lucide-react";

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
  fact: string;
  wavelengthNote?: string;
}

const CANONICAL_TARGETS: TargetBeacon[] = [
  {
    id: "barnards-star",
    name: "Barnard's Star",
    designation: "GJ 699",
    type: "High Proper Motion Red Dwarf",
    raDeg: 269.4485,
    decDeg: 4.7394,
    raHms: "17h 57m 47.6s",
    decDms: "+04° 44′ 22″",
    fact: "Fastest proper motion star in the sky (10.39″/yr); traverses ~10.22″ between SPHEREx annual epochs.",
    wavelengthNote: "Brilliant in near-IR bands; central core saturates detector core.",
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
    fact: "Coldest known brown dwarf (~250 K) with atmospheric water-ice clouds; moves westward at 8.12″/yr.",
    wavelengthNote: "Invisible at λ < 3.0 μm; strongly detected in D5/D6 arrays (3.8–5.0 μm).",
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
    fact: "T1+T6 substellar binary separated by ~402″ from primary star Epsilon Indi A.",
    wavelengthNote: "Strong methane absorption features at 1.66 μm and 2.20 μm.",
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
    fact: "Pre-main sequence binary with tidally disrupted circumstellar protoplanetary disk.",
    wavelengthNote: "Infrared excess from warm silicate dust grains in disk bridge.",
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
    fact: "Pulsating carbon giant star with 314-day period, varying by >5 magnitudes across cycles.",
    wavelengthNote: "Enormous mid-IR molecular carbon absorption bands (CO at 4.67 μm).",
  },
];

// Coordinate conversion: RA/Dec (deg) -> 3D point on sphere of radius R
function celestialToCartesian(raDeg: number, decDeg: number, radius: number): THREE.Vector3 {
  const phi = (raDeg * Math.PI) / 180;
  const theta = ((90 - decDeg) * Math.PI) / 180;
  // In Three.js: +Y is North, +Z is forward, +X is right
  const x = -radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.cos(theta);
  const z = radius * Math.sin(theta) * Math.sin(phi);
  return new THREE.Vector3(x, y, z);
}

const SPECTRAL_CHANNELS = [
  { id: "075um", lambda: "0.75 μm", array: "Array 1 (D1)", desc: "Visible/Near-IR Boundary — Stellar Photospheres", texture: "/textures/spherex_band_075um.jpg" },
  { id: "133um", lambda: "1.33 μm", array: "Array 2 (D2)", desc: "Near-IR J-Band — Interstellar Extinction Penetration", texture: "/textures/spherex_band_133um.jpg" },
  { id: "236um", lambda: "2.36 μm", array: "Array 3 (D3)", desc: "Near-IR K-Band / Dichroic Gap — Molecular CO/H₂O", texture: "/textures/spherex_band_236um.jpg" },
  { id: "472um", lambda: "4.72 μm", array: "Array 6 (D6)", desc: "Mid-IR — Cool Brown Dwarfs & Cold CO Ice/Gas", texture: "/textures/spherex_band_472um.jpg" },
];

export const ExplorerShowcaseVisual: React.FC<ExplorerShowcaseVisualProps> = ({
  activeMode = "sky",
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedBeacon, setSelectedBeacon] = useState<TargetBeacon | null>(null);
  const [hoveredBeaconId, setHoveredBeaconId] = useState<string | null>(null);
  const [activeChannelIdx, setActiveChannelIdx] = useState<number>(0);
  const [beaconScreenPositions, setBeaconScreenPositions] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});
  const [textureLoaded, setTextureLoaded] = useState(false);

  // References to Three.js elements
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const sphereRadius = 1.35;

  // Cached textures
  const textureCacheRef = useRef<Record<string, THREE.Texture>>({});

  // Cycle spectral channels when in spectral mode
  useEffect(() => {
    if (activeMode !== "spectral") return;
    const interval = setInterval(() => {
      setActiveChannelIdx((prev) => (prev + 1) % SPECTRAL_CHANNELS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [activeMode]);

  // Load and swap textures according to activeMode
  useEffect(() => {
    const mesh = sphereMeshRef.current;
    if (!mesh) return;

    let targetTextureUrl = "/textures/spherex_dr1_composite.jpg";
    if (activeMode === "spectral") {
      targetTextureUrl = SPECTRAL_CHANNELS[activeChannelIdx].texture;
    }

    const loader = new THREE.TextureLoader();
    if (textureCacheRef.current[targetTextureUrl]) {
      const tex = textureCacheRef.current[targetTextureUrl];
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.map = tex;
      mat.needsUpdate = true;
    } else {
      loader.load(
        targetTextureUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          textureCacheRef.current[targetTextureUrl] = tex;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.map = tex;
          mat.needsUpdate = true;
          setTextureLoaded(true);
        },
        undefined,
        (err) => {
          console.warn("Failed to load celestial texture:", targetTextureUrl, err);
        }
      );
    }
  }, [activeMode, activeChannelIdx]);

  // Rotate smoothly toward canonical target when in 'object' mode
  useEffect(() => {
    if (activeMode === "object") {
      const target = CANONICAL_TARGETS[0]; // Barnard's Star
      setSelectedBeacon(target);
      if (controlsRef.current && cameraRef.current) {
        // Target coordinates in cartesian
        const pos = celestialToCartesian(target.raDeg, target.decDeg, sphereRadius);
        // Position camera to look directly at this point
        const camPos = pos.clone().normalize().multiplyScalar(4.8);
        cameraRef.current.position.set(camPos.x, camPos.y + 0.2, camPos.z);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    } else if (activeMode === "sky") {
      setSelectedBeacon(null);
    }
  }, [activeMode]);

  // Three.js Mount & Animation Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let destroyed = false;
    let rafId = 0;
    let isVisible = true;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 520;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 4.8);
    cameraRef.current = camera;

    // 2. WebGL Renderer with Alpha Transparency
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Smooth Orbit Controls (Zoom & Pan disabled to protect page scroll)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minPolarAngle = 0.4;
    controls.maxPolarAngle = 2.7;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    let isUserInteracting = false;
    controls.addEventListener("start", () => {
      isUserInteracting = true;
    });
    controls.addEventListener("end", () => {
      setTimeout(() => {
        isUserInteracting = false;
      }, 800);
    });

    // 4. Balanced Atmospheric Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.45);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xf4a272, 1.2);
    dirLight1.position.set(5, 3, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.85);
    dirLight2.position.set(-4, -2, -3);
    scene.add(dirLight2);

    // 5. Celestial Sphere Mesh
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      roughness: 0.82,
      metalness: 0.08,
      color: 0xffffff,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    // Initial rotation: 165 degrees brings Barnard's Star, Epsilon Indi B, and R Draconis to the front
    sphereMesh.rotation.y = (165 * Math.PI) / 180;
    scene.add(sphereMesh);
    sphereMeshRef.current = sphereMesh;

    // Load initial composite texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("/textures/spherex_dr1_composite.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      textureCacheRef.current["/textures/spherex_dr1_composite.jpg"] = tex;
      sphereMat.map = tex;
      sphereMat.needsUpdate = true;
      setTextureLoaded(true);
    });

    // 6. Coordinate Grid Rings (Celestial Equator & Polar Axis)
    const equatorGeo = new THREE.BufferGeometry();
    const equatorPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      equatorPts.push(new THREE.Vector3(Math.cos(angle) * (sphereRadius + 0.006), 0, Math.sin(angle) * (sphereRadius + 0.006)));
    }
    equatorGeo.setFromPoints(equatorPts);
    const equatorMat = new THREE.LineBasicMaterial({
      color: 0xf4a272,
      transparent: true,
      opacity: 0.35,
      linewidth: 1,
    });
    const equatorLine = new THREE.Line(equatorGeo, equatorMat);
    sphereMesh.add(equatorLine);

    // Ecliptic Plane (23.44° tilt)
    const eclipticGeo = new THREE.BufferGeometry();
    const eclipticPts: THREE.Vector3[] = [];
    const tilt = (23.44 * Math.PI) / 180;
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      const x = Math.cos(angle) * (sphereRadius + 0.005);
      const y = Math.sin(angle) * Math.sin(tilt) * (sphereRadius + 0.005);
      const z = Math.sin(angle) * Math.cos(tilt) * (sphereRadius + 0.005);
      eclipticPts.push(new THREE.Vector3(x, y, z));
    }
    eclipticGeo.setFromPoints(eclipticPts);
    const eclipticMat = new THREE.LineBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.28,
    });
    const eclipticLine = new THREE.Line(eclipticGeo, eclipticMat);
    sphereMesh.add(eclipticLine);

    // 7. 3D Beacon Points on Sphere
    const beaconMeshes: { id: string; mesh: THREE.Mesh; pos: THREE.Vector3 }[] = [];
    CANONICAL_TARGETS.forEach((target) => {
      const pos = celestialToCartesian(target.raDeg, target.decDeg, sphereRadius + 0.015);
      const beaconGeo = new THREE.SphereGeometry(0.034, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0xff7b3d,
      });
      const bMesh = new THREE.Mesh(beaconGeo, beaconMat);
      bMesh.position.copy(pos);

      // Subtle outer glow ring
      const ringGeo = new THREE.RingGeometry(0.04, 0.068, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf4a272,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.lookAt(pos.clone().multiplyScalar(2));
      bMesh.add(ringMesh);

      sphereMesh.add(bMesh);
      beaconMeshes.push({ id: target.id, mesh: bMesh, pos });
    });

    // 8. IntersectionObserver to pause rendering when offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 9. Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      if (destroyed) return;
      rafId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Gentle auto-rotation when user is not interacting
      if (!isUserInteracting && sphereMesh) {
        sphereMesh.rotation.y += 0.05 * dt;
      }

      controls.update();
      renderer.render(scene, camera);

      // Compute screen positions of beacons for 2D overlays
      if (container) {
        const rect = container.getBoundingClientRect();
        const newPositions: Record<string, { x: number; y: number; visible: boolean }> = {};

        beaconMeshes.forEach(({ id, pos }) => {
          // World position after sphereMesh rotation
          const worldPos = pos.clone().applyMatrix4(sphereMesh.matrixWorld);
          
          // Check if point is on front hemisphere relative to camera
          const toCam = camera.position.clone().sub(worldPos).normalize();
          const normal = worldPos.clone().normalize();
          const dot = normal.dot(toCam);
          const visible = dot > 0.05;

          const screenPos = worldPos.clone().project(camera);
          const sx = ((screenPos.x + 1) * rect.width) / 2;
          const sy = ((-screenPos.y + 1) * rect.height) / 2;

          newPositions[id] = { x: sx, y: sy, visible };
        });

        setBeaconScreenPositions(newPositions);
      }
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 540;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      equatorGeo.dispose();
      equatorMat.dispose();
      eclipticGeo.dispose();
      eclipticMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] flex items-center justify-center select-none overflow-visible">
      {/* Three.js Canvas Container (Transparent background) */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        style={{ touchAction: "none" }}
      />

      {/* Floating 2D Marker Overlays & Interaction Pills */}
      {CANONICAL_TARGETS.map((target) => {
        const pos = beaconScreenPositions[target.id];
        if (!pos) return null;
        const isHovered = hoveredBeaconId === target.id;
        const isSelected = selectedBeacon?.id === target.id;

        return (
          <div
            key={target.id}
            data-beacon-id={target.id}
            data-beacon-name={target.name}
            style={{
              position: "absolute",
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: "translate(-50%, -50%)",
              opacity: pos.visible ? (isHovered || isSelected ? 1 : 0.85) : 0.18,
              pointerEvents: pos.visible ? "auto" : "none",
              transition: "opacity 0.25s ease, transform 0.2s ease",
            }}
            className="celestial-beacon group cursor-pointer z-20"
            onMouseEnter={() => setHoveredBeaconId(target.id)}
            onMouseLeave={() => setHoveredBeaconId(null)}
            onClick={() => setSelectedBeacon((prev) => (prev?.id === target.id ? null : target))}
          >
            {/* Luminous Pin Core */}
            <div className="relative flex items-center justify-center">
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                  isSelected || isHovered
                    ? "bg-[#FF7B3D] ring-4 ring-[#FF7B3D]/30 scale-125 shadow-[0_0_15px_#FF7B3D]"
                    : "bg-[#F4A272] ring-2 ring-black/80"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>

              {/* Minimal Target Tag on Front Hemisphere */}
              {pos.visible && (
                <div
                  data-beacon-tag={target.id}
                  className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[10.5px] font-mono font-medium backdrop-blur-md transition-all ${
                    isSelected || isHovered
                      ? "bg-[#111117]/90 text-[#F4A272] border border-[#F4A272]/50 shadow-lg translate-x-0"
                      : "bg-black/60 text-white/70 border border-white/10 opacity-75 hover:opacity-100"
                  }`}
                >
                  {target.name}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Target Inspection Card (Displays when clicked or in 'object' mode) */}
      {selectedBeacon && (
        <div className="absolute right-3 sm:right-6 bottom-4 sm:bottom-6 max-w-[280px] sm:max-w-[320px] p-3.5 sm:p-4 rounded-2xl bg-[#08080C]/90 backdrop-blur-xl border border-[#262635] shadow-[0_12px_36px_rgba(0,0,0,0.65)] z-30 transition-all animate-in fade-in slide-in-from-bottom-2">
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
              className="text-[#8E8A85] hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="text-[11px] text-[#A8A49E] mb-2 font-mono flex items-center gap-2">
            <span>RA {selectedBeacon.raHms}</span>
            <span>✦</span>
            <span>Dec {selectedBeacon.decDms}</span>
          </div>

          <p className="text-[11.5px] text-[#C7C3BD] leading-relaxed mb-2.5">
            {selectedBeacon.fact}
          </p>

          <div className="p-2 rounded-lg bg-[#111117] border border-[#262635]/80 text-[10.5px] text-[#F4A272]/90 flex items-start gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 flex-none mt-0.5 text-[#FF7B3D]" />
            <span>{selectedBeacon.wavelengthNote}</span>
          </div>
        </div>
      )}

      {/* Spectral Mode Wavelength Channel Indicator */}
      {activeMode === "spectral" && (
        <div className="absolute top-4 left-4 p-2.5 sm:p-3 rounded-xl bg-[#08080C]/90 backdrop-blur-md border border-[#262635] shadow-lg z-30 flex flex-col gap-1 max-w-[260px] animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-mono text-[#F4A272] font-semibold">
            <Layers className="w-3.5 h-3.5 text-[#FF7B3D]" />
            <span>{SPECTRAL_CHANNELS[activeChannelIdx].lambda}</span>
            <span className="text-[10px] text-[#8E8A85]">({SPECTRAL_CHANNELS[activeChannelIdx].array})</span>
          </div>
          <div className="text-[11px] text-[#C7C3BD]">
            {SPECTRAL_CHANNELS[activeChannelIdx].desc}
          </div>
          <div className="flex gap-1 mt-1.5">
            {SPECTRAL_CHANNELS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannelIdx(idx)}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  idx === activeChannelIdx ? "bg-[#FF7B3D]" : "bg-white/20 hover:bg-white/40"
                }`}
                title={ch.lambda}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scientifically Honest Visual Caption & Interaction Prompt */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10.5px] font-mono text-[#8E8A85] flex items-center gap-2 z-10 pointer-events-none whitespace-nowrap">
        <Compass className="w-3 h-3 text-[#F4A272]" />
        <span>Interactive Infrared Celestial Map ✦ Drag to rotate</span>
      </div>
    </div>
  );
};

export default ExplorerShowcaseVisual;
