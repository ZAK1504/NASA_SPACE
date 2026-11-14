import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout }           from './components/layout/Layout';
import { Home }             from './pages/Home';
import { ExploreSky }       from './pages/ExploreSky';
import { ObjectExplorer }   from './pages/ObjectExplorer';
import { ObjectDetail }     from './pages/ObjectDetail';
import { TimeMachine }      from './pages/TimeMachine';
import { DiscoveryLab }     from './pages/DiscoveryLab';
import { SpectralExplorer } from './pages/SpectralExplorer';
import { LightCurves }      from './pages/LightCurves';
import { Missions }         from './pages/Missions';
import { MyDiscoveries }    from './pages/MyDiscoveries';
import { About }            from './pages/About';
import { Settings }         from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index                       element={<Home />} />
          <Route path="explore"              element={<ExploreSky />} />
          <Route path="objects"              element={<ObjectExplorer />} />
          <Route path="objects/:objectId"    element={<ObjectDetail />} />
          <Route path="time-machine"         element={<TimeMachine />} />
          <Route path="discovery-lab"        element={<DiscoveryLab />} />
          <Route path="spectra"              element={<SpectralExplorer />} />
          <Route path="light-curves"         element={<LightCurves />} />
          <Route path="missions"             element={<Missions />} />
          <Route path="missions/:missionId"  element={<Missions />} />
          <Route path="discoveries"          element={<MyDiscoveries />} />
          <Route path="about"                element={<About />} />
          <Route path="settings"             element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
