import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Compass, Eye, Layers, FlaskConical, TrendingUp, Sparkles, BookOpen } from "lucide-react";
import { returnToJourney } from "../../lib/journeyState";
import { CosmicCopilot } from "../assistant/CosmicCopilot";
import PillSwitch from "../ui/PillSwitch";
import { useGuidedTour } from "../../hooks/useGuidedTour";

export interface ScientificWorkspaceLayoutProps {
  title: string;
  categoryTag?: string;
  defaultChapter?: string;
  workspaceType?: "explorer" | "time-machine" | "labs" | "mission";
  activeTool?: string;
  onSwitchTool?: (toolId: string) => void;
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
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startTour } = useGuidedTour();

  const handleBackToJourney = () => {
    returnToJourney(navigate, defaultChapter);
  };

  return (
    <div className="scientific-workspace-layout min-h-screen bg-[#020308] text-[#f3efe8] flex flex-col relative selection:bg-[#f4a272] selection:text-black">
      {/* 1. Dedicated Scientific Top Bar */}
      <header className="sticky top-0 z-50 w-full h-16 border-b border-white/10 bg-black/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Back to Journey & Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToJourney}
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-[var(--accent)] text-xs font-mono text-white/80 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Return to the Journey at your previous scroll position"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)] group-hover:-translate-x-1 transition-transform" />
            <span>Back to Journey</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* HORIZON Branding */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="font-medium text-sm tracking-tight text-white">SPHEREx HORIZON</span>
          </div>

          {/* Workspace Title Badge */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10.5px] font-mono text-[var(--accent)]">
            <span>[{categoryTag} · {title.toUpperCase()}]</span>
          </div>
        </div>

        {/* Center: Contextual Tool Switching for Explorer / Labs */}
        {workspaceType === "explorer" && (
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
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
          <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
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

        {/* Right: Tour button & Guide */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => startTour("getting-started")}
            className="text-xs font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Tour</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Body Container (Maximum Screen Real Estate) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 flex flex-col">
        {children}
      </main>

      {/* 3. Contextual Bottom Navigation (Constrained ONLY to Explorer and Labs) */}
      {workspaceType === "explorer" && (
        <div className="sticky bottom-6 z-40 flex flex-col items-center justify-center mt-auto pointer-events-none pb-2">
          <div className="pointer-events-auto shadow-2xl backdrop-blur-xl bg-black/75 rounded-full border border-white/10 p-1">
            <PillSwitch
              className="stage-pill"
              items={EXPLORER_TOOLS}
              value={activeTool || "sky"}
              onChange={(id) => {
                if (id === "sky") navigate("/explore");
                else if (id === "object") navigate("/objects");
                else if (id === "spectral") navigate("/spectra");
              }}
            />
          </div>
        </div>
      )}

      {workspaceType === "labs" && (
        <div className="sticky bottom-6 z-40 flex flex-col items-center justify-center mt-auto pointer-events-none pb-2">
          <div className="pointer-events-auto shadow-2xl backdrop-blur-xl bg-black/75 rounded-full border border-white/10 p-1">
            <PillSwitch
              className="stage-pill"
              items={LABS_TOOLS}
              value={activeTool === "light-curves" ? "light-curves" : "discovery"}
              onChange={(id) => {
                if (id === "discovery") navigate("/discovery-lab");
                else if (id === "light-curves") navigate("/light-curves");
              }}
            />
          </div>
        </div>
      )}

      {/* Global Interactive Cosmic Copilot */}
      <CosmicCopilot />
    </div>
  );
};

export default ScientificWorkspaceLayout;