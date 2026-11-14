import React from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { Stage } from '../components/ui/Stage';
import { ClockCard, StatCard } from '../components/ui/Glass';
import { pageById } from '../types/site';
import { ExploreSky } from './ExploreSky';
import { ObjectExplorer } from './ObjectExplorer';
import { ObjectDetail } from './ObjectDetail';
import { SpectralExplorer } from './SpectralExplorer';

const page = pageById('explorer')!;

const COPY: Record<string, {
  bg: { kind: 'nebula' | 'galaxy' | 'band'; seed: number; hue?: number };
  title: (string | { b: string })[];
  icon: string;
  blurb: string;
}> = {
  sky: {
    bg: { kind: 'nebula', seed: 21, hue: 0 },
    title: ['Tune the', { b: 'whole sky' }, 'to any colour.'],
    icon: 'sky',
    blurb: 'Move the crosshair across the sky, then explore through the 102 channels. The same patch of sky looks different in every infrared colour.',
  },
  object: {
    bg: { kind: 'galaxy', seed: 6, hue: 0 },
    title: ['Pick an', { b: 'object' }, 'and read its light.'],
    icon: 'object',
    blurb: 'Every galaxy, brown dwarf and young stellar object carries a fingerprint in its spectrum. Choose a target and see what its light is made of.',
  },
  spectral: {
    bg: { kind: 'band', seed: 9, hue: 0 },
    title: ['Read the', { b: 'spectrum' }, 'like a story.'],
    icon: 'spectral',
    blurb: 'Dips and bumps in a spectrum mark molecules — water, carbon dioxide, CO and more. Jump to the features astronomers hunt for.',
  },
};

interface ExplorerPageProps {
  defaultSub?: string;
}

export const ExplorerPage: React.FC<ExplorerPageProps> = ({ defaultSub }) => {
  const params = useParams<{ sub?: string; objectId?: string }>();
  const sub = defaultSub || params.sub || 'sky';
  const objectId = params.objectId;

  if (!COPY[sub]) {
    return <Navigate to="/explorer/sky" replace />;
  }

  const c = COPY[sub];
  const cards =
    sub === 'sky' ? (
      <>
        <ClockCard />
        <StatCard label="Sky covered" value="100" unit=" %" />
        <StatCard label="Survey bands" value="102" />
      </>
    ) : sub === 'object' ? (
      <>
        <ClockCard />
        <StatCard label="Challenge targets" value="5" />
        <StatCard label="Bands per target" value="102" />
      </>
    ) : (
      <>
        <ClockCard />
        <StatCard label="Spectral range" value="0.75–5" unit=" µm" />
        <StatCard label="Total channels" value="102" />
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
        {sub === 'sky' && <ExploreSky />}
        {sub === 'object' && (objectId ? <ObjectDetail /> : <ObjectExplorer />)}
        {sub === 'spectral' && <SpectralExplorer />}
      </div>
    </Stage>
  );
};

export default ExplorerPage;
