import { useEffect, useRef } from "react";

export interface UseSectionScrollLockOptions {
  chapters: string[];
  activeChapter: string;
  onChapterChange?: (chapterId: string) => void;
  enabled?: boolean;
}

/**
 * High-Precision Section Scroll Lock (Snap-to-Chapter Engine).
 * When the user scrolls even slightly towards another chapter, the engine intercepts the gesture
 * and smoothly drives the scroll to center/snap the full target chapter page into the viewport,
 * providing the exact "scroll lock where full page comes" storytelling experience.
 */
export function useSectionScrollLock({
  chapters,
  activeChapter,
  onChapterChange,
  enabled = true,
}: UseSectionScrollLockOptions) {
  const isLockedRef = useRef(false);
  const activeChapterRef = useRef(activeChapter);
  activeChapterRef.current = activeChapter;

  const chaptersRef = useRef(chapters);
  chaptersRef.current = chapters;

  const accumulatedDeltaRef = useRef(0);
  const clearDeltaTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Helper: calculate absolute document offset for each chapter
    const getChapterScrollTarget = (chapterId: string): number => {
      if (chapterId === "home") return 0;
      const el = document.getElementById(chapterId);
      if (!el) return 0;
      return Math.max(0, el.offsetTop - 70);
    };

    // Helper: navigate to chapter with Lenis or native smooth scroll
    const scrollToChapterIndex = (targetIdx: number) => {
      const targetId = chaptersRef.current[targetIdx];
      if (!targetId) return;

      isLockedRef.current = true;
      activeChapterRef.current = targetId;
      onChapterChange?.(targetId);

      const el = document.getElementById(targetId);
      if (el) {
        if (window.__lenis) {
          window.__lenis.scrollTo(el, {
            offset: -70,
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        } else {
          const targetY = targetId === "home" ? 0 : Math.max(0, el.offsetTop - 70);
          window.scrollTo({
            top: targetY,
            behavior: "smooth",
          });
        }
      }

      // Keep locked for the duration of the transition to prevent multi-skipping
      setTimeout(() => {
        isLockedRef.current = false;
        accumulatedDeltaRef.current = 0;
      }, 1050);
    };

    // Helper: find current chapter index based on active chapter or scroll position
    const getCurrentChapterIndex = (): number => {
      const chs = chaptersRef.current;
      const namedIdx = chs.indexOf(activeChapterRef.current);
      if (namedIdx >= 0) {
        return namedIdx;
      }

      const scrollY = window.scrollY;
      let closestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < chs.length; i++) {
        const targetY = getChapterScrollTarget(chs[i]);
        const dist = Math.abs(scrollY - targetY);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }
      return closestIdx;
    };

    // 1. Wheel Event Listener (Desktop Mouse Wheel & Trackpad)
    const handleWheel = (e: WheelEvent) => {
      // Allow native scrolling inside interactive widgets, canvas, or tour popovers
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("[data-lenis-prevent]") ||
          target.closest(".satellite-canvas") ||
          target.closest(".driver-popover") ||
          target.closest(".cosmic-copilot") ||
          target.closest("input, select, textarea"))
      ) {
        return;
      }

      // If already transitioning, prevent native scroll fighting
      if (isLockedRef.current) {
        e.preventDefault();
        return;
      }

      // Accumulate wheel delta (supports subtle trackpad scrolls and discrete mouse wheel notches)
      accumulatedDeltaRef.current += e.deltaY;

      if (clearDeltaTimerRef.current) {
        window.clearTimeout(clearDeltaTimerRef.current);
      }
      clearDeltaTimerRef.current = window.setTimeout(() => {
        accumulatedDeltaRef.current = 0;
      }, 180);

      // Trigger threshold: "if I scroll a bit to other page the full page comes"
      const THRESHOLD = 24;

      if (Math.abs(accumulatedDeltaRef.current) >= THRESHOLD) {
        const dir = accumulatedDeltaRef.current > 0 ? 1 : -1;
        const currentIdx = getCurrentChapterIndex();
        const nextIdx = Math.max(0, Math.min(chaptersRef.current.length - 1, currentIdx + dir));

        if (nextIdx !== currentIdx) {
          e.preventDefault();
          scrollToChapterIndex(nextIdx);
        }
      }
    };

    // 2. Touch Gesture Listener (Mobile & Tablet Swipes)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isLockedRef.current) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("[data-lenis-prevent]") ||
          target.closest(".satellite-canvas") ||
          target.closest(".cosmic-copilot"))
      ) {
        return;
      }

      const touchEndY = e.changedTouches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - touchEndY;
      const TOUCH_THRESHOLD = 38;

      if (Math.abs(deltaY) >= TOUCH_THRESHOLD) {
        const dir = deltaY > 0 ? 1 : -1;
        const currentIdx = getCurrentChapterIndex();
        const nextIdx = Math.max(0, Math.min(chaptersRef.current.length - 1, currentIdx + dir));

        if (nextIdx !== currentIdx) {
          scrollToChapterIndex(nextIdx);
        }
      }
    };

    // 3. Keyboard Arrow & Page Navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLockedRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        const currentIdx = getCurrentChapterIndex();
        const nextIdx = Math.min(chaptersRef.current.length - 1, currentIdx + 1);
        if (nextIdx !== currentIdx) scrollToChapterIndex(nextIdx);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        const currentIdx = getCurrentChapterIndex();
        const nextIdx = Math.max(0, currentIdx - 1);
        if (nextIdx !== currentIdx) scrollToChapterIndex(nextIdx);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      if (clearDeltaTimerRef.current) {
        window.clearTimeout(clearDeltaTimerRef.current);
      }
    };
  }, [enabled, onChapterChange]);
}

export default useSectionScrollLock;
