import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Star, Eye, Zap, Circle, Clock,
  BarChart2, MapPin, Sparkles
} from 'lucide-react';
import type { AstronomicalObject } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

type BadgeVariant = 'blue' | 'amber' | 'green' | 'red' | 'purple' | 'default';

const typeConfig: Record<string, { icon: React.ReactNode; variant: BadgeVariant }> = {
  'Red Dwarf Star':       { icon: <Star className="w-3.5 h-3.5 text-red-400" />,   variant: 'red' },
  'Brown Dwarf':          { icon: <Eye  className="w-3.5 h-3.5 text-[#F3B85B]" />, variant: 'amber' },
  'Binary Brown Dwarf':   { icon: <Eye  className="w-3.5 h-3.5 text-[#F3B85B]" />, variant: 'amber' },
  'T Tauri Star':         { icon: <Zap  className="w-3.5 h-3.5 text-[#6EA8FE]" />, variant: 'blue' },
  'Carbon Star':          { icon: <Circle className="w-3.5 h-3.5 text-purple-400" />, variant: 'purple' },
};

export const ObjectCard: React.FC<{ object: AstronomicalObject }> = ({ object }) => {
  const navigate = useNavigate();
  const cfg = typeConfig[object.type] ?? { icon: <Star className="w-3.5 h-3.5" />, variant: 'default' as BadgeVariant };

  return (
    <div
      onClick={() => navigate(`/objects/${object.slug}`)}
      className="bg-[#151E30]/90 backdrop-blur-md border border-[#263247] hover:border-[#6EA8FE]/60 rounded-xl p-5 hover:shadow-glow-blue hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col relative overflow-hidden"
    >
      {/* Subtle top gradient glow on hover */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#6EA8FE]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Type badge & Icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {cfg.icon}
          <Badge variant={cfg.variant} dot>
            {object.type}
          </Badge>
        </div>
      </div>

      {/* Target Title */}
      <h3 className="text-base font-bold text-[#E8EDF5] mb-2 group-hover:text-[#6EA8FE] transition-colors leading-snug">
        {object.name}
      </h3>

      {/* Celestial Coordinates */}
      <div className="mb-3 flex items-center gap-1 text-[11px] font-mono bg-[#0B1020]/80 border border-[#263247] rounded-md px-2.5 py-1 text-[#6EA8FE] w-fit">
        <MapPin className="w-3 h-3 text-[#94A3B8]" />
        <span>{object.raHms}</span>
        <span className="text-[#263247] mx-0.5">|</span>
        <span>{object.decDms}</span>
      </div>

      {/* Description */}
      <p className="text-xs text-[#94A3B8] leading-relaxed mb-4 flex-1 line-clamp-3">
        {object.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-5">
        {object.tags.map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-[#0B1020]/60 border border-[#263247] text-[#94A3B8]">
            {tag}
          </span>
        ))}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[#263247] flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/time-machine?object=${object.slug}`); }}
            className="p-1.5 text-[#94A3B8] hover:text-[#6EA8FE] hover:bg-[#1a2540] rounded transition-colors"
            title="Open in Time Machine"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/spectra?object=${object.slug}`); }}
            className="p-1.5 text-[#94A3B8] hover:text-[#6EA8FE] hover:bg-[#1a2540] rounded transition-colors"
            title="Explore 102 Spectral Bands"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <Button
          variant="glow"
          size="sm"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={(e) => { e.stopPropagation(); navigate(`/objects/${object.slug}`); }}
          className="text-xs"
        >
          Investigate
        </Button>
      </div>
    </div>
  );
};
