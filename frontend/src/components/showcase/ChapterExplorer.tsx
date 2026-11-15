import React, { useState } from "react";
import ChapterShowcase from "./ChapterShowcase";
import ExplorerShowcaseVisual from "./ExplorerShowcaseVisual";
import { Compass, Eye, Layers, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { navigateToWorkspace } from "../../lib/journeyState";

interface ChapterExplorerProps {
  onScrollToNext?: () => void;
}

export const ChapterExplorer: React.FC<ChapterExplorerProps> = ({ onScrollToNext }) => {
  const navigate = useNavigate();
  const [hoveredMode, setHoveredMode] = useState<"sky" | "object" | "spectral" | null>(null);

  const handleOpenWorkspace = (key: "sky" | "object" | "spectral") => {
    if (key === "sky") navigateToWorkspace(navigate, "/explore", "explorer");
    else if (key === "object") navigateToWorkspace(navigate, "/objects", "explorer");
    else if (key === "spectral") navigateToWorkspace(navigate, "/spectra", "explorer");
  };

  const actions = (
    <div className="flex flex-col gap-3 w-full">
      {/* Action 1: Sky Explorer */}
      <button
        onClick={() => handleOpenWorkspace("sky")}
        onMouseEnter={() => setHoveredMode("sky")}
        onFocus={() => setHoveredMode("sky")}
        onMouseLeave={() => setHoveredMode(null)}
        onBlur={() => setHoveredMode(null)}
        className="group p-4 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-[var(--accent)] hover:shadow-[0_0_25px_rgba(244,162,114,0.18)] transition-all flex items-center justify-between cursor-pointer text-left w-full hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] transition-all shadow-sm">
            <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white group-hover:text-[var(--accent)] transition-colors">
              Explore the Sky
            </div>
            <div className="text-xs text-[var(--mut)]">All-sky celestial sphere with Aladin Lite</div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
      </button>

      {/* Action 2: Object Explorer */}
      <button
        onClick={() => handleOpenWorkspace("object")}
        onMouseEnter={() => setHoveredMode("object")}
        onFocus={() => setHoveredMode("object")}
        onMouseLeave={() => setHoveredMode(null)}
        onBlur={() => setHoveredMode(null)}
        className="group p-4 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-[var(--accent)] hover:shadow-[0_0_25px_rgba(244,162,114,0.18)] transition-all flex items-center justify-between cursor-pointer text-left w-full hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] transition-all shadow-sm">
            <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white group-hover:text-[var(--accent)] transition-colors">
              Explore Objects
            </div>
            <div className="text-xs text-[var(--mut)]">Stars, brown dwarfs and Gaia proper motion vectors</div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
      </button>

      {/* Action 3: Spectral Explorer */}
      <button
        onClick={() => handleOpenWorkspace("spectral")}
        onMouseEnter={() => setHoveredMode("spectral")}
        onFocus={() => setHoveredMode("spectral")}
        onMouseLeave={() => setHoveredMode(null)}
        onBlur={() => setHoveredMode(null)}
        className="group p-4 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-[var(--accent)] hover:shadow-[0_0_25px_rgba(244,162,114,0.18)] transition-all flex items-center justify-between cursor-pointer text-left w-full hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] transition-all shadow-sm">
            <Layers className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white group-hover:text-[var(--accent)] transition-colors">
              Explore the Spectrum
            </div>
            <div className="text-xs text-[var(--mut)]">102 channels, molecular markers & spectrum extraction</div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
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