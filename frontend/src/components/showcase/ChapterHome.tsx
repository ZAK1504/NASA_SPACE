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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
            <button
              onClick={onScrollToExplorer}
              className="btn orange cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/25"
            >
              <span>Explore the Universe</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigateToWorkspace(navigate, "/explore", "home")}
              className="btn white cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg"
            >
              <Compass className="w-4 h-4 text-black" />
              <span>Explore the Sky</span>
            </button>

            <button
              onClick={() => navigateToWorkspace(navigate, "/time-machine", "home")}
              className="px-5 py-3 rounded-full text-xs font-mono text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Launch Time Machine</span>
            </button>
          </div>

          {/* Mission Specifications Data Stripe */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/10 text-[10.5px] font-mono text-white/50 max-w-md">
            <div>
              <b className="text-white block font-medium text-xs">102</b> CHANNELS
            </div>
            <div>
              <b className="text-white block font-medium text-xs">0.75–5.0</b> µm RANGE
            </div>
            <div>
              <b className="text-white block font-medium text-xs">4</b> SURVEYS
            </div>
            <div>
              <b className="text-white block font-medium text-xs">2 YRS</b> PRIME
            </div>
          </div>
        </div>

        {/* Right Column: Genuine 3D Spacecraft Interactive Model */}
        <div className="lg:col-span-6 flex items-center justify-center relative w-full h-[420px] sm:h-[480px] lg:h-[540px]">
          <div className="w-full h-full relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl flex items-center justify-center">
            {/* Ambient spacecraft illumination */}
            <div className="absolute inset-0 bg-radial from-orange-500/10 via-transparent to-transparent pointer-events-none" />

            <Satellite3D yaw={0.4} />

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10.5px] font-mono text-white/40 pointer-events-none">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SPHEREx Flight Model · Drag to Rotate</span>
              </span>
              <span>102 Near-IR Channels</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChapterHome;