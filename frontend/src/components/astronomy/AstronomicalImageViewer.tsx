import React, { useState } from 'react';
import {
  Compass, Eye, Sliders, Maximize2, Info, ChevronDown, ChevronUp,
  AlertTriangle, Clock, RefreshCw, ZoomIn
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface AstronomicalImageViewerProps {
  imageSrc: string | null;
  loading?: boolean;
  targetName: string;
  ra: number;
  dec: number;
  fovArcsec: number;
  onFovChange?: (fov: number) => void;
  stretch: string;
  onStretchChange?: (stretch: string) => void;
  colormap: string;
  onColormapChange?: (colormap: string) => void;
  smooth: boolean;
  onSmoothToggle?: (smooth: boolean) => void;
  scientificMetadata?: {
    obsId?: string;
    dateObs?: string;
    bunit?: string;
    pixelScale?: number;
    dimensions?: number[];
    fileName?: string;
    isSaturated?: boolean;
  };
  onOpenInTimeMachine?: () => void;
  showTimeMachineAction?: boolean;
  unavailableReason?: string;
  isSingleEpoch?: boolean;
}

const FOV_OPTIONS = [
  { label: "2' (120\") Close-up", value: 120.0 },
  { label: "5' (300\") Star Field", value: 300.0 },
  { label: "10' (600\")", value: 600.0 },
  { label: "15' (900\") Recommended", value: 900.0 },
  { label: "30' (1800\") Wide Field", value: 1800.0 },
];

const STRETCH_OPTIONS = [
  { label: 'Asinh Stretch (Recommended)', value: 'asinh', desc: 'Asymmetric hyperbolic sine: reveals faint circumstellar structure while preserving bright stellar cores.' },
  { label: 'Linear Stretch', value: 'linear', desc: 'Direct proportional mapping of calibrated flux values.' },
  { label: 'Sqrt Stretch', value: 'sqrt', desc: 'Square root normalization: balanced mid-intensity contrast.' },
  { label: 'Log Stretch', value: 'log', desc: 'Logarithmic scale: compresses extreme dynamic range.' },
];

const COLORMAP_OPTIONS = [
  { label: 'Grayscale (Default)', value: 'gray' },
  { label: 'Inferno', value: 'inferno' },
  { label: 'Viridis', value: 'viridis' },
  { label: 'Magma', value: 'magma' },
];

export const AstronomicalImageViewer: React.FC<AstronomicalImageViewerProps> = ({
  imageSrc,
  loading = false,
  targetName,
  ra,
  dec,
  fovArcsec,
  onFovChange,
  stretch,
  onStretchChange,
  colormap,
  onColormapChange,
  smooth,
  onSmoothToggle,
  scientificMetadata,
  onOpenInTimeMachine,
  showTimeMachineAction = true,
  unavailableReason,
  isSingleEpoch = false,
}) => {
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const currentStretch = STRETCH_OPTIONS.find((s) => s.value === stretch) || STRETCH_OPTIONS[0];

  // Calculate dynamic physical scale bar length in pixels and label
  const scaleBarArcmin = fovArcsec >= 1200 ? 5 : fovArcsec >= 600 ? 2 : 1;
  const scaleBarPixelsPercent = ((scaleBarArcmin * 60) / fovArcsec) * 100;

  // Determine if core saturation warning should be highlighted (e.g. Barnard's star, Epsilon Indi A)
  const isBarnard = targetName.toLowerCase().includes('barnard');
  const isEpsInd = targetName.toLowerCase().includes('epsilon indi') || targetName.toLowerCase().includes('eps ind');

  return (
    <div data-tour="astronomical-viewer" className="bg-[#111117] border border-[#262635] rounded-lg p-5 space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#F4A272]" />
          <h3 className="text-sm font-semibold text-[#F3EFE8]">
            Scientific Astronomical Visualization
          </h3>
          {isSingleEpoch && (
            <Badge variant="amber">Single Epoch</Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* FOV Selector */}
          {onFovChange && (
            <div data-tour="viewer-fov" className="flex items-center gap-1.5 text-xs text-[#9E9AA7]">
              <ZoomIn className="w-3.5 h-3.5" />
              <select
                value={fovArcsec}
                onChange={(e) => onFovChange(Number(e.target.value))}
                className="bg-[#08080C] border border-[#262635] text-[#F3EFE8] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#F4A272]"
                title="Select celestial Field of View"
              >
                {FOV_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Display Stretch */}
          {onStretchChange && (
            <div data-tour="viewer-stretch">
              <select
                value={stretch}
                onChange={(e) => onStretchChange(e.target.value)}
                className="bg-[#08080C] border border-[#262635] text-[#9E9AA7] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#F4A272]"
                title="Select display normalization stretch"
              >
                {STRETCH_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Colormap */}
          {onColormapChange && (
            <div data-tour="viewer-colormap">
              <select
                value={colormap}
                onChange={(e) => onColormapChange(e.target.value)}
                className="bg-[#08080C] border border-[#262635] text-[#9E9AA7] text-xs rounded px-2 py-1 focus:outline-none focus:border-[#F4A272]"
                title="Select false-color palette"
              >
                {COLORMAP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Smooth / Native Pixel Toggle */}
          {onSmoothToggle && (
            <button
              data-tour="viewer-smooth"
              onClick={() => onSmoothToggle(!smooth)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                smooth
                  ? 'bg-[#1c1c28] border-[#F4A272] text-[#F4A272]'
                  : 'bg-[#08080C] border-[#262635] text-[#9E9AA7] hover:text-[#F3EFE8]'
              }`}
              title={smooth ? 'Smooth bicubic interpolation enabled' : 'Native telescope pixel display enabled'}
            >
              {smooth ? 'Smooth Display' : 'Native Pixels'}
            </button>
          )}

          {/* Open in Time Machine */}
          {showTimeMachineAction && onOpenInTimeMachine && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Clock className="w-3.5 h-3.5" />}
              onClick={onOpenInTimeMachine}
            >
              Open in Time Machine
            </Button>
          )}
        </div>
      </div>

      {/* Main Astronomical Canvas Container */}
      <div className="relative aspect-square max-h-[520px] mx-auto bg-[#08080C] border border-[#262635] rounded-lg overflow-hidden flex items-center justify-center select-none">
        {loading ? (
          <div className="text-center p-6 space-y-2">
            <RefreshCw className="w-7 h-7 text-[#F4A272] animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#F3EFE8] font-medium">Reprojecting authentic SPHEREx Level 2 FITS…</p>
            <p className="text-[11px] text-[#9E9AA7]">
              Astropy tangent celestial grid · {currentStretch.value.toUpperCase()} stretch · {colormap}
            </p>
          </div>
        ) : imageSrc ? (
          <>
            <img
              src={imageSrc}
              alt={`${targetName} astronomical observation`}
              className={`w-full h-full object-contain ${smooth ? '' : 'image-rendering-pixelated'}`}
            />

            {/* Standard Celestial Compass Overlay: North UP, East LEFT */}
            <div data-tour="viewer-compass" className="absolute top-3 left-3 bg-[#08080C]/80 backdrop-blur-sm border border-[#262635] rounded px-2 py-1 text-[11px] font-mono text-[#F3EFE8] flex items-center gap-1.5 shadow-md pointer-events-none">
              <Compass className="w-3.5 h-3.5 text-[#F4A272]" />
              <span>N ↑ &nbsp; E ←</span>
            </div>

            {/* Angular Scale Bar Overlay */}
            <div data-tour="viewer-scalebar" className="absolute bottom-3 left-3 bg-[#08080C]/80 backdrop-blur-sm border border-[#262635] rounded px-2.5 py-1.5 text-[10px] font-mono text-[#9E9AA7] shadow-md pointer-events-none">
              <div
                className="h-1 bg-[#F4A272] rounded mb-1"
                style={{ width: `${Math.max(20, Math.min(80, scaleBarPixelsPercent))}%`, minWidth: '30px' }}
              />
              <span>{scaleBarArcmin}′ ({scaleBarArcmin * 60}″) scale</span>
            </div>

            {/* Center Reticle Marker */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
              <div className="w-6 h-6 border border-[#F4A272] rounded-full flex items-center justify-center relative">
                <div className="w-1 h-1 bg-[#F4A272] rounded-full" />
                {isEpsInd && (
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#08080C]/90 px-1.5 py-0.5 rounded text-[9px] font-mono text-[#38BDF8] border border-[#38BDF8]/40">
                    Epsilon Indi B (Brown Dwarf)
                  </span>
                )}
              </div>
            </div>

            {/* Epsilon Indi A & B Distinction Overlay */}
            {isEpsInd && (
              <div className="absolute top-12 left-3 bg-[#08080C]/90 backdrop-blur-sm border border-[#38BDF8]/40 rounded p-2 text-[10px] space-y-1 shadow-lg max-w-[210px] pointer-events-none">
                <div className="font-semibold text-[#F3EFE8] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#F3B85B]" />
                  <span>Epsilon Indi System Breakdown</span>
                </div>
                <p className="text-[10px] text-[#9E9AA7] leading-tight">
                  <strong className="text-[#F3B85B]">Primary A:</strong> Saturated K5V star (V=4.69, masked core).
                </p>
                <p className="text-[10px] text-[#9E9AA7] leading-tight">
                  <strong className="text-[#38BDF8]">Target B:</strong> T1+T6 sub-stellar binary at center reticle (~402″ / 6.7′ ENE separation).
                </p>
              </div>
            )}

            {/* Saturation / Physical Core Warning */}
            {isBarnard && (
              <div className="absolute top-3 right-3 bg-[#08080C]/90 backdrop-blur-sm border border-[#F3B85B]/50 rounded px-2.5 py-1 text-[11px] text-[#F3B85B] flex items-center gap-1.5 shadow-md">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Detector Saturation Masked (H2RG Core)</span>
              </div>
            )}
            {isEpsInd && (
              <div className="absolute top-3 right-3 bg-[#08080C]/90 backdrop-blur-sm border border-[#F3B85B]/50 rounded px-2.5 py-1 text-[11px] text-[#F3B85B] flex items-center gap-1.5 shadow-md">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Epsilon Indi A Core Saturation Masked</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-6 space-y-3 max-w-sm">
            <Info className="w-8 h-8 text-[#9E9AA7] mx-auto opacity-70" />
            <p className="text-xs font-semibold text-[#F3EFE8]">
              {unavailableReason || 'Observation Frame Unavailable'}
            </p>
            <p className="text-[11px] text-[#9E9AA7] leading-relaxed">
              {isSingleEpoch
                ? 'Single calibrated Level 2 observation visit available in current local archive release. Multi-epoch comparison requires at least 2 distinct visits.'
                : 'Selected celestial region or observation product does not contain usable scientific pixels in local cache.'}
            </p>
          </div>
        )}
      </div>

      {/* Explanatory Banner Synchronized with UI State */}
      <div className="flex items-center justify-between text-xs text-[#9E9AA7] px-1">
        <div>
          <span className="font-medium text-[#F3EFE8]">{currentStretch.label}:</span>{' '}
          <span className="text-[#9E9AA7]">{currentStretch.desc}</span>
        </div>
        <button
          onClick={() => setShowMetadata(!showMetadata)}
          className="flex items-center gap-1 text-[#F4A272] hover:underline font-mono text-[11px] ml-4 flex-shrink-0"
        >
          {showMetadata ? 'Hide Provenance' : 'View Provenance'}
          {showMetadata ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Collapsible Scientific Provenance & Metadata Panel */}
      {showMetadata && (
        <div className="bg-[#08080C] border border-[#262635] rounded-lg p-4 text-xs font-mono space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#9E9AA7]">
            <div>
              <span className="block text-[#64748B] text-[10px]">OBSERVATION ID</span>
              <span className="text-[#F3EFE8]">{scientificMetadata?.obsId || 'SPHEREx Level 2'}</span>
            </div>
            <div>
              <span className="block text-[#64748B] text-[10px]">DATE (UTC)</span>
              <span className="text-[#F3EFE8]">{scientificMetadata?.dateObs?.slice(0, 10) || '2025-08-27'}</span>
            </div>
            <div>
              <span className="block text-[#64748B] text-[10px]">PIXEL SCALE</span>
              <span className="text-[#F4A272]">6.15″ / pixel</span>
            </div>
            <div>
              <span className="block text-[#64748B] text-[10px]">SCIENTIFIC UNIT</span>
              <span className="text-[#F3EFE8]">{scientificMetadata?.bunit || 'MJy / sr'}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#262635]/50 text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Projection: Tangential (RA---TAN, DEC--TAN) · North UP, East LEFT</span>
            <span>Archive: NASA/IPAC Infrared Science Archive (IRSA)</span>
          </div>
        </div>
      )}
    </div>
  );
};
