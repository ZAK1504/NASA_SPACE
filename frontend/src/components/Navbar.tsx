import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PAGES, firstPath, subPath, PageDef, SubPage } from "../types/site";
import { useGo } from "./ui/Transition";
import { Compass, HelpCircle } from "lucide-react";

interface NavbarProps {
  onStartTour?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onStartTour }) => {
  const go = useGo();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  const topSegment = loc.pathname.split("/")[1] || "";

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (to: string, label: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    go(to, label);
  };

  return (
    <>
      <header className={`nav ${solid ? "solid" : ""}`} data-tour="navigation-header">
        <a
          className="brand"
          href="/"
          onClick={handleNav("/", "Home")}
          aria-label="SPHEREx HORIZON home"
        >
          <svg viewBox="-12 -12 24 24" width="22" height="22" aria-hidden="true">
            <circle r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <ellipse
              rx="11"
              ry="3.6"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.2"
              transform="rotate(-24)"
            />
            <circle r="2.2" fill="currentColor" />
          </svg>
          <span className="font-semibold tracking-tight">SPHEREx <span className="text-[var(--accent)] font-light">HORIZON</span></span>
        </a>

        <nav className="links" aria-label="Main navigation">
          {PAGES.map((p: PageDef) => {
            const pageSegment = p.path.split("/")[1] || "";
            const isActive = pageSegment === topSegment || (topSegment === "" && p.id === "home");
            const dataTourAttr =
              p.id === "explorer"
                ? "nav-explore"
                : p.id === "time"
                ? "nav-timemachine"
                : p.id === "lab"
                ? "nav-discovery"
                : undefined;

            return (
              <div
                key={p.id}
                data-tour={dataTourAttr}
                className={`lk ${isActive ? "active" : ""} ${p.subs ? "has-sub" : ""}`}
              >
                <a href={firstPath(p)} onClick={handleNav(firstPath(p), p.label)}>
                  {p.label}
                  {p.subs && <em aria-hidden="true">▾</em>}
                </a>

                {p.subs && (
                  <div className="drop glass">
                    {p.subs.map((s: SubPage, i: number) => {
                      const subDataTour =
                        s.id === "spectral"
                          ? "nav-spectral"
                          : s.id === "sky"
                          ? "nav-sky"
                          : undefined;
                      return (
                        <a
                          key={s.id}
                          data-tour={subDataTour}
                          href={subPath(p, s)}
                          onClick={handleNav(subPath(p, s), `${p.label} · ${s.label}`)}
                        >
                          <span className="mono">0{i + 1}</span>
                          {s.label}
                          <b>↗</b>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[var(--mut)] hover:text-white border border-[var(--line)] hover:border-white/30 transition-colors"
              title="Interactive Platform Tour"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Tour</span>
            </button>
          )}

          <a
            className="cta"
            href="/mission"
            onClick={handleNav("/mission", "Mission")}
          >
            Play mission
          </a>

          <button
            className="burger"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <i />
            <i />
          </button>
        </div>
      </header>

      {/* Mobile drawer sheet */}
      <div className={`sheet ${open ? "open" : ""}`}>
        {PAGES.map((p: PageDef) => (
          <a
            key={p.id}
            href={firstPath(p)}
            onClick={handleNav(firstPath(p), p.label)}
          >
            <span>{p.label}</span>
            <b>↗</b>
          </a>
        ))}
      </div>
    </>
  );
};

export default Navbar;
