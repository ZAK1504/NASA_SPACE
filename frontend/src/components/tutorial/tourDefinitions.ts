import { DriveStep } from 'driver.js';

export interface TourDefinition {
  id: string;
  title: string;
  description: string;
  targetRoute?: string;
  steps: DriveStep[];
}

export const TOURS: Record<string, TourDefinition> = {
  'getting-started': {
    id: 'getting-started',
    title: 'Getting Started with HORIZON',
    description: 'A 60-second introduction to exploring NASA SPHEREx infrared observations and time-domain astronomy.',
    steps: [
      {
        element: 'body',
        popover: {
          title: '🌌 Welcome to SPHEREx HORIZON',
          description: 'SPHEREx is NASA’s revolutionary all-sky near-infrared space telescope mapping over 1 billion cosmic objects across 102 spectral bands. HORIZON puts this genuine data at your fingertips.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '[data-tour="nav-explore"]',
        popover: {
          title: '🔭 1. Explore the Sky',
          description: 'Navigate the real sky atlas, search astronomical targets or enter arbitrary RA/Dec coordinates, and discover available SPHEREx Level 2 observations.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="nav-spectral"]',
        popover: {
          title: '🌈 2. Spectral Explorer',
          description: 'Explore the official NASA/IPAC SPHEREx DR1 All-Sky HiPS Cube. Slide through 102 spectral channels from 0.75 μm to 5.0 μm and extract genuine calibrated spectra.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="nav-timemachine"]',
        popover: {
          title: '⏳ 3. Time Machine (Core Challenge)',
          description: 'Play multi-date observations like a movie, compare epochs side-by-side or in blink mode, and watch high proper motion objects move across genuine NASA exposures.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="nav-discovery"]',
        popover: {
          title: '🔬 4. Discovery Lab & Journal',
          description: 'Run automated source centroiding and image subtraction, verify astrometric stability, and log your findings to your personal Discovery Journal.',
          side: 'bottom',
        },
      },
    ],
  },

  'spectral-explorer': {
    id: 'spectral-explorer',
    title: 'Spectral Explorer Guide',
    description: 'Learn how to navigate the 102 SPHEREx infrared channels and extract scientific spectra.',
    targetRoute: '/spectral',
    steps: [
      {
        element: '[data-tour="spectral-viewer"]',
        popover: {
          title: '🌐 Official SPHEREx DR1 HiPS Cube',
          description: 'This interactive all-sky canvas displays genuine SPHEREx DR1 infrared imagery directly from NASA/IPAC IRSA. Pan and zoom across the Milky Way and deep space.',
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
          description: 'Quickly jump between the 6 SPHEREx detector arrays (D1 to D6). Notice how different cosmic features appear at different temperatures and wavelengths.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="spectral-scan"]',
        popover: {
          title: '▶️ Wavelength Scan Playback & Preloader',
          description: 'Click Play to animate through infrared wavelengths automatically. Notice the scan preparation engine that preloads high-resolution HiPS planes before playback to eliminate white-frame flashes and stuttering.',
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

  'object-explorer': {
    id: 'object-explorer',
    title: 'Object Explorer Guide',
    description: 'Investigate individual cosmic targets, explore standardized North-up astronomical cutouts, and inspect multi-wavelength catalogs.',
    targetRoute: '/objects/barnards-star',
    steps: [
      {
        element: '[data-tour="astronomical-viewer"]',
        popover: {
          title: '🔭 Standardized Astronomical Cutout',
          description: 'Authentic SPHEREx Level 2 FITS observation reprojected to a celestial tangent grid with standard astronomical orientation: North UP, East LEFT.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="viewer-fov"]',
        popover: {
          title: '🔍 Configurable Field of View (FOV)',
          description: 'Switch between 2′ (120″ close-up), 5′, 10′, 15′ (recommended default), and 30′ wide fields. Each cutout is extracted directly from the full FITS array.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="viewer-stretch"]',
        popover: {
          title: '📊 Non-Linear Normalization (Asinh)',
          description: 'Asinh stretch preserves faint diffuse structures without saturating bright stellar cores. You can also select Linear, Sqrt, or Log.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="viewer-smooth"]',
        popover: {
          title: '🖼️ Smooth vs Native Pixels',
          description: 'Toggle between presentation-quality bicubic smoothing and native 6.15″/pixel detector resolution for scientific evaluation.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="viewer-compass"]',
        popover: {
          title: '🧭 Celestial Compass & Scale Bar',
          description: 'Standard celestial orientation indicators (N ↑, E ←) and physical angular scale bars provide authentic astronomical context.',
          side: 'top',
        },
      },
    ],
  },

  'time-machine': {
    id: 'time-machine',
    title: 'Time Machine Tour (NASA Challenge)',
    description: 'Master multi-epoch time-domain observation playback, comparison modes, and motion tracking.',
    targetRoute: '/time-machine',
    steps: [
      {
        element: '[data-tour="target-selector"]',
        popover: {
          title: '🎯 Select Challenge Target or Enter Coordinates',
          description: 'Choose from Barnard’s Star, WISE 0855, Epsilon Indi B, RW Aurigae, R Draconis, or enter any custom sky coordinates.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="timelapse-player"]',
        popover: {
          title: '🎬 Multi-Epoch Video Playback',
          description: 'Play, pause, loop, and scrub through chronological SPHEREx observations of the same celestial patch across 359+ day baselines.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="comparison-modes"]',
        popover: {
          title: '🔀 Scientific Comparison Modes & Honest Status',
          description: 'Switch between Side-by-Side, Interactive Split Slider, High-Speed Blink Mode, and Cross-Epoch Difference Map. When only one epoch is available, HORIZON displays an honest single-epoch indicator rather than synthetic data.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="fov-selector"]',
        popover: {
          title: '🔍 Configurable Field of View (FOV)',
          description: 'Expand from 2′ up to 30′ cutouts. Genuine larger cutouts are generated from calibrated FITS arrays, eliminating Minecraft-like pixelation.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="display-stretch"]',
        popover: {
          title: '🎨 Display Palette & Asinh Stretch',
          description: 'Select between Grayscale, Inferno, Viridis, or Magma, and toggle smooth display interpolation for presentation while preserving raw arrays.',
          side: 'bottom',
        },
      },
    ],
  },

  'discovery-lab': {
    id: 'discovery-lab',
    title: 'Discovery Lab & Source Detection',
    description: 'Use Photutils DAOStarFinder, image subtraction, and log scientific candidate records.',
    targetRoute: '/discovery-lab',
    steps: [
      {
        element: '[data-tour="difference-map"]',
        popover: {
          title: '⚡ Cross-Epoch Difference Map',
          description: 'Computes signed pixel differences (Epoch 2 − Epoch 1) using a coolwarm diverging colormap. Paired positive/negative residuals reveal movement.',
          side: 'right',
        },
      },
      {
        element: '[data-tour="candidate-list"]',
        popover: {
          title: '✨ DAOStarFinder Detections',
          description: 'Inspect independently measured source centroids, measured angular displacement, and local astrometric stability benchmarks.',
          side: 'left',
        },
      },
      {
        element: '[data-tour="journal-form"]',
        popover: {
          title: '📝 Log to Discovery Journal',
          description: 'Record your scientific findings with provenance, observation dates, and confidence ratings, and export a formatted Markdown/JSON report.',
          side: 'top',
        },
      },
    ],
  },
};
