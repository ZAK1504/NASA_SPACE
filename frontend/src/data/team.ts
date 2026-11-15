export interface TeamMember {
  id: string;
  name: string;
  image: string;
  currentRole: string;
  previousProjectRole: string;
  shortBio: string;
  fullBio: string;
  skills: string[];
  contributions: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  displayOrder: number;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "zakiel-chungath",
    name: "Zakiel Chungath",
    image: "/team/zakiel.png",
    currentRole: "Team Lead & 3D Visualization Engineer",
    previousProjectRole: "Team Lead · 3D Modeling & NASA API Integration",
    shortBio:
      "Bridging virtual and real-world space science through cutting-edge 3D orbital modeling, real-time spacecraft rendering, and mission architecture.",
    fullBio:
      "Zakiel leads the Meteor Rizzlers team with a focus on real-time 3D simulation and immersive scientific visualization. In sphereXplorer, he architected the interactive 3D flight model of the SPHEREx space telescope, designed the cinematic journey visual transitions, and coordinated multi-system integration across frontend and backend services.",
    skills: ["3D Modeling", "Real-Time Rendering", "Team Leadership", "Mission Architecture", "System Design"],
    contributions: [
      "Interactive SPHEREx 3D flight model with full drag rotation & PBR materials",
      "Cinematic journey visual transitions & atmospheric chapter reveal pipelines",
      "NASA API integration pipeline and platform architecture coordination",
    ],
    displayOrder: 1,
  },
  {
    id: "roshith-robert",
    name: "Roshith Robert",
    image: "/team/roshith.png",
    currentRole: "Physics Simulation & Data Pipeline Engineer",
    previousProjectRole: "Physics Simulation & API Retrieval",
    shortBio:
      "Specialized in astronomical physics simulations, multi-epoch celestial coordinate alignment, and high-precision API data retrieval.",
    fullBio:
      "Roshith focuses on the mathematical and computational engines underpinning astronomical discovery. For sphereXplorer, he engineered the multi-epoch observation alignment logic that enables users to detect proper motion and stellar variability across genuine NASA/IPAC IRSA SPHEREx observations.",
    skills: ["Physics Simulation", "API Integration", "Astronomical Data Retrieval", "Orbital Mechanics", "Numerical Computation"],
    contributions: [
      "Multi-epoch observation alignment logic for time-domain transient detection",
      "NASA/IPAC IRSA TAP query and SIA2 coordinate matching routines",
      "Astronomical proper motion vector calculators across observing epochs",
    ],
    displayOrder: 2,
  },
  {
    id: "sanjay-varghese",
    name: "Sanjay Varghese",
    image: "/team/sanjay.png",
    currentRole: "Full-Stack Architect & UI/UX Specialist",
    previousProjectRole: "Backend Developer & UI/UX Specialist",
    shortBio:
      "Focused on high-performance backend systems, interactive sky maps, and creating intuitive, elegant interfaces for complex astronomical data.",
    fullBio:
      "Sanjay bridges scientific computing with accessible, beautiful user interface architecture. In sphereXplorer, he structured the FastAPI backend service, integrated the CDS Aladin Lite v3 all-sky visualization layer, and designed the responsive HUD interface system with strict performance budgets.",
    skills: ["Full-Stack Architecture", "FastAPI / Python", "React 19 & TypeScript", "UI/UX Architecture", "Aladin Lite Integration"],
    contributions: [
      "FastAPI backend architecture with automated in-memory FITS caching",
      "Aladin Lite v3 all-sky integration with authentic SPHEREx DR1 color cubes",
      "Responsive HUD design system with zero-layout-shift performance optimization",
    ],
    displayOrder: 3,
  },
  {
    id: "riyan-raz",
    name: "Riyan Raz",
    image: "/team/riyan.png",
    currentRole: "Core Systems & Cosmic AI Architect",
    previousProjectRole: "Overall Developer · Backend & Chatbot Systems",
    shortBio:
      "Expert in backend architecture, astronomical data processing, and intelligent conversational agents for interactive science education.",
    fullBio:
      "Riyan specializes in systems architecture, large-scale astronomical data caching, and AI-assisted scientific discovery. He developed the Cosmic Copilot assistant, designed the Level 2 FITS extraction pipeline, and implemented the 102-channel spectral curve generation algorithms for sphereXplorer.",
    skills: ["Conversational AI", "Data Processing", "Backend Architecture", "Resource Management", "Spectral Analysis"],
    contributions: [
      "Cosmic Copilot interactive assistant for contextual astronomical guidance",
      "NASA Level 2 FITS parsing and 102-channel spectral extraction pipeline",
      "Automated server-side caching and resilient network fallback layers",
    ],
    displayOrder: 4,
  },
  {
    id: "shwethin-nikesh-kumar",
    name: "Shwethin Nikesh Kumar",
    image: "/team/shwethin.png",
    currentRole: "Interactive Experience & Presentation Architect",
    previousProjectRole: "Game Developer & Presentation Management",
    shortBio:
      "Specialized in gamified scientific education, interactive exploration workflows, and compelling visual presentations for public engagement.",
    fullBio:
      "Shwethin transforms complex astrophysical concepts into engaging, interactive learning experiences. For sphereXplorer, he designed the guided scientific missions, interactive discovery mechanisms, and educational presentation architecture that make deep-space research intuitive and exciting for all ages.",
    skills: ["Interactive Exploration", "Gamification Design", "Asset Optimization", "Science Communication", "Presentation Design"],
    contributions: [
      "Guided scientific mission walkthroughs and interactive discovery milestones",
      "Interactive training simulations and citizen-science discovery journal",
      "Public science communication narrative and presentation architecture",
    ],
    displayOrder: 5,
  },
];

export interface Milestone {
  year: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
}

export const JOURNEY_MILESTONES: Milestone[] = [
  {
    year: "2025",
    badge: "THE GENESIS",
    title: "NEO Tracker",
    subtitle: "Near-Earth Object Tracking & Impact Physics Simulation",
    description:
      "Our journey began at the NASA Space Apps Challenge 2025. As a student team from Kerala, India, we created NEO Tracker — an interactive platform that combined real NASA small-body telemetry with authentic physics simulations to help students visualize orbital trajectories and asteroid impact consequences.",
    highlights: [
      "Interactive 3D orbital simulation using NASA JPL telemetry",
      "Real-time kinetic energy and crater dimension calculations",
      "Comprehensive citizen-science educational dashboard",
    ],
  },
  {
    year: "2025",
    badge: "GLOBAL HONORS",
    title: "NASA Space Apps Global Finalist",
    subtitle: "Selected Among the Top 45 Finalist Teams Worldwide",
    description:
      "Out of thousands of projects submitted globally by participants from over 150 countries, Meteor Rizzlers was selected as an official NASA Space Apps 2025 Global Finalist — one of only 45 teams globally recognized for scientific merit, design excellence, and educational impact.",
    highlights: [
      "Official Global Finalist distinction from NASA Space Apps Challenge",
      "Recognized for scientific accuracy and accessible simulation design",
      "Strengthened our conviction that open science should belong to everyone",
    ],
  },
  {
    year: "2026",
    badge: "THE NEW FRONTIER",
    title: "sphereXplorer",
    subtitle: "From Planetary Defense to the Deep Infrared Cosmos",
    description:
      "Returning for the 2026 NASA Space Apps Challenge, we expanded our scientific horizon. Inspired by NASA's upcoming SPHEREx space telescope, we built sphereXplorer: an all-sky cosmic discovery platform that transforms genuine Level 2 infrared FITS observations into an interactive, time-domain journey across 102 spectral channels.",
    highlights: [
      "Authentic NASA/IPAC IRSA SPHEREx data integration across 102 infrared bands",
      "Multi-epoch time machine revealing stellar motion and photometric variability",
      "Zero-barrier citizen-science workflows with Aladin Lite v3 and Cosmic Copilot",
    ],
  },
];

export interface TechItem {
  name: string;
  category: string;
  description: string;
}

export const TECHNOLOGIES: TechItem[] = [
  { name: "React 19", category: "Frontend Core", description: "Modern reactive user interface architecture" },
  { name: "TypeScript", category: "Language", description: "Type-safe development and verified contracts" },
  { name: "Vite", category: "Build Tooling", description: "Next-generation lightning-fast HMR and bundling" },
  { name: "Tailwind CSS", category: "Design System", description: "Utility-first design tokens and responsive HUD" },
  { name: "Three.js", category: "3D Graphics", description: "WebGL-powered interactive spacecraft flight model" },
  { name: "Aladin Lite v3", category: "Sky Visualization", description: "CDS Strasbourg WebGL all-sky HiPS sphere" },
  { name: "FastAPI", category: "Backend Core", description: "Asynchronous high-performance Python microservice" },
  { name: "Python 3.11", category: "Scientific Core", description: "Astrophysical computation and data processing" },
  { name: "Astropy", category: "Astronomy Core", description: "Official astronomical FITS and WCS coordinate analysis" },
  { name: "NumPy & SciPy", category: "Math & Science", description: "Vectorized array mathematics and scientific analysis" },
  { name: "Photutils", category: "Aperture Photometry", description: "Calibrated stellar flux and background estimation" },
  { name: "Reproject", category: "Coordinate Alignment", description: "Celestial WCS multi-epoch astronomical reprojection" },
  { name: "NASA / IPAC IRSA", category: "Data Archive", description: "Authentic SPHEREx SIA2 & TAP observational stream" },
  { name: "Lenis", category: "Motion Engine", description: "Hardware-accelerated inertial smooth scroll control" },
  { name: "Driver.js", category: "Onboarding UX", description: "Interactive guided platform tour and tutorial walks" },
];
