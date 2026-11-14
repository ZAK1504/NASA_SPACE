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

/** Adds .in to every .rv element when it scrolls into view. */
export function useReveal(dep?: any, delay = 260) {
  useEffect(() => {
    let io: IntersectionObserver | undefined;
    const t = setTimeout(() => {
      io = new IntersectionObserver(
        (es) => es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io?.unobserve(e.target);
          }
        }),
        { threshold: 0.1, rootMargin: "0px 0px -4% 0px" }
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
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, dur]);

  return [ref, v.toFixed(decimals)];
}

/** Scroll progress 0..1 written to --p on <html>; elements with [data-par] get --py for parallax. */
export function useScrollVars(dep?: any) {
  useEffect(() => {
    let raf = 0;
    const run = () => {
      raf = 0;
      const y = window.scrollY, h = window.innerHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - h);
      document.documentElement.style.setProperty("--p", (y / max).toFixed(4));
      document.querySelectorAll<HTMLElement>("[data-par]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const c = r.top + r.height / 2 - h / 2;
        el.style.setProperty("--py", `${(-c * parseFloat(el.dataset.par || "0")).toFixed(1)}px`);
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
