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
    <header className="sticky top-0 z-30 bg-[#0d1526]/90 backdrop-blur-sm border-b border-[#262635] px-4 py-2.5 flex items-center gap-4 flex-shrink-0">
      <span className="text-sm font-semibold text-[#F3EFE8] hidden md:block min-w-0 truncate">
        {title}
      </span>

      {/* Search Input / Command Palette Trigger */}
      <div className="flex-1 max-w-md">
        <div
          onClick={onOpenCommandPalette}
          className="relative flex items-center bg-[#08080C] border border-[#262635] hover:border-[#3c3c4d] rounded pl-9 pr-3 py-1.5 cursor-pointer transition-colors"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9AA7]" />
          <span className="text-xs text-[#9E9AA7] flex-1">
            Search object, RA/Dec, or jump to page…
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-[#9E9AA7] bg-[#111117] border border-[#262635] rounded">
            <span>⌘K</span>
          </kbd>
        </div>
      </div>

      {/* Right status */}
      <div className="ml-auto flex items-center gap-3 flex-shrink-0">
        <TutorialMenu />

        <button
          onClick={onOpenCommandPalette}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-[#262635] text-[#9E9AA7] hover:text-[#F3EFE8] hover:bg-[#111117] transition-colors"
        >
          <Command className="w-3.5 h-3.5 text-[#F4A272]" />
          <span>Quick Jump</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#9E9AA7] hidden sm:block">
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
