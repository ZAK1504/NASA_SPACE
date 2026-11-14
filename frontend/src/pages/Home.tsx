import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ChevronRight,
  Search, GitCompare, Zap, BookOpen,
  Sparkles, Compass, Eye, ShieldCheck, Play, RefreshCw, Layers
} from 'lucide-react';
import { StarField }   from '../components/astronomy/StarField';
import { ObjectCard }  from '../components/astronomy/ObjectCard';
import { Button }      from '../components/ui/Button';
import { Badge }       from '../components/ui/Badge';
import { FEATURED_OBJECTS } from '../constants/objects';
import { MISSIONS }         from '../constants/missions';
import { api } from '../services/api';

const STATS = [
  { label: 'Spectral Bands',   value: '102', desc: 'Near-infrared LVF channels' },
  { label: 'Wavelength Range', value: '0.75 – 5.0 μm', desc: 'Continuous cosmic spectrum' },
  { label: 'Survey Coverage',  value: 'All-Sky', desc: '100% celestial sphere' },
  { label: 'Official Archive', value: 'NASA/IPAC IRSA', desc: 'spherex.obscore' },
];

const HOW = [
  { step: '01', icon: <Search className="w-5 h-5 text-[#6EA8FE]" />,     title: 'Explore the Sky',          body: 'Navigate the celestial sphere with Aladin Lite across optical, 2MASS, and AllWISE sky layers.' },
  { step: '02', icon: <GitCompare className="w-5 h-5 text-[#6EA8FE]" />, title: 'Compare Observations',     body: 'Select observations taken months apart in the Time Machine using side-by-side or blink comparison.' },
  { step: '03', icon: <Zap className="w-5 h-5 text-[#F3B85B]" />,        title: 'Investigate Changes',      body: 'Compute scientific difference maps (Later − Earlier) to detect moving asteroids and variable stars.' },
  { step: '04', icon: <BookOpen className="w-5 h-5 text-[#6EA8FE]" />,   title: 'Record Discoveries',       body: 'Log your findings into your personal Discovery Journal and export scientific reports.' },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Live Telescope Preview state on Home page
  const [selectedTarget, setSelectedTarget] = useState(FEATURED_OBJECTS[0]);
  const [previewStretch, setPreviewStretch] = useState('asinh');
  const [previewColormap, setPreviewColormap] = useState('inferno');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    setLoadingPreview(true);
    api.generatePreview({
      stretch: previewStretch,
      colormap: previewColormap,
      ra: selectedTarget.ra,
      dec: selectedTarget.dec,
    })
      .then((res) => setPreviewImage(res.image_base64))
      .catch((err) => console.error(err))
      .finally(() => setLoadingPreview(false));
  }, [selectedTarget, previewStretch, previewColormap]);

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* ═══ HERO SECTION ═══════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-6 py-20">
        <StarField starCount={280} />

        {/* Ambient Nebula Light Gradients */}
        <div className="absolute top-1/4 left-1/3 w-[550px] h-[550px] bg-[#6EA8FE]/6 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#F3B85B]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center w-full">

          {/* Launch Status Pill */}
          <div className="inline-flex items-center gap-2 mb-8 animate-fade-in">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151E30]/90 border border-[#6EA8FE]/40 shadow-glow-blue backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#6EA8FE] animate-ping" />
              <span className="text-xs font-semibold text-[#E8EDF5]">
                NASA SPHEREx Data Live
              </span>
              <span className="text-[#263247]">•</span>
              <span className="text-xs font-mono text-[#6EA8FE]">
                102 Spectral Bands
              </span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#E8EDF5] tracking-tight leading-[1.08] mb-6 animate-fade-in">
            Explore the Universe.<br />
            <span className="bg-gradient-to-r from-[#6EA8FE] via-[#8fc0ff] to-[#F3B85B] bg-clip-text text-transparent">
              Discover What Changes.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Explore real SPHEREx telescope observations, compare the sky across time,
            and investigate the hidden stories of the cosmos.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-16">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/objects')}
            >
              Start Exploring Targets
            </Button>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Play className="w-4 h-4 text-[#F3B85B]" />}
              onClick={() => navigate('/missions')}
            >
              Launch Guided Mission
            </Button>
            <Button
              variant="ghost"
              size="lg"
              leftIcon={<Compass className="w-4 h-4 text-[#6EA8FE]" />}
              onClick={() => navigate('/explore')}
            >
              Open Sky Map
            </Button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            {STATS.map(({ label, value, desc }) => (
              <div
                key={label}
                className="bg-[#151E30]/80 backdrop-blur-md border border-[#263247] rounded-xl p-4 hover:border-[#6EA8FE]/40 transition-all duration-200"
              >
                <div className="font-mono text-xl font-bold text-[#6EA8FE] mb-1">{value}</div>
                <div className="text-xs font-semibold text-[#E8EDF5] mb-0.5">{label}</div>
                <div className="text-[11px] text-[#94A3B8] leading-tight">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LIVE TELESCOPE OBSERVATION PREVIEW (VISUALIZATION SHOWCASE) ═══════════ */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="bg-[#151E30]/90 backdrop-blur-xl border border-[#263247] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left: Interactive Controls */}
            <div className="flex-1 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#6EA8FE]/10 border border-[#6EA8FE]/30 text-xs text-[#6EA8FE] font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Astropy Scientific Visualization Engine</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-[#E8EDF5] tracking-tight">
                Peer Directly into Astronomical Observations
              </h2>

              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Render telescope data in real-time. Notice how applying an <strong className="text-[#E8EDF5]">Asinh Stretch</strong> reveals faint interstellar clouds and low-surface-brightness stellar companions without blowing out the central core.
              </p>

              {/* Target Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                  Select Target Object:
                </label>
                <div className="flex flex-wrap gap-2">
                  {FEATURED_OBJECTS.slice(0, 4).map((obj) => (
                    <button
                      key={obj.id}
                      onClick={() => setSelectedTarget(obj)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                        selectedTarget.id === obj.id
                          ? 'bg-[#6EA8FE] text-[#0B1020] border-[#6EA8FE] shadow-glow-blue font-semibold'
                          : 'bg-[#0B1020] text-[#94A3B8] border-[#263247] hover:text-[#E8EDF5] hover:border-[#3a4d6b]'
                      }`}
                    >
                      {obj.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stretch & Colormap Controls */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                    Astronomical Stretch
                  </label>
                  <select
                    value={previewStretch}
                    onChange={(e) => setPreviewStretch(e.target.value)}
                    className="w-full bg-[#0B1020] border border-[#263247] text-xs text-[#E8EDF5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#6EA8FE]"
                  >
                    <option value="asinh">Asinh (Preserves Dynamic Range)</option>
                    <option value="linear">Linear (Raw Flux)</option>
                    <option value="sqrt">Square Root</option>
                    <option value="log">Logarithmic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                    False-Color Palette
                  </label>
                  <select
                    value={previewColormap}
                    onChange={(e) => setPreviewColormap(e.target.value)}
                    className="w-full bg-[#0B1020] border border-[#263247] text-xs text-[#E8EDF5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#6EA8FE]"
                  >
                    <option value="inferno">Inferno (Thermal IR)</option>
                    <option value="viridis">Viridis (Perceptually Uniform)</option>
                    <option value="magma">Magma (High-Contrast)</option>
                    <option value="gray">Grayscale (Observatory Native)</option>
                  </select>
                </div>
              </div>

              {/* Quick Action Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/objects/${selectedTarget.slug}`)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Inspect Full {selectedTarget.name} Data
                </Button>
              </div>
            </div>

            {/* Right: Rendered FITS Canvas */}
            <div className="w-full lg:w-[420px] flex-shrink-0">
              <div className="bg-[#0B1020] border border-[#263247] rounded-xl overflow-hidden p-3 relative shadow-2xl">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#E8EDF5] font-semibold">
                    <Eye className="w-3.5 h-3.5 text-[#6EA8FE]" />
                    <span>{selectedTarget.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#6EA8FE] bg-[#151E30] px-2 py-0.5 rounded border border-[#263247]">
                    RA {selectedTarget.ra.toFixed(2)}° · Dec {selectedTarget.dec > 0 ? '+' : ''}{selectedTarget.dec.toFixed(2)}°
                  </span>
                </div>

                {/* Display container */}
                <div className="aspect-square bg-[#070b16] rounded-lg overflow-hidden flex items-center justify-center relative">
                  {loadingPreview ? (
                    <div className="text-center p-4">
                      <RefreshCw className="w-7 h-7 text-[#6EA8FE] animate-spin mx-auto mb-2" />
                      <p className="text-xs text-[#94A3B8]">Rendering with Astropy & Matplotlib…</p>
                    </div>
                  ) : previewImage ? (
                    <img
                      src={previewImage}
                      alt={`${selectedTarget.name} Preview`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p className="text-xs text-[#94A3B8]">Rendering Preview…</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mt-2 px-1 font-mono">
                  <span>Stretch: {previewStretch.toUpperCase()}</span>
                  <span>Colormap: {previewColormap}</span>
                  <span className="text-[#6EA8FE]">Astropy WCS TAN</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════════════════ */}
      <section className="bg-[#111827]/60 backdrop-blur-md border-y border-[#263247] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge variant="blue" className="mb-2" dot>Scientific Methodology</Badge>
              <h2 className="text-3xl font-bold text-[#E8EDF5] tracking-tight">How Cosmic Discovery Works</h2>
            </div>
            <p className="text-sm text-[#94A3B8] max-w-md mt-2 md:mt-0">
              Four structured scientific steps: from locating an astronomical object to validating changes and recording candidate discoveries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW.map(({ step, icon, title, body }) => (
              <div
                key={step}
                className="bg-[#151E30]/90 backdrop-blur-md border border-[#263247] hover:border-[#3a4d6b] rounded-xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-glow-blue flex flex-col group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#0B1020] border border-[#263247] flex items-center justify-center group-hover:border-[#6EA8FE]/50 transition-colors">
                    {icon}
                  </div>
                  <span className="font-mono text-xs font-bold text-[#6EA8FE]/60">{step}</span>
                </div>
                <h3 className="text-sm font-bold text-[#E8EDF5] mb-2 group-hover:text-[#6EA8FE] transition-colors">{title}</h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed flex-1">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED TARGETS ═══════════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="amber" className="mb-2" dot>Observation Targets</Badge>
              <h2 className="text-3xl font-bold text-[#E8EDF5] tracking-tight">Featured Celestial Objects</h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Handpicked benchmark targets showcasing proper motion, substellar atmospheres, and variability
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => navigate('/objects')}
              className="hidden sm:inline-flex"
            >
              All Objects
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {FEATURED_OBJECTS.map((obj) => (
              <ObjectCard key={obj.id} object={obj} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GUIDED MISSIONS BANNER ═════════════════════════════ */}
      <section className="bg-[#111827]/70 backdrop-blur-md border-y border-[#263247] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="blue" className="mb-2" dot>Interactive Citizen Science</Badge>
              <h2 className="text-3xl font-bold text-[#E8EDF5] tracking-tight">Guided Astronomy Missions</h2>
              <p className="text-sm text-[#94A3B8] mt-1">
                Step-by-step discovery missions designed for all levels with interactive quizzes and reports
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => navigate('/missions')}
            >
              View Missions
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MISSIONS.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate(`/missions/${m.id}`)}
                className="bg-[#151E30]/90 backdrop-blur-md border border-[#263247] hover:border-[#6EA8FE]/50 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-blue cursor-pointer flex flex-col group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-semibold text-[#6EA8FE]">{m.subtitle}</span>
                  <Badge variant={m.difficulty === 'beginner' ? 'green' : 'amber'} dot>
                    {m.difficulty}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-[#E8EDF5] mb-2 group-hover:text-[#6EA8FE] transition-colors">
                  {m.title}
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed mb-4 flex-1">
                  {m.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-5">
                  {m.teaches.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-[#0B1020] border border-[#263247] text-[#94A3B8]">
                      {t}
                    </span>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="w-full justify-center"
                >
                  Start Mission
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ABOUT SPHEREX MISSION ══════════════════════════════ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="blue" className="mb-3" dot>NASA Astrophysics Explorer</Badge>
              <h2 className="text-3xl font-bold text-[#E8EDF5] mb-4 tracking-tight">
                About the SPHEREx Space Telescope
              </h2>
              <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
                SPHEREx (Spectro-Photometer for the History of the Universe, Epoch of
                Reionization and Ices Explorer) is an all-sky near-infrared space observatory.
                Every six months, it maps the entire celestial sphere across 102 individual spectral channels.
              </p>
              <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
                All observations on this platform are accessed directly from the official
                NASA/IPAC Infrared Science Archive (IRSA) via IVOA TAP protocols. No scientific measurements are fabricated.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" onClick={() => navigate('/about')}>
                  Read Full Mission Details
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/spectra')}>
                  View 102 Spectral Bands
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Spectral Channels', val: '102', sub: 'Linear Variable Filters' },
                { label: 'Wavelength', val: '0.75 – 5.0 μm', sub: 'Near-Infrared Spectrum' },
                { label: 'Survey Type', val: 'All-Sky', sub: 'Full celestial sphere' },
                { label: 'Science Archive', val: 'IRSA', sub: 'Caltech / NASA IPAC' },
              ].map(({ label, val, sub }) => (
                <div key={label} className="bg-[#151E30]/90 backdrop-blur-md border border-[#263247] rounded-xl p-5">
                  <div className="font-mono text-2xl font-bold text-[#6EA8FE] mb-1">{val}</div>
                  <div className="text-xs font-bold text-[#E8EDF5] mb-0.5">{label}</div>
                  <div className="text-[11px] text-[#94A3B8]">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
