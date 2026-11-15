import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { travelBackToJourney, travelToWorkspace } from "../../lib/journeyState";

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

  const handleBackToJourney = () => {
    travelBackToJourney(navigate, originChapter);
  };

  return (
    <div className="storybook-workspace min-h-screen bg-[#08080C] text-[#f3efe8] flex flex-col relative selection:bg-[#f4a272] selection:text-black">
      {/* 1. Dedicated Scientific Top Bar */}
      <header className="sticky top-0 z-50 w-full h-16 border-b border-white/10 bg-black/90 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
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

          {/* sphereXplorer Wordmark */}
          <div className="flex items-center gap-2">
            <svg viewBox="-12 -12 24 24" width="20" height="20" aria-hidden="true">
              <circle r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <ellipse
                rx="11"
                ry="3.6"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.2"
                transform="rotate(-24)"
              />
              <circle r="2.2" fill="currentColor" />
            </svg>
            <span className="font-semibold text-xs sm:text-sm tracking-tight text-white inline-flex items-baseline">
              <span className="text-[#f3efe8]">sphere</span>
              <span className="text-[1.35em] font-extrabold leading-none inline-block mx-0.5 text-[var(--accent)] drop-shadow-[0_0_8px_rgba(244,162,114,0.5)]">X</span>
              <span className="text-[#f3efe8]">plorer</span>
            </span>
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

      {/* 2. Embedded Authoritative Illustrated Storybook */}
      <main className="flex-1 w-full h-[calc(100vh-64px)] relative bg-[#070910]">
        <iframe
          src="/storybook/index.html"
          title="SPHEREx · The Universe in 102 Colours"
          className="w-full h-full border-0 block"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </main>
    </div>
  );
};

export default StorybookWorkspace;
