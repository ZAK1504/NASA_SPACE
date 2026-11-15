import React, { useState, useEffect, useRef } from "react";
import { ClockCard, StatCard } from "../ui/Glass";
import Icon from "../ui/Icon";
import Satellite3D from "../ui/Satellite3D";
import { Missions } from "../../pages/Missions";
import { ArrowUp, Compass, Clock, RotateCcw } from "lucide-react";

interface MissionSectionProps {
  onBackToTop?: () => void;
  onBackToExplorer?: () => void;
  onBackToTimeMachine?: () => void;
  isSectionActive?: boolean;
}

const FACTS = [
  ["Colours", "102", "infrared channels"],
  ["Range", "0.75–5.0 µm", "near-infrared"],
  ["Surveys", "4", "whole-sky passes"],
  ["Duration", "2 years", "prime mission"],
];

function Overview() {
  return (
    <div className="over">
      <div className="glass over-sat">
        <Satellite3D yaw={0.6} />
        <span className="map-note mono">3D spacecraft model · drag to rotate</span>
      </div>
      <div className="over-side">
        <div className="over-facts">
          {FACTS.map(([k, v, s]) => (
            <div className="glass fact-card" key={k}>
              <small className="mono">{k}</small>
              <b>{v}</b>
              <em className="mono">{s}</em>
            </div>
          ))}
        </div>
        <div className="glass over-cta">
          <p>Ready to put your eyes to work? Train your eyes to spot spectral anomalies across the sky.</p>
          <button
            className="btn orange cursor-pointer"
            onClick={() => {
              const el = document.getElementById("game");
              if (el) {
                if (window.__lenis) {
                  window.__lenis.scrollTo(el, { offset: -70, duration: 1.2 });
                } else {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }
            }}
          >
            Start training simulation <span>↓</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* Built-in educational mini game: find the star whose colour is off */
function MiniGame() {
  const COLS = 12, ROWS = 6, TIME = 30;
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
    <div className="game" data-lenis-prevent>
      <div className="glass game-box">
        <div className="game-top mono">
          <span>Score <b>{score}</b></span>
          <span>Best <b>{best}</b></span>
          <span>Time <b>{left}s</b></span>
        </div>
        <div
          className={`game-grid ${state !== "play" ? "dim" : ""}`}
          key={round}
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {Array.from({ length: COLS * ROWS }, (_, i) => (
            <button
              key={i}
              className={`star ${miss === i ? "miss" : ""}`}
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
          {state !== "play" && (
            <div className="game-over">
              <h3>{state === "over" ? `Time! You found ${score} anomalies.` : "Spot the star with the odd spectral colour"}</h3>
              <p className="text-xs text-[#9E9AA7] mb-4">
                Educational mini-game training human eyes to recognize subtle infrared wavelength variations.
              </p>
              <button className="btn white cursor-pointer" onClick={start}>
                {state === "over" ? "Play again" : "Start training"} <span>↗</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const MissionSection: React.FC<MissionSectionProps> = ({
  onBackToTop,
  onBackToExplorer,
  onBackToTimeMachine,
  isSectionActive = true,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "guided">("overview");

  return (
    <section id="mission" className="w-full relative py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <header className="stage-head mb-6">
        <div className="sh-l">
          <p className="mono tag">[04 · OBSERVATORY & MISSIONS]</p>
          <h2 className="text-3xl md:text-5xl font-light text-[var(--ink)] tracking-tight mt-1">
            Meet the <b className="text-[var(--accent)] font-semibold">observatory</b> mapping it all.
          </h2>
          <div className="blurb mt-3">
            <span className="ic">
              <Icon name="mission" />
            </span>
            <p className="text-sm md:text-base text-[var(--mut)] max-w-2xl leading-relaxed">
              SPHEREx is a NASA space telescope photographing the whole sky in 102 infrared colours — creating
              a legacy map of where cosmic ices, galaxies and stars live.
            </p>
          </div>
        </div>

        <div className="sh-r flex items-center gap-3">
          <ClockCard />
          <StatCard label="Colours" value="102" />
          <StatCard label="Survey passes" value="4" />
        </div>
      </header>

      {/* Hairline Divider (Zero Curly Waves) */}
      <div className="w-full my-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Sub-navigation pill between 3D Observatory & Guided Scientific Missions */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2 text-xs font-mono rounded-full transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-[#ff7b3d] to-[#f4a272] text-black font-semibold shadow-lg"
                : "text-white/70 hover:text-white"
            }`}
          >
            Observatory & Training Simulation
          </button>
          <button
            onClick={() => setActiveTab("guided")}
            className={`px-5 py-2 text-xs font-mono rounded-full transition-all cursor-pointer ${
              activeTab === "guided"
                ? "bg-gradient-to-r from-[#ff7b3d] to-[#f4a272] text-black font-semibold shadow-lg"
                : "text-white/70 hover:text-white"
            }`}
          >
            Guided Science Missions
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="w-full">
        {activeTab === "overview" ? (
          <div className="space-y-12">
            <Overview />

            <div id="game" className="game-sec mt-12">
              <h3 className="sec-h">
                Now <b>train your eyes</b> for discovery.
              </h3>
              <p className="sec-p">
                Spot the one star whose infrared colour is shifted. Real astronomers analyze thousands of
                candidates — you get 30 seconds.
              </p>
              <MiniGame />
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto" data-lenis-prevent>
            <Missions />
          </div>
        )}
      </div>

      {/* Section End Actions: Satisfying conclusion & Navigation back to prior sections */}
      <div className="mt-16 pt-10 border-t border-white/10 flex flex-col items-center justify-center text-center">
        <p className="mono tag mb-3">[End of Continuous Survey]</p>
        <h4 className="text-xl md:text-2xl font-light text-white mb-6">
          Ready to make your next <b className="text-[var(--accent)]">discovery</b>?
        </h4>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              if (onBackToTop) {
                onBackToTop();
              } else {
                const el = document.getElementById("home");
                if (el) {
                  if (window.__lenis) {
                    window.__lenis.scrollTo(el, { offset: 0, duration: 1.5 });
                  } else {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }
            }}
            className="btn white flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Return to Top</span>
          </button>

          <button
            onClick={() => {
              if (onBackToExplorer) {
                onBackToExplorer();
              } else {
                const el = document.getElementById("explorer");
                if (el) {
                  if (window.__lenis) {
                    window.__lenis.scrollTo(el, { offset: -70, duration: 1.3 });
                  } else {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }
            }}
            className="px-4 py-2 rounded-full border border-white/20 text-xs font-mono text-white/80 hover:text-white hover:border-white/40 flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Explorer</span>
          </button>

          <button
            onClick={() => {
              if (onBackToTimeMachine) {
                onBackToTimeMachine();
              } else {
                const el = document.getElementById("time-machine");
                if (el) {
                  if (window.__lenis) {
                    window.__lenis.scrollTo(el, { offset: -70, duration: 1.3 });
                  } else {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }
              }
            }}
            className="px-4 py-2 rounded-full border border-white/20 text-xs font-mono text-white/80 hover:text-white hover:border-white/40 flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Time Machine</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
