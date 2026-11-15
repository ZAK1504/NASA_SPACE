import React, { useState, useEffect, useLayoutEffect } from "react";
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
import { CommandPalette } from "../components/navigation/CommandPalette";
import { CosmicCopilot } from "../components/assistant/CosmicCopilot";
import { useGuidedTour } from "../hooks/useGuidedTour";
import { useSmoothScroll, useReveal, useScrollVars } from "../lib/hooks";
import { useSectionScrollLock } from "../hooks/useSectionScrollLock";
import { getJourneyReturnState, clearJourneyReturnState } from "../lib/journeyState";

declare global {
  interface Window {
    __horizonWarpFactor?: number;
  }
}

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

  // High-Precision Section Scroll Lock Engine ("scroll a bit to other page, full page comes")
  useSectionScrollLock({
    chapters: CHAPTER_IDS,
    activeChapter,
    onChapterChange: (chapterId) => {
      setActiveChapter(chapterId);
      const newHash = `#${chapterId}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, "", newHash);
      }
    },
    enabled: true,
  });

  // Authoritative synchronous scroll restoration: runs BEFORE browser paint to prevent any visible scroll jumps
  useLayoutEffect(() => {
    const savedState = getJourneyReturnState();
    const hash = location.hash.replace("#", "").toLowerCase();

    const restoreTarget = location.state?.targetChapter || savedState?.originChapter || (hash && CHAPTER_IDS.includes(hash) ? hash : null);
    const targetScrollY = location.state?.targetScrollY ?? savedState?.scrollY;

    if (restoreTarget) {
      setActiveChapter(restoreTarget);

      let finalScroll = 0;
      if (targetScrollY && targetScrollY > 0) {
        finalScroll = targetScrollY;
      } else if (restoreTarget !== "home") {
        const el = document.getElementById(restoreTarget);
        if (el) {
          finalScroll = Math.max(0, el.offsetTop - 70);
        }
      }

      if (finalScroll > 0) {
        window.scrollTo({ top: finalScroll, left: 0, behavior: "instant" });
        document.documentElement.scrollTop = finalScroll;
        document.body.scrollTop = finalScroll;
        if (window.__lenis) {
          window.__lenis.scrollTo(finalScroll, { immediate: true });
        }
      }
    }
  }, [location.pathname, location.hash]);

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

  // Warp coordination: smoothly accelerate stars during the transition from Explorer to Time Machine
  // Peaks as Explorer leaves the viewport and Time Machine emerges, settling to zero once centered
  useEffect(() => {
    let raf = 0;
    let expBottomOffset = 0;
    let tmTopOffset = 0;

    const measureWarpOffsets = () => {
      const expEl = document.getElementById("explorer");
      const tmEl = document.getElementById("time-machine");
      if (expEl && tmEl) {
        expBottomOffset = expEl.offsetTop + expEl.offsetHeight;
        tmTopOffset = tmEl.offsetTop;
      }
    };
    measureWarpOffsets();

    const update = () => {
      raf = 0;
      const h = window.innerHeight;
      const scrollY = window.scrollY;

      if (expBottomOffset > 0 && tmTopOffset > 0) {
        const expBottom = expBottomOffset - scrollY;
        const tmTop = tmTopOffset - scrollY;

        // Active warp zone: bottom of explorer is between 85% viewport and scrolled off,
        // while time-machine top is between bottom of screen and centering (h * 0.1)
        if (expBottom < h * 0.85 && tmTop > h * 0.1) {
          const zoneStart = h * 0.85;
          const zoneEnd = h * 0.1;
          const progress = Math.max(0, Math.min(1, (zoneStart - tmTop) / (zoneStart - zoneEnd)));
          // Smooth sine bell curve (0 -> 1 -> 0)
          const warp = Math.sin(progress * Math.PI);
          window.__horizonWarpFactor = warp;
          return;
        }
      }

      window.__horizonWarpFactor = 0;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onResize = () => {
      measureWarpOffsets();
      on();
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      window.__horizonWarpFactor = 0;
    };
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
    <div className="journey-app min-h-screen bg-black text-[#f3efe8] relative flex flex-col selection:bg-[#f4a272] selection:text-black overflow-x-hidden">
      {/* 1. Persistent Cosmic Background (Backdrop & Parallax Starfield with Warp) */}
      <Backdrop activeSection={activeChapter} />
      <Starfield />

      {/* 2. Persistent Top Navigation Header (Exact 5 Chapters) */}
      <Navbar
        activeSection={activeChapter}
        onNavigate={scrollToChapter}
        onStartTour={() => startTour("getting-started", true)}
      />

      {/* 3. Right-Side Chapter Progress Navigator (HOME 01, EXPLORE 02, TIME 03, LABS 04, MISSION 05) */}
      <ChapterNavigator
        activeChapter={activeChapter}
        onSelectChapter={scrollToChapter}
      />

      {/* 4. Continuous Storytelling Journey (Zero Separators — Seamless Flow) */}
      <main className="flex-1 w-full relative z-10 flex flex-col">
        {/* Chapter 01 — Home: Meet SPHEREx */}
        <ChapterHome onScrollToExplorer={() => scrollToChapter("explorer")} />

        {/* Chapter 02 — Explorer: See Beyond the Visible */}
        <ChapterExplorer onScrollToNext={() => scrollToChapter("time-machine")} />

        {/* Chapter 03 — Time Machine: Travel Through the Changing Sky */}
        <ChapterTimeMachine onScrollToNext={() => scrollToChapter("labs")} />

        {/* Chapter 04 — Labs: The Science of Discovery */}
        <ChapterLabs onScrollToNext={() => scrollToChapter("mission")} />

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