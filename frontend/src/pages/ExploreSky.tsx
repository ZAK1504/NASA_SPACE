import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map, Search, Navigation, Crosshair, Layers,
  ExternalLink, ArrowRight, Info, RefreshCw, CheckCircle2
} from 'lucide-react';
import { FEATURED_OBJECTS } from '../constants/objects';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InfoPanel } from '../components/ui/InfoPanel';
import { getAladinInstance } from '../utils/aladinLoader';

export const ExploreSky: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState<any>(FEATURED_OBJECTS[0]);
  const [surveyLayer, setSurveyLayer] = useState<string>('https://irsa.ipac.caltech.edu/data/hips/CDS/DSS2/color');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [aladinStatus, setAladinStatus] = useState<'initializing' | 'ready' | 'fallback'>('initializing');

  const aladinContainerRef = useRef<HTMLDivElement>(null);
  const aladinInstanceRef = useRef<any>(null);

  // Initialize Aladin Lite v3 WebGL engine
  useEffect(() => {
    let isMounted = true;
    setAladinStatus('initializing');

    getAladinInstance()
      .then((A) => {
        if (!isMounted || !aladinContainerRef.current) return;
        try {
          if (!aladinInstanceRef.current) {
            aladinInstanceRef.current = A.aladin(aladinContainerRef.current, {
              survey: surveyLayer,
              fov: 0.8,
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
              aladinInstanceRef.current.setImageSurvey(surveyLayer);
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

  // Update survey layer
  const handleLayerChange = (layer: string) => {
    setSurveyLayer(layer);
    if (aladinInstanceRef.current) {
      try {
        aladinInstanceRef.current.setImageSurvey(layer);
      } catch (e) {
        console.error(e);
      }
    }
  };

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
      {/* Title */}
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
          <Layers className="w-4 h-4 text-[#9E9AA7]" />
          <span className="text-xs text-[#9E9AA7]">Survey:</span>
          <select
            value={surveyLayer}
            onChange={(e) => handleLayerChange(e.target.value)}
            className="bg-[#111117] border border-[#262635] text-[#F3EFE8] text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#F4A272]"
          >
            <option value="https://irsa.ipac.caltech.edu/data/hips/CDS/DSS2/color">DSS2 Color (Optical · NASA/IPAC IRSA)</option>
            <option value="https://irsa.ipac.caltech.edu/data/hips/CDS/2MASS/Color">2MASS Color (Near-Infrared · NASA/IPAC IRSA)</option>
            <option value="https://irsa.ipac.caltech.edu/data/hips/CDS/AllWISE/RGB-W4-W2-W1">AllWISE Color (Mid-Infrared · NASA/IPAC IRSA)</option>
            <option value="https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube">SPHEREx DR1 All-Sky HiPS (102-Band NIR)</option>
          </select>
        </div>
      </div>

      {/* Target Quick Jump and Search */}
      <div className="bg-[#111117] border border-[#262635] rounded p-4 mb-4">
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
                    ? 'bg-[#F4A272] text-[#08080C] border-[#F4A272]'
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

      {/* Active Selected Target Bar (Clean, Non-Overlapping) */}
      {selectedTarget && (
        <div className="bg-[#111117] border border-[#262635] rounded p-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
      <div data-tour="sky-map" className="bg-[#08080C] border border-[#262635] rounded overflow-hidden relative mb-6" style={{ height: '62vh' }}>
        <div ref={aladinContainerRef} className="w-full h-full" />

        {aladinStatus === 'initializing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#08080C]/80 backdrop-blur-sm p-6 text-center z-10">
            <RefreshCw className="w-8 h-8 text-[#F4A272] animate-spin mb-3" />
            <h4 className="text-sm font-semibold text-[#F3EFE8] mb-1">Connecting to NASA/IPAC IRSA Sky Atlas…</h4>
            <p className="text-xs text-[#9E9AA7]">Streaming hierarchical HiPS sky tiles from NASA/IPAC archive…</p>
          </div>
        )}

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

      <InfoPanel title="About the Aladin Lite Sky Map">
        <p>
          <strong className="text-[#F3EFE8]">Aladin Lite</strong> is an interactive sky viewer developed by the Centre de Données astronomiques de Strasbourg (CDS).
          It displays hierarchical celestial all-sky surveys (HiPS) projected onto the celestial sphere.
        </p>
        <p>
          <strong className="text-[#F3EFE8]">Data Attribution:</strong> The background imagery is sourced from optical (DSS2) and infrared surveys (2MASS, AllWISE).
          This provides the astronomical context and coordinate grid. Click on any target to load actual SPHEREx observations in the Object Explorer.
        </p>
      </InfoPanel>
    </div>
  );
};
