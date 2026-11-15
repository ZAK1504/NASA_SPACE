import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface Satellite3DProps {
  yaw?: number;
  className?: string;
  glbUrl?: string;
}

// Module-level cache so GLB model is downloaded and parsed only once across page navigations
let cachedGltfScene: THREE.Group | null = null;
let gltfLoadingPromise: Promise<THREE.Group> | null = null;

export const Satellite3D: React.FC<Satellite3DProps> = ({
  yaw = 0,
  className = "",
  glbUrl = "/models/spherex.glb",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const yawRef = useRef(yaw);
  yawRef.current = yaw;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    let cleanupRenderer: (() => void) | null = null;
    let initIo: IntersectionObserver | null = null;

    const initRenderer = () => {
      if (destroyed || cleanupRenderer) return;

      // 1. Scene & Camera setup
      const scene = new THREE.Scene();
      const width = container.clientWidth || 600;
      const height = container.clientHeight || 500;
      const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
      camera.position.set(0.5, 0.55, 5.75);

      // 2. Renderer with transparent clear color
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);

      // 3. OrbitControls (Smooth drag-to-rotate, wheel zoom disabled to protect normal page scroll)
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.minPolarAngle = 0.8;
      controls.maxPolarAngle = 2.4;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(0, -0.12, 0);

      let isUserInteracting = false;
      controls.addEventListener("start", () => {
        isUserInteracting = true;
      });
      controls.addEventListener("end", () => {
        isUserInteracting = false;
      });

      // 4. Calibrated aerospace lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xfff8f0, 2.2);
      dirLight.position.set(5, 6, 4);
      scene.add(dirLight);

      const pointLightBlue = new THREE.PointLight(0x7dd3fc, 16, 25);
      pointLightBlue.position.set(-5, -2, -4);
      scene.add(pointLightBlue);

      const pointLightOrange = new THREE.PointLight(0xfbbf24, 12, 25);
      pointLightOrange.position.set(1, -4, 3);
      scene.add(pointLightOrange);

      // 5. Model Root Group
      const modelGroup = new THREE.Group();
      modelGroup.rotation.set(0.24, 0, 0.12);
      scene.add(modelGroup);

      // Helper: Build procedural fallback if GLB is unavailable
      const createProceduralFallback = () => {
        const g = new THREE.Group();
        g.rotation.set(0.28, 0, 0.1);
        g.scale.setScalar(0.88);

        const shieldMat = new THREE.MeshStandardMaterial({
          color: 0xdde3f0,
          metalness: 0.25,
          roughness: 0.45,
          side: THREE.DoubleSide,
        });

        const addShield = (y: number, rTop: number, rBot: number) => {
          const geo = new THREE.CylinderGeometry(rTop, rBot, 0.46, 56, 1, true);
          const mesh = new THREE.Mesh(geo, shieldMat);
          mesh.position.y = y;
          g.add(mesh);
        };

        addShield(1.05, 1.55, 1.0);
        addShield(0.62, 1.25, 0.82);
        addShield(0.22, 1.0, 0.64);

        const coreGeo = new THREE.CylinderGeometry(0.38, 0.45, 1.1, 28);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x0f1530, metalness: 0.5, roughness: 0.5 });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.y = 0.35;
        g.add(coreMesh);

        const busGeo = new THREE.BoxGeometry(1.2, 0.75, 1.2);
        const busMat = new THREE.MeshStandardMaterial({
          color: 0xc8aa6e,
          metalness: 0.35,
          roughness: 0.48,
        });
        const busMesh = new THREE.Mesh(busGeo, busMat);
        busMesh.position.y = -0.55;
        g.add(busMesh);

        const wingGeo = new THREE.BoxGeometry(2.9, 0.06, 1.3);
        const wingMat = new THREE.MeshStandardMaterial({
          color: 0x14286e,
          metalness: 0.4,
          roughness: 0.35,
          emissive: 0x0a1a55,
        });
        const wingMesh = new THREE.Mesh(wingGeo, wingMat);
        wingMesh.position.y = -1.0;
        g.add(wingMesh);

        modelGroup.add(g);
      };

      // 6. Fast cached load or initial fetch of GLB model
      if (cachedGltfScene) {
        modelGroup.add(cachedGltfScene.clone(true));
      } else if (gltfLoadingPromise) {
        gltfLoadingPromise
          .then((sceneObj) => {
            if (!destroyed) modelGroup.add(sceneObj.clone(true));
          })
          .catch(() => {
            if (!destroyed) createProceduralFallback();
          });
      } else {
        const loader = new GLTFLoader();
        gltfLoadingPromise = new Promise<THREE.Group>((resolve, reject) => {
          loader.load(
            glbUrl,
            (gltf) => {
              const sceneObj = gltf.scene;
              const box = new THREE.Box3().setFromObject(sceneObj);
              const size = box.getSize(new THREE.Vector3());
              const center = box.getCenter(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              const scaleFactor = 2.65 / (maxDim || 1);
              sceneObj.position.set(-center.x, -center.y, -center.z);

              sceneObj.traverse((child: any) => {
                if (child.isMesh && child.material) {
                  const mat = child.material;
                  if (mat.roughness !== undefined) {
                    mat.roughness = Math.max(0.44, mat.roughness);
                  }
                  if (mat.metalness !== undefined) {
                    mat.metalness = Math.min(0.55, mat.metalness);
                  }
                  if (mat.color) {
                    const hsl = { h: 0, s: 0, l: 0 };
                    mat.color.getHSL(hsl);
                    if (hsl.h >= 0.07 && hsl.h <= 0.17 && hsl.s > 0.45) {
                      mat.color.setHSL(hsl.h, hsl.s * 0.62, Math.min(0.85, hsl.l * 0.94));
                    }
                  }
                }
              });

              const subGroup = new THREE.Group();
              subGroup.scale.setScalar(scaleFactor);
              subGroup.add(sceneObj);
              cachedGltfScene = subGroup;
              resolve(subGroup);
            },
            undefined,
            (err) => reject(err)
          );
        });

        gltfLoadingPromise
          .then((sceneObj) => {
            if (!destroyed) modelGroup.add(sceneObj.clone(true));
          })
          .catch((err) => {
            console.warn("GLB model failed to load, falling back to procedural model:", err);
            if (!destroyed) createProceduralFallback();
          });
      }

      // 7. Visibility tracking & Animation Loop
      let isVisible = true;
      const io = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        { rootMargin: "100px" }
      );
      io.observe(container);

      const startTime = performance.now();
      let lastTime = performance.now();
      let curYaw = 0;
      let idleYaw = 0;
      let rafId = 0;

      const animate = () => {
        if (destroyed) return;
        rafId = requestAnimationFrame(animate);

        if (!isVisible) return;

        const now = performance.now();
        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        const elapsed = (now - startTime) / 1000;

        if (!isUserInteracting) {
          idleYaw += delta * 0.15;
        }

        const targetYaw = yawRef.current;
        curYaw += (targetYaw - curYaw) * 0.05;

        modelGroup.position.y = Math.sin(elapsed * 0.85) * 0.07;
        modelGroup.position.x = Math.cos(elapsed * 0.5) * 0.035;
        modelGroup.rotation.y = idleYaw + curYaw;

        controls.update();
        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container || destroyed) return;
        const w = container.clientWidth || 600;
        const h = container.clientHeight || 500;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener("resize", handleResize);

      cleanupRenderer = () => {
        io.disconnect();
        cancelAnimationFrame(rafId);
        window.removeEventListener("resize", handleResize);
        controls.dispose();
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    };

    // Viewport-deferred initialization: Use IntersectionObserver so offscreen mounts
    // (e.g. returning to Explorer, Time Machine, Labs, or Mission) never instantiate
    // heavy WebGL contexts or compile shaders until actually nearing the viewport!
    initIo = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          initIo?.disconnect();
          initIo = null;
          initRenderer();
        }
      },
      { rootMargin: "200px" }
    );
    initIo.observe(container);

    return () => {
      destroyed = true;
      if (initIo) initIo.disconnect();
      if (cleanupRenderer) cleanupRenderer();
    };
  }, [glbUrl]);

  return <div ref={containerRef} className={`satellite-canvas relative w-full h-full ${className}`} />;
};

export default Satellite3D;
