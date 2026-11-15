import React, { useEffect, useRef } from "react";
import Pic from "./Pic";

interface BackdropProps {
  activeSection?: string;
}

const CHAPTERS = ["home", "explorer", "time-machine", "labs", "mission"];

// Optimal nebula opacity target for each chapter
const NEBULA_OPACITIES = [0.35, 0.44, 0.22, 0.15, 0.38];

/**
 * Coordinated Cosmic Backdrop with Continuous Scroll-Driven Environment Blending.
 * Instead of swapping gradients when crossing discrete observer thresholds (which causes visible seams),
 * 5 persistent atmospheric layers crossfade smoothly via GPU-accelerated opacity driven by section geometry.
 */
export const Backdrop: React.FC<BackdropProps> = ({ activeSection = "home" }) => {
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nebRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let rafId = 0;

    const smoothstep = (min: number, max: number, value: number) => {
      const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
      return x * x * (3 - 2 * x);
    };

    const updateBlending = () => {
      rafId = 0;
      const vh = window.innerHeight;
      const vCenter = vh * 0.5;

      // 1. Locate current centers of all chapters
      const centers: number[] = [];
      for (let i = 0; i < CHAPTERS.length; i++) {
        const el = document.getElementById(CHAPTERS[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          centers.push(rect.top + rect.height * 0.5);
        } else {
          // Fallback estimated positions if an element isn't in DOM
          centers.push(i * vh * 1.4);
        }
      }

      // 2. Compute smooth normalized weight for each chapter
      const weights = new Array(CHAPTERS.length).fill(0);
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
      const scrollY = window.scrollY;
      const endScrollProgress = Math.max(0, Math.min(1, (scrollY - (maxScroll - vh * 0.75)) / (vh * 0.75)));

      if (vCenter <= centers[0]) {
        weights[0] = 1;
      } else if (vCenter >= centers[centers.length - 1] || endScrollProgress >= 1) {
        weights[weights.length - 1] = 1;
      } else {
        // Find which span between centers[i] and centers[i+1] contains vCenter
        for (let i = 0; i < centers.length - 1; i++) {
          const c1 = centers[i];
          const c2 = centers[i + 1];
          if (vCenter >= c1 && vCenter <= c2) {
            const span = Math.max(1, c2 - c1);
            let t = (vCenter - c1) / span;
            // Smoothly accelerate toward 1.0 as the user reaches the end of Journey
            if (i === centers.length - 2 && endScrollProgress > 0) {
              t = Math.max(t, endScrollProgress);
            }
            const easeT = smoothstep(0, 1, t);
            weights[i] = 1 - easeT;
            weights[i + 1] = easeT;
            break;
          }
        }
      }

      // 3. Apply weights directly to layer opacities (GPU-composited)
      let currentNebOpacity = 0;
      for (let i = 0; i < CHAPTERS.length; i++) {
        const layerEl = layerRefs.current[i];
        if (layerEl) {
          layerEl.style.opacity = weights[i].toFixed(3);
        }
        currentNebOpacity += weights[i] * NEBULA_OPACITIES[i];
      }

      if (nebRef.current) {
        nebRef.current.style.opacity = currentNebOpacity.toFixed(3);
      }
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(updateBlending);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateBlending();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="backdrop fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {/* Deep cosmic base */}
      <div className="absolute inset-0 bg-[#040308]" />

      {/* Persistent Nebula Texture with smooth opacity blending */}
      <div ref={nebRef} className="bd-neb absolute inset-0 transition-none will-change-opacity" style={{ opacity: 0.35 }}>
        <Pic kind="nebula" seed={11} w={320} h={180} alt="" />
      </div>

      {/* Persistent Multi-Layer Atmosphere Blending Layers */}
      <div
        ref={(el) => {
          layerRefs.current[0] = el;
        }}
        className="bd-layer bd-layer-home absolute inset-0"
        style={{ opacity: 1 }}
      />
      <div
        ref={(el) => {
          layerRefs.current[1] = el;
        }}
        className="bd-layer bd-layer-explorer absolute inset-0"
        style={{ opacity: 0 }}
      />
      <div
        ref={(el) => {
          layerRefs.current[2] = el;
        }}
        className="bd-layer bd-layer-time-machine absolute inset-0"
        style={{ opacity: 0 }}
      />
      <div
        ref={(el) => {
          layerRefs.current[3] = el;
        }}
        className="bd-layer bd-layer-labs absolute inset-0"
        style={{ opacity: 0 }}
      />
      <div
        ref={(el) => {
          layerRefs.current[4] = el;
        }}
        className="bd-layer bd-layer-mission absolute inset-0"
        style={{ opacity: 0 }}
      />

      {/* Cinematic contrast vignette */}
      <i className="bd-shade" />
    </div>
  );
};

export default Backdrop;
