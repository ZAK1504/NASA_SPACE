import Lenis from "lenis";
import { useEffect, useRef, useState, RefObject } from "react";

export function useNow(ms = 1000): Date {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/** Adds .in to every .rv element when it scrolls into view, with instant progressive-enhancement fallbacks. */
export function useReveal(dep?: any, delay = 60) {
  useEffect(() => {
    // Flag that JS reveal system is active
    document.documentElement.classList.add("js-reveal");

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Immediately reveal all elements if reduced motion is requested
    if (prefersReducedMotion) {
      document.querySelectorAll(".rv").forEach((el) => el.classList.add("in"));
      return;
    }

    // Immediate check on mount for any element currently or near in viewport
    const checkImmediate = () => {
      const vh = window.innerHeight;
      document.querySelectorAll(".rv:not(.in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh + 100 && r.bottom > -50) {
          el.classList.add("in");
        }
      });
    };

    checkImmediate();

    let io: IntersectionObserver | undefined;
    const t = setTimeout(() => {
      checkImmediate();
      io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io?.unobserve(e.target);
            }
          }),
        { threshold: 0.05, rootMargin: "0px 0px 100px 0px" }
      );
      document.querySelectorAll(".rv:not(.in)").forEach((el) => io?.observe(el));
    }, delay);

    return () => {
      clearTimeout(t);
      if (io) io.disconnect();
    };
  }, [dep, delay]);
}

/** Counts up to `to` once the element is on screen. */
export function useCountUp(
  to: number,
  { dur = 1400, decimals = 0 }: { dur?: number; decimals?: number } = {}
): [RefObject<HTMLDivElement | null>, string] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [v, setV] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If reduced motion is requested, display target immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(to);
      return;
    }

    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (t: number) => {
          const k = Math.min(1, (t - t0) / dur);
          setV(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.1, rootMargin: "0px 0px 50px 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, dur]);

  return [ref, v.toFixed(decimals)];
}

/** Scroll progress 0..1 written to --p on <html>; elements with [data-par] get --py for parallax; --hero-scroll for hero choreography.
 *  Also writes --chapter-progress-{id} for each chapter section (home, explorer, time-machine, labs, mission). */
export function useScrollVars(dep?: any) {
  useEffect(() => {
    const CHAPTER_IDS = ["home", "explorer", "time-machine", "labs", "mission"];
    let raf = 0;
    const run = () => {
      raf = 0;
      const y = window.scrollY,
        h = window.innerHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - h);
      document.documentElement.style.setProperty("--p", (y / max).toFixed(4));

      // Local hero scroll progress [0..1] over the first viewport height
      const heroP = Math.min(1, Math.max(0, y / Math.max(1, h * 0.85)));
      document.documentElement.style.setProperty("--hero-scroll", heroP.toFixed(3));
      document.documentElement.style.setProperty("--hero-opacity", Math.max(0, 1 - heroP * 1.35).toFixed(3));

      document.querySelectorAll<HTMLElement>("[data-par]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const c = r.top + r.height / 2 - h / 2;
        el.style.setProperty("--py", `${(-c * parseFloat(el.dataset.par || "0")).toFixed(1)}px`);
      });

      // Per-chapter progress vars: 0 when section top is at viewport bottom, 1 when section bottom is at viewport top
      CHAPTER_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (h - rect.top) / (rect.height + h)));
        document.documentElement.style.setProperty(`--chapter-progress-${id}`, p.toFixed(4));
      });
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, [dep]);
}

/** Returns normalized scroll progress 0..1 for a DOM section. Ref-based, no rerender. */
export function useSectionProgress(
  id: string,
  onChange: (progress: number) => void
) {
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const h = window.innerHeight;
      // 0 when top of section at bottom of viewport, 1 when bottom of section at top
      const p = Math.max(0, Math.min(1, (h - rect.top) / (rect.height + h)));
      onChange(p);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      cancelAnimationFrame(raf);
    };
  }, [id, onChange]);
}

declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}

/**
 * Inertial smooth scrolling (Lenis) — wheel / trackpad only, touch stays native.
 * Restricts to homepage and non-scientific surfaces to avoid interfering with Aladin Lite / map zoom.
 */
export function useSmoothScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      autoRaf: false,
      prevent: (node: HTMLElement) => {
        if ((window as any).__isJourneyScrollLocked) return true;
        return (
          node.closest('.aladin-container') !== null ||
          node.closest('.aladin-box') !== null ||
          node.closest('[data-lenis-prevent]') !== null ||
          node.closest('.sky-map') !== null ||
          node.tagName === 'INPUT' ||
          node.tagName === 'SELECT' ||
          node.tagName === 'TEXTAREA'
        );
      },
    });
    window.__lenis = lenis;

    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [enabled]);
}
