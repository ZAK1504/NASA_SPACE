import React from 'react';
import { CircleDot } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

const PLATFORM = [
  { label: 'Frontend',     value: 'React 18, TypeScript, Vite, Tailwind CSS' },
  { label: 'Backend',      value: 'Python 3.11, FastAPI, Astropy, NumPy' },
  { label: 'Sky Map',      value: 'Aladin Lite (CDS Strasbourg)' },
  { label: 'Data Archive', value: 'NASA/IPAC IRSA (SIA2 protocol)' },
  { label: 'Database',     value: 'Supabase PostgreSQL' },
  { label: 'FITS Library', value: 'Astropy, Reproject, Photutils' },
];

export const About: React.FC = () => (
  <div className="max-w-4xl mx-auto px-6 py-8">
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <CircleDot className="w-6 h-6 text-[#6EA8FE]" />
        <span className="font-mono text-xs text-[#94A3B8] uppercase tracking-widest">About</span>
      </div>
      <h1 className="text-3xl font-bold text-[#E8EDF5] mb-4">About SPHEREX</h1>
      <p className="text-[#94A3B8] leading-relaxed">
        A citizen-science platform for exploring real NASA SPHEREx telescope data.
      </p>
    </div>

    <div className="space-y-6">
      <div className="bg-[#151E30] border border-[#263247] rounded p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="blue">NASA Mission</Badge>
        </div>
        <h2 className="text-lg font-semibold text-[#E8EDF5] mb-3">The SPHEREx Mission</h2>
        <p className="text-sm text-[#94A3B8] leading-relaxed mb-3">
          SPHEREx (Spectro-Photometer for the History of the Universe, Epoch of
          Reionization and Ices Explorer) is a NASA space telescope performing an all-sky
          survey in near-infrared wavelengths. Its 102 spectral channels cover 0.75 to 5
          micrometers, allowing it to measure positions and distances of hundreds of
          millions of galaxies and study water and organic molecules in planet-forming
          regions.
        </p>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          SPHEREx will help scientists understand the initial conditions of the universe,
          the history of galaxy formation, and the prevalence of biologically important
          molecules throughout our galaxy.
        </p>
      </div>

      <div className="bg-[#151E30] border border-[#263247] rounded p-6">
        <h2 className="text-lg font-semibold text-[#E8EDF5] mb-3">Data and Attribution</h2>
        <p className="text-sm text-[#94A3B8] leading-relaxed mb-3">
          All astronomical data displayed on this platform is sourced from the official
          NASA/IPAC Infrared Science Archive (IRSA). Data is accessed through the IRSA
          SIA2 (Simple Image Access version 2) protocol.
        </p>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          We do not modify, invent, or fabricate scientific measurements. Where data is
          unavailable or pending, this is clearly communicated. Any simulated or
          educational content is explicitly labelled as such.
        </p>
      </div>

      <div className="bg-[#151E30] border border-[#263247] rounded p-6">
        <h2 className="text-lg font-semibold text-[#E8EDF5] mb-4">Platform</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PLATFORM.map(({ label, value }) => (
            <div key={label} className="border-b border-[#263247]/60 pb-3 last:border-0">
              <div className="text-xs text-[#94A3B8] mb-1">{label}</div>
              <div className="text-sm text-[#E8EDF5]">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
