import React from "react";
import ChapterShowcase from "./ChapterShowcase";
import LabsShowcaseVisual from "./LabsShowcaseVisual";
import { FlaskConical, TrendingUp, ArrowRight, BookOpen, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { navigateToWorkspace } from "../../lib/journeyState";

export const ChapterLabs: React.FC = () => {
  const navigate = useNavigate();

  const actions = (
    <div className="flex flex-col gap-3 w-full">
      {/* Action 1: Discovery Lab */}
      <button
        onClick={() => navigateToWorkspace(navigate, "/discovery-lab", "labs")}
        className="group p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer text-left w-full"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-[var(--accent)] transition-colors">
              Enter Discovery Lab
            </div>
            <div className="text-xs text-[var(--mut)]">
              DAOStarFinder detection, 3-panel difference & My Discoveries journal
            </div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
      </button>

      {/* Action 2: Light Curves */}
      <button
        onClick={() => navigateToWorkspace(navigate, "/light-curves", "labs")}
        className="group p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer text-left w-full"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-white group-hover:text-[var(--accent)] transition-colors">
              Explore Light Curves
            </div>
            <div className="text-xs text-[var(--mut)]">
              Multi-epoch photometric variability for Mira pulsators & brown dwarfs
            </div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
      </button>
    </div>
  );

  return (
    <ChapterShowcase
      id="labs"
      numberLabel="04 — THE SCIENCE OF DISCOVERY"
      displayTitle="DISCOVER."
      subtitle="Every change tells a story."
      narrative="Compare observations, investigate differences, and build your own scientific record of the changing universe."
      actions={actions}
      visual={<LabsShowcaseVisual />}
    />
  );
};

export default ChapterLabs;