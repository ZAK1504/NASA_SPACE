import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Stage } from '../components/ui/Stage';
import { ClockCard, StatCard } from '../components/ui/Glass';
import { pageById } from '../types/site';
import { DiscoveryLab } from './DiscoveryLab';
import { LightCurves } from './LightCurves';
import { MyDiscoveries } from './MyDiscoveries';

const page = pageById('lab')!;

const COPY: Record<string, {
  bg: { kind: 'nebula' | 'galaxy' | 'band'; seed: number; hue?: number };
  title: (string | { b: string })[];
  icon: string;
  blurb: string;
}> = {
  discovery: {
    bg: { kind: 'nebula', seed: 31 },
    icon: 'discovery',
    title: ['This is where', { b: 'discovery' }, 'begins.'],
    blurb: 'Candidates the pipeline flagged as odd. Run DAOStarFinder point-source detection, perform image difference subtraction, and save discoveries to your research journal.',
  },
  'light-curves': {
    bg: { kind: 'band', seed: 4 },
    icon: 'curve',
    title: ['Fold time into a', { b: 'pattern' }, '.'],
    blurb: 'A star that pulses looks messy over time. Analyze multi-epoch photometric light curves, identify Mira variables, brown dwarf stability, and YSO accretion flares.',
  },
  'my-discovery': {
    bg: { kind: 'galaxy', seed: 22 },
    icon: 'discovery',
    title: ['Your personal', { b: 'findings' }, 'log.'],
    blurb: 'Every candidate you inspect and save collects here. Add research notes, filter by variability type, and export your scientific discoveries.',
  },
};

export const LabPage: React.FC = () => {
  const { sub = 'discovery' } = useParams<{ sub?: string }>();

  if (!COPY[sub]) {
    return <Navigate to="/lab/discovery" replace />;
  }

  const c = COPY[sub];
  const cards = (
    <>
      <ClockCard />
      <StatCard label="Challenge targets" value="5" />
      <StatCard label="Detection engine" value="DAOStarFinder" />
    </>
  );

  return (
    <Stage
      page={page}
      sub={sub}
      bg={c.bg}
      title={c.title}
      icon={c.icon}
      blurb={c.blurb}
      cards={cards}
    >
      <div className="w-full">
        {sub === 'discovery' && <DiscoveryLab />}
        {sub === 'light-curves' && <LightCurves />}
        {sub === 'my-discovery' && <MyDiscoveries />}
      </div>
    </Stage>
  );
};

export default LabPage;
