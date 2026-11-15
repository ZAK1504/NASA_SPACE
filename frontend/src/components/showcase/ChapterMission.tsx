import React from "react";
import ChapterShowcase from "./ChapterShowcase";
import MissionShowcaseVisual from "./MissionShowcaseVisual";
import { Compass, Gamepad2, ArrowRight, ArrowUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { navigateToWorkspace } from "../../lib/journeyState";

interface ChapterMissionProps {
  onScrollToTop: () => void;
}

export const ChapterMission: React.FC<ChapterMissionProps> = ({ onScrollToTop }) => {
  const navigate = useNavigate();

  const actions = (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Action 1: Guided Missions */}
        <button
          onClick={() => navigateToWorkspace(navigate, "/missions", "mission")}
          className="btn orange cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg py-4 px-6 rounded-2xl flex-1"
        >
          <Compass className="w-5 h-5 text-black" />
          <span className="text-sm font-medium">Begin Your Mission</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Action 2: Mini Game */}
        <button
          onClick={() => navigateToWorkspace(navigate, "/mission/training", "mission")}
          className="p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 text-sm font-mono"
        >
          <Gamepad2 className="w-4 h-4 text-[var(--accent)]" />
          <span>Play Mini Game</span>
        </button>
      </div>

      {/* Final Return Action */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50">
        <span>Completed the Tour?</span>
        <button
          onClick={onScrollToTop}
          className="text-[var(--accent)] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Back to Beginning</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <ChapterShowcase
      id="mission"
      numberLabel="05 — YOUR NEXT DISCOVERY"
      displayTitle="MISSION."
      subtitle="The next discovery could be yours."
      narrative="HORIZON gives students, explorers and citizen scientists the opportunity to investigate genuine astronomical observations and learn how discoveries are made."
      actions={actions}
      visual={<MissionShowcaseVisual />}
    />
  );
};

export default ChapterMission;