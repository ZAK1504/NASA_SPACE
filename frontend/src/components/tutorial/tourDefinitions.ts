import { DriveStep } from 'driver.js';

export interface TourDefinition {
  id: string;
  title: string;
  description: string;
  targetRoute?: string;
  steps: DriveStep[];
}

export const TOURS: Record<string, TourDefinition> = {
  // --------------------------------------------------------------------------
  // 1. JOURNEY OVERVIEW
  // --------------------------------------------------------------------------
  'getting-started': {
    id: 'getting-started',
    title: 'Welcome to sphereXplorer',
    description: 'An interactive journey through the continuous storytelling chapters, 3D instruments, and dedicated scientific tools.',
    steps: [
      {
        element: '[data-tour="journey-hero"]',
        popover: {
          title: '🌌 Welcome to sphereXplorer',
          description: 'sphereXplorer lets you explore genuine NASA SPHEREx near-infrared observations, inspect astronomical objects, and investigate how the sky changes over time across 102 spectral bands.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="journey-spacecraft"]',
        popover: {
          title: '🛰️ Interactive SPHEREx Spacecraft',
          description: 'This is the authentic 3D model of NASA’s SPHEREx space observatory. Drag to rotate the spacecraft and examine its passive conical thermal shields, optical assembly, and solar array wings.',
          side: 'left',
          align: 'center',
        },
      },
      {
        element: '[data-tour="journey-navigation"]',
        popover: {
          title: '🧭 Continuous Six-Chapter Journey',
          description: 'These are the six chapters of our continuous storytelling Journey: Home, Explorer, Time Machine, Labs, Mission, and About. The entire experience flows smoothly as you scroll.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '[data-tour="journey-chapter-navigator"]',
        popover: {
          title: '📍 Chapter Progress Navigator',
          description: 'Track your continuous cosmic elevation across the six chapters or click any chapter number (01 to 06) to smoothly glide to that section of the sky.',
          side: 'left',
          align: 'center',
        },
      },
      {
        element: '[data-tour="journey-explorer-actions"]',
        popover: {
          title: '🔭 Chapter 02: Beyond the Visible',
          description: 'Sky Explorer navigates the full celestial sphere with Aladin Lite. Object Explorer investigates individual astronomical targets and Gaia proper-motion vectors. Spectral Explorer uncovers 102 infrared wavelengths.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="journey-time-machine-action"]',
        popover: {
          title: '⏳ Chapter 03: The SPHEREx Time Machine',
          description: 'Compare multi-epoch observations across survey cadences to discover moving stars, examine split-screen and blink comparisons, and watch celestial motion over time.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="journey-labs-actions"]',
        popover: {
          title: '🧪 Chapter 04: The Science of Discovery',
          description: 'In Discovery Lab and Light Curves, compare aligned FITS frames, detect point sources with DAOStarFinder, analyze 3-plane signed residuals, and record verified findings in your journal.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '[data-tour="journey-mission-actions"]',
        popover: {
          title: '🎯 Chapter 05: Your Discovery Begins',
          description: 'Embark on genuine scientific challenge missions tracking Barnard\'s Star and cold brown dwarfs, or test your transient identification skills in the interactive Mini Game simulation.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '[data-tour="journey-about-section"]',
        popover: {
          title: '👥 Chapter 06: Behind the Horizon',
          description: 'Meet the team behind sphereXplorer—Meteor Rizzlers from Kerala, India. Explore verified creator profiles, our 2025 NASA Space Apps Global Finalist journey, why we built the platform, and the open-science tech stack.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '[data-tour="nav-infobook"]',
        popover: {
          title: '📖 The Cosmic Chronicle (Info Book)',
          description: 'Open our dedicated illustrated storybook, The Cosmic Chronicle: The Universe in 102 Colours, featuring facing-page illustrated narratives and authentic SPHEREx data.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '[data-tour="cosmic-copilot"]',
        popover: {
          title: '✨ Cosmic Copilot & Science Guide',
          description: 'Access on-demand celestial guidance, infrared astronomy assistance, and mission briefing notes at any point in your cosmic journey.',
          side: 'left',
          align: 'center',
        },
      },
      {
        element: '[data-tour="journey-ready"]',
        popover: {
          title: '🚀 Dedicated Scientific Workspaces',
          description: 'Entering any scientific tool opens its dedicated full-screen workspace. When you arrive, separate in-depth guided tutorials are available to help you master every scientific instrument.',
          side: 'bottom',
          align: 'end',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 2. SKY EXPLORER (Aladin Lite v3 WebGL)
  // --------------------------------------------------------------------------
  'sky-explorer': {
    id: 'sky-explorer',
    title: 'Sky Explorer Guide',
    description: 'Learn how to navigate the full celestial sphere with Aladin Lite v3 WebGL and compare infrared and optical surveys.',
    targetRoute: '/explore',
    steps: [
      {
        element: '[data-tour="sky-map"]',
        popover: {
          title: '🔭 Interactive Aladin Lite v3 Celestial Sphere',
          description: 'This interactive canvas streams hierarchical celestial tiles (HiPS) directly from NASA/IPAC IRSA and CDS. Click and drag to pan across the celestial sphere, and scroll to zoom into deep space.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="sky-survey-select"]',
        popover: {
          title: '🛰️ Multi-Wavelength Survey Layers',
          description: 'Switch between SPHEREx DR1 all-sky infrared, 2MASS near-infrared, AllWISE mid-infrared, and DSS2 optical surveys. Compare how cool brown dwarfs and dust-enshrouded protostars invisible in optical light shine brightly in infrared wavelengths.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="sky-quickjump"]',
        popover: {
          title: '🎯 Challenge Targets & Quick Jump',
          description: 'Instantly center the telescope on any of the 5 canonical NASA challenge targets: Barnard’s Star, WISE 0855, Epsilon Indi B, RW Aurigae, or R Draconis.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="sky-target-search"]',
        popover: {
          title: '🔍 Coordinate & Object Resolver',
          description: 'Enter any celestial coordinate (Right Ascension & Declination in degrees or HMS/DMS) or search any celestial object designation via SIMBAD and NED.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="sky-inspect-button"]',
        popover: {
          title: '🔬 Inspect in Object Explorer',
          description: 'Click this action to seamlessly open the selected target in the Object Explorer to examine calibrated FITS cutouts, pixel statistics, and Gaia DR3 proper motion vectors.',
          side: 'top',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 3. OBJECT EXPLORER (Target Investigation & FITS Cutouts)
  // --------------------------------------------------------------------------
  'object-explorer': {
    id: 'object-explorer',
    title: 'Object Explorer Guide',
    description: 'Investigate individual cosmic targets, explore standardized North-up astronomical cutouts, and inspect multi-wavelength catalogs.',
    targetRoute: '/objects',
    steps: [
      {
        element: '[data-tour="astronomical-viewer"]',
        popover: {
          title: '🔭 Standardized Astronomical FITS Cutout',
          description: 'Authentic SPHEREx Level 2 FITS observation reprojected to a celestial tangent grid with standard astronomical orientation: North UP, East LEFT. The compass reticle shows celestial orientation.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="viewer-fov"]',
        popover: {
          title: '🔍 Configurable Field of View (FOV)',
          description: 'Switch between 2′ (120″ close-up), 5′, 10′, 15′ (standard survey field), and 30′ wide fields. Each cutout is extracted directly from genuine calibrated FITS arrays.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="viewer-stretch"]',
        popover: {
          title: '📊 Non-Linear Normalization (Asinh)',
          description: 'Asinh stretch preserves faint diffuse structures and diffraction wings without saturating bright stellar cores. You can also select Linear, Sqrt, or Log stretches.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="viewer-astrometry"]',
        popover: {
          title: '🧭 Gaia DR3 Proper Motion & Astrometry',
          description: 'Examine high-precision Gaia DR3 proper motion vectors (mas/yr) and epoch-aware coordinate propagation. For fast-moving targets like Barnard’s Star (10.39″/yr), notice the substantial displacement across annual observation baselines.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="object-spectra-link"]',
        popover: {
          title: '🌈 Explore 102 Spectral Channels',
          description: 'Jump directly to the Spectral Explorer to examine this target across all 102 near-infrared channels and extract its calibrated surface brightness profile (MJy/sr).',
          side: 'top',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 4. SPECTRAL EXPLORER (102-Band Near-Infrared Cube)
  // --------------------------------------------------------------------------
  'spectral-explorer': {
    id: 'spectral-explorer',
    title: 'Spectral Explorer Guide',
    description: 'Learn how to navigate the 102 SPHEREx infrared channels and extract scientific spectra.',
    targetRoute: '/spectra',
    steps: [
      {
        element: '[data-tour="spectral-viewer"]',
        popover: {
          title: '🌐 Official SPHEREx DR1 HiPS Cube',
          description: 'This interactive canvas streams genuine SPHEREx DR1 calibrated infrared imagery directly from NASA/IPAC IRSA. Pan and zoom across the Milky Way and deep space.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="wavelength-slider"]',
        popover: {
          title: '🎛️ 102-Channel Wavelength Slider',
          description: 'Drag this slider to step through the 102 near-infrared channels (0.75 to 5.00 μm). Channels 51 and 52 mark the physical dichroic beam-splitter gap at 2.42 μm.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="detector-bands"]',
        popover: {
          title: '📐 Six Linear Variable Filter Arrays',
          description: 'Quickly jump between the 6 SPHEREx detector arrays (D1 to D6). Notice how interstellar dust extinction, water-ice clouds (3.05 μm), and CO gas/ice (4.67 μm) appear at distinct infrared wavelengths.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="spectral-scan"]',
        popover: {
          title: '▶️ Wavelength Scan Playback & Preloader',
          description: 'Click Play to animate through infrared wavelengths automatically. The scan preparation engine preloads high-resolution HiPS planes before playback to eliminate white-frame flashes and stuttering.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="extract-spectrum"]',
        popover: {
          title: '📊 Genuine Spectrum Extraction',
          description: 'Click anywhere on the sky or target to extract the authentic 102-band calibrated surface brightness profile (MJy/sr) and export the data to CSV.',
          side: 'left',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 5. TIME MACHINE (NASA Challenge Core Multi-Epoch Comparison)
  // --------------------------------------------------------------------------
  'time-machine': {
    id: 'time-machine',
    title: 'Time Machine Tour (Core NASA Challenge)',
    description: 'Master multi-epoch time-domain observation playback, comparison modes, and motion tracking.',
    targetRoute: '/time-machine',
    steps: [
      {
        element: '[data-tour="target-selector"]',
        popover: {
          title: '🎯 Select Challenge Target or Enter Coordinates',
          description: 'Choose from Barnard’s Star, WISE 0855, Epsilon Indi B, RW Aurigae, R Draconis, or enter custom coordinates. The Archive Discovery banner indicates total products discovered across dates in DR1/QR3.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="timelapse-player"]',
        popover: {
          title: '🎬 Multi-Epoch Video Playback',
          description: 'Play, pause, loop, and scrub through chronological SPHEREx observations of the same celestial patch across 359+ day baselines on a fixed celestial grid.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="comparison-modes"]',
        popover: {
          title: '🔀 Scientific Comparison Modes & Archive Metrics',
          description: 'Switch between Side-by-Side, Interactive Split Slider, High-Speed Blink Mode, and Cross-Epoch Difference Map. When single-visit, sphereXplorer honestly displays archive discovery counts and prepared frame status.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="fov-selector"]',
        popover: {
          title: '🔍 Configurable Field of View (FOV)',
          description: 'Expand from 2′ up to 30′ cutouts. Authentic larger cutouts are generated from calibrated FITS arrays. On Epsilon Indi B, inspect primary star Epsilon Indi A ~402″ (~6.7′) to the WSW.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="time-telemetry-motion"]',
        popover: {
          title: '🧭 Astrometric Telemetry & Proper Motion',
          description: 'Inspect baseline duration, Gaia DR3 annual proper motion vectors (mas/yr), catalog-predicted displacement versus independently measured image shifts, and detection flags.',
          side: 'left',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 6. DISCOVERY LAB (DAOStarFinder & Image Subtraction)
  // --------------------------------------------------------------------------
  'discovery-lab': {
    id: 'discovery-lab',
    title: 'Discovery Lab & Source Detection',
    description: 'Use Photutils DAOStarFinder, 3-view image subtraction, and log scientific candidate records.',
    targetRoute: '/discovery-lab',
    steps: [
      {
        element: '[data-tour="difference-map"]',
        popover: {
          title: '⚡ 3-View Cross-Epoch Difference Map',
          description: 'View Epoch 1, Epoch 2, and the signed difference map (Epoch 2 − Epoch 1) side-by-side using coolwarm diverging colors (blue = earlier brighter, red = later brighter, gray = neutral zero Δ).',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="candidate-list"]',
        popover: {
          title: '✨ DAOStarFinder Detections & Astrometric Stability',
          description: 'Inspect source centroids, breakdown metrics, and astrometric registration stability (<0.45 px / 2.74″). For saturated cores like Barnard’s Star, understand IPAC NaN masking and unmasked wing dipoles.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="stacking-controls"]',
        popover: {
          title: '📦 Scientific Co-Addition Stacking',
          description: 'Combine multiple observation frames of the same field to improve signal-to-noise ratio (S/N) and verify faint candidate detections against background noise fluctuations.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="journal-form"]',
        popover: {
          title: '📝 Log to Discovery Journal',
          description: 'Record scientific classifications (e.g. Exploratory Investigation, Possible Moving Source, Known-Source Recovery), add user confidence ratings, and save with full provenance.',
          side: 'top',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 7. DISCOVERY JOURNAL (Saved Discoveries & Research Records)
  // --------------------------------------------------------------------------
  'discovery-journal': {
    id: 'discovery-journal',
    title: 'Discovery Journal Guide',
    description: 'Manage saved astronomical investigations, review candidate classification tags, and export research findings.',
    targetRoute: '/discoveries',
    steps: [
      {
        element: '[data-tour="journal-list"]',
        popover: {
          title: '📓 Saved Scientific Investigations',
          description: 'Review your logged investigations, including target coordinates, observation dates, signed difference cutouts, and user confidence assessments.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="journal-filter"]',
        popover: {
          title: '🏷️ Filter by Object & Classification',
          description: 'Filter saved entries by challenge target or candidate type (e.g. High Proper Motion, Photometric Variable, Transient Candidate).',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="journal-export"]',
        popover: {
          title: '💾 Export Research Data',
          description: 'Export all saved investigations to standardized CSV or JSON formats for external astronomical analysis and scientific verification.',
          side: 'bottom',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 8. LIGHT CURVES (Time-Series Photometry)
  // --------------------------------------------------------------------------
  'light-curves': {
    id: 'light-curves',
    title: 'Photometric Light Curves Guide',
    description: 'Analyze time-series photometric variability across multiple SPHEREx observation dates.',
    targetRoute: '/light-curves',
    steps: [
      {
        element: '[data-tour="light-curve-target"]',
        popover: {
          title: '🎯 Target Selection',
          description: 'Choose targets with confirmed multi-epoch coverage: Mira variable R Draconis (period 314d), young stellar object RW Aurigae, or brown dwarf WISE 0855.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="light-curve-chart"]',
        popover: {
          title: '📊 Photometric Flux Chart',
          description: 'Interactive time-series chart showing calibrated flux (MJy/sr) against observation date (MJD / UTC) with uncertainty error bars. Notice the periodic pulsation amplitude for Mira variables.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="light-curve-provenance"]',
        popover: {
          title: '🔬 Scientific Limitations & Data Provenance',
          description: 'Review documented photometric extraction aperture radii, background subtraction parameters, and band-dependent calibration limits.',
          side: 'top',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 9. GUIDED MISSIONS
  // --------------------------------------------------------------------------
  'missions': {
    id: 'missions',
    title: 'Guided Astronomy Missions Guide',
    description: 'Participate in structured citizen-science investigations using genuine SPHEREx data.',
    targetRoute: '/missions',
    steps: [
      {
        element: '[data-tour="missions-catalog"]',
        popover: {
          title: '🚀 Citizen Science Missions',
          description: 'Choose a scientific mission to investigate: Planet Nine Search, Cold Brown Dwarf Hunter, Young Stellar Object Flare, or Supernova Anomaly.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="mission-briefing"]',
        popover: {
          title: '📋 Mission Briefing & Scientific Verification Criteria',
          description: 'Each mission provides verified coordinates, target metadata, and step-by-step validation criteria connecting you to the genuine scientific tools.',
          side: 'bottom',
        },
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 10. ANOMALY TRAINING SIMULATION
  // --------------------------------------------------------------------------
  'training-game': {
    id: 'training-game',
    title: 'Anomaly Training Simulation Guide',
    description: 'Train your visual perception to distinguish genuine astrophysical transients from detector artifacts.',
    targetRoute: '/mission/training',
    steps: [
      {
        element: '[data-tour="training-canvas"]',
        popover: {
          title: '🎮 Infrared Anomaly Training Simulation',
          description: 'Interactive educational simulation designed to train human eyes to recognize subtle infrared wavelength variations, proper motion dipoles, and cosmic ray hits before conducting real research.',
          side: 'bottom',
        },
      },
    ],
  },
};
