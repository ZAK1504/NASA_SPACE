# SPHEREx HORIZON — UI Migration Route Map & Deep-Link Compatibility

**Project:** SPHEREx HORIZON  
**Branch:** `feat/cinematic-ui-migration`  

---

## 1. Route Mapping Table

To guarantee zero broken links and preserve existing navigation bookmarks while adopting the new presentation structure, all routes are dual-supported via direct routing and automatic canonical redirects:

| Presentation Destination | Prototype Path | Existing Canonical Path | Handled By | Query Parameter Support | Deep-Link Compatibility |
|:---|:---|:---|:---|:---|:---|
| **Homepage** | `/` | `/` | `Home.tsx` | N/A | Full |
| **Explorer > Sky** | `/explorer/sky` | `/explore` | `ExploreSky.tsx` inside `Stage` | `?survey=...&ra=...&dec=...&fov=...` | `/explore` redirects to `/explorer/sky` |
| **Explorer > Object** | `/explorer/object` | `/objects` | `ObjectDetail.tsx` inside `Stage` | `?target=...&id=...` | `/objects` redirects to `/explorer/object` |
| **Explorer > Spectral** | `/explorer/spectral` | `/spectra` | `SpectralExplorer.tsx` inside `Stage` | `?channel=...&wavelength=...` | `/spectra` redirects to `/explorer/spectral` |
| **Time Machine** | `/time-machine` | `/time-machine` | `TimeMachine.tsx` inside `Stage` | `?object=...&ra=...&dec=...&view=...` | Full (both target preset & custom RA/Dec) |
| **Lab > Discovery** | `/lab/discovery` | `/discovery-lab` | `DiscoveryLab.tsx` inside `Stage` | `?target=...&obs1=...&obs2=...` | `/discovery-lab` redirects to `/lab/discovery` |
| **Lab > Light Curves** | `/lab/light-curves` | `/light-curves` | `LightCurves.tsx` inside `Stage` | `?target=...` | `/light-curves` redirects to `/lab/light-curves` |
| **Lab > My Discoveries** | `/lab/my-discovery` | `/discoveries` | `Discoveries.tsx` inside `Stage` | `?filter=...` | `/discoveries` redirects to `/lab/my-discovery` |
| **Mission & Game** | `/mission` | `/missions` | `Mission.tsx` inside `Stage` | `?tab=guided\|game` | `/missions` redirects to `/mission` |

---

## 2. Route Alias & Redirect Architecture

In `frontend/src/App.tsx`:
```tsx
<Routes>
  {/* Presentation Routes */}
  <Route path="/" element={<Home />} />
  <Route path="/explorer" element={<Navigate to="/explorer/sky" replace />} />
  <Route path="/explorer/sky" element={<ExplorerSkyPage />} />
  <Route path="/explorer/object" element={<ExplorerObjectPage />} />
  <Route path="/explorer/spectral" element={<ExplorerSpectralPage />} />
  <Route path="/time-machine" element={<TimeMachinePage />} />
  <Route path="/lab" element={<Navigate to="/lab/discovery" replace />} />
  <Route path="/lab/discovery" element={<DiscoveryLabPage />} />
  <Route path="/lab/light-curves" element={<LightCurvesPage />} />
  <Route path="/lab/my-discovery" element={<MyDiscoveriesPage />} />
  <Route path="/mission" element={<MissionPage />} />

  {/* Legacy Canonical Route Aliases */}
  <Route path="/explore" element={<Navigate to="/explorer/sky" replace />} />
  <Route path="/objects" element={<Navigate to="/explorer/object" replace />} />
  <Route path="/spectra" element={<Navigate to="/explorer/spectral" replace />} />
  <Route path="/discovery-lab" element={<Navigate to="/lab/discovery" replace />} />
  <Route path="/discoveries" element={<Navigate to="/lab/my-discovery" replace />} />
  <Route path="/light-curves" element={<Navigate to="/lab/light-curves" replace />} />
  <Route path="/missions" element={<Navigate to="/mission" replace />} />

  {/* Fallback */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```
