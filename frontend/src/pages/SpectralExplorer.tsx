import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  BarChart2, Layers, Info, Filter, ArrowRight,
  Sparkles, CheckCircle2, ChevronRight, HelpCircle,
  Play, Pause, SkipBack, SkipForward, Download, Globe,
  AlertTriangle, Compass, MapPin, Sliders, RefreshCw
} from 'lucide-react';
import { api, TargetSpectrumResponse } from '../services/api';
import { FEATURED_OBJECTS } from '../constants/objects';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InfoPanel } from '../components/ui/InfoPanel';
import { getAladinInstance } from '../utils/aladinLoader';

const DETECTORS = [
  { id: 'ALL', name: 'All Arrays', range: '0.75 – 5.00 μm', chRange: [1, 102] },
  { id: 'D1', name: 'Array 1 (D1)', range: '0.75 – 1.11 μm', chRange: [1, 17] },
  { id: 'D2', name: 'Array 2 (D2)', range: '1.11 – 1.64 μm', chRange: [18, 34] },
  { id: 'D3', name: 'Array 3 (D3)', range: '1.64 – 2.42 μm', chRange: [35, 50] },
  { id: 'D4', name: 'Array 4 (D4)', range: '2.42 – 3.82 μm', chRange: [53, 68] },
  { id: 'D5', name: 'Array 5 (D5)', range: '3.82 – 4.42 μm', chRange: [69, 85] },
  { id: 'D6', name: 'Array 6 (D6)', range: '4.42 – 5.00 μm', chRange: [86, 102] },
];

const MOLECULAR_FEATURES = [
  { name: 'Water Ice (H₂O)', wavelength: 3.05, detector: 'D4', desc: 'Prominent ice absorption in interstellar clouds and protoplanetary discs.' },
  { name: 'CO₂ Ice', wavelength: 4.27, detector: 'D5', desc: 'Carbon dioxide ice stretching vibration band.' },
  { name: 'CO Gas / Ice', wavelength: 4.67, detector: 'D6', desc: 'Fundamental carbon monoxide absorption feature.' },
  { name: 'Pa-β Hydrogen', wavelength: 1.28, detector: 'D2', desc: 'Paschen-beta emission in accreting young stars like RW Aurigae.' },
];

const getHipsApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:8000/api/spectra/hips`;
  }
  return 'http://127.0.0.1:8000/api/spectra/hips';
};

export const SpectralExplorer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const objectSlug = searchParams.get('object') || 'barnards-star';
  const selectedObject = FEATURED_OBJECTS.find((o) => o.slug === objectSlug) || FEATURED_OBJECTS[0];

  // Spectral Channel Selection & Synchronization Architecture (1 to 102)
  // renderedChannel is the strict source of truth for the displayed image and all wavelength labels
  const [currentChannel, setCurrentChannel] = useState<number>(24);
  const [renderedChannel, setRenderedChannel] = useState<number>(24);
  const [viewerMode, setViewerMode] = useState<'scan' | 'aladin'>('scan');
  const [loopPlayback, setLoopPlayback] = useState<boolean>(true);
  const isGap = renderedChannel === 51 || renderedChannel === 52;
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSpeedMs, setScanSpeedMs] = useState<number>(500); // 500ms smooth scan cadence

  // Active detector filter
  const [activeDetector, setActiveDetector] = useState<string>('ALL');

  // Spectrum data & extraction
  const [spectrum, setSpectrum] = useState<TargetSpectrumResponse | null>(null);
  const [loadingSpectrum, setLoadingSpectrum] = useState<boolean>(true);
  const [hoveredChannel, setHoveredChannel] = useState<any | null>(null);

  // Aladin Lite ref for HiPS
  const aladinContainerRef = useRef<HTMLDivElement>(null);
  const aladinInstanceRef = useRef<any>(null);
  const [aladinReady, setAladinReady] = useState<boolean>(false);
  const [activeSurvey, setActiveSurvey] = useState<string>('spherex');

  // Spectral Frame Preparation & Preloading State
  const [scanMode, setScanMode] = useState<string>('all');
  const [isPreloaded, setIsPreloaded] = useState<boolean>(false);
  const [preloading, setPreloading] = useState<boolean>(true);
  const [preparedCount, setPreparedCount] = useState<number>(0);
  const [totalPreloadPlanes, setTotalPreloadPlanes] = useState<number>(100);
  const isUpdatingLayerRef = useRef<boolean>(false);
  const lastSurveyChannelRef = useRef<number>(renderedChannel);
  const lastSurveyTimeRef = useRef<number>(0);

  // Preload and cache all 100 valid science planes into browser cache before playback
  useEffect(() => {
    let isCancelled = false;
    setPreloading(true);
    setIsPreloaded(false);

    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1';

    // 1. Audit backend cache status
    fetch(`http://${host}:8000/api/spectra/hips/preload/status?mode=${scanMode}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isCancelled) {
          setTotalPreloadPlanes(data.total_channels ?? 100);
        }
      })
      .catch((err) => console.warn('Preload status check:', err));

    // 2. Pre-decode all 100 valid spectral frames into browser image cache
    const validChannels = Array.from({ length: 102 }, (_, i) => i + 1).filter((c) => c !== 51 && c !== 52);
    let loaded = 0;

    validChannels.forEach((ch) => {
      const img = new Image();
      img.src = `http://${host}:8000/api/spectra/frame/${ch}`;
      img.onload = () => {
        if (!isCancelled) {
          loaded++;
          setPreparedCount(loaded);
          if (loaded >= validChannels.length) {
            setIsPreloaded(true);
            setPreloading(false);
          }
        }
      };
      img.onerror = () => {
        if (!isCancelled) {
          loaded++;
          setPreparedCount(loaded);
          if (loaded >= validChannels.length) {
            setIsPreloaded(true);
            setPreloading(false);
          }
        }
      };
    });

    return () => {
      isCancelled = true;
    };
  }, [scanMode]);

  // Initialize Aladin Lite v3 with authentic SPHEREx DR1 HiPS channel stream
  useEffect(() => {
    let isMounted = true;
    getAladinInstance()
      .then((A) => {
        if (!isMounted || !aladinContainerRef.current) return;
        if (!aladinInstanceRef.current) {
          const hipsBase = getHipsApiBase();
          aladinInstanceRef.current = A.aladin(aladinContainerRef.current, {
            survey: `${hipsBase}/${currentChannel}`,
            projection: 'AIT',
            fov: 180,
            target: `${selectedObject.ra} ${selectedObject.dec}`,
            cooFrame: 'J2000',
            showReticle: false,
            showZoomControl: true,
            showFullscreenControl: true,
            showLayersControl: false,
            showGotoControl: false,
            showCoordinates: false,
            showFrame: false,
            showSimbadPointerControl: false,
            showShareControl: false,
            backgroundColor: '#08080C',
          });

          try {
            aladinInstanceRef.current.setBackgroundColor('#08080C');
          } catch (e) {
            // ignore
          }

          // Add target marker
          try {
            const cat = A.catalog({ name: 'Selected Target', sourceSize: 20, color: '#F4A272' });
            aladinInstanceRef.current.addCatalog(cat);
            const marker = A.marker(selectedObject.ra, selectedObject.dec, {
              popupTitle: selectedObject.name,
              popupDesc: `Target: ${selectedObject.type} · RA ${selectedObject.ra.toFixed(4)}°, Dec ${selectedObject.dec.toFixed(4)}°`,
            });
            cat.addSources([marker]);
          } catch (e) {
            console.warn('Marker overlay notice:', e);
          }

          if (isMounted) setAladinReady(true);
        }
      })
      .catch((err) => {
        console.error('Aladin Lite Spectral Explorer init error:', err);
      });

    return () => {
      isMounted = false;
      if (aladinInstanceRef.current) {
        try {
          aladinInstanceRef.current.stopAnimation?.();
          aladinInstanceRef.current.removeLayers?.();
          aladinInstanceRef.current.removeOverlays?.();
        } catch (e) {
          // ignore
        }
      }
      if (aladinContainerRef.current) {
        try {
          const canvases = aladinContainerRef.current.querySelectorAll('canvas');
          canvases.forEach((c) => {
            const gl = c.getContext('webgl2') || c.getContext('webgl');
            gl?.getExtension('WEBGL_lose_context')?.loseContext();
          });
          aladinContainerRef.current.innerHTML = '';
        } catch (e) {
          // ignore
        }
      }
      aladinInstanceRef.current = null;
    };
  }, []);

  // Update HiPS channel survey when currentChannel changes (guarded against concurrent WebGL re-entrancy & throttled during rapid scan)
  useEffect(() => {
    if (!aladinInstanceRef.current || !aladinReady || activeSurvey !== 'spherex' || isGap) return;

    const now = Date.now();
    // When scanning rapidly across 102 channels, throttle full HiPS survey swaps to prevent WebGL context exhaustion
    if (isScanning) {
      const timeSinceLast = now - lastSurveyTimeRef.current;
      const minInterval = Math.max(300, scanSpeedMs * 0.7);
      if (timeSinceLast < minInterval) {
        return;
      }
    }

    if (isUpdatingLayerRef.current) {
      return;
    }

    isUpdatingLayerRef.current = true;
    lastSurveyTimeRef.current = now;
    lastSurveyChannelRef.current = currentChannel;

    const timer = setTimeout(() => {
      try {
        const hipsBase = getHipsApiBase();
        aladinInstanceRef.current.setImageSurvey(`${hipsBase}/${currentChannel}`);
      } catch (e) {
        console.warn('Could not update HiPS channel survey:', e);
      } finally {
        setTimeout(() => {
          isUpdatingLayerRef.current = false;
        }, 150);
      }
    }, 40);

    return () => {
      clearTimeout(timer);
      isUpdatingLayerRef.current = false;
    };
  }, [renderedChannel, aladinReady, activeSurvey, isGap, isScanning, viewerMode]);

  // When scan finishes or is paused, synchronize Aladin Lite instance to the exact final renderedChannel
  useEffect(() => {
    if (!isScanning && aladinInstanceRef.current && aladinReady && activeSurvey === 'spherex' && !isGap) {
      if (lastSurveyChannelRef.current !== renderedChannel) {
        try {
          const hipsBase = getHipsApiBase();
          aladinInstanceRef.current.setImageSurvey(`${hipsBase}/${renderedChannel}`);
          lastSurveyChannelRef.current = renderedChannel;
        } catch (e) {
          console.warn('Sync final channel error:', e);
        }
      }
    }
  }, [isScanning, renderedChannel, aladinReady, activeSurvey, isGap]);

  // Update position when selectedObject changes
  useEffect(() => {
    if (aladinInstanceRef.current && aladinReady && selectedObject) {
      try {
        aladinInstanceRef.current.gotoRaDec(selectedObject.ra, selectedObject.dec);
      } catch (e) {
        console.warn('Aladin goto error:', e);
      }
    }
  }, [selectedObject, aladinReady]);

  // Survey layer switcher
  const handleSurveyChange = (surveyKey: string) => {
    setActiveSurvey(surveyKey);
    if (!aladinInstanceRef.current) return;
    try {
      const hipsBase = getHipsApiBase();
      if (surveyKey === 'spherex') {
        aladinInstanceRef.current.setImageSurvey(`${hipsBase}/${renderedChannel}`);
      } else if (surveyKey === 'allwise') {
        aladinInstanceRef.current.setImageSurvey('https://irsa.ipac.caltech.edu/data/hips/CDS/AllWISE/RGB-W4-W2-W1');
      } else if (surveyKey === '2mass') {
        aladinInstanceRef.current.setImageSurvey('https://irsa.ipac.caltech.edu/data/hips/CDS/2MASS/Color');
      }
    } catch (e) {
      console.warn('Survey switch notice:', e);
    }
  };

  // Fetch authentic spectrum profile
  useEffect(() => {
    setLoadingSpectrum(true);
    api.getSpectrum(selectedObject.slug)
      .then((data) => setSpectrum(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingSpectrum(false));
  }, [selectedObject]);

  // Wavelength scan playback: renderedChannel is advanced and guarantees zero desync
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setRenderedChannel((prev) => {
        let next = prev + 1;
        // Seamlessly jump optical dichroic gap during scan (channels 51 and 52 are unobserved physical boundary)
        if (next === 51 || next === 52) next = 53;
        if (next > 102) {
          if (loopPlayback) {
            next = 1;
          } else {
            setIsScanning(false);
            return prev;
          }
        }
        setCurrentChannel(next);
        return next;
      });
    }, scanSpeedMs);
    return () => clearInterval(interval);
  }, [isScanning, scanSpeedMs, loopPlayback]);

  // Compute current wavelength from channel index (0.75 - 5.00 μm)
  const getWavelengthForChannel = (ch: number): number => {
    let base = 0.75;
    let max = 1.11;
    let localIndex = ch - 1;

    if (ch >= 1 && ch <= 17) { base = 0.75; max = 1.11; localIndex = ch - 1; }
    else if (ch >= 18 && ch <= 34) { base = 1.11; max = 1.64; localIndex = ch - 18; }
    else if (ch >= 35 && ch <= 50) { base = 1.64; max = 2.42; localIndex = ch - 35; }
    else if (ch === 51 || ch === 52) { return 2.42; }
    else if (ch >= 53 && ch <= 68) { base = 2.42; max = 3.82; localIndex = ch - 53; }
    else if (ch >= 69 && ch <= 85) { base = 3.82; max = 4.42; localIndex = ch - 69; }
    else { base = 4.42; max = 5.00; localIndex = ch - 86; }

    const step = (max - base) / 17.0;
    return Math.round((base + localIndex * step) * 1000) / 1000;
  };

  const currentWavelengthUm = getWavelengthForChannel(renderedChannel);

  // Find which detector owns current channel
  const getCurrentDetectorId = (ch: number): string => {
    if (ch <= 17) return 'D1';
    if (ch <= 34) return 'D2';
    if (ch <= 50) return 'D3';
    if (ch === 51 || ch === 52) return 'Gap';
    if (ch <= 68) return 'D4';
    if (ch <= 85) return 'D5';
    return 'D6';
  };

  const currentDetector = getCurrentDetectorId(renderedChannel);

  // Handle detector filter tab click: syncs table/chart AND jumps channel scanner
  const handleSelectDetector = (detId: string) => {
    setActiveDetector(detId);
    if (detId !== 'ALL') {
      const det = DETECTORS.find((d) => d.id === detId);
      if (det && (renderedChannel < det.chRange[0] || renderedChannel > det.chRange[1])) {
        setCurrentChannel(det.chRange[0]);
        setRenderedChannel(det.chRange[0]);
      }
    }
  };

  const handlePrevChannel = () => {
    let prev = renderedChannel - 1;
    if (prev === 52 || prev === 51) prev = 50;
    if (prev < 1) prev = 102;
    setCurrentChannel(prev);
    setRenderedChannel(prev);
  };

  const handleNextChannel = () => {
    let next = renderedChannel + 1;
    if (next === 51 || next === 52) next = 53;
    if (next > 102) next = 1;
    setCurrentChannel(next);
    setRenderedChannel(next);
  };

  const handleSliderChange = (val: number) => {
    setCurrentChannel(val);
    setRenderedChannel(val);
  };

  const handleToggleScan = () => {
    if (!isScanning) {
      if (isGap) {
        setCurrentChannel(53);
        setRenderedChannel(53);
      }
      setIsScanning(true);
    } else {
      setIsScanning(false);
    }
  };

  // Export spectrum to CSV
  const handleExportCSV = () => {
    if (!spectrum || !spectrum.channels) return;
    const headers = 'Channel,Detector,Wavelength_um,Flux_MJy_sr,Flux_uJy,Observed\n';
    const rows = spectrum.channels.map(
      (c) => `${c.channel},${c.detector},${c.wavelength_um},${c.flux_mjy_sr ?? 'null'},${c.flux_uJy ?? 'null'},${c.observed}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SPHEREx_${selectedObject.slug}_spectrum_102bands.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredChannels = spectrum?.channels.filter(
    (ch) => activeDetector === 'ALL' || ch.detector === activeDetector
  ) || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <BarChart2 className="w-5 h-5 text-[#F4A272]" />
            <h1 className="text-2xl font-bold text-[#F3EFE8]">SPHEREx Spectral Explorer</h1>
            <Badge variant="blue">Official DR1 All-Sky Cube</Badge>
            <Badge variant="amber">Cube Resolution: ~12.9″/px (DR1 Order 5)</Badge>
          </div>
          <p className="text-sm text-[#9E9AA7]">
            Explore genuine all-sky near-infrared observations across all 102 SPHEREx spectral channels (0.75 μm – 5.0 μm)
          </p>
        </div>

        {/* Object selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9E9AA7]">Target:</span>
          <select
            value={selectedObject.slug}
            onChange={(e) => navigate(`/spectra?object=${e.target.value}`)}
            className="bg-[#111117] border border-[#262635] text-[#F3EFE8] text-xs rounded px-3 py-1.5 focus:outline-none focus:border-[#F4A272]"
          >
            {FEATURED_OBJECTS.map((obj) => (
              <option key={obj.id} value={obj.slug}>
                {obj.name} ({obj.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Official DR1 All-Sky Spectral Map Viewport */}
      <div className="bg-[#111117] border border-[#262635] rounded-lg overflow-hidden mb-6 shadow-2xl">
        <div className="p-3.5 bg-[#0D1526] border-b border-[#262635] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#F4A272]" />
              <span className="font-semibold text-[#F3EFE8]">Official SPHEREx DR1 Spectral Cube</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#08080C] border border-[#262635] rounded px-2 py-0.5 text-[11px]">
              <span className="text-[#9E9AA7]">Survey:</span>
              <select
                value={activeSurvey}
                onChange={(e) => handleSurveyChange(e.target.value)}
                className="bg-transparent text-[#F4A272] font-mono focus:outline-none cursor-pointer"
              >
                <option value="spherex">SPHEREx DR1 All-Sky Cube (102 Bands)</option>
                <option value="allwise">AllWISE Mid-IR (NASA IRSA)</option>
                <option value="2mass">2MASS Near-IR (NASA IRSA)</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#08080C] border border-[#262635] rounded p-0.5">
              <button
                onClick={() => setViewerMode('scan')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  viewerMode === 'scan' ? 'bg-[#F4A272] text-black font-semibold' : 'text-[#9E9AA7] hover:text-[#F3EFE8]'
                }`}
                title="Synchronized spectral playback view across all 100 bands"
              >
                Scan View (100 Bands)
              </button>
              <button
                onClick={() => {
                  setIsScanning(false);
                  setViewerMode('aladin');
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  viewerMode === 'aladin' ? 'bg-[#F4A272] text-black font-semibold' : 'text-[#9E9AA7] hover:text-[#F3EFE8]'
                }`}
                title="Interactive Aladin Lite pan & zoom sky atlas"
              >
                Aladin Lite View
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-[#F4A272] font-bold">Channel {renderedChannel} / 102</span>
            <span className="text-[#9E9AA7]">·</span>
            <span className="text-[#F3B85B] font-bold">λ = {currentWavelengthUm} μm</span>
            <span className="text-[#9E9AA7]">·</span>
            <span className="text-[#9E9AA7]">Band: Array {currentDetector}</span>
          </div>
        </div>

        {/* Interactive Sky Canvas */}
        <div data-tour="spectral-viewer" className="relative aspect-[21/9] sm:aspect-[16/7] bg-[#08080C] flex items-center justify-center overflow-hidden">
          {/* Synchronized Spectral Scan View (All-Sky 100-plane Image Player) */}
          {viewerMode === 'scan' && !isGap && (
            <div className="relative w-full h-full flex items-center justify-center bg-[#08080C]">
              <img
                src={`http://${typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1'}:8000/api/spectra/frame/${renderedChannel}`}
                alt={`SPHEREx DR1 Channel ${renderedChannel}`}
                className="max-w-full max-h-full object-contain select-none"
              />
              <div className="absolute top-3 left-3 bg-[#08080C]/90 border border-[#262635] rounded px-2.5 py-1 text-xs font-mono text-[#F3EFE8] flex items-center gap-2 shadow-lg backdrop-blur-sm">
                <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-400 animate-pulse' : 'bg-[#F4A272]'}`} />
                <span>SPHEREx DR1 All-Sky Scan: Ch {renderedChannel} ({currentWavelengthUm} μm · Array {currentDetector}) · All-Sky Preview · Science Cube: ~12.9″/px (Order 5)</span>
              </div>
            </div>
          )}

          {/* Always-mounted Aladin Lite v3 WebGL Canvas (Target Viewport) */}
          <div
            ref={aladinContainerRef}
            className="w-full h-full relative"
            style={{
              backgroundColor: '#08080C',
              display: viewerMode === 'aladin' ? 'block' : 'none'
            }}
          >
            {viewerMode === 'aladin' && (
              <div className="absolute top-3 left-3 z-10 bg-[#08080C]/90 border border-[#262635] rounded px-2.5 py-1 text-xs font-mono text-[#F3EFE8] flex items-center gap-2 shadow-lg backdrop-blur-sm pointer-events-none">
                <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-400 animate-pulse' : 'bg-[#F4A272]'}`} />
                <span>SPHEREx DR1 Target View: Ch {renderedChannel} ({currentWavelengthUm} μm · Array {currentDetector}) · Active Viewport · HiPS Order 5 (~12.9″/px)</span>
              </div>
            )}
          </div>

          {/* Dichroic Gap Banner when Ch 51 or 52 is selected (Overlay, never destroys canvas) */}
          {isGap && (
            <div className="absolute inset-0 bg-[#08080C]/95 flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
              <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
              <h3 className="text-base font-bold text-[#F3EFE8] mb-1">
                2.42 μm Optical Dichroic Gap (Channels 51 & 52)
              </h3>
              <p className="text-xs text-[#9E9AA7] max-w-md leading-relaxed mb-4">
                This channel sits precisely at the physical beam-splitter transition between Array 3 and Array 4.
                Scientific data is unobserved at this boundary. No simulated measurements are substituted.
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setCurrentChannel(53);
                  setRenderedChannel(53);
                }}
              >
                Jump to Array 4 (Channel 53 · 2.50 μm) →
              </Button>
            </div>
          )}

          {/* Loading state indicator */}
          {!isPreloaded && preloading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#08080C]/90 backdrop-blur-sm p-6 text-center z-10">
              <RefreshCw className="w-8 h-8 text-[#F4A272] animate-spin mb-3" />
              <h4 className="text-sm font-semibold text-[#F3EFE8] mb-1">
                Preparing Authentic NASA SPHEREx DR1 Infrared Stream…
              </h4>
              <p className="text-xs text-[#9E9AA7] max-w-sm mb-3">
                Pre-decoding all 100 valid infrared spectral channels for jitter-free synchronized playback.
              </p>
              <div className="w-48 bg-[#111117] rounded-full h-2 overflow-hidden border border-[#262635]">
                <div
                  className="bg-[#F4A272] h-full transition-all duration-300"
                  style={{ width: `${Math.round((preparedCount / totalPreloadPlanes) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-[#9E9AA7] mt-1.5">
                {preparedCount} / {totalPreloadPlanes} Planes Ready ({Math.round((preparedCount / totalPreloadPlanes) * 100)}%)
              </span>
            </div>
          )}
        </div>

        {/* Bottom Wavelength Slider Bar */}
        <div className="p-4 bg-[#0D1526] border-t border-[#262635] space-y-3">
          {/* Preload Preparation Status Banner */}
          {preloading && (
            <div className="bg-[#08080C] border border-[#262635] rounded px-3 py-2 text-xs flex items-center justify-between gap-3 text-[#9E9AA7]">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#F4A272] animate-spin" />
                <span>Preparing infrared wavelength scan… Prepared {preparedCount} of {totalPreloadPlanes} valid wavelength planes</span>
              </div>
              <div className="w-32 bg-[#111117] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#F4A272] h-full transition-all duration-300"
                  style={{ width: `${Math.round((preparedCount / totalPreloadPlanes) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Scan Playback Buttons */}
              <div data-tour="spectral-scan" className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant={isScanning ? 'secondary' : 'primary'}
                  onClick={handleToggleScan}
                  disabled={preloading || !isPreloaded}
                  leftIcon={isScanning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                >
                  {preloading ? 'Preparing Scan…' : isScanning ? 'Pause Scan' : 'Wavelength Scan'}
                </Button>
                <select
                  value={scanMode}
                  onChange={(e) => setScanMode(e.target.value)}
                  className="bg-[#111117] border border-[#262635] text-[#F3EFE8] text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#F4A272]"
                  title="Select scan preparation scope"
                >
                  <option value="all">Full Spectrum (100 Bands)</option>
                  <option value="D1">Array D1 (0.75–1.11 μm)</option>
                  <option value="D2">Array D2 (1.11–1.64 μm)</option>
                  <option value="D3">Array D3 (1.64–2.42 μm)</option>
                  <option value="D4">Array D4 (2.42–3.82 μm)</option>
                  <option value="D5">Array D5 (3.82–4.42 μm)</option>
                  <option value="D6">Array D6 (4.42–5.00 μm)</option>
                </select>
                <select
                  value={scanSpeedMs}
                  onChange={(e) => setScanSpeedMs(Number(e.target.value))}
                  className="bg-[#111117] border border-[#262635] text-[#F3EFE8] text-xs rounded px-2 py-1.5 focus:outline-none focus:border-[#F4A272]"
                  title="Scan Speed"
                >
                  <option value={800}>0.8s / band</option>
                  <option value={500}>0.5s / band</option>
                  <option value={300}>0.3s / band</option>
                  <option value={150}>0.15s / band</option>
                </select>
                <button
                  onClick={handlePrevChannel}
                  className="p-1.5 rounded bg-[#111117] border border-[#262635] text-[#9E9AA7] hover:text-[#F3EFE8]"
                  title="Previous Channel"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextChannel}
                  className="p-1.5 rounded bg-[#111117] border border-[#262635] text-[#9E9AA7] hover:text-[#F3EFE8]"
                  title="Next Channel"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-xs text-[#9E9AA7] hidden sm:inline font-mono">
                Channel {renderedChannel} of 102
              </span>
            </div>

            {/* Detector Arrays Quick Selector */}
            <div data-tour="detector-bands" className="flex items-center gap-1 overflow-x-auto text-xs">
              {DETECTORS.slice(1).map((det) => {
                const isActive = currentDetector === det.id;
                return (
                  <button
                    key={det.id}
                    onClick={() => handleSelectDetector(det.id)}
                    className={`px-2 py-1 rounded text-[11px] font-mono border transition-all ${
                      isActive
                        ? 'bg-[#F4A272] text-black border-[#F4A272] font-semibold'
                        : 'bg-[#111117] text-[#9E9AA7] border-[#262635] hover:text-[#F3EFE8]'
                    }`}
                  >
                    {det.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Wavelength Range Slider */}
          <div data-tour="wavelength-slider" className="space-y-1">
            <input
              type="range"
              min="1"
              max="102"
              value={renderedChannel}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full accent-[#F4A272] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#9E9AA7]">
              <span>Ch 1 (0.75 μm)</span>
              <span>Ch 18 (1.11 μm)</span>
              <span>Ch 35 (1.64 μm)</span>
              <span className="text-amber-400 font-bold">Gap (2.42 μm)</span>
              <span>Ch 69 (3.82 μm)</span>
              <span>Ch 86 (4.42 μm)</span>
              <span>Ch 102 (5.00 μm)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detector Filter Tabs for Chart */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs text-[#9E9AA7] font-medium flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#F4A272]" />
            Filter Spectrum Chart & Table by Detector:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DETECTORS.map((det) => (
              <button
                key={det.id}
                onClick={() => handleSelectDetector(det.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer ${
                  activeDetector === det.id
                    ? 'bg-[#F4A272] text-[#08080C] border-[#F4A272]'
                    : 'bg-[#111117] text-[#9E9AA7] border-[#262635] hover:text-[#F3EFE8]'
                }`}
              >
                <span>{det.name}</span>
                <span className="ml-1.5 opacity-70 text-[10px]">({det.range})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Export Data Action */}
        <div data-tour="extract-spectrum">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export 102-Band CSV
          </Button>
        </div>
      </div>

      {/* Main Spectral Chart Panel */}
      <div className="bg-[#111117] border border-[#262635] rounded p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F3EFE8]">
              Calibrated Infrared Spectral Energy Distribution
            </h3>
            <p className="text-xs text-[#9E9AA7]">
              Target: <strong className="text-[#F3EFE8]">{selectedObject.name}</strong> · Showing {filteredChannels.length} spectral bands
            </p>
          </div>
          {hoveredChannel && (
            <div className="text-xs font-mono bg-[#08080C] border border-[#262635] rounded px-3 py-1.5 text-[#F4A272]">
              <span className="font-semibold">Channel {hoveredChannel.channel}</span> ({hoveredChannel.detector}) · {hoveredChannel.wavelength_um} μm
              {hoveredChannel.is_dichroic_gap || hoveredChannel.channel === 51 || hoveredChannel.channel === 52 ? (
                <span className="ml-2 text-amber-400 font-bold">⚠ Dichroic Gap (2.42 μm beam-splitter)</span>
              ) : hoveredChannel.observed ? (
                <span className="ml-2 text-emerald-400">
                  ✓ Authentic SPHEREx L2: {hoveredChannel.flux_mjy_sr != null ? `${hoveredChannel.flux_mjy_sr.toFixed(3)} MJy/sr` : 'Calibrated'} {hoveredChannel.flux_uJy ? `(${hoveredChannel.flux_uJy} μJy)` : ''}
                </span>
              ) : (
                <span className="ml-2 text-[#9E9AA7]">
                  ○ Unobserved in public release {hoveredChannel.reference_model_flux_uJy ? `(Reference Model: ${hoveredChannel.reference_model_flux_uJy} μJy)` : ''}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#9E9AA7] mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#F4A272] rounded-sm" />
            <span>Authentic SPHEREx Level 2 Observation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#262635] rounded-sm" />
            <span>Unobserved Channel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-amber-500/80 border border-amber-400 rounded-sm" />
            <span>Dichroic Gap (2.42 μm Boundary)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 border-t border-dashed border-[#F3B85B]" />
            <span>Molecular Absorption / Emission</span>
          </div>
        </div>

        {/* Interactive Bar Chart for Spectral Bands */}
        <div className="h-64 bg-[#08080C] border border-[#262635] rounded p-4 flex items-end gap-1 overflow-x-auto relative">
          {/* Molecular Line Overlays */}
          {MOLECULAR_FEATURES.map((mol) => {
            const pct = ((mol.wavelength - 0.75) / (5.0 - 0.75)) * 100;
            return (
              <div
                key={mol.name}
                className="absolute top-2 bottom-0 w-px border-l border-dashed border-[#F3B85B]/70 pointer-events-none z-10"
                style={{ left: `${pct}%` }}
              >
                <span className="absolute top-0 -translate-x-1/2 text-[9px] font-mono text-[#F3B85B] bg-[#08080C]/90 px-1 rounded whitespace-nowrap">
                  {mol.name} ({mol.wavelength}μm)
                </span>
              </div>
            );
          })}

          {filteredChannels.map((ch) => {
            const isChGap = ch.is_dichroic_gap || ch.channel === 51 || ch.channel === 52;
            const isObserved = ch.observed && !isChGap;

            let barHeightPct = 12;
            if (isChGap) {
              barHeightPct = 8;
            } else if (isObserved) {
              if (ch.flux_uJy && ch.flux_uJy > 0) {
                barHeightPct = Math.min(90, Math.max(35, Math.round(Math.log10(ch.flux_uJy + 1) * 20)));
              } else {
                barHeightPct = 65;
              }
            }

            const isCurrent = ch.channel === renderedChannel;

            return (
              <div
                key={ch.channel}
                onClick={() => {
                  setCurrentChannel(ch.channel);
                  setRenderedChannel(ch.channel);
                }}
                onMouseEnter={() => setHoveredChannel(ch)}
                onMouseLeave={() => setHoveredChannel(null)}
                className={`flex-1 h-full flex flex-col justify-end group cursor-pointer relative ${
                  isCurrent ? 'ring-2 ring-[#F4A272] rounded-t' : ''
                }`}
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isChGap
                      ? 'bg-amber-600/60 border-t-2 border-amber-400 group-hover:bg-amber-500'
                      : isObserved
                      ? 'bg-[#F4A272] shadow-sm shadow-[#F4A272]/30 group-hover:bg-[#ffb088]'
                      : 'bg-[#181822] border border-dashed border-[#262635] group-hover:bg-[#262635]'
                  }`}
                  style={{ height: `${barHeightPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Wavelength Axis Labels */}
        <div className="flex justify-between text-xs font-mono text-[#9E9AA7] mt-2 px-1">
          <span>0.75 μm (Near-IR edge)</span>
          <span>1.11 μm (D1/D2)</span>
          <span>1.64 μm (D2/D3)</span>
          <span>2.42 μm (D3/D4 Gap)</span>
          <span>3.82 μm (D4/D5)</span>
          <span>4.42 μm (D5/D6)</span>
          <span>5.00 μm</span>
        </div>
      </div>

      {/* Molecular Features Grid */}
      <div className="bg-[#111117] border border-[#262635] rounded p-5 mb-6">
        <h3 className="text-sm font-semibold text-[#F3EFE8] mb-3">
          Key Interstellar & Planetary Molecular Signatures in SPHEREx Range
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOLECULAR_FEATURES.map((mol) => (
            <div key={mol.name} className="bg-[#08080C] border border-[#262635] rounded p-3 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-[#F3EFE8]">{mol.name}</span>
                <Badge variant="amber">{mol.detector}</Badge>
              </div>
              <div className="font-mono text-[#F4A272] mb-1">{mol.wavelength} μm</div>
              <p className="text-[#9E9AA7] text-[11px] leading-relaxed">{mol.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <InfoPanel title="What does spectroscopy reveal about stars?" defaultOpen>
        <p>
          "Different wavelengths reveal different properties of astronomical objects. By studying light across many wavelengths, scientists learn more about the universe."
        </p>
        <p>
          While an ordinary camera only records total brightness, a spectrometer splits light into its constituent wavelengths.
          Specific gases and ices absorb light at precise resonant wavelengths, casting dark absorption fingerprints across the spectrum.
          By analyzing these lines, astronomers can determine the atmospheric temperature, chemical composition, and motion of astronomical bodies without ever traveling there.
        </p>
      </InfoPanel>
    </div>
  );
};
