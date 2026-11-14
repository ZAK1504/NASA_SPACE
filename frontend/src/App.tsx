import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContinuousHorizonApp } from "./pages/ContinuousHorizonApp";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Continuous Single-Page HORIZON Application */}
        <Route path="/" element={<ContinuousHorizonApp />} />
        <Route path="/home" element={<ContinuousHorizonApp />} />
        <Route path="/explorer" element={<ContinuousHorizonApp />} />
        <Route path="/explorer/:sub" element={<ContinuousHorizonApp />} />
        <Route path="/explorer/object/:objectId" element={<ContinuousHorizonApp />} />
        <Route path="/time" element={<ContinuousHorizonApp />} />
        <Route path="/time-machine" element={<ContinuousHorizonApp />} />
        <Route path="/lab" element={<ContinuousHorizonApp />} />
        <Route path="/lab/:sub" element={<ContinuousHorizonApp />} />
        <Route path="/labs" element={<ContinuousHorizonApp />} />
        <Route path="/mission" element={<ContinuousHorizonApp />} />
        <Route path="/missions" element={<ContinuousHorizonApp />} />
        <Route path="/missions/:missionId" element={<ContinuousHorizonApp />} />

        {/* Backward-Compatible Scientific Deep Links */}
        <Route path="/explore" element={<ContinuousHorizonApp />} />
        <Route path="/objects" element={<ContinuousHorizonApp />} />
        <Route path="/objects/:objectId" element={<ContinuousHorizonApp />} />
        <Route path="/spectra" element={<ContinuousHorizonApp />} />
        <Route path="/discovery-lab" element={<ContinuousHorizonApp />} />
        <Route path="/light-curves" element={<ContinuousHorizonApp />} />
        <Route path="/discoveries" element={<ContinuousHorizonApp />} />

        {/* Fallback */}
        <Route path="*" element={<ContinuousHorizonApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
