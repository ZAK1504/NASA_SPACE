import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Activity, TrendingUp, Calendar, Zap, Layers,
  Sparkles, Info, ArrowRight, ArrowLeft, RefreshCw, BarChart2
} from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InfoPanel } from '../components/ui/InfoPanel';

interface LightCurveDataPoint {
  mjd: number;
  date_utc: string;
  band: string;
  flux_ujy: number;
  flux_err_ujy: number;
  mag: number;
  mag_err: number;
  phase?: number | null;
  is_outlier: boolean;
}

interface LightCurveResponse {
  object_id: string;
  object_name: string;
  object_type: string;
  period_days?: number | null;
  variability_type: string;
  primary_band: string;
  secondary_band?: string;
  amplitude_mag: number;
  scientific_summary: string;
  data_source?: string;
  citation?: string;
  data_points: LightCurveDataPoint[];
}

const TARGETS = [
  { id: 'r-draconis', name: 'R Draconis', type: 'Mira Variable (Carbon Star)', tag: 'Pulsator (246 d)' },
  { id: 'rw-aurigae', name: 'RW Aurigae', type: 'Classical T Tauri Star', tag: 'Disk Occultation' },
  { id: 'barnards-star', name: "Barnard's Star", type: 'Red Dwarf Benchmark', tag: 'Stable Baseline' },
  { id: 'wise-0855', name: 'WISE 0855−0714', type: 'Cold Brown Dwarf (Y4)', tag: 'Cloud Weather (8.4 h)' },
];

export const LightCurves: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTargetId = searchParams.get('target') || 'r-draconis';
  const [data, setData] = useState<LightCurveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [metric, setMetric] = useState<'mag' | 'flux'>('mag');
  const [selectedBand, setSelectedBand] = useState<string>('ALL');
  const [phaseFolded, setPhaseFolded] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<LightCurveDataPoint | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getLightCurve(activeTargetId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch light curve data');
        setLoading(false);
      });
  }, [activeTargetId]);

  const selectTarget = (id: string) => {
    setSearchParams({ target: id });
    setHoveredPoint(null);
  };

  const filteredPoints = (data?.data_points || []).filter((pt) => {
    if (selectedBand === 'ALL') return true;
    return pt.band.includes(selectedBand);
  });

  // Calculate chart bounds
  const yValues = filteredPoints.map((pt) => (metric === 'mag' ? pt.mag : pt.flux_ujy));
  const minY = yValues.length ? Math.min(...yValues) : 0;
  const maxY = yValues.length ? Math.max(...yValues) : 10;
  const yPadding = (maxY - minY) * 0.15 || 0.5;

  const yDomainMin = metric === 'mag' ? minY - yPadding : Math.max(0, minY - yPadding);
  const yDomainMax = maxY + yPadding;

  const xValues = filteredPoints.map((pt) => (phaseFolded && pt.phase != null ? pt.phase : pt.mjd));
  const minX = xValues.length ? Math.min(...xValues) : 60700;
  const maxX = xValues.length ? Math.max(...xValues) : 61000;
  const xPadding = (maxX - minX) * 0.05 || 10;
  const xDomainMin = minX - xPadding;
  const xDomainMax = maxX + xPadding;

  // Chart dimensions
  const svgWidth = 840;
  const svgHeight = 360;
  const paddingLeft = 70;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 50;

  const getX = (val: number) => {
    return paddingLeft + ((val - xDomainMin) / (xDomainMax - xDomainMin || 1)) * (svgWidth - paddingLeft - paddingRight);
  };

  const getY = (val: number) => {
    // In astronomy, brighter magnitude = smaller number -> inverted y axis!
    if (metric === 'mag') {
      return paddingTop + ((val - yDomainMin) / (yDomainMax - yDomainMin || 1)) * (svgHeight - paddingTop - paddingBottom);
    } else {
      return svgHeight - paddingBottom - ((val - yDomainMin) / (yDomainMax - yDomainMin || 1)) * (svgHeight - paddingTop - paddingBottom);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#263247] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-[#6EA8FE]/10 text-[#6EA8FE]">
              <Activity className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-[#E8EDF5]">Photometric Light Curve Explorer</h1>
              <p className="text-sm text-[#94A3B8]">
                Multi-epoch brightness variation, stellar pulsations, and occultations across SPHEREx infrared bands
              </p>
            </div>
          </div>
        </div>

        {/* Target Buttons */}
        <div className="flex flex-wrap gap-2">
          {TARGETS.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTarget(t.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                activeTargetId === t.id
                  ? 'bg-[#6EA8FE]/20 border-[#6EA8FE] text-[#6EA8FE] shadow-glow-blue'
                  : 'bg-[#151E30] border-[#263247] text-[#94A3B8] hover:text-[#E8EDF5] hover:border-[#6EA8FE]/40'
              }`}
            >
              <div className="font-semibold">{t.name}</div>
              <div className="text-[10px] opacity-75">{t.tag}</div>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center bg-[#151E30] rounded-xl border border-[#263247] text-[#94A3B8]">
          <RefreshCw className="h-8 w-8 animate-spin text-[#6EA8FE] mb-3" />
          <p className="font-mono text-sm">Calibrating multi-epoch photometry from archive...</p>
        </div>
      ) : error || !data ? (
        <InfoPanel title="Light Curve Retrieval Warning">
          {error || 'Unable to load photometric time-series for this target.'}
        </InfoPanel>
      ) : (
        <>
          {/* Main Chart Card */}
          <div className="bg-[#151E30] rounded-xl border border-[#263247] p-6 shadow-xl space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#263247]/60 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#E8EDF5] flex flex-wrap items-center gap-2">
                  <span>{data.object_name}</span>
                  <Badge variant="blue">{data.variability_type}</Badge>
                  {data.citation && (
                    <Badge variant="purple">Source: {data.citation}</Badge>
                  )}
                </h2>
                <p className="text-xs text-[#94A3B8] mt-1">{data.scientific_summary}</p>
              </div>

              {/* View options */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Metric toggle */}
                <div className="flex items-center bg-[#0B1020] rounded-lg p-1 border border-[#263247]">
                  <button
                    onClick={() => setMetric('mag')}
                    className={`px-2.5 py-1 text-xs font-mono rounded ${
                      metric === 'mag' ? 'bg-[#6EA8FE] text-[#0B1020] font-bold' : 'text-[#94A3B8] hover:text-[#E8EDF5]'
                    }`}
                  >
                    Magnitude (m)
                  </button>
                  <button
                    onClick={() => setMetric('flux')}
                    className={`px-2.5 py-1 text-xs font-mono rounded ${
                      metric === 'flux' ? 'bg-[#6EA8FE] text-[#0B1020] font-bold' : 'text-[#94A3B8] hover:text-[#E8EDF5]'
                    }`}
                  >
                    Flux (μJy)
                  </button>
                </div>

                {/* Phase Fold Toggle (if periodic) */}
                {data.period_days && (
                  <button
                    onClick={() => setPhaseFolded(!phaseFolded)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all ${
                      phaseFolded
                        ? 'bg-[#F3B85B]/20 border-[#F3B85B] text-[#F3B85B]'
                        : 'bg-[#0B1020] border-[#263247] text-[#94A3B8] hover:text-[#E8EDF5]'
                    }`}
                  >
                    {phaseFolded ? 'Phase Folded (0.0 – 1.0)' : 'Time-Domain (MJD)'}
                  </button>
                )}
              </div>
            </div>

            {/* SVG Light Curve Graph */}
            <div className="relative w-full overflow-x-auto bg-[#0B1020]/80 rounded-lg border border-[#263247]/50 p-2">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[700px]">
                {/* Grid Lines */}
                {[0.25, 0.5, 0.75].map((factor) => {
                  const y = paddingTop + factor * (svgHeight - paddingTop - paddingBottom);
                  return (
                    <line
                      key={factor}
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#263247"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Y-Axis Labels */}
                <text x={paddingLeft - 10} y={paddingTop + 10} textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                  {yDomainMin.toFixed(2)} {metric === 'mag' ? 'mag' : 'μJy'}
                </text>
                <text x={paddingLeft - 10} y={svgHeight - paddingBottom} textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                  {yDomainMax.toFixed(2)} {metric === 'mag' ? 'mag' : 'μJy'}
                </text>
                <text
                  x={-svgHeight / 2}
                  y={20}
                  transform="rotate(-90)"
                  textAnchor="middle"
                  fill="#6EA8FE"
                  fontSize="12"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  {metric === 'mag' ? 'Apparent Magnitude (Brighter ↑)' : 'Calibrated Flux Density (μJy)'}
                </text>

                {/* X-Axis Labels */}
                <text x={paddingLeft} y={svgHeight - 15} textAnchor="start" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                  {phaseFolded ? 'Phase 0.0' : `MJD ${xDomainMin.toFixed(0)}`}
                </text>
                <text x={svgWidth - paddingRight} y={svgHeight - 15} textAnchor="end" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                  {phaseFolded ? 'Phase 1.0' : `MJD ${xDomainMax.toFixed(0)}`}
                </text>
                <text
                  x={svgWidth / 2}
                  y={svgHeight - 15}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="12"
                  fontFamily="sans-serif"
                >
                  {phaseFolded ? 'Orbital / Pulsational Phase (Φ)' : 'Observation Timestamp (Modified Julian Date - MJD)'}
                </text>

                {/* Connecting Trend Line */}
                {filteredPoints.length > 1 && (
                  <path
                    d={filteredPoints
                      .map((pt, idx) => {
                        const xVal = phaseFolded && pt.phase != null ? pt.phase : pt.mjd;
                        const yVal = metric === 'mag' ? pt.mag : pt.flux_ujy;
                        const x = getX(xVal);
                        const y = getY(yVal);
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#6EA8FE"
                    strokeWidth="2"
                    strokeOpacity="0.4"
                    strokeDasharray={phaseFolded ? 'none' : '2 2'}
                  />
                )}

                {/* Data Points with Error Bars */}
                {filteredPoints.map((pt, i) => {
                  const xVal = phaseFolded && pt.phase != null ? pt.phase : pt.mjd;
                  const yVal = metric === 'mag' ? pt.mag : pt.flux_ujy;
                  const errVal = metric === 'mag' ? pt.mag_err : pt.flux_err_ujy;

                  const cx = getX(xVal);
                  const cy = getY(yVal);
                  const cyTop = getY(yVal + (metric === 'mag' ? -errVal : errVal));
                  const cyBottom = getY(yVal - (metric === 'mag' ? -errVal : errVal));

                  const isHovered = hoveredPoint === pt;

                  return (
                    <g
                      key={i}
                      className="cursor-pointer transition-transform"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onClick={() => setHoveredPoint(pt)}
                    >
                      {/* Vertical Error Bar */}
                      <line
                        x1={cx}
                        y1={cyTop}
                        x2={cx}
                        y2={cyBottom}
                        stroke="#F3B85B"
                        strokeWidth="1.5"
                        strokeOpacity="0.8"
                      />
                      <line x1={cx - 3} y1={cyTop} x2={cx + 3} y2={cyTop} stroke="#F3B85B" strokeWidth="1.5" />
                      <line x1={cx - 3} y1={cyBottom} x2={cx + 3} y2={cyBottom} stroke="#F3B85B" strokeWidth="1.5" />

                      {/* Point Circle */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 7 : 5}
                        fill={isHovered ? '#6EA8FE' : pt.band.includes('D5') ? '#F3B85B' : '#6EA8FE'}
                        stroke="#0B1020"
                        strokeWidth="2"
                        className="transition-all"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Box */}
              {hoveredPoint && (
                <div className="absolute top-4 right-4 bg-[#151E30]/95 backdrop-blur-md border border-[#6EA8FE] rounded-lg p-3 text-xs shadow-glow-blue max-w-xs">
                  <div className="font-bold text-[#E8EDF5] border-b border-[#263247] pb-1 mb-2">
                    Observation Epoch: {hoveredPoint.date_utc}
                  </div>
                  <div className="space-y-1 font-mono text-[#94A3B8]">
                    <div>Band: <span className="text-[#F3B85B] font-semibold">{hoveredPoint.band}</span></div>
                    <div>MJD: <span className="text-[#E8EDF5]">{hoveredPoint.mjd.toFixed(2)}</span></div>
                    <div>
                      Mag: <span className="text-[#6EA8FE] font-bold">{hoveredPoint.mag.toFixed(3)}</span> ± {hoveredPoint.mag_err.toFixed(3)}
                    </div>
                    <div>
                      Flux: <span className="text-[#E8EDF5]">{hoveredPoint.flux_ujy.toLocaleString()}</span> ± {hoveredPoint.flux_err_ujy} μJy
                    </div>
                    {hoveredPoint.phase != null && (
                      <div>Pulsation Phase: <span className="text-[#F3B85B]">Φ = {hoveredPoint.phase.toFixed(3)}</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Scientific Diagnostics & Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#0B1020] p-3 rounded-lg border border-[#263247]">
                <div className="text-[10px] uppercase font-mono text-[#94A3B8]">Variability Amplitude (Δm)</div>
                <div className="text-xl font-bold font-mono text-[#F3B85B] mt-1">{data.amplitude_mag.toFixed(2)} mag</div>
                <div className="text-[10px] text-[#94A3B8]">Peak-to-trough range</div>
              </div>

              <div className="bg-[#0B1020] p-3 rounded-lg border border-[#263247]">
                <div className="text-[10px] uppercase font-mono text-[#94A3B8]">Pulsation / Rotation Period</div>
                <div className="text-xl font-bold font-mono text-[#6EA8FE] mt-1">
                  {data.period_days ? `${data.period_days.toFixed(1)} days` : 'Aperiodic / Irregular'}
                </div>
                <div className="text-[10px] text-[#94A3B8]">SPHEREx multi-visit cadence</div>
              </div>

              <div className="bg-[#0B1020] p-3 rounded-lg border border-[#263247]">
                <div className="text-[10px] uppercase font-mono text-[#94A3B8]">Total Measured Epochs</div>
                <div className="text-xl font-bold font-mono text-[#E8EDF5] mt-1">{data.data_points.length} visits</div>
                <div className="text-[10px] text-[#94A3B8]">Multi-wavelength visits</div>
              </div>

              <div className="bg-[#0B1020] p-3 rounded-lg border border-[#263247]">
                <div className="text-[10px] uppercase font-mono text-[#94A3B8]">Primary Filter Array</div>
                <div className="text-sm font-bold font-mono text-[#6EA8FE] mt-1 truncate">{data.primary_band}</div>
                <div className="text-[10px] text-[#94A3B8]">Infrared linear variable filter</div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#263247]/60">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/spectra?object=${data.object_id}`)}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  View 102-Band Spectrum
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/time-machine`)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Time Machine Blink Mode
                </Button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/objects/${data.object_id}`)}
              >
                Inspect Target Dossier & Catalogs
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
