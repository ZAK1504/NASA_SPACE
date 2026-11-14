import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Telescope, Map, Star, Clock, FlaskConical,
  BarChart2, Target, BookOpen, CircleDot, ArrowRight, X, Activity
} from 'lucide-react';
import { FEATURED_OBJECTS } from '../../constants/objects';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    { label: 'Explore Sky Map (Aladin Lite)', path: '/explore', icon: Map, category: 'App' },
    { label: 'Object Explorer', path: '/objects', icon: Star, category: 'App' },
    { label: 'Time Machine (Cross-Epoch Compare)', path: '/time-machine', icon: Clock, category: 'App' },
    { label: 'Discovery Lab (DAOStarFinder)', path: '/discovery-lab', icon: FlaskConical, category: 'App' },
    { label: 'Spectral Explorer (102 Near-IR Bands)', path: '/spectra', icon: BarChart2, category: 'App' },
    { label: 'Photometric Light Curves (Pulsations & Dips)', path: '/light-curves', icon: Activity, category: 'App' },
    { label: 'Guided Astronomy Missions', path: '/missions', icon: Target, category: 'App' },
    { label: 'My Discoveries Journal', path: '/discoveries', icon: BookOpen, category: 'App' },
    { label: 'About SPHEREx Mission', path: '/about', icon: CircleDot, category: 'App' },
  ];

  const objectsNav = FEATURED_OBJECTS.map((obj) => ({
    label: `${obj.name} (${obj.type})`,
    path: `/objects/${obj.slug}`,
    icon: Star,
    category: 'Featured Target',
  }));

  const allItems = [...quickNav, ...objectsNav];

  const filtered = allItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#151E30] border border-[#263247] rounded-lg shadow-2xl overflow-hidden">
        {/* Input header */}
        <div className="flex items-center px-4 py-3 border-b border-[#263247]">
          <Search className="w-4 h-4 text-[#94A3B8] mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page name, or target…"
            className="flex-1 bg-transparent text-sm text-[#E8EDF5] placeholder:text-[#94A3B8] focus:outline-none"
          />
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#E8EDF5]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#94A3B8]">
              No matches found for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded text-[#94A3B8] hover:text-[#E8EDF5] hover:bg-[#1a2540] transition-colors cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#6EA8FE]" />
                    <span className="font-medium text-[#E8EDF5]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0B1020] border border-[#263247] text-[#94A3B8]">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#263247] group-hover:text-[#6EA8FE] transition-colors" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-[#263247] bg-[#0d1526] flex items-center justify-between text-[11px] text-[#94A3B8]">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-[#0B1020] border border-[#263247] text-[10px]">ESC</kbd> to close</span>
          <span className="font-mono text-[#6EA8FE]">SPHEREx Quick Navigation</span>
        </div>
      </div>
    </div>
  );
};
