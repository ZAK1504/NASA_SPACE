import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Telescope, Map, Star, Clock,
  FlaskConical, BarChart2, Target,
  BookOpen, Settings, CircleDot, Sparkles, Activity
} from 'lucide-react';

const PRIMARY = [
  { to: '/',            icon: Telescope,    label: 'Home',             exact: true, tourId: 'nav-home' },
  { to: '/explore',     icon: Map,          label: 'Explore Sky',                   tourId: 'nav-explore' },
  { to: '/objects',     icon: Star,         label: 'Object Explorer',               tourId: 'nav-objects' },
  { to: '/time-machine',icon: Clock,        label: 'Time Machine',                  tourId: 'nav-timemachine' },
];

const SECONDARY = [
  { to: '/discovery-lab', icon: FlaskConical, label: 'Discovery Lab',               tourId: 'nav-discovery' },
  { to: '/spectra',       icon: BarChart2,    label: 'Spectral Explorer',           tourId: 'nav-spectral' },
  { to: '/light-curves',  icon: Activity,     label: 'Light Curves',                tourId: 'nav-lightcurves' },
  { to: '/missions',      icon: Target,       label: 'Missions',                    tourId: 'nav-missions' },
  { to: '/discoveries',   icon: BookOpen,     label: 'My Discoveries',              tourId: 'nav-discoveries' },
];

export const Sidebar: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0d1526]/95 backdrop-blur-xl border-r border-[#262635] flex flex-col z-40 select-none shadow-2xl">
      {/* Logo Header */}
      <div className="px-4 py-5 border-b border-[#262635] flex-shrink-0">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F4A272]/20 via-[#1c1c28] to-transparent border border-[#F4A272]/40 flex items-center justify-center flex-shrink-0 group-hover:shadow-glow-blue transition-all duration-300">
            <CircleDot className="w-5 h-5 text-[#F4A272] group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#F3EFE8] tracking-widest flex items-center gap-1.5">
              <span className="inline-flex items-baseline">
                <span>SPHERE</span>
                <span className="text-[1.55em] font-black text-[var(--accent)] mx-0.5 leading-none">x</span>
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#F4A272]/10 text-[#F4A272] border border-[#F4A272]/30 font-mono">
                DR1
              </span>
            </div>
            <div className="text-[11px] text-[#9E9AA7]">Cosmic Discovery</div>
          </div>
        </NavLink>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <div className="text-[10px] font-bold text-[#9E9AA7]/70 uppercase tracking-widest px-3 mb-2 flex items-center justify-between">
          <span>Observation</span>
        </div>
        {PRIMARY.map(({ to, icon: Icon, label, exact, tourId }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              data-tour={tourId}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-[#F4A272] bg-[#1c1c28] border-l-2 border-[#F4A272] pl-[10px] shadow-sm'
                  : 'text-[#9E9AA7] hover:text-[#F3EFE8] hover:bg-[#1c1c28]/60'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          );
        })}

        <div className="text-[10px] font-bold text-[#9E9AA7]/70 uppercase tracking-widest px-3 mt-6 mb-2 flex items-center justify-between">
          <span>Investigation</span>
        </div>
        {SECONDARY.map(({ to, icon: Icon, label, tourId }) => {
          const active = pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              data-tour={tourId}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-[#F4A272] bg-[#1c1c28] border-l-2 border-[#F4A272] pl-[10px] shadow-sm'
                  : 'text-[#9E9AA7] hover:text-[#F3EFE8] hover:bg-[#1c1c28]/60'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer Section */}
      <div className="px-3 py-3 border-t border-[#262635] space-y-1 flex-shrink-0 bg-[#08080C]/50">
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isActive ? 'text-[#F4A272]' : 'text-[#9E9AA7] hover:text-[#F3EFE8] hover:bg-[#1c1c28]'
            }`
          }
        >
          <CircleDot className="w-3.5 h-3.5" />
          <span>About SPHEREx</span>
        </NavLink>
      </div>
    </aside>
  );
};
