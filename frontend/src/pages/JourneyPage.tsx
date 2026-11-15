import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Backdrop from "../components/ui/Backdrop";
import Starfield from "../components/ui/Starfield";
import ChapterNavigator from "../components/navigation/ChapterNavigator";
import ChapterHome from "../components/showcase/ChapterHome";
import ChapterExplorer from "../components/showcase/ChapterExplorer";
import ChapterTimeMachine from "../components/showcase/ChapterTimeMachine";
import ChapterLabs from "../components/showcase/ChapterLabs";
import ChapterMission from "../components/showcase/ChapterMission";
import TimeWarpTransition from "../components/sections/TimeWarpTransition";
import { CommandPalette } from "../components/navigation/CommandPalette";
import { CosmicCopilot } from "../components/assistant/CosmicCopilot";
import { useGuidedTour } from "../hooks/useGuidedTour";
import { useSmoothScroll, useReveal, useScrollVars } from "../lib/hooks";
import { getJourneyReturnState, clearJourneyReturnState } from "../lib/journeyState";

const CHAPTER_IDS = ["home", "explorer", "time-machine", "labs", "mission"];

export const JourneyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize smooth scrolling and reveal systems
  useSmoothScroll();
  useReveal();
  useScrollVars("journey");

  const [activeChapter, setActiveChapter] = useState<string>("home");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { startTour } = useGuidedTour();

  // Scroll smoothly to a specific chapter
  const scrollToChapter = (chapterId: string) => {
    const el = document.getElementById(chapterId);
    if (!el) return;

    setActiveChapter(chapterId);

    // Update URL hash passively without polluting history
    const newHash = `#${chapterId}`;
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, "", newHash);
    }

    if (window.__lenis) {
      window.__lenis.scrollTo(el, { offset: -70, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Restore previous scroll position or handle deep hash on mount
  useEffect(() => {
    const savedState = getJourneyReturnState();
    const hash = location.hash.replace("#", "").toLowerCase();

    const restoreTarget = location.state?.targetChapter || savedState?.originChapter || (hash && CHAPTER_IDS.includes(hash) ? hash : null);
    const targetScrollY = location.state?.targetScrollY ?? savedState?.scrollY;

    if (restoreTarget && restoreTarget !== "home") {
      setActiveChapter(restoreTarget);

      const restore = () => {
        if (targetScrollY && targetScrollY > 100) {
          if (window.__lenis) {
            window.__lenis.scrollTo(targetScrollY, { immediate: true });
          } else {
            window.scrollTo(0, targetScrollY);
          }
        } else {
          const el = document.getElementById(restoreTarget);
          if (el) {
            if (window.__lenis) {
              window.__lenis.scrollTo(el, { immediate: true, offset: -70 });
            } else {
              el.scrollIntoView({ behavior: "auto" });
            }
          }
        }
      };

      // Attempt restore immediately and after a tick to ensure full hydration
      restore();
      const timer = setTimeout(restore, 120);
      clearJourneyReturnState();
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Global hotkey: Ctrl+K or Cmd+K for Command Palette
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

  // Passive active-chapter tracking via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id && CHAPTER_IDS.includes(id)) {
              setActiveChapter(id);
              // Update URL hash passively without full reload
              const newHash = `#${id}`;
              if (window.location.hash !== newHash) {
                window.history.replaceState(null, "", newHash);
              }
            }
          }
        });
      },
      {
        rootMargin: "-25% 0px -55% 0px", // Trigger when chapter is in focal center of viewport
        threshold: 0,
      }
    );

    CHAPTER_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="journey-app min-h-screen bg-black text-[#f3efe8] relative flex flex-col selection:bg-[#f4a272] selection:text-black">
      {/* 1. Persistent Cosmic Background (Backdrop & Parallax Starfield with Warp) */}
      <Backdrop activeSection={activeChapter} />
      <Starfield />

      {/* 2. Persistent Top Navigation Header (Exact 5 Chapters) */}
      <Navbar
        activeSection={activeChapter}
        onNavigate={scrollToChapter}
        onStartTour={() => startTour("getting-started")}
      />

      {/* 3. Right-Side Chapter Progress Navigator (HOME 01, EXPLORE 02, TIME 03, LABS 04, MISSION 05) */}
      <ChapterNavigator
        activeChapter={activeChapter}
        onSelectChapter={scrollToChapter}
      />

      {/* 4. Continuous Storytelling Journey */}
      <main className="flex-1 w-full relative z-10 flex flex-col">
        {/* Chapter 01 — Home: Meet SPHEREx */}
        <ChapterHome onScrollToExplorer={() => scrollToChapter("explorer")} />

        {/* Chapter 02 — Explorer: See Beyond the Visible */}
        <ChapterExplorer />

        {/* Signature Spacetime Continuum Transition Bridge */}
        <TimeWarpTransition />

        {/* Chapter 03 — Time Machine: Travel Through the Changing Sky */}
        <ChapterTimeMachine />

        {/* Chapter 04 — Labs: The Science of Discovery */}
        <ChapterLabs />

        {/* Chapter 05 — Mission: Your Discovery Begins */}
        <ChapterMission onScrollToTop={() => scrollToChapter("home")} />
      </main>

      {/* 5. Global Quick Command Palette (Ctrl+K / ⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* 6. Global Interactive Cosmic Copilot & Guide */}
      <CosmicCopilot />
    </div>
  );
};

export default JourneyPage;