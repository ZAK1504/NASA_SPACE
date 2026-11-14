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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const objectSlug = searchParams.get('object') || 'barnards-star';
  const selectedObject = FEATURED_OBJECTS.find((o) => o.slug === objectSlug) || FEATURED_OBJECTS[0];

  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDetection | null>(null);

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
  const [confidence, setConfidence] = useState<string>('moderate');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setSavedSuccess(false);
    api.compareObservations({
      obsId1: '2025W35_1A_0444_3',
      obsId2: '2026W34_2A_0249_1',
      targetName: selectedObject.name,
      centerRa: selectedObject.ra,
      centerDec: selectedObject.dec,
    })
      .then((data) => {
        setComparison(data);
        if (data.candidates && data.candidates.length > 0) {
          setSelectedCandidate(data.candidates[0]);
          setDiscoveryTitle(`Candidate Detection in ${selectedObject.name}`);
          const date1 = data.observation_1?.date_obs?.slice(0, 10) || '2025-08-27';
          const date2 = data.observation_2?.date_obs?.slice(0, 10) || '2026-08-21';
          setDiscoveryNotes(
            `Inspected SPHEREx cross-epoch difference between ${date1} and ${date2}. Astrometrically measured displacement of ${data.candidates[0].angular_displacement_arcsec}" using photutils DAOStarFinder.`
          );
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedObject]);

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
        candidate_type: selectedCandidate ? selectedCandidate.candidate_type : 'moving_source',
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
          <Badge variant="amber">×1.73 S/N</Badge>
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
          <div className="bg-[#151E30] border border-[#263247] rounded p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#E8EDF5]">
                Aligned Cross-Epoch Difference Map
              </h3>
              <Badge variant="blue">Epoch 2 − Epoch 1</Badge>
            </div>

            <div className="aspect-[4/3] bg-[#0B1020] border border-[#263247] rounded overflow-hidden flex items-center justify-center relative">
              {loading ? (
                <div className="text-center p-4">
                  <RefreshCw className="w-6 h-6 text-[#6EA8FE] animate-spin mx-auto mb-2" />
                  <p className="text-xs text-[#94A3B8]">Computing difference image & running DAOStarFinder…</p>
                </div>
              ) : comparison?.difference_image_base64 ? (
                <img
                  src={comparison.difference_image_base64}
                  alt="Difference Map"
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="text-xs text-[#94A3B8]">Image unavailable</p>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[#94A3B8]">
              <span>Resolution: 6.2"/pixel</span>
              <span className="font-mono text-[#6EA8FE]">Photutils Astrometric Matching</span>
            </div>
          </div>

          {/* Detected Candidate Sources */}
          <div className="bg-[#151E30] border border-[#263247] rounded p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#F3B85B]" />
              <h3 className="text-sm font-semibold text-[#E8EDF5]">
                Detected Candidate Features ({comparison?.candidates.length || 0})
              </h3>
            </div>

            {comparison && comparison.candidates.length > 0 ? (
              <div className="space-y-2">
                {comparison.candidates.map((cand) => {
                  const isSelected = selectedCandidate?.id === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
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
                        <span>Displacement: {cand.angular_displacement_arcsec}"</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8]">No candidates detected in this field.</p>
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
              <form onSubmit={handleSaveDiscovery} className="space-y-4">
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
                    value={selectedCandidate?.candidate_type || 'moving_source'}
                    className="w-full bg-[#0B1020] border border-[#263247] rounded px-3 py-1.5 text-xs text-[#E8EDF5] focus:outline-none focus:border-[#6EA8FE]"
                    disabled
                  >
                    <option value="moving_source">Possible Moving Object</option>
                    <option value="variable_source">Possible Variable Object</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                    Confidence Rating
                  </label>
                  <select
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    className="w-full bg-[#0B1020] border border-[#263247] rounded px-3 py-1.5 text-xs text-[#E8EDF5] focus:outline-none focus:border-[#6EA8FE]"
                  >
                    <option value="high">High Confidence (Multiple confirmations)</option>
                    <option value="moderate">Moderate Confidence (Clear signal)</option>
                    <option value="low">Low Confidence (Possible artifact)</option>
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
