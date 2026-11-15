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
      className="pointer-events-none select-none w-full relative overflow-hidden"
      style={{
        minHeight: '20vh',
        background:
          'linear-gradient(to bottom, rgba(220,150,60,0.05) 0%, transparent 45%, rgba(60,50,200,0.08) 100%)',
      }}
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
// Warm amber to charcoal. Scan-line freeze-frame aesthetic.
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
      className="pointer-events-none select-none w-full relative overflow-hidden"
      style={{
        minHeight: '18vh',
        background:
          'linear-gradient(to bottom, rgba(200,100,20,0.07) 0%, rgba(10,10,10,0.95) 60%, rgba(20,18,22,1) 100%)',
      }}
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
// Charcoal to midnight blue. Golden horizon sunrise glow.
// ------------------------------------------------------------
export const LabsToMissionTransition: React.FC = () => (
  <div
    aria-hidden="true"
    className="labs-to-mission-transition pointer-events-none select-none w-full"
    style={{ minHeight: '20vh' }}
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
