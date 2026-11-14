import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Telescope, Map, Star, Clock,
  FlaskConical, BarChart2, Target,
  BookOpen, Settings, CircleDot, Sparkles, Activity
} from 'lucide-react';

const PRIMARY = [
  { to: '/',            icon: Telescope,    label: 'Home',             exact: true },
  { to: '/explore',     icon: Map,          label: 'Explore Sky' },
  { to: '/objects',     icon: Star,         label: 'Object Explorer' },
  { to: '/time-machine',icon: Clock,        label: 'Time Machine' },
];

const SECONDARY = [
  { to: '/discovery-lab', icon: FlaskConical, label: 'Discovery Lab' },
  { to: '/spectra',       icon: BarChart2,    label: 'Spectral Explorer' },
  { to: '/light-curves',  icon: Activity,     label: 'Light Curves' },
  { to: '/missions',      icon: Target,       label: 'Missions' },
  { to: '/discoveries',   icon: BookOpen,     label: 'My Discoveries' },
];

export const Sidebar: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0d1526]/95 backdrop-blur-xl border-r border-[#263247] flex flex-col z-40 select-none shadow-2xl">
      {/* Logo Header */}
      <div className="px-4 py-5 border-b border-[#263247] flex-shrink-0">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6EA8FE]/20 via-[#1a2540] to-transparent border border-[#6EA8FE]/40 flex items-center justify-center flex-shrink-0 group-hover:shadow-glow-blue transition-all duration-300">
            <CircleDot className="w-5 h-5 text-[#6EA8FE] group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#E8EDF5] tracking-widest flex items-center gap-1.5">
              <span>SPHEREX</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#6EA8FE]/10 text-[#6EA8FE] border border-[#6EA8FE]/30 font-mono">
                DR1
              </span>
            </div>
            <div className="text-[11px] text-[#94A3B8]">Cosmic Discovery</div>
          </div>
        </NavLink>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <div className="text-[10px] font-bold text-[#94A3B8]/70 uppercase tracking-widest px-3 mb-2 flex items-center justify-between">
          <span>Observation</span>
        </div>
        {PRIMARY.map(({ to, icon: Icon, label, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-[#6EA8FE] bg-[#1a2540] border-l-2 border-[#6EA8FE] pl-[10px] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#E8EDF5] hover:bg-[#1a2540]/60'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          );
        })}

        <div className="text-[10px] font-bold text-[#94A3B8]/70 uppercase tracking-widest px-3 mt-6 mb-2 flex items-center justify-between">
          <span>Investigation</span>
        </div>
        {SECONDARY.map(({ to, icon: Icon, label }) => {
          const active = pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-[#6EA8FE] bg-[#1a2540] border-l-2 border-[#6EA8FE] pl-[10px] shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#E8EDF5] hover:bg-[#1a2540]/60'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer Section */}
      <div className="px-3 py-3 border-t border-[#263247] space-y-1 flex-shrink-0 bg-[#0B1020]/50">
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isActive ? 'text-[#6EA8FE]' : 'text-[#94A3B8] hover:text-[#E8EDF5] hover:bg-[#1a2540]'
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
