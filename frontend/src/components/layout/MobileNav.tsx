import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Telescope, Map, Star, Clock, Target,
  Menu, X, FlaskConical, BarChart2,
  BookOpen, Settings, CircleDot, Activity
} from 'lucide-react';

const TAB_ITEMS = [
  { to: '/',             icon: Telescope, label: 'Home',    exact: true },
  { to: '/explore',      icon: Map,       label: 'Explore' },
  { to: '/objects',      icon: Star,      label: 'Objects' },
  { to: '/time-machine', icon: Clock,     label: 'Time' },
  { to: '/missions',     icon: Target,    label: 'Missions' },
];

const ALL_ITEMS = [
  { to: '/',               icon: Telescope,   label: 'Home' },
  { to: '/explore',        icon: Map,         label: 'Explore Sky' },
  { to: '/objects',        icon: Star,        label: 'Object Explorer' },
  { to: '/time-machine',   icon: Clock,       label: 'Time Machine' },
  { to: '/discovery-lab',  icon: FlaskConical,label: 'Discovery Lab' },
  { to: '/spectra',        icon: BarChart2,   label: 'Spectral Explorer' },
  { to: '/light-curves',   icon: Activity,    label: 'Light Curves' },
  { to: '/missions',       icon: Target,      label: 'Missions' },
  { to: '/discoveries',    icon: BookOpen,    label: 'My Discoveries' },
  { to: '/about',          icon: CircleDot,   label: 'About SPHEREx' },
  { to: '/settings',       icon: Settings,    label: 'Settings' },
];

export const MobileNav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0d1526] border-t border-[#262635] flex z-40 md:hidden">
        {TAB_ITEMS.map(({ to, icon: Icon, label, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
                active ? 'text-[#F4A272]' : 'text-[#9E9AA7]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          );
        })}
        <button
          onClick={() => setOpen(true)}
          className="flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] text-[#9E9AA7]"
        >
          <Menu className="w-5 h-5" />
          More
        </button>
      </nav>

      {/* Full-screen menu */}
      {open && (
        <div className="fixed inset-0 bg-[#08080C] z-50 flex flex-col md:hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#262635]">
            <div className="flex items-center gap-3">
              <CircleDot className="w-5 h-5 text-[#F4A272]" />
              <span className="font-bold text-[#F3EFE8] tracking-widest text-sm">SPHEREX</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#9E9AA7] hover:text-[#F3EFE8]">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {ALL_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#F4A272] bg-[#1c1c28]'
                      : 'text-[#9E9AA7] hover:text-[#F3EFE8] hover:bg-[#1c1c28]'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};
