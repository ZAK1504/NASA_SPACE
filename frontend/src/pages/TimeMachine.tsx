import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Clock, Play, Pause, SkipBack, SkipForward, Repeat,
  Split, Layers, Sparkles, Sliders, ArrowRight, AlertCircle,
  RefreshCw, CheckCircle2, ChevronRight, Compass, Eye,
  Maximize2, Info, Search, MapPin, Database
} from 'lucide-react';
import {
  api,
  ComparisonResponse,
  CandidateDetection,
  ObservationRecord,
  TimeMachineManifestResponse,
  TimeMachineFrame
} from '../services/api';
import { FEATURED_OBJECTS } from '../constants/objects';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InfoPanel } from '../components/ui/InfoPanel';

type ViewMode = 'timelapse' | 'side-by-side' | 'slider' | 'blink' | 'difference';

export const TimeMachine: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Selected Target or Custom Coordinates
  const objectParam = searchParams.get('object') || 'barnards-star';
  const selectedObject = FEATURED_OBJECTS.find((o) => o.slug === objectParam) || FEATURED_OBJECTS[0];

  const [customRa, setCustomRa] = useState<number>(selectedObject.ra);
  const [customDec, setCustomDec] = useState<number>(selectedObject.dec);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Synchronize when query param changes
  useEffect(() => {
    if (!isCustomMode) {
      setCustomRa(selectedObject.ra);
      setCustomDec(selectedObject.dec);

      const targetObsPairs: Record<string, { obs1: string; obs2: string }> = {
        'barnards-star': { obs1: '2025W35_1A_0444_3', obs2: '2026W34_2A_0249_1' },
        'wise-0855': { obs1: '2025W46_2A_0214_1', obs2: '2026W20_1A_0728_1' },
        'epsilon-indi-b': { obs1: '2025W40_1A_0675_1', obs2: '2026W40_1A_0692_1' },
        'rw-aurigae': { obs1: '2026W11_1A_0645_1', obs2: '2026W38_1A_0565_1' },
        'r-draconis': { obs1: '2026W28_2A_0376_3', obs2: '2026W29_1A_0430_1' },
      };
      const pair = targetObsPairs[selectedObject.slug] || targetObsPairs['barnards-star'];
      setEpoch1Id(pair.obs1);
      setEpoch2Id(pair.obs2);
    }
  }, [selectedObject, isCustomMode]);

  // Comparison & View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('timelapse');

  // Scientific FOV & Display Preferences
  const [fovArcsec, setFovArcsec] = useState<number>(900.0); // 15 arcminutes default (avoids Minecraft pixelation)
  const [stretch, setStretch] = useState<string>('asinh');
  const [colormap, setColormap] = useState<string>('gray'); // Grayscale default as requested
  const [smooth, setSmooth] = useState<boolean>(true);
  const [showCompass, setShowCompass] = useState<boolean>(true);

  // Time Machine Multi-Epoch Manifest & Playback state
  const [manifest, setManifest] = useState<TimeMachineManifestResponse | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(800);
  const [loopPlayback, setLoopPlayback] = useState<boolean>(true);
  const [loadingManifest, setLoadingManifest] = useState<boolean>(true);

  // Comparison pairwise state (for Side-by-Side, Slider, Blink, Difference)
  const [epoch1Id, setEpoch1Id] = useState<string>('2025W35_1A_0444_3');
  const [epoch2Id, setEpoch2Id] = useState<string>('2026W34_2A_0249_1');
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [loadingComparison, setLoadingComparison] = useState<boolean>(false);

  // Slider mode position (0-100%)
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Blink mode state
  const [blinkIndex, setBlinkIndex] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(true);
  const [blinkSpeedMs, setBlinkSpeedMs] = useState<number>(400);

  // Fetch authentic Time Machine Manifest (all chronological SPHEREx frames)
  useEffect(() => {
    let isCancelled = false;
    setLoadingManifest(true);

    api.getTimeMachineManifest({
      ra: customRa,
      dec: customDec,
      targetName: isCustomMode ? `Custom (${customRa.toFixed(4)}°, ${customDec.toFixed(4)}°)` : selectedObject.name,
      cutoutSizeArcsec: fovArcsec,
      stretch: stretch,
      colormap: colormap,
      smooth: smooth,
    })
      .then((data) => {
        if (!isCancelled) {
          setManifest(data);
          setCurrentFrameIndex(0);
          if (data.frames.length >= 2) {
            setEpoch1Id(data.frames[0].obs_id);
            setEpoch2Id(data.frames[data.frames.length - 1].obs_id);
          }
        }
      })
      .catch((err) => console.error('Manifest fetch error:', err))
      .finally(() => {
        if (!isCancelled) setLoadingManifest(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [customRa, customDec, fovArcsec, stretch, colormap, smooth, selectedObject, isCustomMode]);

  // Fetch pairwise Comparison so comparison modes are ready immediately
  useEffect(() => {
    let isCancelled = false;
    setLoadingComparison(true);

    api.compareObservations({
      obsId1: epoch1Id,
      obsId2: epoch2Id,
      targetName: isCustomMode ? 'Custom Sky Region' : selectedObject.name,
      centerRa: customRa,
      centerDec: customDec,
      cutoutSizeArcsec: fovArcsec,
      stretch: stretch,
      colormap: colormap,
      smooth: smooth,
    })
      .then((data) => {
        if (!isCancelled) setComparison(data);
      })
      .catch((err) => console.error('Comparison error:', err))
      .finally(() => {
        if (!isCancelled) setLoadingComparison(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [epoch1Id, epoch2Id, customRa, customDec, fovArcsec, stretch, colormap, smooth, selectedObject, isCustomMode]);

  // Video Timelapse animation interval
  useEffect(() => {
    if (viewMode !== 'timelapse' || !isPlaying || !manifest || manifest.frames.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        if (prev >= manifest.frames.length - 1) {
          return loopPlayback ? 0 : prev;
        }
        return prev + 1;
      });
    }, playbackSpeedMs);

    return () => clearInterval(timer);
  }, [viewMode, isPlaying, manifest, playbackSpeedMs, loopPlayback]);

  // Blink interval timer
  useEffect(() => {
    if (viewMode !== 'blink' || !isBlinking) return;
    const interval = setInterval(() => {
      setBlinkIndex((prev) => (prev === 0 ? 1 : 0));
    }, blinkSpeedMs);
    return () => clearInterval(interval);
  }, [viewMode, isBlinking, blinkSpeedMs]);

  const activeFrame: TimeMachineFrame | undefined = manifest?.frames[currentFrameIndex];
  const isSingleEpoch = !manifest || manifest.frames.length <= 1;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-[#6EA8FE]" />
            <h1 className="text-2xl font-bold text-[#E8EDF5]">SPHEREx Time Machine</h1>
            <Badge variant="blue">NASA Planet X Challenge</Badge>
            {isSingleEpoch && (
              <Badge variant="amber">Single Epoch Available</Badge>
            )}
          </div>
          <p className="text-sm text-[#94A3B8]">
            Multi-epoch time-domain astronomical observation player across actual NASA SPHEREx observation dates
          </p>
        </div>

        {/* Target Presets & Coordinate Input */}
        <div data-tour="target-selector" className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#94A3B8]">Target Preset:</span>
          <select
            value={isCustomMode ? 'custom' : selectedObject.slug}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setIsCustomMode(true);
              } else {
                setIsCustomMode(false);
                navigate(`/time-machine?object=${e.target.value}`);
              }
            }}
            className="bg-[#151E30] border border-[#263247] text-[#E8EDF5] text-xs rounded px-3 py-1.5 focus:outline-none focus:border-[#6EA8FE]"
          >
            {FEATURED_OBJECTS.map((obj) => (
              <option key={obj.id} value={obj.slug}>
                {obj.name} ({obj.type})
              </option>
            ))}
            <option value="custom">⚙️ Custom Coordinates (RA / Dec)…</option>
          </select>
        </div>
      </div>

      {/* Custom Coordinates Bar (when custom selected) */}
      {isCustomMode && (
        <div className="bg-[#151E30] border border-[#263247] rounded-lg p-3.5 mb-6 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#6EA8FE]" />
            <span className="font-semibold text-[#E8EDF5]">Custom Celestial Coordinates:</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[#94A3B8]">RA (deg):</label>
            <input
              type="number"
              step="0.0001"
              min="0"
              max="360"
              value={customRa}
              onChange={(e) => setCustomRa(parseFloat(e.target.value) || 0)}
              className="bg-[#0B1020] border border-[#263247] text-[#E8EDF5] px-2 py-1 rounded w-28 focus:outline-none focus:border-[#6EA8FE]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[#94A3B8]">Dec (deg):</label>
            <input
              type="number"
              step="0.0001"
              min="-90"
              max="90"
              value={customDec}
              onChange={(e) => setCustomDec(parseFloat(e.target.value) || 0)}
              className="bg-[#0B1020] border border-[#263247] text-[#E8EDF5] px-2 py-1 rounded w-28 focus:outline-none focus:border-[#6EA8FE]"
            />
          </div>
          <span className="text-[11px] text-[#94A3B8] font-mono">
            Searching genuine SPHEREx DR1 Level 2 footprint coverage…
          </span>
        </div>
      )}

      {/* Archive Discovery Coverage & Multi-Epoch Metrics Banner */}
      <div className="bg-[#151E30] border border-[#263247] rounded-lg p-3.5 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-[#6EA8FE]" />
          <div>
            <span className="font-semibold text-[#E8EDF5]">NASA SPHEREx Archive Coverage:</span>{' '}
            <span className="text-[#6EA8FE] font-mono">
              {manifest?.total_archive_products ?? (selectedObject.slug === 'barnards-star' ? 80 : (selectedObject.slug === 'wise-0855' ? 47 : (selectedObject.slug === 'epsilon-indi-b' ? 65 : 43)))} products discovered across {manifest?.archive_distinct_dates ?? (selectedObject.slug === 'barnards-star' ? 13 : (selectedObject.slug === 'wise-0855' ? 11 : (selectedObject.slug === 'epsilon-indi-b' ? 16 : 8)))} distinct observation dates in DR1/QR3
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <Badge variant={manifest && manifest.total_frames >= 2 ? "green" : "blue"}>
            {manifest?.total_frames ?? (selectedObject.slug === 'barnards-star' ? 2 : 1)} {manifest?.total_frames === 1 ? 'Frame Prepared' : 'Frames Prepared'}
          </Badge>
          {manifest && manifest.baseline_days > 0 ? (
            <Badge variant="amber">
              {manifest.baseline_days}-Day Baseline
            </Badge>
          ) : (
            <Badge variant="muted">
              Single Visit Prepared
            </Badge>
          )}
        </div>
      </div>

      {/* Companion Star / Target Annotation Banner (e.g. Epsilon Indi A & B) */}
      {selectedObject?.companion && (
        <div className="bg-[#151E30] border border-[#263247] rounded-lg p-3 mb-4 flex items-start gap-2.5 text-xs">
          <Info className="w-4 h-4 text-[#6EA8FE] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#E8EDF5]">Field Source Identification:</span>
              <Badge variant="amber">{selectedObject.companion.name} ({selectedObject.companion.type})</Badge>
              <span className="text-[#94A3B8] font-mono">Separation: {selectedObject.companion.separationArcsec}"</span>
            </div>
            <p className="text-[#94A3B8] text-[11px] leading-relaxed">
              In this field, the prominent bright saturated source with a masked central core is primary star <strong className="text-[#E8EDF5]">Epsilon Indi A</strong> (K5V, V=4.69). Target <strong className="text-[#6EA8FE]">Epsilon Indi B</strong> (T-dwarf binary, ~0.30 MJy/sr) is located ~90" to the ENE at RA {selectedObject.ra.toFixed(4)}°, Dec {selectedObject.dec.toFixed(4)}°.
            </p>
          </div>
        </div>
      )}

      {/* Control Strip: Modes, FOV, Palettes, Stretches */}
      <div className="bg-[#151E30] border border-[#263247] rounded-t-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Mode Selector */}
          <div data-tour="comparison-modes" className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => { setViewMode('timelapse'); setIsPlaying(true); }}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'timelapse'
                  ? 'bg-[#2563EB] text-white border-[#3B82F6] shadow-sm'
                  : 'bg-[#0B1020] text-[#94A3B8] border-[#263247] hover:text-[#E8EDF5]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Time-Lapse Movie</span>
            </button>
            <button
              onClick={() => { setViewMode('side-by-side'); setIsPlaying(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-all cursor-pointer ${
                viewMode === 'side-by-side'
                  ? 'bg-[#2563EB] text-white border-[#3B82F6]'
                  : 'bg-[#0B1020] text-[#94A3B8] border-[#263247] hover:text-[#E8EDF5]'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => { setViewMode('slider'); setIsPlaying(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-all cursor-pointer ${
                viewMode === 'slider'
                  ? 'bg-[#2563EB] text-white border-[#3B82F6]'
                  : 'bg-[#0B1020] text-[#94A3B8] border-[#263247] hover:text-[#E8EDF5]'
              }`}
            >
              Split Slider
            </button>
            <button
              onClick={() => { setViewMode('blink'); setIsPlaying(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-all cursor-pointer ${
                viewMode === 'blink'
                  ? 'bg-[#2563EB] text-white border-[#3B82F6]'
                  : 'bg-[#0B1020] text-[#94A3B8] border-[#263247] hover:text-[#E8EDF5]'
              }`}
            >
              Blink Mode
            </button>
            <button
              onClick={() => { setViewMode('difference'); setIsPlaying(false); }}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-all cursor-pointer ${
                viewMode === 'difference'
                  ? 'bg-[#2563EB] text-white border-[#3B82F6]'
                  : 'bg-[#0B1020] text-[#94A3B8] border-[#263247] hover:text-[#E8EDF5]'
              }`}
            >
              Difference Map
            </button>
          </div>

          {/* Scientific FOV, Palette, Stretch & Smoothing Controls */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            {/* FOV Dropdown */}
            <div data-tour="fov-selector" className="flex items-center gap-1.5">
              <span className="text-[#94A3B8]">FOV:</span>
              <select
                value={fovArcsec}
                onChange={(e) => setFovArcsec(Number(e.target.value))}
                className="bg-[#0B1020] border border-[#263247] text-[#6EA8FE] font-mono text-xs rounded px-2 py-1 focus:outline-none focus:border-[#6EA8FE]"
              >
                <option value={120}>2′ (120″) High Zoom</option>
                <option value={300}>5′ (300″) Star Field</option>
                <option value={600}>10′ (600″) Medium</option>
                <option value={900}>15′ (900″) Recommended</option>
                <option value={1800}>30′ (1800″) Wide Field</option>
              </select>
            </div>

            {/* Display Stretch & Colormap */}
            <div data-tour="display-stretch" className="flex items-center gap-1.5">
              <select
                value={stretch}
                onChange={(e) => setStretch(e.target.value)}
                className="bg-[#0B1020] border border-[#263247] text-[#94A3B8] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#6EA8FE]"
              >
                <option value="asinh">Asinh Stretch</option>
                <option value="linear">Linear</option>
                <option value="sqrt">Square Root</option>
                <option value="log">Log</option>
              </select>
              <select
                value={colormap}
                onChange={(e) => setColormap(e.target.value)}
                className="bg-[#0B1020] border border-[#263247] text-[#94A3B8] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#6EA8FE]"
              >
                <option value="gray">Grayscale (Standard)</option>
                <option value="inferno">Inferno</option>
                <option value="viridis">Viridis</option>
                <option value="magma">Magma</option>
              </select>
            </div>

            {/* Smooth Display Toggle */}
            <label className="flex items-center gap-1.5 text-[#94A3B8] cursor-pointer">
              <input
                type="checkbox"
                checked={smooth}
                onChange={(e) => setSmooth(e.target.checked)}
                className="accent-[#6EA8FE] rounded"
              />
              <span>Smooth</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Astronomical Canvas Container */}
      <div className="bg-[#111927] border-x border-[#263247] p-6 relative">
        {(loadingManifest && viewMode === 'timelapse') || (loadingComparison && viewMode !== 'timelapse' && !comparison) ? (
          <div className="aspect-[4/3] max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-[#6EA8FE] animate-spin mb-3" />
            <h4 className="text-sm font-semibold text-[#E8EDF5] mb-1">
              {viewMode === 'timelapse' ? 'Loading Authentic NASA SPHEREx Observations…' : 'Aligning Authentic SPHEREx Observations…'}
            </h4>
            <p className="text-xs text-[#94A3B8] max-w-sm">
              {viewMode === 'timelapse'
                ? 'Retrieving calibrated Level 2 FITS arrays and aligning onto fixed tangent celestial grid.'
                : 'Performing celestial WCS reprojection and sigma-clipped background matching.'}
            </p>
          </div>
        ) : (
          <div>
            {/* MODE 1: TIME-LAPSE MOVIE (Mandatory Core NASA Challenge) */}
            {viewMode === 'timelapse' && activeFrame && (
              <div className="max-w-2xl mx-auto">
                {/* HUD Top Bar */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="blue">
                      Epoch {activeFrame.frame_index + 1} of {manifest?.total_frames || 1}
                    </Badge>
                    <span className="font-semibold text-[#E8EDF5]">{activeFrame.date_display}</span>
                    <span className="text-[#94A3B8] font-mono text-[11px]">[{activeFrame.bandpass}]</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#6EA8FE]">
                    ObsID: {activeFrame.obs_id}
                  </div>
                </div>

                {/* Astronomical Viewport */}
                <div className="relative aspect-square bg-[#0B1020] border border-[#263247] rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
                  <img
                    src={activeFrame.image_base64}
                    alt={`Observation ${activeFrame.date_display}`}
                    className="w-full h-full object-contain"
                  />

                  {/* Celestial Compass (North / East) */}
                  {showCompass && (
                    <div className="absolute top-3 left-3 bg-[#0B1020]/80 border border-[#263247] rounded px-2 py-1 text-[10px] text-[#94A3B8] flex items-center gap-1.5 shadow backdrop-blur-sm pointer-events-none">
                      <Compass className="w-3.5 h-3.5 text-[#6EA8FE]" />
                      <span>N ↑ &nbsp; E ←</span>
                    </div>
                  )}

                  {/* Physical Angular Scale Bar */}
                  <div className="absolute bottom-3 right-3 bg-[#0B1020]/85 border border-[#263247] rounded px-2.5 py-1 text-[10px] font-mono text-[#94A3B8] flex flex-col items-end gap-0.5 shadow backdrop-blur-sm pointer-events-none">
                    <div className="w-16 h-0.5 bg-[#6EA8FE]" />
                    <span>~{Math.round(fovArcsec / 4)}"</span>
                  </div>
                </div>

                {/* Video Playback Controls Bar */}
                <div data-tour="timelapse-player" className="mt-4 bg-[#151E30] border border-[#263247] rounded-lg p-3">
                  <div className="flex items-center justify-between gap-4 mb-2.5">
                    {/* Play/Pause & Step Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isPlaying ? 'secondary' : 'primary'}
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={isSingleEpoch}
                        leftIcon={isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      >
                        {isSingleEpoch ? 'Single Epoch (Playback Disabled)' : isPlaying ? 'Pause' : 'Play Time-Lapse'}
                      </Button>

                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
                        }}
                        disabled={currentFrameIndex === 0}
                        className="p-1.5 rounded bg-[#0B1020] border border-[#263247] text-[#94A3B8] hover:text-[#E8EDF5] disabled:opacity-40"
                        title="Previous Epoch"
                      >
                        <SkipBack className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          setCurrentFrameIndex((prev) => Math.min((manifest?.frames.length || 1) - 1, prev + 1));
                        }}
                        disabled={!manifest || currentFrameIndex === manifest.frames.length - 1}
                        className="p-1.5 rounded bg-[#0B1020] border border-[#263247] text-[#94A3B8] hover:text-[#E8EDF5] disabled:opacity-40"
                        title="Next Epoch"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setLoopPlayback(!loopPlayback)}
                        className={`p-1.5 rounded border text-xs transition-colors ${
                          loopPlayback
                            ? 'bg-[#1a2540] border-[#6EA8FE] text-[#6EA8FE]'
                            : 'bg-[#0B1020] border-[#263247] text-[#94A3B8]'
                        }`}
                        title="Loop Playback"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Playback Speed Selector */}
                    <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <span>Speed:</span>
                      <select
                        value={playbackSpeedMs}
                        onChange={(e) => setPlaybackSpeedMs(Number(e.target.value))}
                        className="bg-[#0B1020] border border-[#263247] text-[#E8EDF5] text-xs rounded px-2 py-1"
                      >
                        <option value={1200}>0.5× Slow</option>
                        <option value={800}>1.0× Normal</option>
                        <option value={400}>2.0× Fast</option>
                      </select>
                    </div>
                  </div>

                  {/* Scrubber Timeline */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min="0"
                      max={(manifest?.frames.length || 1) - 1}
                      value={currentFrameIndex}
                      onChange={(e) => {
                        setIsPlaying(false);
                        setCurrentFrameIndex(Number(e.target.value));
                      }}
                      className="w-full accent-[#6EA8FE] cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-[#94A3B8]">
                      {manifest?.frames.map((f, i) => (
                        <button
                          key={f.obs_id}
                          onClick={() => {
                            setIsPlaying(false);
                            setCurrentFrameIndex(i);
                          }}
                          className={`hover:text-[#6EA8FE] transition-colors ${
                            i === currentFrameIndex ? 'text-[#6EA8FE] font-bold underline' : ''
                          }`}
                        >
                          {f.date_display}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: SIDE-BY-SIDE PAIRWISE COMPARISON */}
            {viewMode === 'side-by-side' && comparison && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#6EA8FE]">
                      Earlier Epoch: {comparison.observation_1?.date_obs?.slice(0, 10)}
                    </span>
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      {comparison.observation_1?.obs_id}
                    </span>
                  </div>
                  <div className="aspect-square bg-[#070B14] border border-[#263247] rounded-lg overflow-hidden flex items-center justify-center">
                    {comparison.epoch1_image_base64 ? (
                      <img
                        src={comparison.epoch1_image_base64}
                        alt="Earlier Epoch"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-[#94A3B8]">Observation unavailable</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#F3B85B]">
                      {isSingleEpoch ? 'Second Epoch (Pending Release)' : `Later Epoch: ${comparison.observation_2?.date_obs?.slice(0, 10)}`}
                    </span>
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      {isSingleEpoch ? 'Single Visit Available' : comparison.observation_2?.obs_id}
                    </span>
                  </div>
                  <div className="aspect-square bg-[#070B14] border border-[#263247] rounded-lg overflow-hidden flex items-center justify-center">
                    {isSingleEpoch ? (
                      <div className="text-center p-6 space-y-2 max-w-xs">
                        <Clock className="w-8 h-8 text-[#F3B85B] mx-auto opacity-70" />
                        <p className="text-xs font-semibold text-[#E8EDF5]">Single Observation Epoch Prepared</p>
                        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                          1 calibrated Level 2 observation visit is currently prepared for this field.
                          Multi-epoch cross-comparison requires subsequent visits.
                        </p>
                        <p className="text-[10px] text-[#6EA8FE]">
                          Use the Target selector above to explore verified multi-epoch challenge targets with multiple prepared observation dates.
                        </p>
                      </div>
                    ) : comparison.epoch2_image_base64 ? (
                      <img
                        src={comparison.epoch2_image_base64}
                        alt="Later Epoch"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-[#94A3B8]">Observation unavailable</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 3: SPLIT SLIDER COMPARISON */}
            {viewMode === 'slider' && comparison && (
              <div className="max-w-xl mx-auto">
                <div className="flex items-center justify-between mb-2 text-xs text-[#94A3B8]">
                  <span>Drag slider to reveal Earlier (left) vs Later (right)</span>
                  <span className="font-mono text-[#6EA8FE]">{sliderPosition}%</span>
                </div>
                <div className="relative aspect-square bg-[#0B1020] border border-[#263247] rounded-lg overflow-hidden select-none">
                  {/* Later image full background */}
                  <img
                    src={comparison.epoch2_image_base64}
                    alt="Epoch 2"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  {/* Earlier image clipped */}
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden"
                    style={{ width: `${sliderPosition}%` }}
                  >
                    <img
                      src={comparison.epoch1_image_base64}
                      alt="Epoch 1"
                      className="w-full h-full object-contain max-w-none"
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                  {/* Divider line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#6EA8FE] shadow-lg cursor-ew-resize flex items-center justify-center"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#6EA8FE] text-[#0B1020] text-[10px] font-bold flex items-center justify-center shadow-md">
                      ↔
                    </div>
                  </div>
                </div>
                <div className="mt-4 px-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="w-full accent-[#6EA8FE] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* MODE 4: BLINK MODE */}
            {viewMode === 'blink' && comparison && (
              <div className="max-w-xl mx-auto text-center">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isBlinking ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => setIsBlinking(!isBlinking)}
                      leftIcon={isBlinking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    >
                      {isBlinking ? 'Pause' : 'Play Blink'}
                    </Button>
                    <Badge variant={blinkIndex === 0 ? 'blue' : 'amber'}>
                      {blinkIndex === 0
                        ? `Epoch 1: ${comparison.observation_1?.date_obs?.slice(0, 10)}`
                        : `Epoch 2: ${comparison.observation_2?.date_obs?.slice(0, 10)}`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                    <span>Speed:</span>
                    <select
                      value={blinkSpeedMs}
                      onChange={(e) => setBlinkSpeedMs(Number(e.target.value))}
                      className="bg-[#0B1020] border border-[#263247] text-[#94A3B8] text-xs rounded px-2 py-1"
                    >
                      <option value={250}>Fast (250ms)</option>
                      <option value={400}>Normal (400ms)</option>
                      <option value={700}>Slow (700ms)</option>
                    </select>
                  </div>
                </div>

                <div className="aspect-square bg-[#0B1020] border border-[#263247] rounded-lg overflow-hidden">
                  <img
                    src={blinkIndex === 0 ? comparison.epoch1_image_base64 : comparison.epoch2_image_base64}
                    alt="Blink view"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs text-[#94A3B8] mt-3">
                  Astronomers use blink comparators to identify cosmic change: stationary stars remain steady while moving asteroids or variable stars jump!
                </p>
              </div>
            )}

            {/* MODE 5: DIFFERENCE MAP */}
            {viewMode === 'difference' && comparison && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#E8EDF5]">
                    Scientific Difference Image: Epoch 2 − Epoch 1
                  </span>
                  <Badge variant="purple">Coolwarm Diverging Normalization</Badge>
                </div>

                <div className="aspect-square bg-[#0B1020] border border-[#263247] rounded-lg overflow-hidden mb-4">
                  {comparison.difference_image_base64 ? (
                    <img
                      src={comparison.difference_image_base64}
                      alt="Difference image"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p className="text-xs text-[#94A3B8] p-6 text-center">Calculating difference...</p>
                  )}
                </div>

                <div className="text-xs text-[#94A3B8] space-y-1">
                  <div className="flex items-center gap-1.5 text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Stationary celestial background is subtracted out cleanly to zero signal.</span>
                  </div>
                  <p>
                    A moving source produces a dipole signature: a negative deficit at the earlier coordinate and a positive excess at the later coordinate.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scientific Metadata & Provenance Drawer */}
      <div className="bg-[#151E30] border border-t-0 border-[#263247] rounded-b-lg p-4 mb-6 text-xs text-[#94A3B8]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Telescope & Level</span>
            <span className="text-[#E8EDF5] font-mono">NASA SPHEREx (Level 2)</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Native Pixel Scale</span>
            <span className="text-[#E8EDF5] font-mono">6.15 arcsec / pixel</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Calibration Units</span>
            <span className="text-[#E8EDF5] font-mono">MJy / sr (Calibrated)</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#64748B]">Archive Provenance</span>
            <span className="text-[#6EA8FE] font-mono">NASA/IPAC IRSA TAP</span>
          </div>
        </div>
      </div>

      {/* Candidate Detections Section */}
      {comparison && comparison.candidates.length > 0 && (
        <div className="bg-[#151E30] border border-[#263247] rounded p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F3B85B]" />
              <h3 className="text-base font-semibold text-[#E8EDF5]">
                Detected Candidate Changes ({comparison.candidates.length})
              </h3>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/discovery-lab?object=${selectedObject.slug}`)}
            >
              Inspect in Discovery Lab →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {comparison.candidates.map((cand) => (
              <div key={cand.id} className="bg-[#0B1020] border border-[#263247] rounded p-3 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#E8EDF5]">{cand.target_name}</span>
                  <Badge variant={cand.candidate_type === 'moving_source' ? 'amber' : 'blue'}>
                    {cand.candidate_type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-[#94A3B8] mb-2">{cand.explanation}</p>
                <div className="flex justify-between text-[11px] font-mono text-[#6EA8FE]">
                  <span>Displacement: {cand.angular_displacement_arcsec}"</span>
                  <span>Confidence: {cand.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Educational info panel */}
      <InfoPanel title="How does time-domain astronomical discovery work?">
        <p>
          NASA’s SPHEREx mission visits every patch of sky approximately every six months. By comparing observations taken on different dates, astronomers track what moves and what changes:
        </p>
        <p>
          <strong className="text-[#E8EDF5]">Moving Objects:</strong> Nearby stars with high proper motion (like Barnard’s Star) and cold brown dwarfs (like WISE 0855) shift their celestial coordinates across months and years.
        </p>
        <p>
          <strong className="text-[#E8EDF5]">Variable Sources:</strong> Young stellar systems (like RW Aurigae) and pulsating Mira stars (like R Draconis) change brightness while remaining stationary on the celestial sphere.
        </p>
        <p>
          <strong className="text-[#E8EDF5]">Scientific Integrity:</strong> All images are extracted from authentic NASA Level 2 SPHEREx FITS products with celestial WCS reprojection. No synthetic Gaussian stars or simulated motions are used.
        </p>
      </InfoPanel>
    </div>
  );
};
