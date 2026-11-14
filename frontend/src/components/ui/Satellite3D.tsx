import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface Satellite3DProps {
  yaw?: number;
  className?: string;
  glbUrl?: string;
}

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
    let rafId = 0;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.7, 6.4);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = 0.9;
    controls.maxPolarAngle = 2.2;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 4. Lighting matching visual prototype
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff1dc, 3.2);
    dirLight.position.set(4, 5, 3);
    scene.add(dirLight);

    const pointLightBlue = new THREE.PointLight(0x8fb4ff, 45, 20);
    pointLightBlue.position.set(-4, -1, -3);
    scene.add(pointLightBlue);

    const pointLightOrange = new THREE.PointLight(0xf4a272, 80, 20);
    pointLightOrange.position.set(0, -4, 3);
    scene.add(pointLightOrange);

    // 5. Model Root Group
    const modelGroup = new THREE.Group();
    modelGroup.rotation.set(0.28, 0, 0.08);
    scene.add(modelGroup);

    // Helper: Build procedural fallback if GLB is unavailable
    const createProceduralFallback = () => {
      const g = new THREE.Group();
      g.rotation.set(0.28, 0, 0.1);
      g.scale.setScalar(0.88);

      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0xcfd7ee,
        metalness: 0.35,
        roughness: 0.38,
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

      // Core telescope cylinder
      const coreGeo = new THREE.CylinderGeometry(0.38, 0.45, 1.1, 28);
      const coreMat = new THREE.MeshStandardMaterial({ color: 0x0f1530, metalness: 0.6, roughness: 0.4 });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.y = 0.35;
      g.add(coreMesh);

      // Gold spacecraft bus
      const busGeo = new THREE.BoxGeometry(1.2, 0.75, 1.2);
      const busMat = new THREE.MeshStandardMaterial({
        color: 0xd9a441,
        metalness: 0.55,
        roughness: 0.35,
        emissive: 0x3a2605,
      });
      const busMesh = new THREE.Mesh(busGeo, busMat);
      busMesh.position.y = -0.55;
      g.add(busMesh);

      // Solar panel wings
      const wingGeo = new THREE.BoxGeometry(2.9, 0.06, 1.3);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x14286e,
        metalness: 0.4,
        roughness: 0.3,
        emissive: 0x0a1a55,
      });
      const wingMesh = new THREE.Mesh(wingGeo, wingMat);
      wingMesh.position.y = -1.0;
      g.add(wingMesh);

      modelGroup.add(g);
    };

    // 6. Load genuine SPHEREx GLB model
    const loader = new GLTFLoader();
    loader.load(
      glbUrl,
      (gltf) => {
        if (destroyed) return;
        const sceneObj = gltf.scene;

        // Auto-center and normalize scale to match viewport
        const box = new THREE.Box3().setFromObject(sceneObj);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3.4 / (maxDim || 1);

        sceneObj.position.set(-center.x, -center.y, -center.z);

        const subGroup = new THREE.Group();
        subGroup.scale.setScalar(scaleFactor);
        subGroup.add(sceneObj);
        modelGroup.add(subGroup);
      },
      undefined,
      (err) => {
        console.warn("GLB model failed to load, falling back to procedural model:", err);
        if (!destroyed) createProceduralFallback();
      }
    );

    // 7. Animation Loop
    const clock = new THREE.Clock();
    let curYaw = 0;

    const animate = () => {
      if (destroyed) return;
      rafId = requestAnimationFrame(animate);

      const targetYaw = yawRef.current;
      curYaw += (targetYaw - curYaw) * 0.05;

      const elapsed = clock.getElapsedTime();
      const scrollY = window.scrollY || 0;
      modelGroup.rotation.y = scrollY * 0.003 + elapsed * 0.14 + curYaw;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || destroyed) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // 9. Cleanup
    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [glbUrl]);

  return <div ref={containerRef} className={`sat ${className}`} />;
};

export default Satellite3D;
