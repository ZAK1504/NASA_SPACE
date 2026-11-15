import React, { useState } from "react";
import ChapterShowcase from "./ChapterShowcase";
import ExplorerShowcaseVisual from "./ExplorerShowcaseVisual";
import { Compass, Eye, Layers, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { travelToWorkspace } from "../../lib/journeyState";

interface ChapterExplorerProps {
  onScrollToNext?: () => void;
}

export const ChapterExplorer: React.FC<ChapterExplorerProps> = ({ onScrollToNext }) => {
  const navigate = useNavigate();
  const [hoveredMode, setHoveredMode] = useState<"sky" | "object" | "spectral" | null>(null);

  const handleOpenWorkspace = (key: "sky" | "object" | "spectral") => {
    if (key === "sky") travelToWorkspace(navigate, "/explore", "explorer");
    else if (key === "object") travelToWorkspace(navigate, "/objects", "explorer");
    else if (key === "spectral") travelToWorkspace(navigate, "/spectra", "explorer");
  };

  const actions = (
    <div data-tour="journey-explorer-actions" className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full max-w-4xl mx-auto">
      {/* Action 1: Sky Explorer */}
      <button
        onClick={() => handleOpenWorkspace("sky")}
        onMouseEnter={() => setHoveredMode("sky")}
        onFocus={() => setHoveredMode("sky")}
        onMouseLeave={() => setHoveredMode(null)}
        onBlur={() => setHoveredMode(null)}
        className="group p-4 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-[var(--accent)] hover:shadow-[0_0_25px_rgba(244,162,114,0.18)] transition-all flex flex-col items-center justify-center text-center cursor-pointer w-full hover:-translate-y-0.5"
      >
        <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] transition-all shadow-sm mb-3">
          <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        </div>
        <div className="text-sm font-semibold text-white group-hover:text-[var(--accent)] transition-colors mb-1">
          Explore the Sky
        </div>
        <div className="text-xs text-[var(--mut)] mb-3 leading-relaxed">
          All-sky celestial sphere with Aladin Lite
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-white/60 group-hover:text-[var(--accent)] mt-auto">
          <span>Launch</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* Action 2: Object Explorer */}
      <button
        onClick={() => handleOpenWorkspace("object")}
        onMouseEnter={() => setHoveredMode("object")}
        onFocus={() => setHoveredMode("object")}
        onMouseLeave={() => setHoveredMode(null)}
        onBlur={() => setHoveredMode(null)}
        className="group p-4 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-[var(--accent)] hover:shadow-[0_0_25px_rgba(244,162,114,0.18)] transition-all flex flex-col items-center justify-center text-center cursor-pointer w-full hover:-translate-y-0.5"
      >
        <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] transition-all shadow-sm mb-3">
          <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-sm font-semibold text-white group-hover:text-[var(--accent)] transition-colors mb-1">
          Explore Objects
        </div>
        <div className="text-xs text-[var(--mut)] mb-3 leading-relaxed">
          Stars, brown dwarfs & Gaia proper motion
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-white/60 group-hover:text-[var(--accent)] mt-auto">
          <span>Inspect</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* Action 3: Spectral Explorer */}
      <button
        onClick={() => handleOpenWorkspace("spectral")}
        onMouseEnter={() => setHoveredMode("spectral")}
        onFocus={() => setHoveredMode("spectral")}
        onMouseLeave={() => setHoveredMode(null)}
        onBlur={() => setHoveredMode(null)}
        className="group p-4 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-[var(--accent)] hover:shadow-[0_0_25px_rgba(244,162,114,0.18)] transition-all flex flex-col items-center justify-center text-center cursor-pointer w-full hover:-translate-y-0.5"
      >
        <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] transition-all shadow-sm mb-3">
          <Layers className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </div>
        <div className="text-sm font-semibold text-white group-hover:text-[var(--accent)] transition-colors mb-1">
          Explore the Spectrum
        </div>
        <div className="text-xs text-[var(--mut)] mb-3 leading-relaxed">
          102 bands & molecular water/ice markers
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-white/60 group-hover:text-[var(--accent)] mt-auto">
          <span>Analyze</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    </div>
  );

  return (
    <ChapterShowcase
      id="explorer"
      dataTour="home-amazing"
      numberLabel="02 — BEYOND THE VISIBLE"
      displayTitle="EXPLORE."
      subtitle="See beyond the visible."
      narrative="The night sky looks familiar to our eyes. But infrared light reveals an entirely different universe. Explore the sky, investigate celestial objects and discover how the universe changes across wavelengths."
      actions={actions}
      visual={<ExplorerShowcaseVisual activeMode={hoveredMode || "sky"} />}
      nextChapterCue={{ id: "time-machine", label: "TIME MACHINE", number: "03" }}
      onScrollToNext={onScrollToNext}
    />
  );
};

export default ChapterExplorer;