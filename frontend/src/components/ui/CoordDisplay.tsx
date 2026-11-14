import React from 'react';
import { MapPin } from 'lucide-react';

interface CoordDisplayProps {
  ra: number;
  dec: number;
  raHms?: string;
  decDms?: string;
  compact?: boolean;
}

export const CoordDisplay: React.FC<CoordDisplayProps> = ({
  ra, dec, raHms, decDms, compact = false,
}) => {
  if (compact) {
    return (
      <span className="font-mono text-xs text-[#6EA8FE]">
        RA {ra.toFixed(4)}° Dec {dec >= 0 ? '+' : ''}{dec.toFixed(4)}°
      </span>
    );
  }

  return (
    <div className="bg-[#0B1020] border border-[#263247] rounded p-3 space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-3.5 h-3.5 text-[#6EA8FE]" />
        <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
          Sky Coordinates · J2000
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-[#94A3B8] mb-1">Right Ascension</div>
          <div className="font-mono text-sm text-[#6EA8FE]">{raHms ?? `${ra.toFixed(4)}°`}</div>
          <div className="font-mono text-xs text-[#94A3B8] mt-0.5">{ra.toFixed(6)}°</div>
        </div>
        <div>
          <div className="text-xs text-[#94A3B8] mb-1">Declination</div>
          <div className="font-mono text-sm text-[#6EA8FE]">{decDms ?? `${dec >= 0 ? '+' : ''}${dec.toFixed(4)}°`}</div>
          <div className="font-mono text-xs text-[#94A3B8] mt-0.5">{dec >= 0 ? '+' : ''}{dec.toFixed(6)}°</div>
        </div>
      </div>
    </div>
  );
};
