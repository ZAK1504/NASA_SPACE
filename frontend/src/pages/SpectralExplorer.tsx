import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  BarChart2, Layers, Info, Filter, ArrowRight,
  Sparkles, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import { api, TargetSpectrumResponse } from '../services/api';
import { FEATURED_OBJECTS } from '../constants/objects';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InfoPanel } from '../components/ui/InfoPanel';

const DETECTORS = [
  { id: 'ALL', name: 'All Detectors', range: '0.75 – 5.00 μm' },
  { id: 'D1', name: 'Array 1 (D1)', range: '0.75 – 1.11 μm' },
  { id: 'D2', name: 'Array 2 (D2)', range: '1.11 – 1.64 μm' },
  { id: 'D3', name: 'Array 3 (D3)', range: '1.64 – 2.42 μm' },
  { id: 'D4', name: 'Array 4 (D4)', range: '2.42 – 3.82 μm' },
  { id: 'D5', name: 'Array 5 (D5)', range: '3.82 – 4.42 μm' },
  { id: 'D6', name: 'Array 6 (D6)', range: '4.42 – 5.00 μm' },
];

const MOLECULAR_FEATURES = [
  { name: 'Water Ice (H₂O)', wavelength: 3.05, detector: 'D4', desc: 'Prominent ice absorption in interstellar clouds and protoplanetary discs.' },
  { name: 'CO₂ Ice', wavelength: 4.27, detector: 'D5', desc: 'Carbon dioxide ice stretching vibration band.' },
  { name: 'CO Gas / Ice', wavelength: 4.67, detector: 'D6', desc: 'Fundamental carbon monoxide absorption feature.' },
  { name: 'Pa-β Hydrogen', wavelength: 1.28, detector: 'D2', desc: 'Paschen-beta emission in accreting young stars like RW Aurigae.' },
];

export const SpectralExplorer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const objectSlug = searchParams.get('object') || 'barnards-star';
  const selectedObject = FEATURED_OBJECTS.find((o) => o.slug === objectSlug) || FEATURED_OBJECTS[0];

  const [activeDetector, setActiveDetector] = useState<string>('ALL');
  const [spectrum, setSpectrum] = useState<TargetSpectrumResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredChannel, setHoveredChannel] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getSpectrum(selectedObject.slug)
      .then((data) => {
        setSpectrum(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedObject]);

  const filteredChannels = spectrum?.channels.filter(
    (ch) => activeDetector === 'ALL' || ch.detector === activeDetector
  ) || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-5 h-5 text-[#6EA8FE]" />
            <h1 className="text-2xl font-bold text-[#E8EDF5]">Spectral Explorer</h1>
          </div>
          <p className="text-sm text-[#94A3B8]">
            Investigate light across SPHEREx's 102 near-infrared spectral channels (0.75 μm – 5.0 μm)
          </p>
        </div>

        {/* Object selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A3B8]">Target:</span>
          <select
            value={selectedObject.slug}
            onChange={(e) => navigate(`/spectra?object=${e.target.value}`)}
            className="bg-[#151E30] border border-[#263247] text-[#E8EDF5] text-sm rounded px-3 py-1.5 focus:outline-none focus:border-[#6EA8FE]"
          >
            {FEATURED_OBJECTS.map((obj) => (
              <option key={obj.id} value={obj.slug}>
                {obj.name} ({obj.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Detector Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {DETECTORS.map((det) => (
          <button
            key={det.id}
            onClick={() => setActiveDetector(det.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer ${
              activeDetector === det.id
                ? 'bg-[#6EA8FE] text-[#0B1020] border-[#6EA8FE]'
                : 'bg-[#151E30] text-[#94A3B8] border-[#263247] hover:text-[#E8EDF5]'
            }`}
          >
            <span>{det.name}</span>
            <span className="ml-1.5 opacity-70 text-[10px]">({det.range})</span>
          </button>
        ))}
      </div>

      {/* Main Spectral Chart Panel */}
      <div className="bg-[#151E30] border border-[#263247] rounded p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#E8EDF5]">
              Spectral Channel Energy Distribution
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Target: <strong className="text-[#E8EDF5]">{selectedObject.name}</strong> · Showing {filteredChannels.length} of 102 spectral bands
            </p>
          </div>
          {hoveredChannel && (
            <div className="text-xs font-mono bg-[#0B1020] border border-[#263247] rounded px-3 py-1.5 text-[#6EA8FE]">
              <span className="font-semibold">Channel {hoveredChannel.channel}</span> ({hoveredChannel.detector}) · {hoveredChannel.wavelength_um} μm
              {hoveredChannel.is_dichroic_gap || hoveredChannel.channel === 51 || hoveredChannel.channel === 52 ? (
                <span className="ml-2 text-amber-400 font-bold">⚠ Dichroic Gap (2.42 μm beam-splitter)</span>
              ) : hoveredChannel.observed ? (
                <span className="ml-2 text-emerald-400">
                  ✓ Authentic SPHEREx L2: {hoveredChannel.flux_mjy_sr != null ? `${hoveredChannel.flux_mjy_sr.toFixed(3)} MJy/sr` : 'Calibrated'} {hoveredChannel.flux_uJy ? `(${hoveredChannel.flux_uJy} μJy)` : ''}
                </span>
              ) : (
                <span className="ml-2 text-[#94A3B8]">
                  ○ Unobserved in public release {hoveredChannel.reference_model_flux_uJy ? `(Reference Model: ${hoveredChannel.reference_model_flux_uJy} μJy)` : ''}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#94A3B8] mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#6EA8FE] rounded-sm" />
            <span>Authentic SPHEREx Level 2 Observation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#263247] rounded-sm" />
            <span>Unobserved Channel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-amber-500/80 border border-amber-400 rounded-sm" />
            <span>Dichroic Gap (2.42 μm Boundary)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 border-t border-dashed border-[#F3B85B]" />
            <span>Molecular Absorption / Emission</span>
          </div>
        </div>

        {/* Interactive Bar Chart for Spectral Bands */}
        <div className="h-64 bg-[#0B1020] border border-[#263247] rounded p-4 flex items-end gap-1 overflow-x-auto relative">
          {/* Molecular Line Overlays */}
          {MOLECULAR_FEATURES.map((mol) => {
            // Find approximate position
            const pct = ((mol.wavelength - 0.75) / (5.0 - 0.75)) * 100;
            return (
              <div
                key={mol.name}
                className="absolute top-2 bottom-0 w-px border-l border-dashed border-[#F3B85B]/70 pointer-events-none z-10"
                style={{ left: `${pct}%` }}
              >
                <span className="absolute top-0 -translate-x-1/2 text-[9px] font-mono text-[#F3B85B] bg-[#0B1020]/90 px-1 rounded whitespace-nowrap">
                  {mol.name} ({mol.wavelength}μm)
                </span>
              </div>
            );
          })}

          {filteredChannels.map((ch) => {
            const isGap = ch.is_dichroic_gap || ch.channel === 51 || ch.channel === 52;
            const isObserved = ch.observed && !isGap;

            // Height calculation based on authentic scientific measurements or honest unobserved baseline
            let barHeightPct = 12; // Unobserved minimal indicator
            if (isGap) {
              barHeightPct = 8;
            } else if (isObserved) {
              if (ch.flux_uJy && ch.flux_uJy > 0) {
                // Scale authentic flux logarithmically or linearly into 30-90% range
                barHeightPct = Math.min(90, Math.max(35, Math.round(Math.log10(ch.flux_uJy + 1) * 20)));
              } else {
                barHeightPct = 65; // Observed detector bandpass coverage
              }
            }

            return (
              <div
                key={ch.channel}
                onMouseEnter={() => setHoveredChannel(ch)}
                onMouseLeave={() => setHoveredChannel(null)}
                className="flex-1 h-full flex flex-col justify-end group cursor-pointer relative"
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isGap
                      ? 'bg-amber-600/60 border-t-2 border-amber-400 group-hover:bg-amber-500'
                      : isObserved
                      ? 'bg-[#6EA8FE] shadow-sm shadow-[#6EA8FE]/30 group-hover:bg-[#99c4ff]'
                      : 'bg-[#1E293B] border border-dashed border-[#334155] group-hover:bg-[#263247]'
                  }`}
                  style={{ height: `${barHeightPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Wavelength Axis Labels */}
        <div className="flex justify-between text-xs font-mono text-[#94A3B8] mt-2 px-1">
          <span>0.75 μm (Near-IR edge)</span>
          <span>1.64 μm</span>
          <span>2.42 μm</span>
          <span>3.82 μm</span>
          <span>5.00 μm</span>
        </div>
      </div>

      {/* Key Molecular Features Grid */}
      <div className="bg-[#151E30] border border-[#263247] rounded p-5 mb-6">
        <h3 className="text-sm font-semibold text-[#E8EDF5] mb-3">
          Key Interstellar & Planetary Molecular Signatures in SPHEREx Range
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOLECULAR_FEATURES.map((mol) => (
            <div key={mol.name} className="bg-[#0B1020] border border-[#263247] rounded p-3 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-[#E8EDF5]">{mol.name}</span>
                <Badge variant="amber">{mol.detector}</Badge>
              </div>
              <div className="font-mono text-[#6EA8FE] mb-1">{mol.wavelength} μm</div>
              <p className="text-[#94A3B8] text-[11px] leading-relaxed">{mol.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <InfoPanel title="What does spectroscopy reveal about stars?" defaultOpen>
        <p>
          "Different wavelengths reveal different properties of astronomical objects. By studying light across many wavelengths, scientists learn more about the universe."
        </p>
        <p>
          While an ordinary camera only records total brightness, a spectrometer splits light into its constituent wavelengths.
          Specific gases and ices absorb light at precise resonant wavelengths, casting dark absorption fingerprints across the spectrum.
          By analyzing these lines, astronomers can determine the atmospheric temperature, chemical composition, and motion of astronomical bodies without ever traveling there.
        </p>
      </InfoPanel>
    </div>
  );
};
