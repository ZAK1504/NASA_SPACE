import React from "react";
import ChapterShowcase from "./ChapterShowcase";
import ExplorerShowcaseVisual from "./ExplorerShowcaseVisual";
import { Compass, Eye, Layers, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { navigateToWorkspace } from "../../lib/journeyState";

export const ChapterExplorer: React.FC = () => {
  const navigate = useNavigate();

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
        className="group p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer text-left w-full"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-[var(--accent)] transition-colors">
              Explore the Sky
            </div>
            <div className="text-xs text-[var(--mut)]">All-sky celestial sphere with Aladin Lite</div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
      </button>

      {/* Action 2: Object Explorer */}
      <button
        onClick={() => handleOpenWorkspace("object")}
        className="group p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer text-left w-full"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-[var(--accent)] transition-colors">
              Explore Objects
            </div>
            <div className="text-xs text-[var(--mut)]">Stars, brown dwarfs and Gaia proper motion vectors</div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
      </button>

      {/* Action 3: Spectral Explorer */}
      <button
        onClick={() => handleOpenWorkspace("spectral")}
        className="group p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer text-left w-full"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-[var(--accent)] transition-colors">
              Explore the Spectrum
            </div>
            <div className="text-xs text-[var(--mut)]">102 channels, molecular markers & spectrum extraction</div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
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
      visual={<ExplorerShowcaseVisual onSelectAction={handleOpenWorkspace} />}
    />
  );
};

export default ChapterExplorer;