import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar }   from './Sidebar';
import { MobileNav } from './MobileNav';
import { TopBar }    from './TopBar';
import { CommandPalette } from '../navigation/CommandPalette';
import { CosmicCopilot }  from '../assistant/CosmicCopilot';

export const Layout: React.FC = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0B1020]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="md:ml-60 min-h-screen flex flex-col">
        <TopBar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
        <main className="flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile nav */}
      <MobileNav />

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
