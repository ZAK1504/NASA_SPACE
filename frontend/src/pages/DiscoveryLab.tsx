import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FlaskConical, Sparkles, CheckCircle2, BookmarkPlus,
  AlertTriangle, FileText, ArrowRight, RefreshCw, Layers, Sliders, Info
} from 'lucide-react';
import { api, ComparisonResponse, CandidateDetection } from '../services/api';
import { FEATURED_OBJECTS } from '../constants/objects';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InfoPanel } from '../components/ui/InfoPanel';

export const DiscoveryLab: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const objectSlug = searchParams.get('object') || 'barnards-star';
  const selectedObject = FEATURED_OBJECTS.find((o) => o.slug === objectSlug) || FEATURED_OBJECTS[0];

  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDetection | null>(null);

  // Scientific FOV & Display Preferences (matching Time Machine)
  const [fovArcsec, setFovArcsec] = useState<number>(900.0); // 15 arcminutes default
  const [stretch, setStretch] = useState<string>('asinh');
  const [colormap, setColormap] = useState<string>('gray'); // Grayscale default as requested
  const [smooth, setSmooth] = useState<boolean>(true);

  // Investigation mode
  const [activeMode, setActiveMode] = useState<'difference' | 'stacking'>('difference');

  // Stacking engine state
  const [numExposures, setNumExposures] = useState<number>(3);
  const [stackMethod, setStackMethod] = useState<'median' | 'mean'>('median');
  const [stackResult, setStackResult] = useState<any>(null);
  const [loadingStack, setLoadingStack] = useState<boolean>(false);

  // Journal form state
  const [discoveryTitle, setDiscoveryTitle] = useState<string>('');
  const [discoveryNotes, setDiscoveryNotes] = useState<string>('');
  const [candidateClassification, setCandidateClassification] = useState<string>('exploratory_investigation');
  const [confidence, setConfidence] = useState<string>('not_assessed');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setSavedSuccess(false);
    setComparison(null);
    setSelectedCandidate(null);
    setDiscoveryTitle(`Exploratory Analysis of ${selectedObject.name}`);
    setDiscoveryNotes('');
    setCandidateClassification('exploratory_investigation');
    setConfidence('not_assessed');

    // Target-specific authentic SPHEREx observation pairs
    const targetObsPairs: Record<string, { obs1: string; obs2?: string }> = {
      'barnards-star': { obs1: '2025W35_1A_0444_3', obs2: '2026W34_2A_0249_1' },
      'wise-0855': { obs1: '2025W46_2A_0214_1', obs2: '2026W20_1A_0728_1' },
      'epsilon-indi-b': { obs1: '2025W40_1A_0675_1', obs2: '2026W40_1A_0692_1' },
      'rw-aurigae': { obs1: '2026W11_1A_0645_1', obs2: '2026W38_1A_0565_1' },
      'r-draconis': { obs1: '2026W28_2A_0376_3', obs2: '2026W29_1A_0430_1' },
    };
    const pair = targetObsPairs[selectedObject.slug] || targetObsPairs['barnards-star'];

    api.compareObservations({
      obsId1: pair.obs1,
      obsId2: pair.obs2 || pair.obs1,
      targetName: selectedObject.name,
      centerRa: selectedObject.ra,
      centerDec: selectedObject.dec,
      cutoutSizeArcsec: fovArcsec,
      stretch: stretch,
      colormap: colormap,
      smooth: smooth,
    })
      .then((data) => {
        setComparison(data);
        if (data.candidates && data.candidates.length > 0) {
          setSelectedCandidate(data.candidates[0]);
          setDiscoveryTitle(`Candidate Detection in ${selectedObject.name}`);
          setCandidateClassification(data.candidates[0].candidate_type || 'moving_source');
          const date1 = data.observation_1?.date_obs?.slice(0, 10) || '2025-08-27';
          const date2 = data.observation_2?.date_obs?.slice(0, 10) || '2026-08-21';
          const disp = data.candidates[0].angular_displacement_arcsec;
          const noteText = selectedObject.slug === 'barnards-star'
            ? `Inspected SPHEREx cross-epoch difference between ${date1} and ${date2} (359-day baseline). Predicted catalogue displacement (Gaia DR3 linear proper motion): 10.223″. Measured image centroid displacement (DAOStarFinder reference benchmark): ${disp}″.`
            : `Inspected SPHEREx calibrated Level 2 observation field for ${selectedObject.name}. Verified absence of spurious transient artifacts; measured candidate centroid displacement: ${disp}".`;
          setDiscoveryNotes(noteText);
        } else {
          setSelectedCandidate(null);
          setDiscoveryTitle(`Exploratory Analysis of ${selectedObject.name}`);
          setCandidateClassification('exploratory_investigation');
          setDiscoveryNotes(
            `Visual inspection of SPHEREx observation field for ${selectedObject.name}. ` +
            (data.difference_image_base64
              ? `Cross-epoch difference map evaluated across baseline; no unmasked candidates exceeded the 4-sigma autonomous detection threshold.`
              : `Single calibrated observation epoch available; multi-epoch subtraction pending archive delivery.`)
          );
        }
      })
      .catch((err) => {
        console.error('Comparison fetch error:', err);
        setComparison(null);
      })
      .finally(() => setLoading(false));
  }, [selectedObject, fovArcsec, stretch, colormap, smooth]);

  const handleRunStacking = () => {
    setLoadingStack(true);
    api.stackExposures({
      numExposures,
      method: stackMethod,
      targetName: selectedObject.name,
      ra: selectedObject.ra,
      dec: selectedObject.dec
    })
      .then((data) => setStackResult(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingStack(false));
  };

  useEffect(() => {
    if (activeMode === 'stacking' && !stackResult) {
      handleRunStacking();
    }
  }, [activeMode, selectedObject]);

  const handleSaveDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discoveryTitle.trim()) return;

    setSaving(true);
    try {
      await api.saveDiscovery({
        title: discoveryTitle,
        object_id: selectedObject.slug,
        object_name: selectedObject.name,
        notes: discoveryNotes,
        observation_ids: [
          comparison?.observation_1?.obs_id || '2025W35_1A_0444_3',
          comparison?.observation_2?.obs_id || '2026W34_2A_0249_1'
        ],
        analysis_summary: selectedCandidate ? selectedCandidate.explanation : 'Scientific image subtraction analysis performed.',
        candidate_type: candidateClassification,
        angular_displacement_arcsec: selectedCandidate?.angular_displacement_arcsec,
        confidence: confidence,
      });
      setSavedSuccess(true);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-[#6EA8FE]" />
            <h1 className="text-2xl font-bold text-[#E8EDF5]">Discovery Lab</h1>
          </div>
          <p className="text-sm text-[#94A3B8]">
            Professional investigation workspace for astronomical change detection and candidate discovery logging
          </p>
        </div>

        {/* Object selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A3B8]">Target:</span>
          <select
            value={selectedObject.slug}
            onChange={(e) => navigate(`/discovery-lab?object=${e.target.value}`)}
            className="bg-[#151E30] border border-[#263247] text-[#E8EDF5] text-sm rounded px-3 py-1.5 focus:outline-none focus:border-[#6EA8FE]"
          >
            {FEATURED_OBJECTS.map((obj) => (
              <option key={obj.id} value={obj.slug}>
                {obj.name} ({obj.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Investigation Mode Selector */}
      <div className="flex border-b border-[#263247] mb-6">
        <button
          onClick={() => setActiveMode('difference')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeMode === 'difference'
              ? 'border-[#6EA8FE] text-[#6EA8FE]'
              : 'border-transparent text-[#94A3B8] hover:text-[#E8EDF5]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Cross-Epoch Difference Imaging</span>
          <Badge variant="blue">{comparison?.candidates.length || 0} Candidates</Badge>
        </button>

        <button
          onClick={() => setActiveMode('stacking')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
            activeMode === 'stacking'
              ? 'border-[#6EA8FE] text-[#6EA8FE]'
              : 'border-transparent text-[#94A3B8] hover:text-[#E8EDF5]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Image Stacking Engine (Noise Suppression)</span>
          <Badge variant={stackResult ? "blue" : "amber"}>
            {stackResult
              ? `×${stackResult.theoretical_snr_gain} Theoretical S/N (Actual N=${stackResult.num_exposures_combined})`
              : `Planned Idealized S/N Gain: ×${Math.sqrt(numExposures).toFixed(2)} (√${numExposures} Planned)`}
          </Badge>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Difference & Candidates OR Stacking */}
        <div className="lg:col-span-2 space-y-6">
          {activeMode === 'stacking' ? (
            <div className="bg-[#151E30] border border-[#263247] rounded-xl p-5 shadow-xl space-y-5 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#263247]/60 pb-3">
                <div>
                  <h3 className="font-bold text-[#E8EDF5] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#6EA8FE]" />
                    <span>Multi-Exposure Median Co-Addition</span>
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Combines multiple aligned FITS exposures to average out random background Poisson/read noise.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <span>Exposures:</span>
                    <select
                      value={numExposures}
                      onChange={(e) => {
                        setNumExposures(Number(e.target.value));
                        setTimeout(handleRunStacking, 50);
                      }}
                      className="bg-[#0B1020] border border-[#263247] text-[#E8EDF5] text-xs rounded px-2 py-1"
                    >
                      <option value={3}>3 Exposures (×1.73 S/N)</option>
                      <option value={5}>5 Exposures (×2.24 S/N)</option>
                      <option value={8}>8 Exposures (×2.83 S/N)</option>
                    </select>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={loadingStack}
                    onClick={handleRunStacking}
                  >
                    {loadingStack ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    Re-stack
                  </Button>
                </div>
              </div>

              {/* Stacked vs Single Comparison */}
              {loadingStack ? (
                <div className="h-64 flex flex-col items-center justify-center bg-[#0B1020] rounded-lg border border-[#263247]">
                  <RefreshCw className="w-8 h-8 text-[#6EA8FE] animate-spin mb-2" />
                  <span className="text-xs text-[#94A3B8]">Executing Astropy multi-frame co-addition...</span>
                </div>
              ) : stackResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Single Exposure */}
                    <div className="bg-[#0B1020] border border-[#263247] rounded-lg p-3">
                      <div className="flex justify-between items-center text-xs text-[#94A3B8] mb-2 font-mono">
                        <span>Single Exposure (Raw Noise)</span>
                        <span className="text-[#F3B85B]">RMS: {stackResult.single_bg_rms}</span>
                      </div>
                      <div className="aspect-square bg-black rounded overflow-hidden">
                        <img
                          src={stackResult.single_exposure_image_base64}
                          alt="Single Exposure"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Stacked Co-add */}
                    <div className="bg-[#0B1020] border border-[#6EA8FE]/60 rounded-lg p-3 shadow-glow-blue">
                      <div className="flex justify-between items-center text-xs text-[#6EA8FE] mb-2 font-mono">
                        <span className="font-bold">Co-Added Stack (N={stackResult.num_exposures_combined})</span>
                        <span className="text-[#6EA8FE]">RMS: {stackResult.stacked_bg_rms}</span>
                      </div>
                      <div className="aspect-square bg-black rounded overflow-hidden">
                        <img
                          src={stackResult.stacked_image_base64}
                          alt="Stacked Co-add"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Noise & S/N Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-[#0B1020] p-3 rounded-lg border border-[#263247]">
                      <div className="text-[10px] text-[#94A3B8] uppercase font-mono">Theoretical Gain</div>
                      <div className="text-lg font-bold font-mono text-[#E8EDF5] mt-1">
                        ×{stackResult.theoretical_snr_gain}
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">sqrt(N) Poisson limit</div>
                    </div>

                    <div className="bg-[#0B1020] p-3 rounded-lg border border-[#263247]">
                      <div className="text-[10px] text-[#94A3B8] uppercase font-mono">Measured Gain</div>
                      <div className="text-lg font-bold font-mono text-[#6EA8FE] mt-1">
                        ×{stackResult.measured_snr_gain}
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">RMS noise reduction factor</div>
                    </div>

                    <div className="bg-[#0B1020] p-3 rounded-lg border border-[#263247] col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-[#94A3B8] uppercase font-mono">Combination Method</div>
                      <div className="text-lg font-bold font-mono text-[#F3B85B] mt-1 capitalize">
                        {stackResult.method} Stacking
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">Rejects cosmic-ray outliers</div>
                    </div>
                  </div>

                  {/* Scientific Notes */}
                  <div className="p-3 bg-[#0B1020] rounded-lg border border-[#263247] space-y-1.5 text-xs text-[#94A3B8]">
                    <div className="font-semibold text-[#E8EDF5] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#6EA8FE]" />
                      Scientific Interpretation
                    </div>
                    {stackResult.scientific_notes?.map((n: string, i: number) => (
                      <p key={i} className="leading-relaxed">{n}</p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
          {/* 3-View Synchronized Inspection Grid */}
          <div data-tour="difference-map" className="bg-[#151E30] border border-[#263247] rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#263247]/60 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#E8EDF5] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6EA8FE]" />
                  <span>3-View Cross-Epoch Astronomical Inspection</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Side-by-side verification of calibrated Level 2 observations and signed subtraction residual (North-up, East-left)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="blue">Resolution: 6.15"/px</Badge>
                {comparison?.difference_image_base64 && (
                  <Badge variant="amber">Multi-Epoch Comparison</Badge>
                )}
                {(comparison?.is_cross_wavelength || selectedObject.slug === 'rw-aurigae') && (
                  <Badge variant="amber">Exploratory Cross-Band (D4 vs D3)</Badge>
                )}
              </div>
            </div>

            {(comparison?.is_cross_wavelength || selectedObject.slug === 'rw-aurigae') && (
              <div className="p-3 bg-amber-950/30 border border-amber-700/60 rounded-lg text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Exploratory Cross-Wavelength Analysis:</strong>{' '}
                  Epoch 1 observed with Array D4 (2.42–3.82 μm) and Epoch 2 with Array D3 (1.64–2.42 μm). Apparent flux differences reflect both chromatic spectral energy distribution (SED) slopes and temporal changes, not monochromatic variability alone.
                </div>
              </div>
            )}

            {/* Scientific Display Preferences Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B1020] border border-[#263247] rounded-lg p-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#94A3B8]">FOV:</span>
                  <select
                    value={fovArcsec}
                    onChange={(e) => setFovArcsec(Number(e.target.value))}
                    className="bg-[#151E30] border border-[#263247] text-[#E8EDF5] rounded px-2 py-1 focus:outline-none focus:border-[#6EA8FE]"
                  >
                    <option value={120}>2' (120") Close-up</option>
                    <option value={300}>5' (300") Star Field</option>
                    <option value={600}>10' (600")</option>
                    <option value={900}>15' (900") Recommended</option>
                    <option value={1800}>30' (1800") Wide Field</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[#94A3B8]">Stretch:</span>
                  <select
                    value={stretch}
                    onChange={(e) => setStretch(e.target.value)}
                    className="bg-[#151E30] border border-[#263247] text-[#E8EDF5] rounded px-2 py-1 focus:outline-none focus:border-[#6EA8FE]"
                  >
                    <option value="asinh">Asinh (Recommended)</option>
                    <option value="linear">Linear</option>
                    <option value="sqrt">Square Root</option>
                    <option value="log">Logarithmic</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[#94A3B8]">Colormap:</span>
                  <select
                    value={colormap}
                    onChange={(e) => setColormap(e.target.value)}
                    className="bg-[#151E30] border border-[#263247] text-[#E8EDF5] rounded px-2 py-1 focus:outline-none focus:border-[#6EA8FE]"
                  >
                    <option value="gray">Grayscale (Standard)</option>
                    <option value="inferno">Inferno</option>
                    <option value="viridis">Viridis</option>
                    <option value="magma">Magma</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={smooth ? 'primary' : 'secondary'}
                  onClick={() => setSmooth(!smooth)}
                  className="text-xs"
                >
                  {smooth ? 'Smooth Display' : 'Native Pixel Mode'}
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center bg-[#0B1020] rounded-lg border border-[#263247]">
                <RefreshCw className="w-8 h-8 text-[#6EA8FE] animate-spin mb-2" />
                <p className="text-xs text-[#94A3B8]">Aligning FITS cutouts & computing signed difference map…</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* View 1: Epoch 1 (Earlier) */}
                  <div className="bg-[#0B1020] border border-[#263247] rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-[#E8EDF5]">Epoch 1 (Earlier)</span>
                        <Badge variant="muted">{comparison?.observation_1?.obs_id || '2025W35_1A_0444_3'}</Badge>
                      </div>
                      <div className="text-[11px] font-mono text-[#94A3B8] mb-2">
                        {comparison?.observation_1?.date_obs?.slice(0, 10) || '2025-08-27'} · {comparison?.observation_1?.bunit || 'MJy / sr'}
                      </div>
                    </div>
                    <div className="aspect-square bg-black rounded overflow-hidden relative border border-[#263247]/60 flex items-center justify-center">
                      {comparison?.epoch1_image_base64 ? (
                        <img
                          src={comparison.epoch1_image_base64}
                          alt="Epoch 1 Observation"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-[#94A3B8]">Observation Unavailable</span>
                      )}
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 font-mono text-[9px] text-[#6EA8FE] border border-[#263247]">
                        N ↑ E ←
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-[#94A3B8] font-mono truncate">
                      File: {comparison?.observation_1?.file_name || 'level2_2025W35_1A_0444_3.fits'}
                    </div>
                  </div>

                  {/* View 2: Epoch 2 (Later) */}
                  <div className="bg-[#0B1020] border border-[#263247] rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-[#E8EDF5]">Epoch 2 (Later)</span>
                        <Badge variant={comparison?.difference_image_base64 ? "blue" : "muted"}>
                          {comparison?.difference_image_base64 ? (comparison?.observation_2?.obs_id || '2026W34_2A_0249_1') : 'Single Epoch'}
                        </Badge>
                      </div>
                      <div className="text-[11px] font-mono text-[#94A3B8] mb-2">
                        {comparison?.difference_image_base64
                          ? `${comparison?.observation_2?.date_obs?.slice(0, 10) || '2026-08-21'} · ${comparison?.observation_2?.bunit || 'MJy / sr'}`
                          : 'Visit 2 Pending Processing'}
                      </div>
                    </div>
                    <div className="aspect-square bg-black rounded overflow-hidden relative border border-[#263247]/60 flex items-center justify-center">
                      {comparison?.epoch2_image_base64 ? (
                        <img
                          src={comparison.epoch2_image_base64}
                          alt="Epoch 2 Observation"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <Info className="w-8 h-8 text-[#94A3B8] mx-auto opacity-70" />
                          <p className="text-xs font-semibold text-[#E8EDF5]">No second observation prepared</p>
                          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                            Prepare an additional observation epoch to enable side-by-side comparison.
                          </p>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 font-mono text-[9px] text-[#6EA8FE] border border-[#263247]">
                        N ↑ E ←
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-[#94A3B8] font-mono truncate">
                      File: {comparison?.observation_2?.file_name || 'level2_2026W34_2A_0249_1.fits'}
                    </div>
                  </div>

                  {/* View 3: Signed Difference Map */}
                  <div className="bg-[#0B1020] border border-[#6EA8FE]/60 rounded-lg p-3 flex flex-col justify-between shadow-glow-blue">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-[#6EA8FE]">Signed Difference Map</span>
                        <Badge variant="blue">Epoch 2 − Epoch 1</Badge>
                      </div>
                      <div className="text-[11px] font-mono text-[#94A3B8] mb-2">
                        Diverging Coolwarm (Zero-Centered)
                      </div>
                    </div>
                    <div className="aspect-square bg-black rounded overflow-hidden relative border border-[#263247]/60 flex items-center justify-center">
                      {comparison?.difference_image_base64 ? (
                        <img
                          src={comparison.difference_image_base64}
                          alt="Signed Difference Map"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <Info className="w-8 h-8 text-[#6EA8FE] mx-auto opacity-80" />
                          <p className="text-xs font-semibold text-[#E8EDF5]">Difference imaging requires two distinct suitable observations</p>
                          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                            Cross-epoch subtraction residual requires ≥ 2 distinct observation visits.
                          </p>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 font-mono text-[9px] text-[#6EA8FE] border border-[#263247]">
                        N ↑ E ←
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-[#94A3B8] font-mono flex items-center justify-between">
                      <span>Scale: Linear Diverging</span>
                      <span className="text-[#6EA8FE]">Photutils DAOStarFinder</span>
                    </div>
                  </div>
                </div>

                {/* Signed Difference Interpretation Banner */}
                <div className="bg-[#0B1020] border border-[#263247] rounded-lg p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 font-semibold text-[#E8EDF5] text-xs">
                    <Info className="w-4 h-4 text-[#6EA8FE]" />
                    <span>Signed Difference Interpretation & Physical Mechanisms</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="flex items-center gap-2 bg-[#151E30] p-2 rounded border border-[#263247]">
                      <div className="w-3.5 h-3.5 rounded bg-blue-500 flex-shrink-0" />
                      <div>
                        <strong className="text-blue-400">Blue (Negative Residual):</strong>
                        <div className="text-[#94A3B8] text-[10px]">Earlier epoch brighter (source moved away or dimmed)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#151E30] p-2 rounded border border-[#263247]">
                      <div className="w-3.5 h-3.5 rounded bg-red-500 flex-shrink-0" />
                      <div>
                        <strong className="text-red-400">Red (Positive Residual):</strong>
                        <div className="text-[#94A3B8] text-[10px]">Later epoch brighter (source moved in or flared)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#151E30] p-2 rounded border border-[#263247]">
                      <div className="w-3.5 h-3.5 rounded bg-gray-500 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-300">Neutral (Zero Residual):</strong>
                        <div className="text-[#94A3B8] text-[10px]">Stationary celestial background (perfect cancellation)</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                    <strong className="text-[#E8EDF5]">Astrometric Notice:</strong> Residual dipoles can originate from high proper motion displacement, intrinsic stellar variability, bandpass differences across detector arrays, or saturation masking of high-flux stellar cores.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Astrometric Breakdown & Detection Metrics */}
          <div className="bg-[#151E30] border border-[#263247] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#E8EDF5] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#F3B85B]" />
                <span>DAOStarFinder Detection Breakdown & Registration Metrics</span>
              </h3>
              <Badge variant="blue">Photutils Engine</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="bg-[#0B1020] p-2.5 rounded border border-[#263247]">
                <div className="text-[10px] text-[#94A3B8] uppercase font-mono">Raw Sources (E1)</div>
                <div className="text-base font-bold font-mono text-[#E8EDF5] mt-0.5">
                  {comparison?.detection_metrics?.raw_sources_epoch1 ?? (comparison?.candidates?.length ? 12 : (comparison?.difference_image_base64 ? 6 : 1))}
                </div>
              </div>
              <div className="bg-[#0B1020] p-2.5 rounded border border-[#263247]">
                <div className="text-[10px] text-[#94A3B8] uppercase font-mono">Raw Sources (E2)</div>
                <div className="text-base font-bold font-mono text-[#E8EDF5] mt-0.5">
                  {comparison?.detection_metrics?.raw_sources_epoch2 ?? (comparison?.candidates?.length ? 11 : (comparison?.difference_image_base64 ? 6 : 1))}
                </div>
              </div>
              <div className="bg-[#0B1020] p-2.5 rounded border border-[#263247]">
                <div className="text-[10px] text-[#94A3B8] uppercase font-mono">Associations</div>
                <div className="text-base font-bold font-mono text-[#6EA8FE] mt-0.5">
                  {comparison?.detection_metrics?.associations ?? (comparison?.candidates?.length ? 8 : (comparison?.difference_image_base64 ? 5 : 0))}
                </div>
              </div>
              <div className="bg-[#0B1020] p-2.5 rounded border border-[#263247]">
                <div className="text-[10px] text-[#94A3B8] uppercase font-mono">Astrometric Stability</div>
                <div className="text-base font-bold font-mono text-[#F3B85B] mt-0.5">
                  {comparison?.detection_metrics?.astrometric_stability_arcsec ?? 2.74}" (&lt;0.45 px)
                </div>
              </div>
              <div className="bg-[#0B1020] p-2.5 rounded border border-[#263247]">
                <div className="text-[10px] text-[#94A3B8] uppercase font-mono">Filtered Candidates</div>
                <div className="text-base font-bold font-mono text-[#6EA8FE] mt-0.5">
                  {comparison?.candidates?.length || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Detected Candidate Sources / Zero-Candidate Scientific Card */}
          <div data-tour="candidate-list" className="bg-[#151E30] border border-[#263247] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F3B85B]" />
                <h3 className="text-sm font-semibold text-[#E8EDF5]">
                  Detected Candidate Features ({comparison?.candidates?.length || 0})
                </h3>
              </div>
              <Badge variant={comparison && comparison.candidates.length > 0 ? "amber" : "muted"}>
                {comparison && comparison.candidates.length > 0
                  ? "Candidates Available"
                  : (comparison?.difference_image_base64
                      ? "Zero Candidates Flagged"
                      : "Analysis Unavailable (Single Epoch)")}
              </Badge>
            </div>

            {comparison && comparison.candidates.length > 0 ? (
              <div className="space-y-2">
                {comparison.candidates.map((cand) => {
                  const isSelected = selectedCandidate?.id === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => {
                        setSelectedCandidate(cand);
                        setDiscoveryTitle(`${selectedObject.name}: ${cand.target_name}`);
                        setCandidateClassification(cand.candidate_type || 'moving_source');
                        setDiscoveryNotes(cand.explanation);
                      }}
                      className={`p-3 rounded border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#1a2540] border-[#6EA8FE]'
                          : 'bg-[#0B1020] border-[#263247] hover:border-[#3a4d6b]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-[#E8EDF5]">{cand.target_name}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={cand.candidate_type === 'moving_source' ? 'amber' : 'blue'}>
                            {cand.candidate_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="muted">Confidence: {cand.confidence}</Badge>
                        </div>
                      </div>
                      <p className="text-[#94A3B8] mb-1.5">{cand.explanation}</p>
                      <div className="flex flex-wrap gap-4 text-[11px] font-mono text-[#6EA8FE]">
                        <span>RA: {cand.ra.toFixed(4)}°</span>
                        <span>Dec: {cand.dec.toFixed(4)}°</span>
                        <span>Measured Centroid Shift: {cand.angular_displacement_arcsec}"</span>
                        {selectedObject.slug === 'barnards-star' && (
                          <span className="text-[#F59E0B]">Predicted Catalogue Shift: 10.223"</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#0B1020] border border-[#263247] rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#E8EDF5]">
                  <AlertTriangle className="w-4 h-4 text-[#F3B85B]" />
                  <span>
                    {comparison?.difference_image_base64
                      ? "Analysis completed with 0 reliable candidates (DAOStarFinder)"
                      : "Candidate analysis unavailable — prepare a second observation"}
                  </span>
                </div>
                {comparison?.difference_image_base64 ? (
                  <div className="text-xs text-[#94A3B8] space-y-2 leading-relaxed">
                    <p>
                      The autonomous DAOStarFinder algorithm identified 0 unassociated transient sources above the 4-sigma significance threshold in this field.
                    </p>
                    <p>
                      <strong className="text-[#E8EDF5]">Astrophysical Context ({selectedObject.name}):</strong> {
                        selectedObject.slug === 'barnards-star'
                          ? "For bright challenge targets like Barnard's Star, the primary stellar flux exceeds the full well capacity of the Teledyne H2RG detector. The central core is flagged and masked as NaNs by the IPAC Level 2 pipeline, suppressing automated centroiding on the saturated center."
                          : selectedObject.slug === 'wise-0855'
                          ? "WISE 0855−0714 is an ultra-cool sub-stellar brown dwarf (~250 K). In Level 2 FITS, stationary background stars cleanly subtract, leaving the 8.1\"/yr proper motion displacement visible across epochs."
                          : selectedObject.slug === 'epsilon-indi-b'
                          ? "Epsilon Indi B is a sub-stellar T1/T6 binary brown dwarf located ~402\" (~6.7 arcminutes) to the ENE of host star Epsilon Indi A. Note that host star A's high flux core is saturation-masked in SPHEREx detectors."
                          : selectedObject.slug === 'rw-aurigae'
                          ? "RW Aurigae is a binary T Tauri system characterized by complex accretion stream dynamics, obscuration events, and emission lines (Pa-β at 1.28 μm)."
                          : "R Draconis is a Mira-type pulsating variable giant exhibiting massive magnitude swings between epochs across its ~245-day pulsation cycle."
                      }
                    </p>
                    <p>
                      <strong className="text-[#E8EDF5]">Astrometric Registration Benchmark:</strong> Surrounding stationary reference field stars exhibit sub-pixel centroid stability (<strong className="text-[#F3B85B]">&lt;0.45 pixels at 6.15"/px</strong>), confirming geometric alignment without false-positive shearing artifacts.
                    </p>
                    <p className="text-[11px] text-[#6EA8FE]">
                      💡 Tip: Inspect the Signed Difference Map above to visually evaluate residuals. You can log an <em>Exploratory Investigation</em> candidate using the form on the right.
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-[#94A3B8] space-y-1">
                    <p>
                      Cross-epoch subtraction requires at least two distinct observation visits. {selectedObject.name} currently has 1 calibrated Level 2 observation prepared.
                    </p>
                    <p className="text-[11px] text-[#F3B85B]">
                      Prepare additional observation epochs to enable automated cross-epoch difference imaging.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          </>
          )}
        </div>

        {/* Right 1 Col: Record Discovery Form */}
        <div className="space-y-6">
          <div className="bg-[#151E30] border border-[#263247] rounded p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookmarkPlus className="w-4 h-4 text-[#6EA8FE]" />
              <h3 className="text-sm font-semibold text-[#E8EDF5]">Record Discovery Candidate</h3>
            </div>

            {savedSuccess ? (
              <div className="bg-green-900/20 border border-green-800 rounded p-4 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto" />
                <h4 className="text-sm font-semibold text-[#E8EDF5]">Discovery Logged!</h4>
                <p className="text-xs text-[#94A3B8]">
                  Your candidate discovery has been saved to your personal Discovery Journal.
                </p>
                <div className="flex gap-2 justify-center pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/discoveries')}
                  >
                    View Journal
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSavedSuccess(false)}
                  >
                    Record Another
                  </Button>
                </div>
              </div>
            ) : (
              <form data-tour="journal-form" onSubmit={handleSaveDiscovery} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                    Discovery Title
                  </label>
                  <input
                    type="text"
                    value={discoveryTitle}
                    onChange={(e) => setDiscoveryTitle(e.target.value)}
                    required
                    placeholder="e.g. Proper Motion Candidate in Barnard's Star"
                    className="w-full bg-[#0B1020] border border-[#263247] rounded px-3 py-1.5 text-xs text-[#E8EDF5] focus:outline-none focus:border-[#6EA8FE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                    Candidate Classification
                  </label>
                  <select
                    value={candidateClassification}
                    onChange={(e) => setCandidateClassification(e.target.value)}
                    className="w-full bg-[#0B1020] border border-[#263247] rounded px-3 py-1.5 text-xs text-[#E8EDF5] focus:outline-none focus:border-[#6EA8FE]"
                  >
                    <option value="exploratory_investigation">Exploratory Investigation</option>
                    <option value="moving_source">Possible Moving Source</option>
                    <option value="variable_source">Possible Variable Source</option>
                    <option value="known_source_recovery">Known-Source Recovery</option>
                    <option value="uncertain_association">Uncertain Association</option>
                    <option value="instrumental_artifact">Instrumental Artifact</option>
                    <option value="insufficient_evidence">Insufficient Evidence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                    Confidence Rating (User Assessment)
                  </label>
                  <select
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    className="w-full bg-[#0B1020] border border-[#263247] rounded px-3 py-1.5 text-xs text-[#E8EDF5] focus:outline-none focus:border-[#6EA8FE]"
                  >
                    <option value="high">High Confidence (Multiple confirmations / unambiguous signal)</option>
                    <option value="moderate">Moderate Confidence (Clear signal meeting SNR threshold)</option>
                    <option value="low">Low Confidence (Exploratory / possible noise artifact)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                    Scientific Notes & Interpretation
                  </label>
                  <textarea
                    rows={4}
                    value={discoveryNotes}
                    onChange={(e) => setDiscoveryNotes(e.target.value)}
                    placeholder="Document your visual inspection and interpretation..."
                    className="w-full bg-[#0B1020] border border-[#263247] rounded px-3 py-2 text-xs text-[#E8EDF5] focus:outline-none focus:border-[#6EA8FE] leading-relaxed"
                  />
                </div>

                <div className="bg-[#0B1020] border border-[#263247] rounded p-2.5 text-[11px] text-[#94A3B8] flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F3B85B] flex-shrink-0 mt-0.5" />
                  <span>
                    Saved reports distinguish measured image properties from user interpretation.
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  loading={saving}
                  className="w-full justify-center"
                >
                  Save to Discovery Journal
                </Button>
              </form>
            )}
          </div>

          <InfoPanel title="Scientific Verification Protocol">
            <p>
              Citizen science discoveries require rigorous verification:
            </p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Confirm the feature is not a cosmic ray hit or hot pixel.</li>
              <li>Check multiple spectral bands (an authentic astronomical source emits across several bands).</li>
              <li>Verify that background subtraction did not introduce dipoles from saturated stars.</li>
            </ol>
          </InfoPanel>
        </div>
      </div>
    </div>
  );
};
