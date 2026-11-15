import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import JourneyPage from "./pages/JourneyPage";
import WorkspaceTransitionOverlay from "./components/navigation/WorkspaceTransitionOverlay";

// Lazy-loaded dedicated scientific workspaces for optimal production code-splitting
const SkyExplorerWorkspace = lazy(() => import("./pages/workspaces/SkyExplorerWorkspace"));
const ObjectExplorerWorkspace = lazy(() => import("./pages/workspaces/ObjectExplorerWorkspace"));
const SpectralExplorerWorkspace = lazy(() => import("./pages/workspaces/SpectralExplorerWorkspace"));
const TimeMachineWorkspace = lazy(() => import("./pages/workspaces/TimeMachineWorkspace"));
const DiscoveryLabWorkspace = lazy(() => import("./pages/workspaces/DiscoveryLabWorkspace"));
const MyDiscoveriesWorkspace = lazy(() => import("./pages/workspaces/MyDiscoveriesWorkspace"));
const LightCurvesWorkspace = lazy(() => import("./pages/workspaces/LightCurvesWorkspace"));
const MissionsWorkspace = lazy(() => import("./pages/workspaces/MissionsWorkspace"));
const TrainingGameWorkspace = lazy(() => import("./pages/workspaces/TrainingGameWorkspace"));

const WorkspaceLoader: React.FC = () => (
  <div className="min-h-screen w-full bg-[#060608] flex flex-col items-center justify-center text-[#F4A272] font-mono text-sm">
    <div className="w-8 h-8 border-2 border-[#F4A272] border-t-transparent rounded-full animate-spin mb-4" />
    <span className="tracking-widest uppercase text-xs text-[#9E9AA7]">Calibrating SPHEREx Instruments...</span>
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      {/* Cinematic Workspace Travel & Return Overlay */}
      <WorkspaceTransitionOverlay />
      <Suspense fallback={<WorkspaceLoader />}>
        <Routes>
          {/* Layer A — The HORIZON Journey (Continuous Storytelling Showcase) */}
          <Route path="/" element={<JourneyPage />} />
          <Route path="/home" element={<JourneyPage />} />

          {/* Layer B — Dedicated Scientific Workspaces */}
          {/* 1. Sky Explorer */}
          <Route path="/explore" element={<SkyExplorerWorkspace />} />
          <Route path="/explorer/sky" element={<SkyExplorerWorkspace />} />
          <Route path="/explorer" element={<Navigate to="/explore" replace />} />

          {/* 2. Object Explorer & Detail */}
          <Route path="/objects" element={<ObjectExplorerWorkspace />} />
          <Route path="/objects/:objectId" element={<ObjectExplorerWorkspace />} />
          <Route path="/explorer/object" element={<ObjectExplorerWorkspace />} />
          <Route path="/explorer/object/:objectId" element={<ObjectExplorerWorkspace />} />

          {/* 3. Spectral Explorer */}
          <Route path="/spectra" element={<SpectralExplorerWorkspace />} />
          <Route path="/explorer/spectral" element={<SpectralExplorerWorkspace />} />

          {/* 4. SPHEREx Time Machine */}
          <Route path="/time-machine" element={<TimeMachineWorkspace />} />
          <Route path="/time" element={<TimeMachineWorkspace />} />

          {/* 5. Discovery Lab */}
          <Route path="/discovery-lab" element={<DiscoveryLabWorkspace />} />
          <Route path="/lab/discovery" element={<DiscoveryLabWorkspace />} />
          <Route path="/lab" element={<Navigate to="/discovery-lab" replace />} />
          <Route path="/labs" element={<Navigate to="/discovery-lab" replace />} />

          {/* 6. My Discoveries Journal */}
          <Route path="/discoveries" element={<MyDiscoveriesWorkspace />} />
          <Route path="/lab/my-discovery" element={<MyDiscoveriesWorkspace />} />

          {/* 7. Photometric Light Curves */}
          <Route path="/light-curves" element={<LightCurvesWorkspace />} />
          <Route path="/lab/light-curves" element={<LightCurvesWorkspace />} />

          {/* 8. Guided Science Missions */}
          <Route path="/missions" element={<MissionsWorkspace />} />
          <Route path="/missions/:missionId" element={<MissionsWorkspace />} />
          <Route path="/mission" element={<MissionsWorkspace />} />

          {/* 9. Training Simulation Mini-Game */}
          <Route path="/mission/training" element={<TrainingGameWorkspace />} />
          <Route path="/game" element={<TrainingGameWorkspace />} />

          {/* Fallback to Journey */}
          <Route path="*" element={<JourneyPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;