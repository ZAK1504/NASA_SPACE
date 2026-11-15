import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Compass, Eye, Layers, FlaskConical, TrendingUp, Sparkles, BookOpen } from "lucide-react";
import { returnToJourney, travelBackToJourney } from "../../lib/journeyState";
import { CosmicCopilot } from "../assistant/CosmicCopilot";
import { useGuidedTour } from "../../hooks/useGuidedTour";

export interface ScientificWorkspaceLayoutProps {
  title: string;
  categoryTag?: string;
  defaultChapter?: string;
  workspaceType?: "explorer" | "time-machine" | "labs" | "mission";
  activeTool?: string;
  onSwitchTool?: (toolId: string) => void;
  tourId?: string;
  children: React.ReactNode;
}

const EXPLORER_TOOLS = [
  { id: "sky", label: "Sky" },
  { id: "object", label: "Object" },
  { id: "spectral", label: "Spectral" },
];

const LABS_TOOLS = [
  { id: "discovery", label: "Discovery" },
  { id: "light-curves", label: "Light Curves" },
];

export const ScientificWorkspaceLayout: React.FC<ScientificWorkspaceLayoutProps> = ({
  title,
  categoryTag = "SCIENTIFIC WORKSPACE",
  defaultChapter = "home",
  workspaceType,
  activeTool,
  onSwitchTool,
  tourId,
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startTour, shouldAutoStart } = useGuidedTour();

  // CRITICAL: Ensure every newly opened dedicated workspace always starts at the top
  React.useEffect(() => {
    // If Lenis smooth scroll is present, reset immediately
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  // Determine route-specific tour ID
  const getResolvedTourId = (): string => {
    if (tourId) return tourId;
    const path = location.pathname;
    if (path.includes("/explore") || activeTool === "sky") return "sky-explorer";
    if (path.includes("/objects") || activeTool === "object") return "object-explorer";
    if (path.includes("/spectra") || activeTool === "spectral") return "spectral-explorer";
    if (path.includes("/time") || workspaceType === "time-machine") return "time-machine";
    if (path.includes("/discovery") || activeTool === "discovery") return "discovery-lab";
    if (path.includes("/light-curves") || activeTool === "light-curves") return "light-curves";
    if (path.includes("/discoveries") || activeTool === "discoveries") return "discovery-journal";
    if (path.includes("/missions") || path === "/mission") return "missions";
    if (path.includes("/training") || path === "/game") return "training-game";
    return "getting-started";
  };

  // Automatic first-visit tutorial introduction (delayed until travel overlay completes)
  React.useEffect(() => {
    const resolvedId = getResolvedTourId();
    if (!resolvedId || resolvedId === "getting-started") return;

    if (!shouldAutoStart(resolvedId)) return;

    // Wait ~1100ms for travel transition to finish and elements to mount
    const autoTimer = setTimeout(() => {
      startTour(resolvedId, false);
    }, 1100);

    return () => clearTimeout(autoTimer);
  }, [location.pathname]);

  const handleBackToJourney = () => {
    travelBackToJourney(navigate, defaultChapter);
  };

  return (
    <div className="scientific-workspace-layout horizon-workspace min-h-screen bg-[#08080C] text-[#f3efe8] flex flex-col relative selection:bg-[#f4a272] selection:text-black">
      {/* 1. Dedicated Scientific Top Bar */}
      <header className="sticky top-0 z-50 w-full h-16 border-b border-white/10 bg-black/85 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Back to Journey & Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleBackToJourney}
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-[var(--accent)] text-xs font-mono text-white/80 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Return to the Journey at your previous scroll position"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)] group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to Journey</span>
            <span className="sm:hidden">Journey</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* HORIZON Branding */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="font-medium text-xs sm:text-sm tracking-tight text-white">SPHEREx HORIZON</span>
          </div>

          {/* Workspace Title Badge */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10.5px] font-mono text-[var(--accent)]">
            <span>[{categoryTag} · {title.toUpperCase()}]</span>
          </div>
        </div>

        {/* Center: Contextual Tool Switching for Explorer / Labs (Single Authoritative Navigation) */}
        {workspaceType === "explorer" && (
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 text-xs">
            <button
              onClick={() => navigate("/explore")}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeTool === "sky"
                  ? "bg-[var(--accent)] text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Sky
            </button>
            <button
              onClick={() => navigate("/objects")}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeTool === "object"
                  ? "bg-[var(--accent)] text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Object
            </button>
            <button
              onClick={() => navigate("/spectra")}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeTool === "spectral"
                  ? "bg-[var(--accent)] text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Spectral
            </button>
          </div>
        )}

        {workspaceType === "labs" && (
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 text-xs">
            <button
              onClick={() => navigate("/discovery-lab")}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeTool === "discovery"
                  ? "bg-[var(--accent)] text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Discovery
            </button>
            <button
              onClick={() => navigate("/discoveries")}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeTool === "discoveries"
                  ? "bg-[var(--accent)] text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Journal
            </button>
            <button
              onClick={() => navigate("/light-curves")}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeTool === "light-curves"
                  ? "bg-[var(--accent)] text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Light Curves
            </button>
          </div>
        )}

        {/* Right: Page-Specific Tour Button (Manual replay always launches) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => startTour(getResolvedTourId(), true)}
            className="text-xs font-mono text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 hover:border-[var(--accent)] transition-all flex items-center gap-1.5 cursor-pointer"
            title={`Start ${title} guided tour`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Tour</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Body Container (Maximum Screen Real Estate, ZERO Bottom Navigation Overlays) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 flex flex-col">
        {children}
      </main>

      {/* Global Interactive Cosmic Copilot */}
      <CosmicCopilot />
    </div>
  );
};

export default ScientificWorkspaceLayout;