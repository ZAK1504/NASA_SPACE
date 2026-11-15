import React, { useState, useEffect, useRef } from "react";
import ScientificWorkspaceLayout from "../../components/layout/ScientificWorkspaceLayout";
import { Sparkles, RotateCcw, Trophy, Timer } from "lucide-react";

export const TrainingGameWorkspace: React.FC = () => {
  const COLS = 12,
    ROWS = 6,
    TIME = 30;
  const [state, setState] = useState<"idle" | "play" | "over">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [left, setLeft] = useState(TIME);
  const [round, setRound] = useState(0);
  const [miss, setMiss] = useState(-1);
  const grid = useRef({ odd: 0, hue: 30, shift: 40 });

  const next = (sc: number) => {
    const shift = Math.max(12, 46 - sc * 3);
    grid.current = {
      odd: Math.floor(Math.random() * COLS * ROWS),
      hue: Math.floor(Math.random() * 360),
      shift,
    };
    setRound((r) => r + 1);
  };

  const start = () => {
    setScore(0);
    setLeft(TIME);
    setState("play");
    next(0);
  };

  useEffect(() => {
    if (state !== "play") return;
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setState("over");
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [state]);

  useEffect(() => {
    if (state === "over") {
      setBest((b) => Math.max(b, score));
    }
  }, [state, score]);

  const click = (i: number) => {
    if (state !== "play") return;
    if (i === grid.current.odd) {
      setScore(score + 1);
      next(score + 1);
    } else {
      setMiss(i);
      setTimeout(() => setMiss(-1), 280);
      setLeft((l) => Math.max(0, l - 2));
    }
  };

  const g = grid.current;

  return (
    <ScientificWorkspaceLayout
      title="Spectral Training Simulation"
      categoryTag="04 · EDUCATIONAL MODULE"
      defaultChapter="mission"
      workspaceType="mission"
    >
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[var(--accent)] text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EDUCATIONAL TRAINING SIMULATION · NOT SAVED AS SCIENTIFIC DISCOVERY</span>
          </div>
          <h2 className="text-3xl font-light text-white tracking-tight">
            Train your eyes to spot <b className="text-[var(--accent)] font-medium">spectral color oddities</b>
          </h2>
          <p className="text-sm text-[var(--mut)] max-w-xl mx-auto mt-2">
            Spot the one star whose infrared colour is shifted across the detector grid. Real astronomers analyze thousands of candidates — you get 30 seconds.
          </p>
        </div>

        <div data-tour="training-canvas" className="game rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 shadow-2xl">
          <div className="game-top mono flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-sm">
            <span className="flex items-center gap-1.5">
              <span>Score:</span> <b className="text-[var(--accent)] text-base">{score}</b>
            </span>
            <span className="flex items-center gap-1.5 text-white/60">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Personal Best:</span> <b className="text-white">{best}</b>
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Timer className="w-4 h-4" />
              <span>Time Remaining:</span> <b className="text-white text-base">{left}s</b>
            </span>
          </div>

          <div
            className={`game-grid ${state !== "play" ? "dim opacity-30 pointer-events-none" : ""}`}
            key={round}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gap: "8px",
            }}
          >
            {Array.from({ length: COLS * ROWS }, (_, i) => (
              <button
                key={i}
                className={`star aspect-square rounded-full transition-transform hover:scale-125 cursor-pointer ${
                  miss === i ? "ring-2 ring-red-500" : ""
                }`}
                onClick={() => click(i)}
                aria-label="star"
                style={{
                  background: `radial-gradient(circle, hsl(${
                    g.hue + (i === g.odd ? g.shift : 0)
                  } 85% 72%) 0 30%, transparent 70%)`,
                  animationDelay: `${(i % 7) * 90}ms`,
                }}
              />
            ))}
          </div>

          {state !== "play" && (
            <div className="game-over text-center py-12">
              <h3 className="text-xl font-medium text-white mb-2">
                {state === "over"
                  ? `Time! You flagged ${score} spectral anomalies.`
                  : "Spot the star with the odd spectral colour"}
              </h3>
              <p className="text-xs text-[var(--mut)] mb-6 max-w-md mx-auto">
                Educational mini-game training human eyes to recognize subtle infrared wavelength variations across the detector.
              </p>
              <button
                className="btn orange cursor-pointer inline-flex items-center gap-2 shadow-lg"
                onClick={start}
              >
                <span>{state === "over" ? "Train Again" : "Start Simulation"}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </ScientificWorkspaceLayout>
  );
};

export default TrainingGameWorkspace;