import React from "react";
import ChapterShowcase from "./ChapterShowcase";
import TimeMachineShowcaseVisual from "./TimeMachineShowcaseVisual";
import { Clock, Play, ArrowRight, Activity, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { travelToWorkspace } from "../../lib/journeyState";

interface ChapterTimeMachineProps {
  onScrollToNext?: () => void;
}

export const ChapterTimeMachine: React.FC<ChapterTimeMachineProps> = ({ onScrollToNext }) => {
  const navigate = useNavigate();

  const actions = (
    <div data-tour="journey-time-machine-action" className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto">
      {/* Centered Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-white/70 w-full">
        <div className="flex flex-col items-center text-center gap-1.5 bg-white/[0.04] p-3 rounded-xl border border-white/10">
          <Calendar className="w-4 h-4 text-[var(--accent)] flex-shrink-0 mb-1" />
          <span>Multi-epoch 6-month survey cadences</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1.5 bg-white/[0.04] p-3 rounded-xl border border-white/10">
          <Activity className="w-4 h-4 text-cyan-400 flex-shrink-0 mb-1" />
          <span>Gaia DR3 proper motion astrometry</span>
        </div>
        <div className="flex flex-col items-center text-center gap-1.5 bg-white/[0.04] p-3 rounded-xl border border-white/10">
          <Play className="w-4 h-4 text-amber-400 flex-shrink-0 mb-1" />
          <span>Time-Lapse, Blink & Split Slider</span>
        </div>
      </div>

      {/* Main Centered Launch Button */}
      <button
        onClick={() => travelToWorkspace(navigate, "/time-machine", "time-machine")}
        className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[#f4a272] to-[#ff7b3d] text-black font-semibold text-base hover:brightness-110 transition-all cursor-pointer inline-flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(244,162,114,0.35)] hover:shadow-[0_0_40px_rgba(244,162,114,0.5)] w-full sm:w-auto hover:-translate-y-0.5"
      >
        <Clock className="w-5 h-5 text-black group-hover:rotate-45 transition-transform" />
        <span>Launch Time Machine</span>
        <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  return (
    <ChapterShowcase
      id="time-machine"
      numberLabel="03 — THROUGH SPACE AND TIME"
      displayTitle="REWIND."
      subtitle="Travel through the changing sky."
      narrative="Stars move. Celestial objects change. By comparing genuine observations from different dates, we can explore a universe that is constantly evolving."
      actions={actions}
      visual={<TimeMachineShowcaseVisual />}
      nextChapterCue={{ id: "labs", label: "LABS", number: "04" }}
      onScrollToNext={onScrollToNext}
    />
  );
};

export default ChapterTimeMachine;