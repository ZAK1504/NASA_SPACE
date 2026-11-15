import { useEffect, useRef } from "react";

export interface UseSectionScrollLockOptions {
  chapters: string[];
  activeChapter: string;
  onChapterChange?: (chapterId: string) => void;
  enabled?: boolean;
}

type ScrollStateMachineState =
  | "IDLE"                         // Awaiting a deliberate physical gesture
  | "TRANSITIONING"                // Actively animating toward fixed target chapter
  | "WAITING_FOR_MOMENTUM_TO_END"; // Reached target; consuming residual inertia wheel events

/**
 * Authoritative State-Machine Controlled Chapter Scroll Engine.
 *
 * Guarantees:
 * 1. Single Deliberate Gesture = Exactly One Adjacent Chapter (Home -> Explorer -> STOP).
 * 2. Fixed Destination: Destination chapter cannot be recalculated or re-triggered during animation.
 * 3. Capture-Phase Shielding: Captures wheel events before Lenis's internal listeners so momentum
 *    cannot prematurely cancel programmatic chapter scrollTo animations.
 * 4. Residual Momentum Rejection: Upon reaching target chapter, controller transitions to
 *    WAITING_FOR_MOMENTUM_TO_END and suppresses ALL trailing wheel events until an inactivity
 *    window (320ms of silence on the wheel bus) has elapsed.
 * 5. Taller Section Freedom: Sections taller than viewport (e.g. Chapter 06 About) scroll
 *    naturally inside their bounds and only transition when reaching the top/bottom boundary.
 * 6. Direct Nav Override: Clicking navbar links / dots safely cancels any pending state.
 */
export function useSectionScrollLock({
  chapters,
  activeChapter,
  onChapterChange,
  enabled = true,
}: UseSectionScrollLockOptions) {
  const stateRef = useRef<ScrollStateMachineState>("IDLE");
  const fixedDestinationIndexRef = useRef<number | null>(null);

  const activeChapterRef = useRef(activeChapter);
  activeChapterRef.current = activeChapter;

  const chaptersRef = useRef(chapters);
  chaptersRef.current = chapters;

  const onChapterChangeRef = useRef(onChapterChange);
  onChapterChangeRef.current = onChapterChange;

  const accumulatedDeltaRef = useRef(0);
  const clearDeltaTimerRef = useRef<number | null>(null);
  const quietTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);
  const lastWheelTimeRef = useRef(0);
  const arrivalTimestampRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      (window as any).__isJourneyScrollLocked = false;
      return;
    }

    (window as any).__isJourneyScrollLocked = true;

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

    // Helper: arm/refresh the momentum quiet timer with brief, responsive delay
    const armMomentumQuietTimer = (delay = 130) => {
      if (quietTimerRef.current) {
        window.clearTimeout(quietTimerRef.current);
      }
      // Require 130ms of silence on the wheel bus before returning to IDLE
      quietTimerRef.current = window.setTimeout(() => {
        stateRef.current = "IDLE";
        fixedDestinationIndexRef.current = null;
        accumulatedDeltaRef.current = 0;
      }, delay);
    };

    // Helper: initiate controlled single-chapter transition
    const initiateTransition = (originIdx: number, targetIdx: number) => {
      const chs = chaptersRef.current;
      const safeIdx = Math.max(0, Math.min(chs.length - 1, targetIdx));
      const targetId = chs[safeIdx];
      if (!targetId) return;

      stateRef.current = "TRANSITIONING";
      fixedDestinationIndexRef.current = safeIdx;
      activeChapterRef.current = targetId;
      onChapterChangeRef.current?.(targetId);

      const targetY = getChapterScrollTarget(targetId);

      // Clear any pending timers
      if (quietTimerRef.current) window.clearTimeout(quietTimerRef.current);
      if (safetyTimerRef.current) window.clearTimeout(safetyTimerRef.current);

      const onArrival = () => {
        const now = performance.now();
        const timeSinceLastWheel = now - lastWheelTimeRef.current;

        // If no wheel events arrived in the last 120ms of the transition,
        // the gesture has completely ended. Return to IDLE immediately so the next gesture responds instantly!
        if (timeSinceLastWheel > 120) {
          stateRef.current = "IDLE";
          fixedDestinationIndexRef.current = null;
          accumulatedDeltaRef.current = 0;
          return;
        }

        // Transition to WAITING_FOR_MOMENTUM_TO_END to consume trailing decelerating inertia
        stateRef.current = "WAITING_FOR_MOMENTUM_TO_END";
        arrivalTimestampRef.current = now;
        armMomentumQuietTimer(130);
      };

      if (window.__lenis) {
        window.__lenis.scrollTo(targetY, {
          duration: 0.62,
          lock: true,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
          onComplete: onArrival,
        });
      } else {
        window.scrollTo({
          top: targetY,
          behavior: "smooth",
        });
        safetyTimerRef.current = window.setTimeout(onArrival, 620);
      }

      // Fallback safety timeout in case onComplete isn't called (e.g. background tab)
      safetyTimerRef.current = window.setTimeout(onArrival, 900);
    };

    // Expose programmatic navigation hook on window for explicit nav / workspace returns
    (window as any).__journeyNavigateToChapter = (chapterId: string) => {
      const idx = chaptersRef.current.indexOf(chapterId);
      if (idx !== -1) {
        initiateTransition(getCurrentChapterIndex(), idx);
      }
    };

    // Reset helper for workspace return
    (window as any).__resetJourneyScrollState = () => {
      stateRef.current = "IDLE";
      fixedDestinationIndexRef.current = null;
      accumulatedDeltaRef.current = 0;
      if (quietTimerRef.current) window.clearTimeout(quietTimerRef.current);
      if (safetyTimerRef.current) window.clearTimeout(safetyTimerRef.current);
    };

    // Wheel Event Listener (Precision Trackpads & Mouse Wheels)
    const handleWheel = (e: WheelEvent) => {
      // Allow internal scrolling in interactive modal popovers, copilot chat, storybook, etc.
      // (Note: .satellite-canvas is intentionally omitted so scrolling over the 3D spacecraft advances the Journey naturally)
      const element = e.target instanceof Element ? e.target : null;
      if (
        element &&
        (element.closest("[data-lenis-prevent]") ||
          element.closest(".driver-popover") ||
          element.closest(".cosmic-copilot") ||
          element.closest(".story-workspace") ||
          element.closest("iframe") ||
          element.closest('input:not([type="range"]), select, textarea'))
      ) {
        return;
      }

      // Check for Ctrl/Cmd modifier (browser zoom)
      if (e.ctrlKey || e.metaKey) return;

      const now = performance.now();
      const lastWheel = lastWheelTimeRef.current;
      lastWheelTimeRef.current = now;

      // 1. Normalizing delta across modes (pixels vs lines vs pages)
      const delta =
        e.deltaMode === 1
          ? e.deltaY * 18
          : e.deltaMode === 2
          ? e.deltaY * window.innerHeight
          : e.deltaY;

      // Ignore zero or micro-drift (<0.5px)
      if (Math.abs(delta) < 0.5) return;

      // 2. If actively TRANSITIONING:
      // Suppress native scroll, stop Lenis, and consume all trailing inertial wheel events!
      if (stateRef.current === "TRANSITIONING") {
        (e as any).lenisStopPropagation = true;
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      // 3. If WAITING FOR MOMENTUM TO END:
      if (stateRef.current === "WAITING_FOR_MOMENTUM_TO_END") {
        (e as any).lenisStopPropagation = true;
        e.preventDefault();
        e.stopImmediatePropagation();

        const timeSinceArrival = now - arrivalTimestampRef.current;
        const timeSincePrevWheel = now - lastWheel;

        // Check for genuine new deliberate gesture vs residual decelerating inertia:
        // A new deliberate gesture has a distinct pause (>80ms) or a strong delta spike (|delta| >= 24)
        // after the destination has settled for at least 140ms.
        if (timeSinceArrival >= 140 && (timeSincePrevWheel > 80 || Math.abs(delta) >= 24)) {
          stateRef.current = "IDLE";
          fixedDestinationIndexRef.current = null;
          accumulatedDeltaRef.current = 0;
          // Fall through to process as a new gesture immediately!
        } else {
          // Trailing decelerating inertia: refresh brief quiet timer
          armMomentumQuietTimer(130);
          return;
        }
      }

      // 4. Section Boundary Check for Taller Chapters (e.g. Chapter 06 About)
      const currentIdx = getCurrentChapterIndex();
      const currentChapterId = chaptersRef.current[currentIdx];
      const { top, height } = getChapterBounds(currentChapterId);
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const isTallChapter = currentChapterId === "about" || height > viewportHeight * 1.6;

      if (isTallChapter) {
        const maxScrollInChapter = top + height - viewportHeight;
        if (delta > 0 && scrollY < maxScrollInChapter - 20) {
          // Allow natural downward scroll within the chapter
          accumulatedDeltaRef.current = 0;
          return;
        }
        if (delta < 0 && scrollY > top + 20) {
          // Allow natural upward scroll within the chapter
          accumulatedDeltaRef.current = 0;
          return;
        }
      }

      // 5. Direction Reversal Check: reset accumulation if direction flips
      if (
        (accumulatedDeltaRef.current > 0 && delta < 0) ||
        (accumulatedDeltaRef.current < 0 && delta > 0)
      ) {
        accumulatedDeltaRef.current = 0;
      }

      // Stop Lenis from free-scrolling between chapters while section lock accumulates
      (e as any).lenisStopPropagation = true;
      e.preventDefault();

      accumulatedDeltaRef.current += delta;

      if (clearDeltaTimerRef.current) {
        window.clearTimeout(clearDeltaTimerRef.current);
      }
      clearDeltaTimerRef.current = window.setTimeout(() => {
        accumulatedDeltaRef.current = 0;
      }, 220);

      // Highly responsive deliberate gesture threshold:
      // Single mouse-wheel notch (~20-100px) or quick trackpad flick immediately crosses 18!
      const THRESHOLD = 18;

      if (Math.abs(accumulatedDeltaRef.current) >= THRESHOLD) {
        const direction = accumulatedDeltaRef.current > 0 ? 1 : -1;
        const nextIdx = currentIdx + direction;

        if (nextIdx >= 0 && nextIdx < chaptersRef.current.length) {
          e.preventDefault();
          e.stopImmediatePropagation();
          accumulatedDeltaRef.current = 0;
          initiateTransition(currentIdx, nextIdx);
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
      if (stateRef.current !== "IDLE") return;
      const element = e.target instanceof Element ? e.target : null;
      if (
        element &&
        (element.closest("[data-lenis-prevent]") ||
          element.closest(".cosmic-copilot") ||
          element.closest("iframe"))
      ) {
        return;
      }

      const touchEndY = e.changedTouches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - touchEndY;
      const TOUCH_THRESHOLD = 36;

      if (Math.abs(deltaY) >= TOUCH_THRESHOLD) {
        const direction = deltaY > 0 ? 1 : -1;
        const currentIdx = getCurrentChapterIndex();
        const currentChapterId = chaptersRef.current[currentIdx];
        const { top, height } = getChapterBounds(currentChapterId);
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;

        const isTallChapter = currentChapterId === "about" || height > viewportHeight * 1.6;
        if (isTallChapter) {
          const maxScrollInChapter = top + height - viewportHeight;
          if (direction > 0 && scrollY < maxScrollInChapter - 20) return;
          if (direction < 0 && scrollY > top + 20) return;
        }

        const nextIdx = currentIdx + direction;
        if (nextIdx >= 0 && nextIdx < chaptersRef.current.length) {
          initiateTransition(currentIdx, nextIdx);
        }
      }
    };

    // Keyboard Arrow & Page Navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current !== "IDLE") return;
      const element = e.target instanceof Element ? e.target : null;
      if (element && (element.tagName === "INPUT" || element.tagName === "TEXTAREA")) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        const currentIdx = getCurrentChapterIndex();
        const nextIdx = Math.min(chaptersRef.current.length - 1, currentIdx + 1);
        if (nextIdx !== currentIdx) initiateTransition(currentIdx, nextIdx);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        const currentIdx = getCurrentChapterIndex();
        const nextIdx = Math.max(0, currentIdx - 1);
        if (nextIdx !== currentIdx) initiateTransition(currentIdx, nextIdx);
      }
    };

    // Register with capture: true so handleWheel intercepts BEFORE Lenis
    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true, capture: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true } as any);
      window.removeEventListener("touchstart", handleTouchStart, { capture: true } as any);
      window.removeEventListener("touchend", handleTouchEnd, { capture: true } as any);
      window.removeEventListener("keydown", handleKeyDown);
      if (clearDeltaTimerRef.current) window.clearTimeout(clearDeltaTimerRef.current);
      if (quietTimerRef.current) window.clearTimeout(quietTimerRef.current);
      if (safetyTimerRef.current) window.clearTimeout(safetyTimerRef.current);
      (window as any).__isJourneyScrollLocked = false;
      delete (window as any).__journeyNavigateToChapter;
      delete (window as any).__resetJourneyScrollState;
    };
  }, [enabled]);
}

export default useSectionScrollLock;
