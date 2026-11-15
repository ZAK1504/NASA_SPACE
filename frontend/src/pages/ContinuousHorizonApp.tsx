import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Backdrop from "../components/ui/Backdrop";
import Starfield from "../components/ui/Starfield";
import Home from "./Home";
import ExplorerSection, { ExplorerSubTab } from "../components/sections/ExplorerSection";
import TimeMachineSection from "../components/sections/TimeMachineSection";
import LabsSection, { LabsSubTab } from "../components/sections/LabsSection";
import MissionSection from "../components/sections/MissionSection";
import { CommandPalette } from "../components/navigation/CommandPalette";
import { CosmicCopilot } from "../components/assistant/CosmicCopilot";
import { useGuidedTour } from "../hooks/useGuidedTour";
import { useSmoothScroll, useReveal } from "../lib/hooks";

const SECTION_IDS = ["home", "explorer", "time-machine", "labs", "mission"];

export const ContinuousHorizonApp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  // Initialize Lenis smooth scroll and global reveal observer
  useSmoothScroll();
  useReveal();

  const [activeSection, setActiveSection] = useState<string>("home");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { startTour } = useGuidedTour();

  // Explorer & Labs initial sub-tab states parsed from URL
  const [explorerSub, setExplorerSub] = useState<ExplorerSubTab>("sky");
  const [explorerObjectId, setExplorerObjectId] = useState<string | undefined>(undefined);
  const [labsSub, setLabsSub] = useState<LabsSubTab>("discovery");
  const [labsJournal, setLabsJournal] = useState<boolean>(false);

  // Parse deep links & hash on initial mount
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    const hash = location.hash.replace("#", "").toLowerCase();
    let targetSection: string | null = null;

    if (hash === "time-machine" || path.includes("time-machine") || path === "/time") {
      targetSection = "time-machine";
    } else if (hash === "explorer" || path.includes("spectra") || path.includes("explore") || path.includes("objects")) {
      targetSection = "explorer";
      if (path.includes("spectra") || hash === "spectral") {
        setExplorerSub("spectral");
      } else if (path.includes("objects") || hash === "object") {
        setExplorerSub("object");
        const parts = path.split("/");
        const id = parts[parts.length - 1];
        if (id && id !== "objects" && id !== "object") {
          setExplorerObjectId(id);
        }
      } else {
        setExplorerSub("sky");
      }
    } else if (hash === "labs" || path.includes("lab") || path.includes("discoveries") || path.includes("light-curves")) {
      targetSection = "labs";
      if (path.includes("light-curves")) {
        setLabsSub("light-curves");
      } else if (path.includes("discoveries")) {
        setLabsSub("discovery");
        setLabsJournal(true);
      } else {
        setLabsSub("discovery");
      }
    } else if (hash === "mission" || path.includes("mission")) {
      targetSection = "mission";
    }

    if (targetSection && targetSection !== "home") {
      setActiveSection(targetSection);
      // Position to section on deep link load
      const scrollToTarget = () => {
        const el = document.getElementById(targetSection!);
        if (el) {
          if (window.__lenis) {
            window.__lenis.scrollTo(el, { immediate: true, offset: -70 });
          } else {
            el.scrollIntoView({ behavior: "auto" });
          }
        }
      };
      scrollToTarget();
      const timer = setTimeout(scrollToTarget, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Global hotkey: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Smooth scroll handler for navigation clicks
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;

    setActiveSection(sectionId);

    // Update URL passively without full reload
    const cleanPath = sectionId === "home" ? "/" : `/${sectionId}`;
    if (window.location.pathname !== cleanPath) {
      window.history.pushState(null, "", cleanPath);
    }

    if (window.__lenis) {
      window.__lenis.scrollTo(el, { offset: -70, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Passive active-section tracking via IntersectionObserver
  useEffect(() => {
    let currentActive = "home";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id && SECTION_IDS.includes(id)) {
              currentActive = id;
              setActiveSection(id);

              // Update URL passively via replaceState (no history pollution)
              const newPath = id === "home" ? "/" : `/${id}`;
              if (window.location.pathname !== newPath) {
                window.history.replaceState(null, "", newPath);
              }
            }
          }
        });
      },
      {
        rootMargin: "-25% 0px -55% 0px", // Trigger when section is in the focal middle of viewport
        threshold: 0,
      }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="continuous-app min-h-screen bg-black text-[#f3efe8] relative flex flex-col selection:bg-[#f4a272] selection:text-black">
      {/* 1. Persistent Cosmic Background (Backdrop & Parallax Starfield with Warp) */}
      <Backdrop activeSection={activeSection} />
      <Starfield />

      {/* 2. Persistent Top Navigation Header (Exact 5 Destinations) */}
      <Navbar
        activeSection={activeSection}
        onNavigate={scrollToSection}
        onStartTour={() => startTour("getting-started", true)}
      />

      {/* 3. Continuous Main Scroll Container */}
      <main className="flex-1 w-full relative z-10 flex flex-col">
        {/* Section 1: Home */}
        <section id="home" className="w-full">
          <Home onNavigateSection={scrollToSection} />
        </section>

        {/* Section 2: Explorer */}
        <ExplorerSection
          initialSub={explorerSub}
          initialObjectId={explorerObjectId}
          onContinueToTimeMachine={() => scrollToSection("time-machine")}
          isSectionActive={activeSection === "explorer"}
        />

        {/* Section 3: Time Machine */}
        <TimeMachineSection
          onContinueToLabs={() => scrollToSection("labs")}
          isSectionActive={activeSection === "time-machine"}
        />

        {/* Section 4: Labs */}
        <LabsSection
          initialSub={labsSub}
          initialNestedJournal={labsJournal}
          onContinueToMission={() => scrollToSection("mission")}
          isSectionActive={activeSection === "labs"}
        />

        {/* Section 5: Mission */}
        <MissionSection
          onBackToTop={() => scrollToSection("home")}
          onBackToExplorer={() => scrollToSection("explorer")}
          onBackToTimeMachine={() => scrollToSection("time-machine")}
          isSectionActive={activeSection === "mission"}
        />
      </main>

      {/* 4. Global Quick Command Palette (Ctrl+K / ⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* 5. Global Interactive Cosmic Copilot & Guide */}
      <CosmicCopilot />
    </div>
  );
};

export default ContinuousHorizonApp;
