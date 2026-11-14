import React from 'react';
import { Stage } from '../components/ui/Stage';
import { ClockCard, StatCard } from '../components/ui/Glass';
import { pageById } from '../types/site';
import { TimeMachine } from './TimeMachine';

const page = pageById('time')!;

export const TimePage: React.FC = () => {
  const cards = (
    <>
      <ClockCard />
      <StatCard label="Survey pass" value="2" unit=" / 4" />
      <StatCard label="Multi-epoch targets" value="5" />
    </>
  );

  return (
    <Stage
      page={page}
      bg={{ kind: 'galaxy', seed: 14, hue: 0 }}
      title={['Watch the sky', { b: 'change' }, 'over two years.']}
      icon="time"
      blurb="SPHEREx surveys the entire celestial sphere every six months. Compare multi-epoch observations across time to discover high-proper-motion stars, moving asteroids, and variable transients."
      cards={cards}
    >
      <div className="w-full">
        <TimeMachine />
      </div>
    </Stage>
  );
};

export default TimePage;
