import React from 'react';

export interface ChapterTransitionProps {
  from: 'home' | 'explorer' | 'time-machine' | 'labs';
  to: 'explorer' | 'time-machine' | 'labs' | 'mission';
}

// ------------------------------------------------------------
// TRANSITION 1 — HOME → EXPLORER: "Into the Infrared"
// Warm amber glow fades to cool indigo. Particle dots drift up.
// ------------------------------------------------------------
export const HomeToExplorerTransition: React.FC = () => {
  // Stagger the particles across the width
  const particles = [
    { left: '12%', delay: '0s', dur: '4s' },
    { left: '28%', delay: '1.1s', dur: '4.6s' },
    { left: '44%', delay: '0.4s', dur: '3.8s' },
    { left: '62%', delay: '2.0s', dur: '5.1s' },
    { left: '78%', delay: '0.7s', dur: '4.3s' },
    { left: '90%', delay: '1.6s', dur: '3.5s' },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none w-full relative overflow-hidden h-20 my-2"
      style={{ background: 'transparent' }}
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="drift-particle"
          style={{
            left: p.left,
            bottom: '20%',
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}
    </div>
  );
};

// ------------------------------------------------------------
// TRANSITION 3 — TIME MACHINE → LABS: "Deceleration"
// Warm amber to charcoal. Scan-line freeze-frame aesthetic on transparent canvas.
// ------------------------------------------------------------
export const TimeMachineToLabsTransition: React.FC = () => {
  const lines = [
    { top: '30%', delay: '0s' },
    { top: '52%', delay: '0.7s' },
    { top: '74%', delay: '1.4s' },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none w-full relative overflow-hidden h-20 my-2"
      style={{ background: 'transparent' }}
    >
      {lines.map((l, i) => (
        <span
          key={i}
          className="scan-line"
          style={{
            top: l.top,
            animationDelay: l.delay,
          }}
        />
      ))}
    </div>
  );
};

// ------------------------------------------------------------
// TRANSITION 4 — LABS → MISSION: "Expanding Atlas"
// Transparent horizon glow revealing celestial depth.
// ------------------------------------------------------------
export const LabsToMissionTransition: React.FC = () => (
  <div
    aria-hidden="true"
    className="labs-to-mission-transition pointer-events-none select-none w-full h-24 my-2"
    style={{ background: 'transparent' }}
  />
);

// ------------------------------------------------------------
// Generic ChapterTransition dispatcher
// ------------------------------------------------------------
export const ChapterTransition: React.FC<ChapterTransitionProps> = ({ from, to }) => {
  if (from === 'home' && to === 'explorer') return <HomeToExplorerTransition />;
  if (from === 'time-machine' && to === 'labs') return <TimeMachineToLabsTransition />;
  if (from === 'labs' && to === 'mission') return <LabsToMissionTransition />;
  return null;
};

export default ChapterTransition;
