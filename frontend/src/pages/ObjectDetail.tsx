import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, AlertCircle, Clock, Eye, ExternalLink,
  Layers, RefreshCw, BarChart2, CheckCircle2, Sliders
} from 'lucide-react';
import { api, ObservationRecord, TargetSpectrumResponse } from '../services/api';
import { FEATURED_OBJECTS } from '../constants/objects';
import { CoordDisplay } from '../components/ui/CoordDisplay';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { InfoPanel } from '../components/ui/InfoPanel';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

type Tab = 'overview' | 'observations' | 'spectra' | 'compare' | 'catalogs';

export const ObjectDetail: React.FC = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  // Object and data state
  const fallbackObj = FEATURED_OBJECTS.find((o) => o.slug === objectId || o.id === objectId);
  const [objectData, setObjectData] = useState<any>(fallbackObj || null);
  
  // Observations state
  const [observations, setObservations] = useState<ObservationRecord[]>([]);
  const [loadingObs, setLoadingObs] = useState<boolean>(false);
  const [obsError, setObsError] = useState<string | null>(null);

  // Spectral state
  const [spectrumData, setSpectrumData] = useState<TargetSpectrumResponse | null>(null);
  const [loadingSpec, setLoadingSpec] = useState<boolean>(false);

  // Cross-Mission Catalog state
  const [catalogData, setCatalogData] = useState<any>(null);
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(false);

  // Preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [selectedStretch, setSelectedStretch] = useState<string>('asinh');
  const [selectedColormap, setSelectedColormap] = useState<string>('inferno');

  // Fetch object details and preview
  useEffect(() => {
    if (!objectId) return;
    
    // Fetch object from API
    api.getObject(objectId)
      .then((data) => setObjectData(data))
      .catch(() => {
        // Keep fallback
      });

    // Generate scientific preview
    const targetObj = fallbackObj || objectData;
    if (targetObj && targetObj.ra !== undefined && targetObj.dec !== undefined) {
      setLoadingPreview(true);
      api.generatePreview({
        stretch: selectedStretch,
        colormap: selectedColormap,
        ra: targetObj.ra,
        dec: targetObj.dec,
        fovArcsec: 180.0,
      })
      .then((res) => {
        if (res && res.image_base64) {
          setPreviewImage(res.image_base64);
        }
      })
      .catch((err) => console.warn('Preview render error:', err))
      .finally(() => setLoadingPreview(false));
    }
  }, [objectId, selectedStretch, selectedColormap]);

  // Fetch observations when tab is switched
  useEffect(() => {
    if (tab === 'observations' && observations.length === 0 && objectId) {
      setLoadingObs(true);
      setObsError(null);
      api.getObservations({ objectId, limit: 30 })
        .then((res) => {
          setObservations(res.observations);
        })
        .catch((err) => {
          setObsError(err.message || 'Could not load observations from archive');
        })
        .finally(() => setLoadingObs(false));
    }

    if (tab === 'spectra' && !spectrumData && objectId) {
      setLoadingSpec(true);
      api.getSpectrum(objectId)
        .then((data) => setSpectrumData(data))
        .catch(() => {})
        .finally(() => setLoadingSpec(false));
    }

    if (tab === 'catalogs' && !catalogData && objectId) {
      setLoadingCatalog(true);
      api.getCatalogCrossmatch(objectId)
        .then((data) => setCatalogData(data))
        .catch(() => {})
        .finally(() => setLoadingCatalog(false));
    }
  }, [tab, objectId, observations.length, spectrumData, catalogData]);

  if (!objectData) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <EmptyState
          title="Object not found"
          description="This object is not in our database. Try searching from the Object Explorer."
          action={{ label: 'Back to objects', onClick: () => navigate('/objects') }}
        />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'observations', label: 'Observations', count: observations.length || undefined },
    { id: 'spectra', label: 'Spectra (102 Bands)' },
    { id: 'catalogs', label: 'Catalogs (Gaia / AllWISE)' },
    { id: 'compare', label: 'Time Machine' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-6">
        <Link to="/objects" className="hover:text-[#E8EDF5] transition-colors">Objects</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#E8EDF5]">{objectData.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="blue">{objectData.type}</Badge>
            {objectData.tags && objectData.tags.map((t: string) => <Badge key={t} variant="muted">{t}</Badge>)}
            {objectData.spectral_type && (
              <Badge variant="amber">Spectral Type: {objectData.spectral_type}</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-[#E8EDF5] mb-3">{objectData.name}</h1>
          <p className="text-[#94A3B8] leading-relaxed max-w-2xl text-sm">{objectData.description}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Clock className="w-4 h-4" />}
            onClick={() => navigate(`/time-machine?object=${objectData.slug || objectData.id}`)}
          >
            Time Machine
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/discovery-lab?object=${objectData.slug || objectData.id}`)}
          >
            Investigate in Lab
          </Button>
        </div>
      </div>

      {/* Coordinates */}
      <div className="mb-8">
        <CoordDisplay
          ra={objectData.ra}
          dec={objectData.dec}
          raHms={objectData.ra_hms || objectData.raHms}
          decDms={objectData.dec_dms || objectData.decDms}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-[#263247] mb-6">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                tab === t.id
                  ? 'border-[#6EA8FE] text-[#6EA8FE]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#E8EDF5]'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1a2540] text-[#6EA8FE]">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Scientific Preview */}
            <div className="bg-[#151E30] border border-[#263247] rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#6EA8FE]" />
                  <h3 className="text-sm font-semibold text-[#E8EDF5]">Scientific Visualization</h3>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedStretch}
                    onChange={(e) => setSelectedStretch(e.target.value)}
                    className="bg-[#0B1020] border border-[#263247] text-[#94A3B8] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#6EA8FE]"
                  >
                    <option value="asinh">Asinh Stretch</option>
                    <option value="linear">Linear Stretch</option>
                    <option value="sqrt">Sqrt Stretch</option>
                    <option value="log">Log Stretch</option>
                  </select>
                  <select
                    value={selectedColormap}
                    onChange={(e) => setSelectedColormap(e.target.value)}
                    className="bg-[#0B1020] border border-[#263247] text-[#94A3B8] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#6EA8FE]"
                  >
                    <option value="inferno">Inferno</option>
                    <option value="viridis">Viridis</option>
                    <option value="magma">Magma</option>
                    <option value="gray">Grayscale</option>
                  </select>
                </div>
              </div>

              <div className="aspect-square bg-[#0B1020] border border-[#263247] rounded overflow-hidden flex items-center justify-center relative">
                {loadingPreview ? (
                  <div className="text-center p-4">
                    <RefreshCw className="w-6 h-6 text-[#6EA8FE] animate-spin mx-auto mb-2" />
                    <p className="text-xs text-[#94A3B8]">Rendering with Astropy {selectedStretch} stretch…</p>
                  </div>
                ) : previewImage ? (
                  <img
                    src={previewImage}
                    alt={`${objectData.name} observation preview`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <p className="text-xs text-[#94A3B8]">Preview unavailable</p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-[#94A3B8]">
                <span>Percentile: 0.5% – 99.5%</span>
                <span className="font-mono text-[#6EA8FE]">Astropy WCS & Visualization</span>
              </div>
            </div>

            {/* Scientific Properties Panel */}
            <div className="space-y-4">
              <div className="bg-[#151E30] border border-[#263247] rounded p-5">
                <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">Astrometric & Physical Parameters</h3>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center border-b border-[#263247]/50 pb-2">
                    <dt className="text-[#94A3B8]">Object Type</dt>
                    <dd className="text-[#E8EDF5] font-medium">{objectData.type}</dd>
                  </div>
                  {objectData.distance_ly && (
                    <div className="flex justify-between items-center border-b border-[#263247]/50 pb-2">
                      <dt className="text-[#94A3B8]">Distance</dt>
                      <dd className="font-mono text-[#6EA8FE]">{objectData.distance_ly} light-years</dd>
                    </div>
                  )}
                  {objectData.proper_motion_ra !== undefined && (
                    <div className="flex justify-between items-center border-b border-[#263247]/50 pb-2">
                      <dt className="text-[#94A3B8]">Proper Motion (RA)</dt>
                      <dd className="font-mono text-[#6EA8FE]">{objectData.proper_motion_ra} mas/yr</dd>
                    </div>
                  )}
                  {objectData.proper_motion_dec !== undefined && (
                    <div className="flex justify-between items-center border-b border-[#263247]/50 pb-2">
                      <dt className="text-[#94A3B8]">Proper Motion (Dec)</dt>
                      <dd className="font-mono text-[#6EA8FE]">{objectData.proper_motion_dec} mas/yr</dd>
                    </div>
                  )}
                  {objectData.parallax && (
                    <div className="flex justify-between items-center border-b border-[#263247]/50 pb-2">
                      <dt className="text-[#94A3B8]">Parallax</dt>
                      <dd className="font-mono text-[#6EA8FE]">{objectData.parallax} mas</dd>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-b border-[#263247]/50 pb-2">
                    <dt className="text-[#94A3B8]">IRSA Archive Source</dt>
                    <dd className="text-[#6EA8FE] text-xs font-mono">NASA/IPAC IRSA (spherex.obscore)</dd>
                  </div>
                </dl>
              </div>

              <InfoPanel title="What am I seeing?" defaultOpen>
                <p>
                  This view presents calibrated observation data for{' '}
                  <strong className="text-[#E8EDF5]">{objectData.name}</strong>.
                </p>
                <p>
                  The image is rendered using an <strong className="text-[#E8EDF5]">inverse hyperbolic sine (Asinh) stretch</strong>.
                  Astronomical images have immense dynamic range: faint background nebulosity is thousands of times dimmer than stellar cores.
                  An Asinh stretch preserves faint background details without saturating bright stars.
                </p>
                <p>
                  Switch to the <strong className="text-[#E8EDF5]">Observations</strong> tab to explore individual real observations taken across SPHEREx's 102 spectral bands.
                </p>
              </InfoPanel>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Observations */}
      {tab === 'observations' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-start gap-3 bg-[#151E30] border border-[#263247] rounded p-4">
            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#94A3B8]">
              <span className="text-[#E8EDF5] font-medium">NASA/IPAC IRSA SPHEREx Archive Connected: </span>
              Displaying genuine observations from the official <span className="font-mono text-[#6EA8FE]">spherex.obscore</span> table.
              Select any observation pair to compare them in the Time Machine.
            </div>
          </div>

          {loadingObs ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#151E30] border border-[#263247] rounded p-4 space-y-3">
                  <LoadingSkeleton className="h-5 w-2/3" />
                  <LoadingSkeleton className="h-3 w-1/3" />
                  <LoadingSkeleton className="h-3 w-full" />
                  <LoadingSkeleton className="h-3 w-4/5" />
                  <LoadingSkeleton className="h-8 w-24 mt-2" />
                </div>
              ))}
            </div>
          ) : obsError ? (
            <div className="bg-[#151E30] border border-red-900/40 rounded p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-[#E8EDF5] mb-1">Archive Query Notice</h4>
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto mb-4">{obsError}</p>
              <Button variant="ghost" size="sm" onClick={() => { setObservations([]); setLoadingObs(true); }}>
                Retry Query
              </Button>
            </div>
          ) : observations.length === 0 ? (
            <EmptyState
              title="No observations found"
              description="No SPHEREx observations currently matched this target field in the archive."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {observations.map((obs) => (
                <div key={obs.id} className="bg-[#151E30] border border-[#263247] rounded p-4 flex flex-col hover:border-[#3a4d6b] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold text-[#6EA8FE] truncate">
                      {obs.obs_id}
                    </span>
                    <Badge variant="blue">{obs.bandpass || 'SPHEREx'}</Badge>
                  </div>

                  <div className="text-xs text-[#94A3B8] space-y-1 mb-3">
                    {obs.date_obs && (
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-mono text-[#E8EDF5]">{obs.date_obs}</span>
                      </div>
                    )}
                    {obs.wavelength_min_um && obs.wavelength_max_um && (
                      <div className="flex justify-between">
                        <span>Wavelength:</span>
                        <span className="font-mono text-[#6EA8FE]">{obs.wavelength_min_um} – {obs.wavelength_max_um} μm</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Pixel Scale:</span>
                      <span className="font-mono text-[#E8EDF5]">{obs.pixel_scale_arcsec || 6.2}"/pix</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Archive:</span>
                      <span className="text-[#E8EDF5]">{obs.archive_source}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-[#263247] flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/time-machine?object=${objectData.slug}&obs1=${obs.obs_id}`)}
                      className="text-xs w-full justify-center"
                    >
                      Compare in Time Machine
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Spectra */}
      {tab === 'spectra' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#151E30] border border-[#263247] rounded p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-1">
                  102-Band Near-Infrared Spectral Coverage
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Wavelength range: 0.75 μm to 5.0 μm across 6 detector arrays (D1 to D6)
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                rightIcon={<BarChart2 className="w-4 h-4" />}
                onClick={() => navigate(`/spectra?object=${objectData.slug}`)}
              >
                Full Spectral Explorer
              </Button>
            </div>

            {loadingSpec ? (
              <div className="py-12 text-center">
                <RefreshCw className="w-6 h-6 text-[#6EA8FE] animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#94A3B8]">Loading spectral coverage…</p>
              </div>
            ) : spectrumData ? (
              <div>
                {/* Visual spectrum band bar */}
                <div className="h-6 w-full rounded flex overflow-hidden mb-3 border border-[#263247]">
                  {spectrumData.channels.map((ch) => (
                    <div
                      key={ch.channel}
                      className={`flex-1 transition-opacity ${
                        ch.observed ? 'bg-[#6EA8FE]' : 'bg-[#1a2540]'
                      }`}
                      title={`Channel ${ch.channel}: ${ch.wavelength_um} μm (${ch.detector})`}
                    />
                  ))}
                </div>

                <div className="flex justify-between text-xs font-mono text-[#94A3B8] mb-4">
                  <span>0.75 μm (Optical edge)</span>
                  <span>2.4 μm</span>
                  <span>3.8 μm</span>
                  <span>5.0 μm (Mid-IR edge)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                  {['D1: 0.75-1.11μm', 'D2: 1.11-1.64μm', 'D3: 1.64-2.42μm', 'D4: 2.42-3.82μm', 'D5: 3.82-4.42μm', 'D6: 4.42-5.00μm'].map((name, i) => {
                    const detId = `D${i+1}`;
                    const hasDet = spectrumData.covered_detectors.includes(detId);
                    return (
                      <div key={detId} className={`p-2 rounded border ${hasDet ? 'bg-[#6EA8FE]/10 border-[#6EA8FE]/40 text-[#6EA8FE]' : 'bg-[#0B1020] border-[#263247] text-[#94A3B8]'}`}>
                        <div className="font-semibold">{detId}</div>
                        <div className="text-[10px] mt-0.5">{name.split(': ')[1]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <InfoPanel title="Why are 102 spectral bands important?">
            <p>
              Most astronomical cameras take pictures through just 3 or 4 wide broadband filters (e.g. Red, Green, Blue).
              SPHEREx carries <strong className="text-[#E8EDF5]">Linear Variable Filters (LVF)</strong> that act like 102 distinct narrow color filters.
            </p>
            <p>
              This allows astronomers to produce a full near-infrared spectrum for every single pixel in the entire sky,
              identifying water ice (3.05 μm), carbon dioxide ice (4.27 μm), and determining cosmic redshifts for hundreds of millions of galaxies.
            </p>
          </InfoPanel>
        </div>
      )}

      {/* Tab: Catalogs */}
      {tab === 'catalogs' && (
        <div className="space-y-6 animate-fade-in">
          {loadingCatalog ? (
            <div className="h-64 flex items-center justify-center bg-[#151E30] rounded-xl border border-[#263247]">
              <RefreshCw className="w-6 h-6 text-[#6EA8FE] animate-spin mr-2" />
              <span className="text-sm text-[#94A3B8]">Cross-matching Gaia DR3, AllWISE & SIMBAD...</span>
            </div>
          ) : catalogData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gaia DR3 Card */}
              <div className="bg-[#151E30] border border-[#263247] rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-[#263247] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#6EA8FE]/10 text-[#6EA8FE] text-xs font-bold font-mono">ESA</span>
                    <h3 className="font-bold text-[#E8EDF5]">Gaia DR3 Astrometry</h3>
                  </div>
                  <Badge variant="blue">J2016.0</Badge>
                </div>

                <div className="space-y-2 text-xs font-mono text-[#94A3B8]">
                  <div className="text-[11px] text-[#6EA8FE] truncate">{catalogData.gaia_dr3?.source_id}</div>
                  {catalogData.gaia_dr3?.total_pm_mas_yr && (
                    <div className="flex justify-between border-b border-[#263247]/40 py-1">
                      <span>Total Proper Motion (μ):</span>
                      <span className="text-[#F3B85B] font-bold">{catalogData.gaia_dr3.total_pm_mas_yr} mas/yr</span>
                    </div>
                  )}
                  {catalogData.gaia_dr3?.pm_ra_mas_yr && (
                    <div className="flex justify-between border-b border-[#263247]/40 py-1">
                      <span>μ_RA * cos(Dec):</span>
                      <span className="text-[#E8EDF5]">{catalogData.gaia_dr3.pm_ra_mas_yr} mas/yr</span>
                    </div>
                  )}
                  {catalogData.gaia_dr3?.pm_dec_mas_yr && (
                    <div className="flex justify-between border-b border-[#263247]/40 py-1">
                      <span>μ_Dec:</span>
                      <span className="text-[#E8EDF5]">{catalogData.gaia_dr3.pm_dec_mas_yr} mas/yr</span>
                    </div>
                  )}
                  {catalogData.gaia_dr3?.parallax_mas && (
                    <div className="flex justify-between border-b border-[#263247]/40 py-1">
                      <span>Parallax (ϖ):</span>
                      <span className="text-[#E8EDF5]">{catalogData.gaia_dr3.parallax_mas} ± {catalogData.gaia_dr3.parallax_error_mas} mas</span>
                    </div>
                  )}
                  {catalogData.gaia_dr3?.distance_ly && (
                    <div className="flex justify-between border-b border-[#263247]/40 py-1">
                      <span>Astrometric Distance:</span>
                      <span className="text-[#6EA8FE] font-bold">{catalogData.gaia_dr3.distance_ly} light-years</span>
                    </div>
                  )}
                  {catalogData.gaia_dr3?.phot_g_mean_mag && (
                    <div className="flex justify-between py-1">
                      <span>Gaia Photometry (G / BP / RP):</span>
                      <span className="text-[#E8EDF5]">{catalogData.gaia_dr3.phot_g_mean_mag} / {catalogData.gaia_dr3.phot_bp_mean_mag || '—'} / {catalogData.gaia_dr3.phot_rp_mean_mag || '—'}</span>
                    </div>
                  )}
                  {catalogData.gaia_dr3?.notes && (
                    <div className="text-[11px] text-[#F3B85B] italic pt-1">{catalogData.gaia_dr3.notes}</div>
                  )}
                </div>
              </div>

              {/* AllWISE Card */}
              <div className="bg-[#151E30] border border-[#263247] rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-[#263247] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#F3B85B]/10 text-[#F3B85B] text-xs font-bold font-mono">NASA</span>
                    <h3 className="font-bold text-[#E8EDF5]">AllWISE Infrared Photometry</h3>
                  </div>
                  <Badge variant="amber">Mid-IR</Badge>
                </div>

                <div className="space-y-2 text-xs font-mono text-[#94A3B8]">
                  <div className="text-[11px] text-[#F3B85B] truncate">{catalogData.allwise?.designation}</div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-[#0B1020] p-2 rounded border border-[#263247]">
                      <div className="text-[10px] text-[#94A3B8]">W1 (3.4 μm)</div>
                      <div className="text-base font-bold text-[#E8EDF5]">{catalogData.allwise?.w1_mag_3_4um ?? '—'} mag</div>
                    </div>
                    <div className="bg-[#0B1020] p-2 rounded border border-[#263247]">
                      <div className="text-[10px] text-[#94A3B8]">W2 (4.6 μm)</div>
                      <div className="text-base font-bold text-[#E8EDF5]">{catalogData.allwise?.w2_mag_4_6um ?? '—'} mag</div>
                    </div>
                    <div className="bg-[#0B1020] p-2 rounded border border-[#263247]">
                      <div className="text-[10px] text-[#94A3B8]">W3 (12 μm)</div>
                      <div className="text-base font-bold text-[#E8EDF5]">{catalogData.allwise?.w3_mag_12um ?? '—'} mag</div>
                    </div>
                    <div className="bg-[#0B1020] p-2 rounded border border-[#263247]">
                      <div className="text-[10px] text-[#94A3B8]">W4 (22 μm)</div>
                      <div className="text-base font-bold text-[#E8EDF5]">{catalogData.allwise?.w4_mag_22um ?? '—'} mag</div>
                    </div>
                  </div>
                  {catalogData.allwise?.notes && (
                    <div className="text-[11px] text-[#94A3B8] italic pt-1">{catalogData.allwise.notes}</div>
                  )}
                </div>
              </div>

              {/* SIMBAD Card */}
              <div className="bg-[#151E30] border border-[#263247] rounded-xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-[#263247] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#6EA8FE]/10 text-[#6EA8FE] text-xs font-bold font-mono">CDS</span>
                    <h3 className="font-bold text-[#E8EDF5]">SIMBAD Astronomical Database</h3>
                  </div>
                  <Badge variant="muted">Identifier</Badge>
                </div>
                <div className="space-y-1.5 text-xs text-[#94A3B8]">
                  <div>Main ID: <span className="font-mono text-[#E8EDF5] font-bold">{catalogData.simbad?.main_id}</span></div>
                  <div>Spectral Class: <span className="font-mono text-[#F3B85B]">{catalogData.simbad?.sp_type || '—'}</span></div>
                  <div>Literature Citations: <span className="font-mono text-[#6EA8FE]">{catalogData.simbad?.bibcode_count || 0} papers</span></div>
                  <div className="text-[11px] pt-1">
                    Aliases: <span className="font-mono text-[#94A3B8]">{catalogData.simbad?.aliases?.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* JPL Horizons Verification Card */}
              <div className="bg-[#151E30] border border-[#263247] rounded-xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-[#263247] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#6EA8FE]/10 text-[#6EA8FE] text-xs font-bold font-mono">JPL</span>
                    <h3 className="font-bold text-[#E8EDF5]">JPL Horizons Ephemeris Check</h3>
                  </div>
                  <Badge variant="blue">Solar System Check</Badge>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {catalogData.jpl_horizons?.notes}
                </p>
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => navigate(`/light-curves?target=${objectData.slug || objectData.id}`)}
                  >
                    View Multi-Epoch Light Curve
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <InfoPanel title="Cross-Match Information">
              No cross-mission catalog records cached for this target yet.
            </InfoPanel>
          )}
        </div>
      )}

      {/* Tab: Compare */}
      {tab === 'compare' && (
        <div className="animate-fade-in text-center py-8">
          <Clock className="w-12 h-12 text-[#6EA8FE] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#E8EDF5] mb-2">Compare Observations across Epochs</h3>
          <p className="text-sm text-[#94A3B8] max-w-md mx-auto mb-6">
            Open the Time Machine to compare observations of {objectData.name} taken on different dates,
            blink between images, and generate difference maps.
          </p>
          <Button
            variant="primary"
            size="md"
            rightIcon={<ChevronRight className="w-4 h-4" />}
            onClick={() => navigate(`/time-machine?object=${objectData.slug}`)}
          >
            Launch Time Machine for {objectData.name}
          </Button>
        </div>
      )}
    </div>
  );
};
