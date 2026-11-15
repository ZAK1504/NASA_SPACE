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
    <div data-tour="journey-labs-actions" className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
      {/* Action 1: Discovery Lab */}
      <button
        onClick={() => travelToWorkspace(navigate, "/discovery-lab", "labs")}
        className="group p-5 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-[var(--accent)] hover:shadow-[0_0_25px_rgba(244,162,114,0.18)] transition-all flex flex-col items-center justify-center text-center cursor-pointer w-full hover:-translate-y-0.5"
      >
        <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] transition-all shadow-sm mb-3">
          <FlaskConical className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </div>
        <div className="text-sm font-semibold text-white group-hover:text-[var(--accent)] transition-colors mb-1">
          Enter Discovery Lab
        </div>
        <div className="text-xs text-[var(--mut)] mb-3 leading-relaxed">
          DAOStarFinder detection, 3-panel difference & My Discoveries journal
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-white/60 group-hover:text-[var(--accent)] mt-auto">
          <span>Open Lab</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>

      {/* Action 2: Light Curves */}
      <button
        onClick={() => travelToWorkspace(navigate, "/light-curves", "labs")}
        className="group p-5 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-[var(--accent)] hover:shadow-[0_0_25px_rgba(244,162,114,0.18)] transition-all flex flex-col items-center justify-center text-center cursor-pointer w-full hover:-translate-y-0.5"
      >
        <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] transition-all shadow-sm mb-3">
          <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-sm font-semibold text-white group-hover:text-[var(--accent)] transition-colors mb-1">
          Explore Light Curves
        </div>
        <div className="text-xs text-[var(--mut)] mb-3 leading-relaxed">
          Multi-epoch photometric variability for Mira pulsators & brown dwarfs
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-white/60 group-hover:text-[var(--accent)] mt-auto">
          <span>View Curves</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
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