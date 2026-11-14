import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../Navbar';
import { Starfield } from '../ui/Starfield';
import { Backdrop } from '../ui/Backdrop';
import { CommandPalette } from '../navigation/CommandPalette';
import { CosmicCopilot } from '../assistant/CosmicCopilot';
import { useGuidedTour } from '../../hooks/useGuidedTour';
import { useSmoothScroll } from '../../lib/hooks';

export const Layout: React.FC = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { startTour } = useGuidedTour();

  // Initialize Lenis smooth scroll
  useSmoothScroll();

  // Global hotkey: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="cinematic-shell min-h-screen bg-black text-[#f3efe8] relative flex flex-col selection:bg-[#f4a272] selection:text-black">
      {/* Deep-space cosmic backdrop */}
      <Backdrop />

      {/* 3-layer parallax starfield with shooting stars */}
      <Starfield />

      {/* Cinematic Top Navigation Header */}
      <Navbar onStartTour={() => startTour('getting-started')} />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10 flex flex-col">
        <Outlet />
      </main>

      {/* Global Quick Command Palette (Ctrl+K / ⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Global Interactive Cosmic Copilot & Guide */}
      <CosmicCopilot />
    </div>
  );
};

export default Layout;
