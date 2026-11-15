import { useEffect, useRef } from "react";

export interface UseSectionScrollLockOptions {
  chapters: string[];
  activeChapter: string;
  onChapterChange?: (chapterId: string) => void;
  enabled?: boolean;
}

/**
 * Controlled Chapter-by-Chapter Journey Scroll Lock.
 *
 * Requirements:
 * 1. Single deliberate scroll moves strictly to adjacent chapter (no multi-chapter skipping).
 * 2. Momentum / inertia rejection: after initiating transition, ignore residual wheel/trackpad events until quiet.
 * 3. Taller sections (e.g., About) scroll naturally until reaching the boundary before triggering chapter change.
 * 4. No intermediate halfway auto-scroll timers causing uncontrolled skips.
 */
export function useSectionScrollLock({
  chapters,
  activeChapter,
  onChapterChange,
  enabled = true,
}: UseSectionScrollLockOptions) {
  const isTransitioningRef = useRef(false);
  const activeChapterRef = useRef(activeChapter);
  activeChapterRef.current = activeChapter;

  const chaptersRef = useRef(chapters);
  chaptersRef.current = chapters;

  const accumulatedDeltaRef = useRef(0);
  const clearDeltaTimerRef = useRef<number | null>(null);
  const transitionCooldownTimerRef = useRef<number | null>(null);
  const lastWheelTimeRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    // Helper: calculate absolute document offset for each chapter
    const getChapterScrollTarget = (chapterId: string): number => {
      if (chapterId === "home") return 0;
      const el = document.getElementById(chapterId);
      if (!el) return 0;
      return Math.max(0, el.offsetTop - 70);
    };

    // Helper: get bounding info for chapter (top, height, bottom)
    const getChapterBounds = (chapterId: string) => {
      const top = getChapterScrollTarget(chapterId);
      const el = document.getElementById(chapterId);
      const height = el ? el.offsetHeight : window.innerHeight;
      return { top, height, bottom: top + height };
    };

    // Helper: find current chapter based on scroll position
    const getCurrentChapterIndex = (): number => {
      const chs = chaptersRef.current;
      const scrollY = window.scrollY;
      let closestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < chs.length; i++) {
        const { top } = getChapterBounds(chs[i]);
        const dist = Math.abs(scrollY - top);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }
      return closestIdx;
    };

    // Helper: navigate strictly to adjacent chapter
    const transitionToChapter = (targetIdx: number) => {
      const chs = chaptersRef.current;
      const safeIdx = Math.max(0, Math.min(chs.length - 1, targetIdx));
      const targetId = chs[safeIdx];
      if (!targetId) return;

      isTransitioningRef.current = true;
      activeChapterRef.current = targetId;
      onChapterChange?.(targetId);

      const targetY = getChapterScrollTarget(targetId);

      if (window.__lenis) {
        window.__lenis.scrollTo(targetY, {
          duration: 0.85,
          lock: true,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
          onComplete: () => {
            // Keep locked for short post-transition quiet period to consume residual inertia
            if (transitionCooldownTimerRef.current) {
              window.clearTimeout(transitionCooldownTimerRef.current);
            }
            transitionCooldownTimerRef.current = window.setTimeout(() => {
              isTransitioningRef.current = false;
              accumulatedDeltaRef.current = 0;
            }, 250);
          },
        });
      } else {
        window.scrollTo({
          top: targetY,
          behavior: "smooth",
        });
        if (transitionCooldownTimerRef.current) {
          window.clearTimeout(transitionCooldownTimerRef.current);
        }
        transitionCooldownTimerRef.current = window.setTimeout(() => {
          isTransitioningRef.current = false;
          accumulatedDeltaRef.current = 0;
        }, 900);
      }
    };

    // Wheel Event Listener (Precision Trackpads & Mouse Wheels)
    const handleWheel = (e: WheelEvent) => {
      // Allow internal scrolling in interactive canvas, modal popovers, copilot chat, storybook, etc.
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("[data-lenis-prevent]") ||
          target.closest(".satellite-canvas") ||
          target.closest(".driver-popover") ||
          target.closest(".cosmic-copilot") ||
          target.closest(".story-workspace") ||
          target.closest("iframe") ||
          target.closest('input:not([type="range"]), select, textarea'))
      ) {
        return;
      }

      const now = performance.now();
      lastWheelTimeRef.current = now;

      // If already transitioning, consume wheel event to avoid browser native jumping
      if (isTransitioningRef.current) {
        e.preventDefault();
        return;
      }

      // Normalize delta across modes (pixels vs lines vs pages)
      const delta =
        e.deltaMode === 1
          ? e.deltaY * 18
          : e.deltaMode === 2
          ? e.deltaY * window.innerHeight
          : e.deltaY;

      // Accumulate delta
      accumulatedDeltaRef.current += delta;

      if (clearDeltaTimerRef.current) {
        window.clearTimeout(clearDeltaTimerRef.current);
      }
      clearDeltaTimerRef.current = window.setTimeout(() => {
        accumulatedDeltaRef.current = 0;
      }, 180);

      // Threshold to detect deliberate swipe/scroll gesture (reject micro-jitters)
      const WHEEL_THRESHOLD = 50;

      if (Math.abs(accumulatedDeltaRef.current) >= WHEEL_THRESHOLD) {
        const direction = accumulatedDeltaRef.current > 0 ? 1 : -1;
        const currentIdx = getCurrentChapterIndex();
        const currentChapterId = chaptersRef.current[currentIdx];
        const { top, height } = getChapterBounds(currentChapterId);
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;

        // Check if current chapter is taller than viewport (e.g. About or expanded sections)
        const isTallChapter = height > viewportHeight + 40;

        if (isTallChapter) {
          const maxScrollInChapter = top + height - viewportHeight;
          if (direction > 0) {
            // Scrolling down: only advance if user has scrolled to the bottom of the tall chapter
            if (scrollY < maxScrollInChapter - 30) {
              // Allow natural scrolling down inside the chapter
              return;
            }
          } else {
            // Scrolling up: only retreat if user has scrolled back to the top of the tall chapter
            if (scrollY > top + 30) {
              // Allow natural scrolling up inside the chapter
              return;
            }
          }
        }

        const nextIdx = currentIdx + direction;
        if (nextIdx >= 0 && nextIdx < chaptersRef.current.length) {
          e.preventDefault();
          accumulatedDeltaRef.current = 0;
          transitionToChapter(nextIdx);
        }
      }
    };

    // Touch Gesture Listener (Mobile Swipes)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioningRef.current) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("[data-lenis-prevent]") ||
          target.closest(".satellite-canvas") ||
          target.closest(".cosmic-copilot") ||
          target.closest("iframe"))
      ) {
        return;
      }

      const touchEndY = e.changedTouches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - touchEndY;
      const TOUCH_THRESHOLD = 45;

      if (Math.abs(deltaY) >= TOUCH_THRESHOLD) {
        const direction = deltaY > 0 ? 1 : -1;
        const currentIdx = getCurrentChapterIndex();
        const currentChapterId = chaptersRef.current[currentIdx];
        const { top, height } = getChapterBounds(currentChapterId);
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;

        const isTallChapter = height > viewportHeight + 40;
        if (isTallChapter) {
          const maxScrollInChapter = top + height - viewportHeight;
          if (direction > 0 && scrollY < maxScrollInChapter - 30) return;
          if (direction < 0 && scrollY > top + 30) return;
        }

        const nextIdx = currentIdx + direction;
        if (nextIdx >= 0 && nextIdx < chaptersRef.current.length) {
          transitionToChapter(nextIdx);
        }
      }
    };

    // Keyboard Arrow & Page Navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioningRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        const currentIdx = getCurrentChapterIndex();
        const nextIdx = Math.min(chaptersRef.current.length - 1, currentIdx + 1);
        if (nextIdx !== currentIdx) transitionToChapter(nextIdx);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        const currentIdx = getCurrentChapterIndex();
        const nextIdx = Math.max(0, currentIdx - 1);
        if (nextIdx !== currentIdx) transitionToChapter(nextIdx);
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
      if (clearDeltaTimerRef.current) window.clearTimeout(clearDeltaTimerRef.current);
      if (transitionCooldownTimerRef.current) window.clearTimeout(transitionCooldownTimerRef.current);
    };
  }, [enabled, onChapterChange]);
}

export default useSectionScrollLock;
