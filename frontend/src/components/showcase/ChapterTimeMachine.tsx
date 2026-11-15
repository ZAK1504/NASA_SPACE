import React from "react";
import ChapterShowcase from "./ChapterShowcase";
import TimeMachineShowcaseVisual from "./TimeMachineShowcaseVisual";
import { Clock, Play, ArrowRight, Activity, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { navigateToWorkspace } from "../../lib/journeyState";

export const ChapterTimeMachine: React.FC = () => {
  const navigate = useNavigate();

  const actions = (
    <div className="flex flex-col gap-4 w-full">
      {/* Feature Bullet List */}
      <div className="space-y-2 text-xs font-mono text-white/70">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Compare multi-epoch observations across 6-month survey cadences</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Gaia DR3 proper motion astrometry & displacement tracking</span>
        </div>
        <div className="flex items-center gap-2">
          <Play className="w-3.5 h-3.5 text-amber-400" />
          <span>Time-Lapse Movie, Side-by-Side, Split Slider & Blink Mode</span>
        </div>
      </div>

      {/* Main Launch Button */}
      <button
        onClick={() => navigateToWorkspace(navigate, "/time-machine", "time-machine")}
        className="btn orange cursor-pointer inline-flex items-center justify-between gap-3 shadow-lg hover:shadow-orange-500/25 py-4 px-6 rounded-2xl w-full"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-black" />
          <span className="text-base font-medium">Launch Time Machine</span>
        </div>
        <ArrowRight className="w-5 h-5" />
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
    />
  );
};

export default ChapterTimeMachine;