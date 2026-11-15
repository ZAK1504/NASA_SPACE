import React from "react";
import Satellite3D from "../ui/Satellite3D";
import { ArrowDown, Compass, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { navigateToWorkspace } from "../../lib/journeyState";

interface ChapterHomeProps {
  onScrollToExplorer: () => void;
}

export const ChapterHome: React.FC<ChapterHomeProps> = ({ onScrollToExplorer }) => {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      data-tour="home-hero"
      className="chapter-home w-full min-h-[92vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 flex flex-col justify-between relative z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full my-auto">
        {/* Left Column: Numbered Label, Massive Typography, Mission Narrative, CTAs */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {/* Chapter Number & Tag */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
              01 — THE BEGINNING
            </p>
          </div>

          {/* Massive Display Title */}
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-extralight tracking-tighter text-white uppercase leading-none mb-4">
            SPHEREx<b className="text-[var(--accent)] font-normal">.</b>
          </h1>

          {/* Subtitle */}
          <h2 className="text-xl sm:text-3xl font-light text-[var(--ink)] tracking-tight mb-4">
            The universe doesn't stand still.
          </h2>

          {/* Narrative */}
          <p className="text-sm sm:text-base text-[var(--mut)] leading-relaxed mb-8 max-w-lg">
            SPHEREx observes the universe through infrared light. HORIZON transforms genuine NASA observations
            into an interactive journey through the sky, time and scientific discovery.
          </p>

          {/* Action Buttons with Clear Visual Hierarchy */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
            <button
              onClick={onScrollToExplorer}
              className="group px-6 py-3.5 rounded-full bg-gradient-to-r from-[#f4a272] to-[#ff7b3d] text-black font-semibold text-sm hover:brightness-110 transition-all cursor-pointer inline-flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(244,162,114,0.3)] hover:shadow-[0_0_35px_rgba(244,162,114,0.5)] hover:-translate-y-0.5"
            >
              <span>Explore the Universe</span>
              <ArrowDown className="w-4 h-4 text-black group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigateToWorkspace(navigate, "/explore", "home")}
              className="group px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#f4a272] text-white text-sm font-medium transition-all cursor-pointer inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 shadow-sm"
            >
              <Compass className="w-4 h-4 text-[#f4a272] group-hover:rotate-45 transition-transform" />
              <span>Explore the Sky</span>
            </button>

            <button
              onClick={() => navigateToWorkspace(navigate, "/time-machine", "home")}
              className="group px-4 py-3.5 rounded-full text-xs font-mono text-white/70 hover:text-white bg-black/40 hover:bg-white/10 border border-white/10 hover:border-white/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
            >
              <Clock className="w-3.5 h-3.5 text-[#f4a272]" />
              <span>Time Machine</span>
            </button>
          </div>

          {/* Mission Specifications Data Stripe */}
          <div className="grid grid-cols-4 gap-3 pt-5 border-t border-white/10 text-[10.5px] font-mono text-white/50 max-w-md">
            <div>
              <b className="text-white block font-medium text-xs mb-0.5">102</b> CHANNELS
            </div>
            <div>
              <b className="text-white block font-medium text-xs mb-0.5">0.75–5.0</b> µm RANGE
            </div>
            <div>
              <b className="text-white block font-medium text-xs mb-0.5">4</b> ALL-SKY SURVEYS
            </div>
            <div>
              <b className="text-white block font-medium text-xs mb-0.5">2 YRS</b> PRIME MISSION
            </div>
          </div>
        </div>

        {/* Right Column: Genuine 3D Spacecraft Floating Freely (Zero Box / Visible Card Container) */}
        <div className="lg:col-span-6 flex items-center justify-center relative w-full h-[460px] sm:h-[520px] lg:h-[600px] pointer-events-auto select-none">
          {/* Subtle atmospheric cosmic back-illumination (No rectangular edges) */}
          <div className="absolute inset-0 bg-radial from-[var(--accent)]/15 via-indigo-600/5 to-transparent pointer-events-none filter blur-3xl -z-10" />

          {/* 3D WebGL Canvas floating freely directly against the galaxy */}
          <Satellite3D yaw={0.4} className="w-full h-full" />

          {/* Minimal, elegant floating label */}
          <div className="absolute bottom-2 right-4 flex items-center gap-2 text-[10.5px] font-mono text-white/40 pointer-events-none tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span>SPHEREx Flight Model · Drag to rotate</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChapterHome;