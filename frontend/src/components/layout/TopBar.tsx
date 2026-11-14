import React, { useState } from 'react';
import { Search, Sparkles, Command } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TutorialMenu } from '../tutorial/TutorialMenu';

const PAGE_TITLES: [string, string, boolean?][] = [
  ['/',               'Home',              true ],
  ['/explore',        'Explore Sky'              ],
  ['/objects',        'Object Explorer'          ],
  ['/time-machine',   'Time Machine'             ],
  ['/discovery-lab',  'Discovery Lab'            ],
  ['/spectra',        'Spectral Explorer'        ],
  ['/missions',       'Missions'                 ],
  ['/discoveries',    'My Discoveries'           ],
  ['/about',          'About SPHEREx'            ],
  ['/settings',       'Settings'                 ],
];

interface TopBarProps {
  onOpenCommandPalette?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenCommandPalette }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const title =
    PAGE_TITLES.find(([p, , exact]) => (exact ? pathname === p : pathname.startsWith(p)))?.[1]
    ?? 'SPHEREX';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/objects?q=${encodeURIComponent(q.trim())}`);
      setQ('');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0d1526]/90 backdrop-blur-sm border-b border-[#263247] px-4 py-2.5 flex items-center gap-4 flex-shrink-0">
      <span className="text-sm font-semibold text-[#E8EDF5] hidden md:block min-w-0 truncate">
        {title}
      </span>

      {/* Search Input / Command Palette Trigger */}
      <div className="flex-1 max-w-md">
        <div
          onClick={onOpenCommandPalette}
          className="relative flex items-center bg-[#0B1020] border border-[#263247] hover:border-[#3a4d6b] rounded pl-9 pr-3 py-1.5 cursor-pointer transition-colors"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <span className="text-xs text-[#94A3B8] flex-1">
            Search object, RA/Dec, or jump to page…
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-[#94A3B8] bg-[#151E30] border border-[#263247] rounded">
            <span>⌘K</span>
          </kbd>
        </div>
      </div>

      {/* Right status */}
      <div className="ml-auto flex items-center gap-3 flex-shrink-0">
        <TutorialMenu />

        <button
          onClick={onOpenCommandPalette}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-[#263247] text-[#94A3B8] hover:text-[#E8EDF5] hover:bg-[#151E30] transition-colors"
        >
          <Command className="w-3.5 h-3.5 text-[#6EA8FE]" />
          <span>Quick Jump</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#94A3B8] hidden sm:block">
            {pathname.startsWith('/explore')
              ? 'Sky Atlas: Aladin Lite v3'
              : pathname.startsWith('/spectra')
              ? 'HiPS Cube: 102 Bands'
              : pathname.startsWith('/time-machine')
              ? 'Multi-Epoch Time Machine'
              : 'NASA/IPAC IRSA: Online'}
          </span>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="System online & verified" />
        </div>
      </div>
    </header>
  );
};
