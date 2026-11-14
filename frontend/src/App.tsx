import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { TransitionProvider } from './components/ui/Transition';
import { Home } from './pages/Home';
import { ExplorerPage } from './pages/ExplorerPage';
import { TimePage } from './pages/TimePage';
import { LabPage } from './pages/LabPage';
import { MissionPage } from './pages/MissionPage';
import { About } from './pages/About';
import { Settings } from './pages/Settings';

// Helper component that preserves query parameters during redirection
const RedirectWithQuery: React.FC<{ to: string }> = ({ to }) => {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <TransitionProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* 1. Cinematic Homepage */}
            <Route index element={<Home />} />

            {/* 2. Explorer Workspace (All-sky, Object, Spectral) */}
            <Route path="explorer" element={<Navigate to="/explorer/sky" replace />} />
            <Route path="explorer/:sub" element={<ExplorerPage />} />
            <Route path="explorer/object/:objectId" element={<ExplorerPage defaultSub="object" />} />

            {/* 3. Time Machine Workspace (Time-domain multi-epoch analysis) */}
            <Route path="time" element={<TimePage />} />

            {/* 4. Lab Workspace (Discovery, Light curves, My discovery) */}
            <Route path="lab" element={<Navigate to="/lab/discovery" replace />} />
            <Route path="lab/:sub" element={<LabPage />} />

            {/* 5. Mission Workspace (3D Observatory, facts, simulation & guided missions) */}
            <Route path="mission" element={<MissionPage />} />

            {/* 6. General / Information Pages */}
            <Route path="about" element={<About />} />
            <Route path="settings" element={<Settings />} />

            {/* 7. Backward-Compatible Scientific Route Aliases (Preserving all deep-links & search query parameters) */}
            <Route path="explore" element={<RedirectWithQuery to="/explorer/sky" />} />
            <Route path="objects" element={<RedirectWithQuery to="/explorer/object" />} />
            <Route path="objects/:objectId" element={<ExplorerPage defaultSub="object" />} />
            <Route path="spectra" element={<RedirectWithQuery to="/explorer/spectral" />} />
            <Route path="time-machine" element={<RedirectWithQuery to="/time" />} />
            <Route path="discovery-lab" element={<RedirectWithQuery to="/lab/discovery" />} />
            <Route path="light-curves" element={<RedirectWithQuery to="/lab/light-curves" />} />
            <Route path="discoveries" element={<RedirectWithQuery to="/lab/my-discovery" />} />
            <Route path="missions" element={<RedirectWithQuery to="/mission" />} />
            <Route path="missions/:missionId" element={<MissionPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </TransitionProvider>
    </BrowserRouter>
  );
}

export default App;
