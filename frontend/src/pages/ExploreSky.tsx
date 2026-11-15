import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map, Search, Navigation, Crosshair, Layers,
  ExternalLink, ArrowRight, Info, RefreshCw, CheckCircle2,
  Sliders, AlertTriangle, ChevronLeft, ChevronRight, Sparkles, Eye
} from 'lucide-react';
import { FEATURED_OBJECTS } from '../constants/objects';
import { api, getApiUrl } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InfoPanel } from '../components/ui/InfoPanel';
import { getAladinInstance } from '../utils/aladinLoader';

export type SurveyId = 'dss2' | '2mass' | 'allwise' | 'spherex';

export interface SurveyDef {
  id: SurveyId;
  name: string;
  shortName: string;
  regime: string;
  source: string;
  getUrl: (ch: number) => string;
}

// SPHEREx 6 detector array specifications
const SPHEREX_DETECTOR_BANDS = [
  { band: 'D1', name: 'Array 1 (D1)', lMin: 0.75, lMax: 1.11, count: 17, r: 41 },
  { band: 'D2', name: 'Array 2 (D2)', lMin: 1.11, lMax: 1.64, count: 17, r: 41 },
  { band: 'D3', name: 'Array 3 (D3)', lMin: 1.64, lMax: 2.42, count: 17, r: 41 },
  { band: 'D4', name: 'Array 4 (D4)', lMin: 2.42, lMax: 3.82, count: 17, r: 35 },
  { band: 'D5', name: 'Array 5 (D5)', lMin: 3.82, lMax: 4.42, count: 17, r: 110 },
  { band: 'D6', name: 'Array 6 (D6)', lMin: 4.42, lMax: 5.00, count: 17, r: 130 },
];

export interface ChannelMeta {
  channel: number;
  wavelength_um: number;
  detector: string;
  detector_name: string;
  resolving_power: number;
  is_dichroic_gap: boolean;
  notes?: string;
}

export const getChannelMeta = (ch: number): ChannelMeta => {
  const channel = Math.max(1, Math.min(102, Math.round(ch)));
  const isGap = channel === 51 || channel === 52;

  let accumulated = 0;
  for (const b of SPHEREX_DETECTOR_BANDS) {
    if (channel <= accumulated + b.count) {
      const idxInBand = channel - accumulated - 1;
      const step = (b.lMax - b.lMin) / (b.count - 1);
      const wl = b.lMin + idxInBand * step;
      return {
        channel,
        wavelength_um: Math.round(wl * 1000) / 1000,
        detector: b.band,
        detector_name: b.name,
        resolving_power: b.r,
        is_dichroic_gap: isGap,
        notes: isGap
          ? 'Physical 2.42 μm dichroic beam-splitter gap between Array 3 and Array 4'
          : undefined,
      };
    }
    accumulated += b.count;
  }
  return {
    channel: 24,
    wavelength_um: 1.309,
    detector: 'D2',
    detector_name: 'Array 2 (D2)',
    resolving_power: 41,
    is_dichroic_gap: false,
  };
};

const getSpherexHipsUrl = (channel: number): string => {
  const raw = getApiUrl(`/spectra/hips/${channel}`);
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return typeof window !== 'undefined' ? `${window.location.origin}${raw}` : raw;
};

const SURVEY_REGISTRY: Record<SurveyId, SurveyDef> = {
  dss2: {
    id: 'dss2',
    name: 'DSS2 Color (Optical · NASA/IPAC IRSA)',
    shortName: 'DSS2 Optical',
    regime: 'Optical (0.4–0.9 μm)',
    source: 'NASA/IPAC IRSA / CDS',
    getUrl: () => 'https://irsa.ipac.caltech.edu/data/hips/CDS/DSS2/color',
  },
  '2mass': {
    id: '2mass',
    name: '2MASS Color (Near-Infrared · NASA/IPAC IRSA)',
    shortName: '2MASS Near-IR',
    regime: 'Near-IR J+H+Ks (1.2–2.2 μm)',
    source: 'NASA/IPAC IRSA / CDS',
    getUrl: () => 'https://irsa.ipac.caltech.edu/data/hips/CDS/2MASS/Color',
  },
  allwise: {
    id: 'allwise',
    name: 'AllWISE Color (Mid-Infrared · NASA/IPAC IRSA)',
    shortName: 'AllWISE Mid-IR',
    regime: 'Mid-IR W1+W2+W4 (3.4–22 μm)',
    source: 'NASA/IPAC IRSA / CDS',
    getUrl: () => 'https://irsa.ipac.caltech.edu/data/hips/CDS/AllWISE/RGB-W4-W2-W1',
  },
  spherex: {
    id: 'spherex',
    name: 'SPHEREx DR1 Near-IR (Calibrated Spectral HiPS Planes)',
    shortName: 'SPHEREx DR1 NIR',
    regime: 'Near-IR (0.75–5.00 μm · 102 Bands)',
    source: 'NASA/IPAC IRSA Calibrated SPHEREx DR1',
    getUrl: (channel: number) => getSpherexHipsUrl(channel),
  },
};

const SPHEREX_PRESET_CHANNELS = [
  { channel: 10, label: 'Ch 10', wavelength: '0.95 μm', det: 'Array 1 (D1)', desc: 'Optical/NIR Frontier' },
  { channel: 24, label: 'Ch 24', wavelength: '1.31 μm', det: 'Array 2 (D2)', desc: 'Near-Infrared Standard' },
  { channel: 42, label: 'Ch 42', wavelength: '1.98 μm', det: 'Array 3 (D3)', desc: 'Intermediate NIR' },
  { channel: 60, label: 'Ch 60', wavelength: '3.12 μm', det: 'Array 4 (D4)', desc: 'H₂O Ice Absorption' },
  { channel: 75, label: 'Ch 75', wavelength: '4.05 μm', det: 'Array 5 (D5)', desc: 'CO₂ Ice Absorption' },
  { channel: 92, label: 'Ch 92', wavelength: '4.64 μm', det: 'Array 6 (D6)', desc: 'CO Gas / Ice Band' },
];

export const ExploreSky: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState<any>(FEATURED_OBJECTS[0]);
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyId>('dss2');
  const [spherexChannel, setSpherexChannel] = useState<number>(24);
  const [surveyLoading, setSurveyLoading] = useState<boolean>(false);
  const [surveyError, setSurveyError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [aladinStatus, setAladinStatus] = useState<'initializing' | 'ready' | 'fallback'>('initializing');

  const aladinContainerRef = useRef<HTMLDivElement>(null);
  const aladinInstanceRef = useRef<any>(null);

  // Active channel metadata
  const currentMeta = useMemo(() => getChannelMeta(spherexChannel), [spherexChannel]);

  // Switch survey layer while preserving RA/Dec, FOV, and catalog overlays
  const switchSurvey = (newSurveyId: SurveyId, channel: number = spherexChannel) => {
    setSelectedSurvey(newSurveyId);
    setSurveyLoading(true);
    setSurveyError(null);

    if (!aladinInstanceRef.current) {
      setSurveyLoading(false);
      return;
    }

    try {
      let currentRa: number | undefined;
      let currentDec: number | undefined;
      let currentFov: number | undefined;

      try {
        const coords = aladinInstanceRef.current.getRaDec();
        if (coords && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          currentRa = coords[0];
          currentDec = coords[1];
        }
        currentFov = aladinInstanceRef.current.getFov();
      } catch (e) {
        // ignore
      }

      const surveyDef = SURVEY_REGISTRY[newSurveyId];
      const targetUrl = surveyDef.getUrl(channel);

      aladinInstanceRef.current.setImageSurvey(targetUrl);

      // Re-apply center coordinates and FOV
      if (currentRa !== undefined && currentDec !== undefined) {
        aladinInstanceRef.current.gotoRaDec(currentRa, currentDec);
      } else if (selectedTarget) {
        aladinInstanceRef.current.gotoRaDec(selectedTarget.ra, selectedTarget.dec);
      }
      if (currentFov !== undefined && currentFov > 0) {
        aladinInstanceRef.current.setFov(currentFov);
      }

      // Smooth loading indicator duration
      setTimeout(() => {
        setSurveyLoading(false);
      }, 700);
    } catch (err: any) {
      console.error('Error switching survey layer:', err);
      setSurveyError(`Could not load ${SURVEY_REGISTRY[newSurveyId].shortName} survey tiles.`);
      setSurveyLoading(false);
    }
  };

  const handleChannelChange = (newChannel: number) => {
    const boundedChannel = Math.max(1, Math.min(102, newChannel));
    setSpherexChannel(boundedChannel);
    if (selectedSurvey === 'spherex') {
      switchSurvey('spherex', boundedChannel);
    }
  };

  // Initialize Aladin Lite v3 WebGL engine
  useEffect(() => {
    let isMounted = true;
    setAladinStatus('initializing');

    getAladinInstance()
      .then((A) => {
        if (!isMounted || !aladinContainerRef.current) return;
        try {
          if (!aladinInstanceRef.current) {
            const initialDef = SURVEY_REGISTRY[selectedSurvey];
            const initialUrl = initialDef.getUrl(spherexChannel);

            aladinInstanceRef.current = A.aladin(aladinContainerRef.current, {
              survey: initialUrl,
              fov: 12.0,
              target: `${selectedTarget.ra} ${selectedTarget.dec}`,
              cooFrame: 'J2000',
              showReticle: true,
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
              aladinInstanceRef.current.setImageSurvey(initialUrl);
            } catch (layerErr) {
              console.warn('Initial survey configuration notice:', layerErr);
            }

            // Add markers for featured objects
            try {
              const cat = A.catalog({ name: 'SPHEREx Targets', sourceSize: 18, color: '#F4A272' });
              aladinInstanceRef.current.addCatalog(cat);

              FEATURED_OBJECTS.forEach((obj) => {
                const marker = A.marker(obj.ra, obj.dec, {
                  popupTitle: obj.name,
                  popupDesc: `${obj.type} · RA ${obj.ra.toFixed(4)}°, Dec ${obj.dec.toFixed(4)}°`,
                });
                cat.addSources([marker]);
              });
            } catch (catErr) {
              console.warn('Aladin catalog overlay notice:', catErr);
            }

            if (isMounted) setAladinStatus('ready');
          }
        } catch (e) {
          console.error('Aladin Lite instantiation error:', e);
          if (isMounted) setAladinStatus('fallback');
        }
      })
      .catch((err) => {
        console.error('Aladin Lite module load error:', err);
        if (isMounted) setAladinStatus('fallback');
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

  // Update Aladin position when selectedTarget changes
  useEffect(() => {
    if (aladinInstanceRef.current && selectedTarget) {
      try {
        aladinInstanceRef.current.gotoRaDec(selectedTarget.ra, selectedTarget.dec);
      } catch (e) {
        console.error('Aladin goto error:', e);
      }
    }
  }, [selectedTarget]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchMessage(null);
    try {
      const res = await api.resolveCoordinates(searchQuery);
      if (res.resolved && res.ra !== undefined && res.dec !== undefined) {
        const newTarget = {
          id: 'custom',
          name: searchQuery,
          type: res.source === 'SIMBAD' ? 'Resolved Celestial Object' : 'Sky Position',
          ra: res.ra,
          dec: res.dec,
          ra_hms: res.ra_hms || `${res.ra.toFixed(4)}°`,
          dec_dms: res.dec_dms || `${res.dec.toFixed(4)}°`,
          description: `Resolved via ${res.source}. Position on celestial sphere.`,
          tags: ['resolved target'],
        };
        setSelectedTarget(newTarget);
        setSearchMessage(`Resolved to RA ${res.ra.toFixed(4)}°, Dec ${res.dec.toFixed(4)}° (${res.source})`);
      } else {
        setSearchMessage(res.error || 'Object not found');
      }
    } catch (err: any) {
      setSearchMessage('Search request failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Title & Survey Layer Picker Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Map className="w-5 h-5 text-[#F4A272]" />
            <h1 className="text-2xl font-bold text-[#F3EFE8]">Explore Sky</h1>
          </div>
          <p className="text-sm text-[#9E9AA7]">
            Interactive celestial map powered by Aladin Lite with SPHEREx target footprints
          </p>
        </div>

        {/* Survey Layer Picker */}
        <div data-tour="sky-survey-select" className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#F4A272]" />
          <span className="text-xs text-[#9E9AA7]">Survey:</span>
          <select
            value={selectedSurvey}
            onChange={(e) => switchSurvey(e.target.value as SurveyId)}
            className="bg-[#111117] border border-[#262635] text-[#F3EFE8] text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#F4A272] cursor-pointer hover:border-[#F4A272]/50 transition-colors"
          >
            <option value="dss2">DSS2 Color (Optical · NASA/IPAC IRSA)</option>
            <option value="2mass">2MASS Color (Near-Infrared · NASA/IPAC IRSA)</option>
            <option value="allwise">AllWISE Color (Mid-Infrared · NASA/IPAC IRSA)</option>
            <option value="spherex">SPHEREx DR1 Near-IR (Calibrated Spectral HiPS Planes)</option>
          </select>
        </div>
      </div>

      {/* Dedicated SPHEREx Spectral Channel Controller (Visible when SPHEREx Survey is Active) */}
      {selectedSurvey === 'spherex' && (
        <div className="bg-[#111117] border border-[#F4A272]/30 rounded-xl p-4 mb-4 shadow-[0_0_20px_rgba(244,162,114,0.08)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#F4A272]" />
              <span className="text-xs font-semibold text-[#F3EFE8] uppercase tracking-wider">
                SPHEREx DR1 Spectral Plane Controls
              </span>
              <span className="text-[10px] font-mono text-[#F4A272] bg-[#F4A272]/10 border border-[#F4A272]/30 px-2 py-0.5 rounded">
                Channel {spherexChannel} of 102
              </span>
            </div>

            {/* Active Channel Details */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-[#F3EFE8] font-bold">
                λ = {currentMeta.wavelength_um.toFixed(3)} μm
              </span>
              <span className="text-[#9E9AA7]">·</span>
              <span className="text-[#F4A272]">{currentMeta.detector_name}</span>
              <span className="text-[#9E9AA7]">·</span>
              <span className="text-white/60">R ~ {currentMeta.resolving_power}</span>
              <button
                onClick={() => navigate(`/spectra?object=${selectedTarget?.slug || 'barnards-star'}`)}
                className="ml-2 text-[11px] text-[#F4A272] hover:text-white flex items-center gap-1 cursor-pointer underline underline-offset-2"
                title="Open Spectral Explorer to inspect the full 102-channel SED curve"
              >
                <span>Spectral Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Quick Signature Band Presets */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="text-[11px] font-mono text-[#9E9AA7] mr-1">Signature Bands:</span>
            {SPHEREX_PRESET_CHANNELS.map((p) => {
              const isSelected = spherexChannel === p.channel;
              return (
                <button
                  key={p.channel}
                  onClick={() => handleChannelChange(p.channel)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[#F4A272] text-[#08080C] font-bold border-[#F4A272]'
                      : 'bg-[#08080C] text-[#C7C3BD] border-[#262635] hover:border-[#F4A272]/50 hover:text-white'
                  }`}
                  title={`${p.label} (${p.wavelength}) · ${p.det} · ${p.desc}`}
                >
                  <span className="font-semibold">{p.label}</span>
                  <span className="ml-1 opacity-75">({p.wavelength})</span>
                </button>
              );
            })}
          </div>

          {/* Continuous Channel Slider & Steppers */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleChannelChange(spherexChannel - 1)}
              disabled={spherexChannel <= 1}
              className="p-1 rounded bg-[#08080C] border border-[#262635] text-[#F3EFE8] hover:border-[#F4A272] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Spectral Channel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min="1"
                max="102"
                value={spherexChannel}
                onChange={(e) => handleChannelChange(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-[#262635] rounded-lg appearance-none cursor-pointer accent-[#F4A272]"
              />
            </div>

            <button
              onClick={() => handleChannelChange(spherexChannel + 1)}
              disabled={spherexChannel >= 102}
              className="p-1 rounded bg-[#08080C] border border-[#262635] text-[#F3EFE8] hover:border-[#F4A272] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Spectral Channel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="min-w-[64px] text-right text-xs font-mono text-[#F4A272] font-semibold">
              Ch {spherexChannel}
            </div>
          </div>

          {/* Dichroic Gap Warning Banner or Scientific Honesty Note */}
          {currentMeta.is_dichroic_gap ? (
            <div className="mt-3 flex items-center justify-between gap-3 p-2.5 bg-amber-950/40 border border-amber-500/50 rounded-lg text-amber-200 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>2.42 μm Dichroic Transition Gap:</strong> Channels 51 and 52 represent the physical optical boundary between Array 3 and 4 where no science pixels exist.
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleChannelChange(50)}
                  className="px-2 py-0.5 bg-amber-800/70 hover:bg-amber-700 text-white rounded text-[11px] font-mono cursor-pointer"
                >
                  Jump to Ch 50 (2.42 μm)
                </button>
                <button
                  onClick={() => handleChannelChange(53)}
                  className="px-2 py-0.5 bg-amber-800/70 hover:bg-amber-700 text-white rounded text-[11px] font-mono cursor-pointer"
                >
                  Jump to Ch 53 (2.50 μm)
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2.5 flex items-center justify-between text-[10.5px] font-mono text-[#9E9AA7] pt-2 border-t border-[#262635]">
              <span>Calibrated SPHEREx 12.9″/pix monochromatic HiPS plane · Single spectral slice (0.75–5.00 μm)</span>
              <span className="text-[#F4A272]">Linear Variable Filter Near-IR</span>
            </div>
          )}
        </div>
      )}

      {/* Target Quick Jump and Search */}
      <div className="bg-[#111117] border border-[#262635] rounded-xl p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Quick jump buttons */}
          <div data-tour="sky-quickjump" className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#9E9AA7] mr-1">Quick Jump:</span>
            {FEATURED_OBJECTS.map((obj) => (
              <button
                key={obj.id}
                onClick={() => setSelectedTarget(obj)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  selectedTarget?.slug === obj.slug
                    ? 'bg-[#F4A272] text-[#08080C] border-[#F4A272] font-semibold'
                    : 'bg-[#08080C] text-[#9E9AA7] border-[#262635] hover:text-[#F3EFE8]'
                }`}
              >
                {obj.name}
              </button>
            ))}
          </div>

          {/* Coordinate / Object Search Form */}
          <form data-tour="sky-target-search" onSubmit={handleSearch} className="flex gap-2 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9E9AA7]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Resolve name (e.g. Vega) or RA, Dec"
                className="w-full bg-[#08080C] border border-[#262635] rounded pl-8 pr-2 py-1 text-xs text-[#F3EFE8] focus:outline-none focus:border-[#F4A272]"
              />
            </div>
            <Button variant="primary" size="sm" loading={searching}>
              Go
            </Button>
          </form>
        </div>

        {searchMessage && (
          <div className="mt-2 text-xs font-mono text-[#F4A272]">
            {searchMessage}
          </div>
        )}
      </div>

      {/* Active Selected Target Bar */}
      {selectedTarget && (
        <div className="bg-[#111117] border border-[#262635] rounded-xl p-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-bold text-[#F3EFE8] text-sm">{selectedTarget.name}</span>
            <Badge variant="blue">{selectedTarget.type}</Badge>
            <span className="font-mono text-[#F4A272]">
              RA: {selectedTarget.ra.toFixed(4)}° ({selectedTarget.ra_hms || selectedTarget.raHms}) · Dec: {selectedTarget.dec.toFixed(4)}° ({selectedTarget.dec_dms || selectedTarget.decDms})
            </span>
          </div>
          <div data-tour="sky-inspect-button">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/objects/${selectedTarget.slug || selectedTarget.id}`)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Inspect in Object Explorer
            </Button>
          </div>
        </div>
      )}

      {/* Main Aladin Map Container */}
      <div data-tour="sky-map" className="bg-[#08080C] border border-[#262635] rounded-2xl overflow-hidden relative mb-6 shadow-2xl" style={{ height: '62vh' }}>
        <div ref={aladinContainerRef} className="w-full h-full" />

        {/* Survey Tile Loading Overlay Badge */}
        {surveyLoading && (
          <div className="absolute top-3 left-3 bg-[#08080C]/90 backdrop-blur-md border border-[#F4A272]/40 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono text-[#F4A272] z-20 pointer-events-none shadow-lg animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F4A272]" />
            <span>Loading {SURVEY_REGISTRY[selectedSurvey].shortName} HiPS tiles…</span>
          </div>
        )}

        {/* Survey Error Notification Overlay */}
        {surveyError && (
          <div className="absolute top-3 right-3 bg-red-950/90 backdrop-blur-md border border-red-500/50 px-3 py-2 rounded-lg flex items-center gap-2 text-xs text-red-200 z-20 shadow-lg">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-mono">{surveyError}</span>
            <button
              onClick={() => switchSurvey(selectedSurvey)}
              className="ml-2 px-2 py-0.5 bg-red-800 text-white rounded text-[10px] font-mono hover:bg-red-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Initializing Overlay */}
        {aladinStatus === 'initializing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#08080C]/85 backdrop-blur-sm p-6 text-center z-10">
            <RefreshCw className="w-8 h-8 text-[#F4A272] animate-spin mb-3" />
            <h4 className="text-sm font-semibold text-[#F3EFE8] mb-1">Connecting to NASA/IPAC IRSA Sky Atlas…</h4>
            <p className="text-xs text-[#9E9AA7]">Streaming hierarchical HiPS sky tiles from NASA/IPAC archive…</p>
          </div>
        )}

        {/* Fallback View */}
        {aladinStatus === 'fallback' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#08080C]/90 backdrop-blur-sm p-6 text-center z-10">
            <div className="relative w-48 h-48 rounded-full border border-[#F4A272]/30 flex items-center justify-center mb-4 bg-gradient-to-b from-[#1c1c28]/40 to-transparent shadow-glow-blue animate-pulse">
              <div className="absolute inset-2 rounded-full border border-dashed border-[#262635]" />
              <div className="w-3 h-3 rounded-full bg-[#F4A272] shadow-glow-blue" />
              <div className="absolute -top-2 px-2 py-0.5 rounded bg-[#111117] border border-[#262635] text-[10px] font-mono text-[#F4A272]">
                Target: {selectedTarget?.name}
              </div>
            </div>
            <div className="text-sm font-bold text-[#F3EFE8] mb-1">
              Celestial Sphere Contextual View
            </div>
            <p className="text-xs text-[#9E9AA7] max-w-md mb-4 font-mono">
              RA {selectedTarget?.ra.toFixed(4)}° · Dec {selectedTarget?.dec.toFixed(4)}° · Coordinate Frame: ICRS / J2000
            </p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/objects/${selectedTarget?.slug || selectedTarget?.id}`)}
              >
                Inspect Target in Object Explorer
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <InfoPanel title="About the Aladin Lite Sky Map & SPHEREx Survey">
        <p>
          <strong className="text-[#F3EFE8]">Aladin Lite</strong> is an interactive sky viewer developed by the Centre de Données astronomiques de Strasbourg (CDS).
          It displays hierarchical celestial all-sky surveys (HiPS) projected onto the celestial sphere.
        </p>
        <p>
          <strong className="text-[#F3EFE8]">Survey Context:</strong> Switch between optical (<strong className="text-[#F4A272]">DSS2</strong>), near-infrared (<strong className="text-[#F4A272]">2MASS</strong>), mid-infrared (<strong className="text-[#F4A272]">AllWISE</strong>), and calibrated monochromatic SPHEREx near-infrared spectral planes (<strong className="text-[#F4A272]">SPHEREx DR1</strong>, 0.75–5.00 μm across 102 bands).
        </p>
        <p>
          <strong className="text-[#F3EFE8]">Scientific Honesty Notice:</strong> SPHEREx uses Linear Variable Filters to image the sky in discrete narrow spectral bands rather than broad optical colors. Each SPHEREx channel represents a calibrated monochromatic 12.9″/pix spectral slice.
        </p>
      </InfoPanel>
    </div>
  );
};

export default ExploreSky;
