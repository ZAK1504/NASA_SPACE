import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { travelBackToJourney, travelToWorkspace } from "../../lib/journeyState";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Compass,
  Clock,
  FlaskConical,
  Layers,
  ArrowLeft,
  Share2,
  Bookmark,
} from "lucide-react";

interface StoryChapter {
  id: string;
  chapterNumber: string;
  title: string;
  subtitle: string;
  wavelength: string;
  leadQuote: string;
  narrative: string[];
  image: string;
  imageCaption: string;
  imageCredit: string;
  scienceLinks: { label: string; url: string }[];
  explorationCta?: { label: string; route: string; icon: "explore" | "time" | "lab" };
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "prologue",
    chapterNumber: "PROLOGUE",
    title: "Beyond Visible Light",
    subtitle: "Opening the Infrared Window onto the Universe",
    wavelength: "0.75 μm – 5.0 μm",
    leadQuote: "For millennia, humanity gazed at the night sky through the narrow slit of visible light. The real story begins beyond the red.",
    narrative: [
      "For millennia, human astronomy was confined to the visible spectrum—a tiny sliver between 380 and 750 nanometers. But the coldest, most distant, and most fundamental processes in our cosmos emit almost entirely in the infrared.",
      "Cosmic dust clouds that completely block visible light become transparent at infrared wavelengths. Stars hidden inside dense molecular nurseries shine through clearly. And light emitted by the very first galaxies over 13 billion years ago has had its wavelength stretched into the near-infrared by the expansion of spacetime.",
      "NASA’s SPHEREx mission (Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer) was engineered to map the entire sky across these crucial infrared wavelengths with unprecedented spectral coverage.",
    ],
    image: "/textures/spherex_dr1_composite.jpg",
    imageCaption: "NASA SPHEREx All-Sky Infrared Survey Composite Mosaic (3-Color False-Color Representation)",
    imageCredit: "NASA / JPL-Caltech / IPAC / SPHEREx Science Team",
    scienceLinks: [
      { label: "NASA SPHEREx Mission Overview", url: "https://science.nasa.gov/mission/spherex/" },
      { label: "IRSA SPHEREx Archive", url: "https://caltech-ipac.github.io/spherex-archive-documentation/" },
    ],
  },
  {
    id: "fingerprints",
    chapterNumber: "CHAPTER 01",
    title: "The Fingerprints of the Cosmos",
    subtitle: "102 Discrete Infrared Channels Across the Entire Celestial Sphere",
    wavelength: "102 Bands · R ~ 35 to 130",
    leadQuote: "Every chemical element and molecule in space signs its name in the light. 102 colors reveal what eyes cannot see.",
    narrative: [
      "Traditional space telescopes either capture high-resolution pictures through a few broad filters, or obtain detailed spectra of one single star at a time. SPHEREx does something radically different: it maps every pixel on the entire sky across 102 distinct infrared channels.",
      "Using linear variable filters (LVFs) mounted directly above its detectors, the telescope acts as a celestial prism. As SPHEREx points and scans across the sky, every celestial coordinate is observed through all 102 wavelengths from 0.75 to 5.0 micrometers.",
      "The result is a three-dimensional datacube of the universe: two spatial dimensions on the sky, and a third dimension of spectral color that reveals temperature, chemical composition, redshift, and distance.",
    ],
    image: "/textures/spherex_band_133um.jpg",
    imageCaption: "SPHEREx Spectral Channel 25 (1.33 μm) — Resolving Stellar Distributions and Galactic Structure",
    imageCredit: "IPAC / NASA IRSA Observational Archive",
    scienceLinks: [
      { label: "SPHEREx Instrument & LVF Technology", url: "https://spherex.caltech.edu/page/instrument" },
      { label: "Wavelength Calibration System", url: "https://caltech-ipac.github.io/spherex-archive-documentation/spectral-channels/" },
    ],
    explorationCta: {
      label: "Open Spectral Explorer",
      route: "/spectra",
      icon: "explore",
    },
  },
  {
    id: "dawn",
    chapterNumber: "CHAPTER 02",
    title: "Echoes of Cosmic Dawn",
    subtitle: "Testing Inflation and the Epoch of Reionization",
    wavelength: "0.75 μm – 2.0 μm Extragalactic",
    leadQuote: "In the first billionth of a second after the Big Bang, quantum ripples laid the blueprint for the entire cosmic web.",
    narrative: [
      "In the first split-second after the creation of the universe, cosmic inflation expanded quantum fluctuations into macroscopic density waves. Over billions of years, gravity pulled matter into those cosmic ripples, forming the filaments and voids of the cosmic web.",
      "By obtaining redshifts for hundreds of millions of galaxies across the full sphere, SPHEREx measures three-dimensional large-scale galaxy clustering with extraordinary statistical precision, testing non-Gaussian fluctuations from inflation.",
      "Simultaneously, SPHEREx maps the aggregate diffuse extragalactic background light (EBL) fluctuations, isolating the collective glow of the very first generation of stars and black holes formed during the Epoch of Reionization.",
    ],
    image: "/textures/spherex_band_075um.jpg",
    imageCaption: "Near-Infrared Extragalactic Deep Field Showing Large-Scale Galaxy Clustering",
    imageCredit: "NASA / ESA / SPHEREx Cosmology Working Group",
    scienceLinks: [
      { label: "Cosmic Inflation & Large-Scale Structure", url: "https://spherex.caltech.edu/page/cosmology" },
      { label: "Extragalactic Background Light Studies", url: "https://science.nasa.gov/mission/spherex/science/" },
    ],
    explorationCta: {
      label: "Inspect Deep Galaxies",
      route: "/objects",
      icon: "explore",
    },
  },
  {
    id: "ices",
    chapterNumber: "CHAPTER 03",
    title: "Biogenic Ices in Stellar Nurseries",
    subtitle: "Mapping Water and the Molecular Precursors of Life",
    wavelength: "2.5 μm – 5.0 μm Molecular Absorption",
    leadQuote: "The water filling Earth's oceans was born in frozen grains orbiting newborn stars millions of years before Earth existed.",
    narrative: [
      "Where did Earth's oceans and organic molecules come from? Astrochemical research shows that water ice (H₂O), carbon monoxide (CO), carbon dioxide (CO₂), and complex biogenic ices form on microscopic dust grains deep inside cold interstellar molecular clouds.",
      "As newborn stars and planetary systems condense out of these clouds, those ices are incorporated into comets, asteroids, and planetesimals, eventually delivering water and prebiotic volatiles to terrestrial planets.",
      "SPHEREx surveys absorption features toward millions of Milky Way stars embedded in or shining through molecular clouds, producing the first all-sky map of the interstellar abundance, distribution, and composition of life-supporting ices.",
    ],
    image: "/textures/spherex_band_472um.jpg",
    imageCaption: "4.72 μm Band Tracing Interstellar Ice Absorption Bands in Dense Star-Forming Nebulae",
    imageCredit: "NASA / JPL-Caltech / Interstellar Ice Survey",
    scienceLinks: [
      { label: "Interstellar Biogenic Ices Science", url: "https://spherex.caltech.edu/page/ices" },
      { label: "Origins of Solar System Water", url: "https://science.nasa.gov/open-science/spherex-universe-map/" },
    ],
    explorationCta: {
      label: "Analyze in Discovery Lab",
      route: "/discovery-lab",
      icon: "lab",
    },
  },
  {
    id: "changing-sky",
    chapterNumber: "CHAPTER 04",
    title: "The Changing Sky",
    subtitle: "Time-Domain Astronomy and Moving Solar Neighbors",
    wavelength: "4 All-Sky Cadences over 2 Years",
    leadQuote: "Look closely at the stars: they do not stand still. They drift, pulse, flare, and dance through time.",
    narrative: [
      "The universe is frequently depicted as an eternal, motionless tapestry. In reality, the sky is constantly changing. Stars migrate through space, variable stars pulsate in brightness, young stellar objects flare, and cold brown dwarfs drift past nearby systems.",
      "SPHEREx conducts four independent all-sky surveys over its two-year nominal prime mission. By comparing aligned observations separated by six-month cadences, astronomers can track high proper motion stars across the celestial sphere.",
      "From Barnard’s Star sprinting across Ophiuchus to cold, elusive Y-dwarfs floating silently through our solar neighborhood, multi-epoch observations turn static astronomy into an active, living cinematic time machine.",
    ],
    image: "/textures/spherex_band_236um.jpg",
    imageCaption: "Multi-Epoch Difference Photometry Highlighting Proper Motion and Variable Stellar Flux",
    imageCredit: "NASA / IPAC IRSA / SPHEREx Time Domain Pipeline",
    scienceLinks: [
      { label: "All-Sky Survey Cadence & Orbit", url: "https://caltech-ipac.github.io/spherex-archive-documentation/survey-strategy/" },
      { label: "High Proper Motion Stars in Gaia & SPHEREx", url: "https://science.nasa.gov/mission/spherex/" },
    ],
    explorationCta: {
      label: "Launch Time Machine",
      route: "/time-machine",
      icon: "time",
    },
  },
  {
    id: "epilogue",
    chapterNumber: "EPILOGUE",
    title: "The Next Discovery is Yours",
    subtitle: "Open Science, Accessible Data, and the Spirit of Exploration",
    wavelength: "Public Domain · NASA Open Science",
    leadQuote: "Science belongs to anyone with the curiosity to ask and the courage to look.",
    narrative: [
      "The greatest achievement of modern astrophysics is not merely building powerful telescopes—it is ensuring that the universe belongs to everyone. Through NASA's Open Science initiative, genuine SPHEREx observations are delivered freely to the global public.",
      "We built SPHEREx HORIZON so that students in classrooms, educators in planetariums, and citizen scientists in every corner of the world can directly interact with these genuine observations—without needing expensive institutional software or steep mathematical prerequisites.",
      "Explore the sky in 3D, inspect 102 spectral bands, slide across time epochs, detect new transients, and log your findings in your personal discovery journal. The data is real. The questions are yours. Your journey begins now.",
    ],
    image: "/spherex_dr1_allsky_rgb.png",
    imageCaption: "SPHEREx HORIZON All-Sky Infrared Panorama — Open to Citizen Scientists Worldwide",
    imageCredit: "Meteor Rizzlers / NASA Space Apps Challenge 2026",
    scienceLinks: [
      { label: "NASA Open Science Principles", url: "https://science.nasa.gov/open-science/" },
      { label: "NASA Space Apps Challenge 2026", url: "https://www.spaceappschallenge.org/" },
    ],
    explorationCta: {
      label: "Begin Your Science Mission",
      route: "/missions",
      icon: "explore",
    },
  },
];

interface CosmicChronicleProps {
  defaultReturnChapter?: string;
}

export const CosmicChronicle: React.FC<CosmicChronicleProps> = ({
  defaultReturnChapter = "about",
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [activeBandIndex, setActiveBandIndex] = useState(0);

  const chapter = STORY_CHAPTERS[currentPage];
  const totalPages = STORY_CHAPTERS.length;

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  };

  // Keyboard navigation support: Left / Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage]);

  const handleReturn = () => {
    travelBackToJourney(navigate, defaultReturnChapter);
  };

  const handleCtaClick = (route: string) => {
    travelToWorkspace(navigate, route, "about");
  };

  const bands = [
    { label: "0.75 μm", src: "/textures/spherex_band_075um.jpg" },
    { label: "1.33 μm", src: "/textures/spherex_band_133um.jpg" },
    { label: "2.36 μm", src: "/textures/spherex_band_236um.jpg" },
    { label: "4.72 μm", src: "/textures/spherex_band_472um.jpg" },
  ];

  return (
    <div className="cosmic-chronicle min-h-screen bg-[#07060A] text-[#f3efe8] flex flex-col selection:bg-[var(--accent)] selection:text-black">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#07060A]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleReturn}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Return to originating Journey scroll position"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Return to Journey</span>
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-wider">
              THE COSMIC CHRONICLE
            </span>
            <span className="text-white/30 text-xs">·</span>
            <span className="text-xs text-white/60 font-light">The Universe in 102 Colours</span>
          </div>
        </div>

        {/* Chapter Quick Selector & Progress */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs font-mono text-white/50">
            {chapter.chapterNumber} ({currentPage + 1}/{totalPages})
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className={`p-1.5 rounded-lg border border-white/10 transition-colors ${
                currentPage === 0
                  ? "opacity-30 cursor-not-allowed text-white/40"
                  : "hover:bg-white/10 text-white cursor-pointer hover:border-[var(--accent)]"
              }`}
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className={`p-1.5 rounded-lg border border-white/10 transition-colors ${
                currentPage === totalPages - 1
                  ? "opacity-30 cursor-not-allowed text-white/40"
                  : "hover:bg-white/10 text-white cursor-pointer hover:border-[var(--accent)]"
              }`}
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Facing Pages Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch"
          >
            {/* Left Page: Illustrated Narrative & Editorial Typography */}
            <div className="lg:col-span-6 bg-[#100F15] border border-white/10 rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              {/* Subtle Warm Page Lighting */}
              <div className="absolute top-0 left-0 w-80 h-80 bg-[var(--accent)]/5 rounded-full filter blur-3xl pointer-events-none" />

              <div>
                {/* Chapter Meta Strip */}
                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-widest">
                      {chapter.chapterNumber}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-white/40 bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
                    {chapter.wavelength}
                  </span>
                </div>

                {/* Chapter Title & Subtitle */}
                <h1 className="text-2xl sm:text-4xl font-extralight tracking-tight text-white mb-2 leading-tight">
                  {chapter.title}
                </h1>
                <h2 className="text-xs sm:text-sm font-medium text-[var(--accent)] mb-6 tracking-wide">
                  {chapter.subtitle}
                </h2>

                {/* Lead Quote Callout */}
                <div className="p-4 rounded-xl bg-white/[0.03] border-l-2 border-[var(--accent)] mb-6">
                  <p className="font-serif italic text-xs sm:text-sm text-white/90 leading-relaxed">
                    "{chapter.leadQuote}"
                  </p>
                </div>

                {/* Main Narrative Paragraphs */}
                <div className="space-y-4 text-xs sm:text-sm text-white/75 font-light leading-relaxed">
                  {chapter.narrative.map((para, i) => (
                    <p key={i}>
                      {i === 0 ? (
                        <span className="float-left text-3xl font-serif text-[var(--accent)] mr-2 leading-none">
                          {para[0]}
                        </span>
                      ) : null}
                      {i === 0 ? para.slice(1) : para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Left Page Footer: Scientific References & Footnotes */}
              <div className="mt-8 pt-4 border-t border-white/10">
                <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider block mb-2">
                  Verified Scientific Sources:
                </span>
                <div className="flex flex-wrap gap-3">
                  {chapter.scienceLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--accent)] hover:text-white transition-colors"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Page: Authentic Astronomical Visual & Scientific Explorer */}
            <div className="lg:col-span-6 bg-[#100F15] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="flex flex-col h-full">
                {/* Visual Header */}
                <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                  <span className="font-mono text-[11px] text-white/50 uppercase tracking-wider">
                    AUTHENTIC OBSERVATIONAL DATA
                  </span>
                  <span className="font-mono text-[11px] text-[var(--accent)]">
                    NASA / IPAC IRSA
                  </span>
                </div>

                {/* Interactive Multi-Wavelength Viewport */}
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-white/15 mb-4 group">
                  <img
                    src={
                      currentPage === 1
                        ? bands[activeBandIndex].src
                        : chapter.image
                    }
                    alt={chapter.imageCaption}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Channel Tag Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white/90">
                      {currentPage === 1
                        ? `Channel Filter: ${bands[activeBandIndex].label}`
                        : chapter.wavelength}
                    </span>
                    <span className="text-[10px] font-mono text-white/50">
                      HiPS Level 3
                    </span>
                  </div>
                </div>

                {/* Special Interactive Wavelength Selector (for Chapter 01) */}
                {currentPage === 1 && (
                  <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="font-mono text-[10px] text-white/50 block mb-2 uppercase">
                      Select Infrared Wavelength Channel:
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {bands.map((b, idx) => (
                        <button
                          key={b.label}
                          onClick={() => setActiveBandIndex(idx)}
                          className={`py-1.5 px-2 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                            activeBandIndex === idx
                              ? "bg-[var(--accent)] text-black font-semibold shadow-md"
                              : "bg-white/5 hover:bg-white/10 text-white/70"
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Caption & Attribution */}
                <p className="text-xs text-white/70 leading-relaxed mb-2 font-light">
                  {chapter.imageCaption}
                </p>
                <span className="text-[10.5px] font-mono text-white/40 block mb-6">
                  Credit: {chapter.imageCredit}
                </span>

                {/* Right Page Action / Exploration CTA */}
                <div className="mt-auto pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {chapter.explorationCta ? (
                    <button
                      onClick={() => handleCtaClick(chapter.explorationCta!.route)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:brightness-110 text-black text-xs font-semibold font-mono transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Compass className="w-4 h-4 text-black" />
                      <span>{chapter.explorationCta.label}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                      <Bookmark className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>The Cosmic Chronicle · SPHEREx HORIZON</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {currentPage > 0 && (
                      <button
                        onClick={handlePrev}
                        className="px-3.5 py-2 rounded-xl border border-white/10 hover:border-white/30 text-xs font-mono text-white/80 hover:text-white transition-colors cursor-pointer"
                      >
                        ← Prev
                      </button>
                    )}
                    {currentPage < totalPages - 1 ? (
                      <button
                        onClick={handleNext}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white transition-all cursor-pointer"
                      >
                        Next Page →
                      </button>
                    ) : (
                      <button
                        onClick={handleReturn}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f4a272] to-[#ff7b3d] text-black font-semibold text-xs font-mono transition-all cursor-pointer shadow-md"
                      >
                        Return to Journey ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 3. Bottom Table of Contents Strip */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {STORY_CHAPTERS.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => setCurrentPage(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                currentPage === idx
                  ? "bg-[var(--accent)] text-black font-semibold shadow-md"
                  : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {ch.chapterNumber}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CosmicChronicle;
