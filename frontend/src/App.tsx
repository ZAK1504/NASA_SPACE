import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import JourneyPage from "./pages/JourneyPage";
import SkyExplorerWorkspace from "./pages/workspaces/SkyExplorerWorkspace";
import ObjectExplorerWorkspace from "./pages/workspaces/ObjectExplorerWorkspace";
import SpectralExplorerWorkspace from "./pages/workspaces/SpectralExplorerWorkspace";
import TimeMachineWorkspace from "./pages/workspaces/TimeMachineWorkspace";
import DiscoveryLabWorkspace from "./pages/workspaces/DiscoveryLabWorkspace";
import MyDiscoveriesWorkspace from "./pages/workspaces/MyDiscoveriesWorkspace";
import LightCurvesWorkspace from "./pages/workspaces/LightCurvesWorkspace";
import MissionsWorkspace from "./pages/workspaces/MissionsWorkspace";
import TrainingGameWorkspace from "./pages/workspaces/TrainingGameWorkspace";
import AboutWorkspace from "./pages/workspaces/AboutWorkspace";
import WorkspaceTransitionOverlay from "./components/navigation/WorkspaceTransitionOverlay";

export function App() {
  return (
    <BrowserRouter>
      {/* Cinematic Workspace Travel & Return Overlay */}
      <WorkspaceTransitionOverlay />
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

        {/* 10. About SPHEREx */}
        <Route path="/about" element={<AboutWorkspace />} />

        {/* Fallback to Journey */}
        <Route path="*" element={<JourneyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;