import React from "react";
import Satellite3D from "../ui/Satellite3D";
import { ArrowDown, Compass, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { travelToWorkspace } from "../../lib/journeyState";

interface ChapterHomeProps {
  onScrollToExplorer: () => void;
}

export const ChapterHome: React.FC<ChapterHomeProps> = ({ onScrollToExplorer }) => {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      data-tour="home-hero"
      className="chapter-home w-full min-h-[calc(100vh-70px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col justify-center relative z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full my-auto">
        {/* Left Column: Numbered Label, Massive Typography, Mission Narrative, CTAs */}
        <div
          data-tour="journey-hero"
          className="lg:col-span-6 flex flex-col justify-center"
          style={{
            transform: `translateY(calc(var(--hero-scroll, 0) * -45px))`,
            opacity: `calc(1 - var(--hero-scroll, 0) * 1.25)`,
            willChange: "transform, opacity",
            transition: "none",
          }}
        >
          {/* Chapter Number & Tag */}
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
              01 — THE BEGINNING
            </p>
          </div>

          {/* Massive Display Title */}
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-extralight tracking-tighter text-white uppercase leading-none mb-3">
            SPHEREx<b className="text-[var(--accent)] font-normal">.</b>
          </h1>

          {/* Subtitle */}
          <h2 className="text-xl sm:text-2xl font-light text-[var(--ink)] tracking-tight mb-3">
            The universe doesn't stand still.
          </h2>

          {/* Narrative */}
          <p className="text-xs sm:text-sm text-[var(--mut)] leading-relaxed mb-6 max-w-lg">
            SPHEREx observes the universe through infrared light. HORIZON transforms genuine NASA observations
            into an interactive journey through the sky, time and scientific discovery.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <button
              onClick={onScrollToExplorer}
              className="group px-6 py-3 rounded-full bg-gradient-to-r from-[#f4a272] to-[#ff7b3d] text-black font-semibold text-sm hover:brightness-110 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(244,162,114,0.3)] hover:shadow-[0_0_35px_rgba(244,162,114,0.5)] hover:-translate-y-0.5"
            >
              <span>Explore the Universe</span>
              <ArrowDown className="w-4 h-4 text-black group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={() => travelToWorkspace(navigate, "/explore", "home")}
              className="group px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#f4a272] text-white text-sm font-medium transition-all cursor-pointer inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 shadow-sm"
            >
              <Compass className="w-4 h-4 text-[#f4a272] group-hover:rotate-45 transition-transform" />
              <span>Explore the Sky</span>
            </button>

            <button
              onClick={() => travelToWorkspace(navigate, "/time-machine", "home")}
              className="group px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#f4a272] text-white text-sm font-medium transition-all cursor-pointer inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 shadow-sm"
            >
              <Clock className="w-4 h-4 text-[#f4a272] group-hover:rotate-45 transition-transform" />
              <span>Time Machine</span>
            </button>
          </div>

          {/* Mission Specifications Data Stripe */}
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-white/10 text-[10.5px] font-mono text-white/50 max-w-md">
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

        {/* Right Column: Genuine 3D Spacecraft Floating Freely */}
        <div
          data-tour="journey-spacecraft"
          className="lg:col-span-6 flex items-center justify-center relative w-full h-[380px] sm:h-[440px] lg:h-[480px] pointer-events-auto select-none"
          style={{
            transform: `translateX(calc(var(--hero-scroll, 0) * 40px)) translateY(calc(var(--hero-scroll, 0) * 25px)) scale(calc(1 - var(--hero-scroll, 0) * 0.1))`,
            opacity: `calc(1 - var(--hero-scroll, 0) * 0.7)`,
            willChange: "transform, opacity",
            transition: "none",
          }}
        >
          {/* Subtle atmospheric cosmic back-illumination */}
          <div className="absolute inset-0 bg-radial from-[var(--accent)]/15 via-indigo-600/5 to-transparent pointer-events-none filter blur-3xl -z-10" />

          {/* 3D WebGL Canvas floating freely directly against the galaxy */}
          <Satellite3D yaw={0.4} className="w-full h-full" />

          {/* Minimal, elegant floating label */}
          <div className="absolute bottom-4 right-6 flex items-center gap-2 text-[10.5px] font-mono text-white/45 pointer-events-none tracking-wider uppercase bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span>SPHEREx Flight Model · Drag to rotate</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChapterHome;
