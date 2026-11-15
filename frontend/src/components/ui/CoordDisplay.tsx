import React from 'react';
import { MapPin } from 'lucide-react';

interface CoordDisplayProps {
  ra: number;
  dec: number;
  raHms?: string;
  decDms?: string;
  compact?: boolean;
  frame?: string;
  positionEpoch?: string;
  catalogueEpoch?: string;
}

export const CoordDisplay: React.FC<CoordDisplayProps> = ({
  ra,
  dec,
  raHms,
  decDms,
  compact = false,
  frame = 'ICRS (J2000.0 Frame)',
  positionEpoch = 'J2026.0 (Propagated)',
  catalogueEpoch = 'Gaia DR3 (J2016.0)',
}) => {
  if (compact) {
    return (
      <span className="font-mono text-xs text-[#F4A272]">
        RA {ra.toFixed(4)}° Dec {dec >= 0 ? '+' : ''}{dec.toFixed(4)}°
      </span>
    );
  }

  return (
    <div className="bg-[#08080C] border border-[#262635] rounded p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262635]/60 pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#F4A272]" />
          <span className="text-xs font-semibold text-[#F3EFE8] tracking-wide">
            Astrometric Coordinates
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-1.5 py-0.5 rounded bg-[#111117] border border-[#262635] text-[#9E9AA7]" title="Celestial Reference Frame">
            Frame: <span className="text-[#F4A272]">{frame}</span>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#111117] border border-[#262635] text-[#9E9AA7]" title="Proper-motion propagated position epoch">
            Epoch: <span className="text-[#F3B85B]">{positionEpoch}</span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-1">
        <div>
          <div className="text-xs text-[#9E9AA7] mb-1">Right Ascension</div>
          <div className="font-mono text-sm text-[#F4A272] font-semibold">{raHms ?? `${ra.toFixed(4)}°`}</div>
          <div className="font-mono text-xs text-[#9E9AA7] mt-0.5">{ra.toFixed(6)}°</div>
        </div>
        <div>
          <div className="text-xs text-[#9E9AA7] mb-1">Declination</div>
          <div className="font-mono text-sm text-[#F4A272] font-semibold">{decDms ?? `${dec >= 0 ? '+' : ''}${dec.toFixed(4)}°`}</div>
          <div className="font-mono text-xs text-[#9E9AA7] mt-0.5">{dec >= 0 ? '+' : ''}{dec.toFixed(6)}°</div>
        </div>
      </div>
      <div className="text-[10px] text-[#64748B] flex items-center justify-between pt-1 border-t border-[#262635]/30">
        <span>Cat Ref Epoch: {catalogueEpoch}</span>
        <span>Astrometric System: Barycentric ICRS</span>
      </div>
    </div>
  );
};
