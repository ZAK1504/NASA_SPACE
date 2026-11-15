import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { travelBackToJourney, travelToWorkspace } from "../../lib/journeyState";
import BrandWordmark from "../../components/brand/BrandWordmark";

export const StorybookWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const originChapter = location.state?.originChapter || "about";

  // Handle postMessage navigation requests from the embedded storybook iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "NAVIGATE" && e.data.route) {
        travelToWorkspace(navigate, e.data.route, "about");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  useEffect(() => {
    document.title = "sphereXplorer — The Cosmic Chronicle";
  }, []);

  const handleBackToJourney = () => {
    travelBackToJourney(navigate, originChapter);
  };

  return (
    <div className="story-workspace w-full h-[100dvh] h-screen min-h-0 bg-[#08080C] text-[#f3efe8] flex flex-col relative selection:bg-[#f4a272] selection:text-black overflow-hidden">
      {/* 1. Dedicated Scientific Top Bar */}
      <header className="story-workspace-header flex-none w-full h-16 border-b border-white/10 bg-black/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between z-50">
        {/* Left: Back to Journey & Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleBackToJourney}
            data-tour="workspace-back-button"
            data-action="back-to-journey"
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-[var(--accent)] text-xs font-mono text-white/80 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Return to the Journey at your previous scroll position"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)] group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to Journey</span>
            <span className="sm:hidden">Journey</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* sphereXPLORER Wordmark with Original Symbol */}
          <div className="flex items-center">
            <BrandWordmark size="sm" />
          </div>

          {/* Storybook Title Badge */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10.5px] font-mono text-[var(--accent)]">
            <BookOpen className="w-3 h-3 text-[var(--accent)]" />
            <span>[INFO BOOK · THE UNIVERSE IN 102 COLOURS]</span>
          </div>
        </div>

        {/* Right: Quick Chapter Return indicator */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline font-mono text-xs text-white/50">
            Origin: Chapter {originChapter.toUpperCase()}
          </span>
          <button
            onClick={handleBackToJourney}
            className="px-3 py-1.5 rounded-full text-xs font-mono bg-[var(--accent)]/15 border border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all cursor-pointer font-medium"
          >
            Return ↗
          </button>
        </div>
      </header>

      {/* 2. Embedded Authoritative Illustrated Storybook - Full Viewport Filling */}
      <main className="story-workspace-content flex-1 w-full min-h-0 min-w-0 relative bg-[#070910] overflow-hidden">
        <iframe
          src="/storybook/index.html"
          title="SPHEREx · The Universe in 102 Colours"
          className="storybook-frame absolute inset-0 w-full h-full border-0 block"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </main>
    </div>
  );
};

export default StorybookWorkspace;
