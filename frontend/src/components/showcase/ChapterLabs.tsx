import React from "react";
import ChapterShowcase from "./ChapterShowcase";
import LabsShowcaseVisual from "./LabsShowcaseVisual";
import { FlaskConical, TrendingUp, ArrowRight, BookOpen, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { travelToWorkspace } from "../../lib/journeyState";

interface ChapterLabsProps {
  onScrollToNext?: () => void;
}

export const ChapterLabs: React.FC<ChapterLabsProps> = ({ onScrollToNext }) => {
  const navigate = useNavigate();

  const actions = (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Action 1: Discovery Lab */}
      <button
        onClick={() => travelToWorkspace(navigate, "/discovery-lab", "labs")}
        className="group p-4 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-[var(--accent)] hover:shadow-[0_0_25px_rgba(244,162,114,0.18)] transition-all flex items-center justify-between cursor-pointer text-left w-full hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] transition-all shadow-sm">
            <FlaskConical className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white group-hover:text-[var(--accent)] transition-colors">
              Enter Discovery Lab
            </div>
            <div className="text-xs text-[var(--mut)]">
              DAOStarFinder detection, 3-panel difference & My Discoveries journal
            </div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
      </button>

      {/* Action 2: Light Curves */}
      <button
        onClick={() => travelToWorkspace(navigate, "/light-curves", "labs")}
        className="group p-4 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-[var(--accent)] hover:shadow-[0_0_25px_rgba(244,162,114,0.18)] transition-all flex items-center justify-between cursor-pointer text-left w-full hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] transition-all shadow-sm">
            <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white group-hover:text-[var(--accent)] transition-colors">
              Explore Light Curves
            </div>
            <div className="text-xs text-[var(--mut)]">
              Multi-epoch photometric variability for Mira pulsators & brown dwarfs
            </div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
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
      nextChapterCue={{ id: "mission", label: "MISSION", number: "05" }}
      onScrollToNext={onScrollToNext}
    />
  );
};

export default ChapterLabs;