import { useEffect, useRef } from "react";

export interface UseSectionScrollLockOptions {
  chapters: string[];
  activeChapter: string;
  onChapterChange?: (chapterId: string) => void;
  enabled?: boolean;
}

/**
 * Intelligent Section Scroll Lock Engine with Halfway Auto-Scroll.
 * 1. If user scrolls a bit, it smoothly drives to the next/prev full chapter page.
 * 2. If the user stops halfway between chapters (>= 45%), it automatically scrolls down to lock the next chapter in view.
 * 3. Eliminates intermediate drift so every page rests centrally locked and completely in view.
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
  const scrollSettleTimerRef = useRef<number | null>(null);

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
            duration: 1.15,
            lock: true,
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

      // Unlock after the transition completes smoothly
      setTimeout(() => {
        isLockedRef.current = false;
        accumulatedDeltaRef.current = 0;
      }, 1050);
    };

    // Helper: get current chapter index from actual scroll position
    const getCurrentChapterIndex = (): number => {
      const chs = chaptersRef.current;
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

    // 1. Halfway Auto-Scroll Detection on Scroll Settle:
    // If user opens halfway to the next page, automatically scroll down to complete the page arrival!
    const handleScrollSettle = () => {
      if (isLockedRef.current) return;

      const scrollY = window.scrollY;
      const chs = chaptersRef.current;
      const targets = chs.map((id) => getChapterScrollTarget(id));

      // Find the pair of chapters [i, i+1] current scroll is between
      for (let i = 0; i < targets.length - 1; i++) {
        const yTop = targets[i];
        const yBottom = targets[i + 1];

        if (scrollY > yTop + 10 && scrollY < yBottom - 10) {
          const span = yBottom - yTop;
          const progress = (scrollY - yTop) / span;

          // If opened halfway (>= 45%), automatically scroll DOWN to lock the next chapter!
          if (progress >= 0.45) {
            scrollToChapterIndex(i + 1);
          } else {
            // If less than halfway, snap back to lock current chapter
            scrollToChapterIndex(i);
          }
          break;
        }
      }
    };

    const onScroll = () => {
      if (isLockedRef.current) return;
      if (scrollSettleTimerRef.current) {
        window.clearTimeout(scrollSettleTimerRef.current);
      }
      scrollSettleTimerRef.current = window.setTimeout(handleScrollSettle, 110);
    };

    // 2. Wheel Event Listener (Mouse Wheel & Trackpad)
    const handleWheel = (e: WheelEvent) => {
      // Allow native scrolling inside interactive canvas, tour popovers, or copilot chat
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("[data-lenis-prevent]") ||
          target.closest(".satellite-canvas") ||
          target.closest(".driver-popover") ||
          target.closest(".cosmic-copilot") ||
          target.closest('input:not([type="range"]), select, textarea'))
      ) {
        return;
      }

      if (isLockedRef.current) {
        e.preventDefault();
        return;
      }

      accumulatedDeltaRef.current += e.deltaY;

      if (clearDeltaTimerRef.current) {
        window.clearTimeout(clearDeltaTimerRef.current);
      }
      clearDeltaTimerRef.current = window.setTimeout(() => {
        accumulatedDeltaRef.current = 0;
      }, 160);

      // Trigger threshold: subtle wheel flick or notch initiates smooth page lock
      const THRESHOLD = 20;

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

    // 3. Touch Gesture Listener (Mobile & Tablet Swipes)
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
      const TOUCH_THRESHOLD = 32;

      if (Math.abs(deltaY) >= TOUCH_THRESHOLD) {
        const dir = deltaY > 0 ? 1 : -1;
        const currentIdx = getCurrentChapterIndex();
        const nextIdx = Math.max(0, Math.min(chaptersRef.current.length - 1, currentIdx + dir));

        if (nextIdx !== currentIdx) {
          scrollToChapterIndex(nextIdx);
        }
      }
    };

    // 4. Keyboard Arrow & Page Navigation
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

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
      if (clearDeltaTimerRef.current) window.clearTimeout(clearDeltaTimerRef.current);
      if (scrollSettleTimerRef.current) window.clearTimeout(scrollSettleTimerRef.current);
    };
  }, [enabled, onChapterChange]);
}

export default useSectionScrollLock;
