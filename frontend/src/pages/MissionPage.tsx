import React, { useState, useEffect, useRef } from 'react';
import { Stage } from '../components/ui/Stage';
import { ClockCard, StatCard } from '../components/ui/Glass';
import { Satellite3D } from '../components/ui/Satellite3D';
import { pageById } from '../types/site';
import { Missions } from './Missions';

const page = pageById('mission')!;

const FACTS = [
  ['Colours', '102', 'infrared channels'],
  ['Range', '0.75–5.0 µm', 'near-infrared'],
  ['Surveys', '4', 'whole-sky passes'],
  ['Duration', '2 years', 'prime mission'],
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
            className="btn orange"
            onClick={() => {
              const el = document.getElementById('game');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Start training simulation <span>↗</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* Built-in educational mini game: find the star whose colour is off */
function MiniGame() {
  const COLS = 12, ROWS = 6, TIME = 30;
  const [state, setState] = useState<'idle' | 'play' | 'over'>('idle');
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
    setState('play');
    next(0);
  };

  useEffect(() => {
    if (state !== 'play') return;
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setState('over');
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [state]);

  useEffect(() => {
    if (state === 'over') {
      setBest((b) => Math.max(b, score));
    }
  }, [state, score]);

  const click = (i: number) => {
    if (state !== 'play') return;
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
    <div className="game">
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
              className={`star ${miss === i ? 'miss' : ''}`}
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
          {state !== 'play' && (
            <div className="game-over">
              <h3>{state === 'over' ? `Time! You found ${score} anomalies.` : 'Spot the star with the odd spectral colour'}</h3>
              <p className="text-xs text-[#9E9AA7] mb-4">
                Educational mini-game training human eyes to recognize subtle infrared wavelength variations.
              </p>
              <button className="btn white" onClick={start}>
                {state === 'over' ? 'Play again' : 'Start training'} <span>↗</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const MissionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'guided'>('overview');

  const cards = (
    <>
      <ClockCard />
      <StatCard label="Colours" value="102" />
      <StatCard label="Survey passes" value="4" />
    </>
  );

  return (
    <Stage
      page={page}
      bg={{ kind: 'nebula', seed: 41 }}
      title={['Meet the', { b: 'observatory' }, 'mapping it all.']}
      icon="mission"
      blurb="SPHEREx is a NASA space telescope photographing the whole sky in 102 infrared colours — creating a legacy map of where cosmic ices, galaxies and stars live."
      cards={cards}
    >
      <div className="w-full space-y-12">
        {/* Sub-navigation pill between 3D Observatory & Guided Scientific Missions */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2 text-xs font-mono rounded-full transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-[#ff7b3d] to-[#f4a272] text-black font-semibold shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Observatory & Simulation
            </button>
            <button
              onClick={() => setActiveTab('guided')}
              className={`px-5 py-2 text-xs font-mono rounded-full transition-all cursor-pointer ${
                activeTab === 'guided'
                  ? 'bg-gradient-to-r from-[#ff7b3d] to-[#f4a272] text-black font-semibold shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Guided Science Missions
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <>
            <Overview />

            <div id="game" className="game-sec mt-12">
              <h2 className="sec-h">
                Now <b>train your eyes</b> for discovery.
              </h2>
              <p className="sec-p">
                Spot the one star whose infrared colour is shifted. Real astronomers analyze thousands of candidates — you get 30 seconds.
              </p>
              <MiniGame />
            </div>
          </>
        ) : (
          <div className="max-w-6xl mx-auto">
            <Missions />
          </div>
        )}
      </div>
    </Stage>
  );
};

export default MissionPage;
