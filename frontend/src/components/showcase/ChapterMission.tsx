import React from "react";
import ChapterShowcase from "./ChapterShowcase";
import MissionShowcaseVisual from "./MissionShowcaseVisual";
import { Compass, Gamepad2, ArrowRight, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { travelToWorkspace } from "../../lib/journeyState";

interface ChapterMissionProps {
  onScrollToTop?: () => void;
  onScrollToNext?: () => void;
}

export const ChapterMission: React.FC<ChapterMissionProps> = ({ onScrollToTop, onScrollToNext }) => {
  const navigate = useNavigate();

  const actions = (
    <div data-tour="journey-mission-actions" className="flex flex-col gap-3.5 w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Action 1: Guided Missions */}
        <button
          onClick={() => travelToWorkspace(navigate, "/missions", "mission")}
          className="group h-12 px-5 rounded-2xl bg-gradient-to-r from-[#f4a272] to-[#ff7b3d] text-black font-semibold text-sm hover:brightness-110 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(244,162,114,0.3)] hover:shadow-[0_0_35px_rgba(244,162,114,0.5)] flex-1 hover:-translate-y-0.5"
        >
          <Compass className="w-4 h-4 text-black group-hover:rotate-45 transition-transform" />
          <span>Begin Your Mission</span>
          <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Action 2: Play Game (Training Simulation) */}
        <button
          onClick={() => travelToWorkspace(navigate, "/mission/training", "mission")}
          className="group h-12 px-5 rounded-2xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.15] hover:border-[var(--accent)] text-white font-semibold text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer flex-1 hover:-translate-y-0.5 shadow-sm"
        >
          <Gamepad2 className="w-4 h-4 text-[var(--accent)] group-hover:scale-110 transition-transform" />
          <span>Play Game</span>
          <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Downward Transition to Chapter 06: About */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50">
        <span>Chapter 05 of 06 · Discovery Begins</span>
        {onScrollToNext && (
          <button
            onClick={onScrollToNext}
            className="text-[var(--accent)] hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors group"
          >
            <span>Meet the Team Below</span>
            <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        )}
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
