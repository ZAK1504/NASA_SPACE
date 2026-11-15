import React, { useEffect, useState } from "react";
import { HelpCircle, Compass, Menu, X, Users, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { travelToWorkspace } from "../lib/journeyState";
import BrandWordmark from "./brand/BrandWordmark";

export interface NavDestination {
  id: string;
  label: string;
  targetId: string;
  dataTour?: string;
}

export const NAV_DESTINATIONS: NavDestination[] = [
  { id: "home", label: "Home", targetId: "home", dataTour: "nav-home" },
  { id: "explorer", label: "Explorer", targetId: "explorer", dataTour: "nav-explore" },
  { id: "time-machine", label: "Time Machine", targetId: "time-machine", dataTour: "nav-timemachine" },
  { id: "labs", label: "Labs", targetId: "labs", dataTour: "nav-discovery" },
  { id: "mission", label: "Mission", targetId: "mission", dataTour: "nav-mission" },
  { id: "about", label: "About", targetId: "about", dataTour: "nav-about" },
];

interface NavbarProps {
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
  onStartTour?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection = "home",
  onNavigate,
  onStartTour,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (targetId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);

    if (onNavigate) {
      onNavigate(targetId);
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        const targetY = targetId === "home" ? 0 : Math.max(0, el.offsetTop - 70);
        if (window.__lenis) {
          window.__lenis.scrollTo(targetY, {
            duration: 1.15,
            easing: (t: number) => 1 - Math.pow(1 - t, 3.5),
          });
        } else {
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      } else {
        window.location.href = `/#${targetId}`;
      }
    }
  };

  return (
    <>
      <header className={`nav ${solid ? "solid" : ""}`} data-tour="navigation-header">
        {/* Brand / Logo */}
        <a
          className="brand flex items-center gap-2"
          href="#home"
          onClick={handleNavClick("home")}
          aria-label="sphereXplorer home"
        >
          <BrandWordmark size="md" />
        </a>

        {/* Desktop Persistent Top Navigation (Exact 5 Destinations) */}
        <nav className="links" data-tour="journey-navigation" aria-label="Main continuous navigation">
          {NAV_DESTINATIONS.map((dest) => {
            const isActive = activeSection === dest.id || activeSection === dest.targetId;
            return (
              <div
                key={dest.id}
                data-tour={dest.dataTour}
                className={`lk ${isActive ? "active" : ""}`}
              >
                <a
                  href={`#${dest.targetId}`}
                  onClick={handleNavClick(dest.targetId)}
                  className="transition-colors"
                >
                  {dest.label}
                </a>
              </div>
            );
          })}
        </nav>

        {/* Right CTA & Tour Actions */}
        <div data-tour="journey-ready" className="flex items-center gap-3 ml-auto">
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[var(--mut)] hover:text-white border border-[var(--line)] hover:border-white/30 transition-colors cursor-pointer"
              title="Interactive Platform Tour"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Tour</span>
            </button>
          )}

          {/* Info Book (Far Right) */}
          <button
            onClick={() => travelToWorkspace(navigate, "/story", activeSection)}
            className="cta cursor-pointer flex items-center gap-1.5"
            data-tour="nav-infobook"
            title="Read The Cosmic Chronicle Illustrated Storybook"
          >
            <BookOpen className="w-3.5 h-3.5 text-black" />
            <span>Info Book</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            className="burger"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-black/85 backdrop-blur-xl z-40 md:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: "64px" }}
      >
        <div className="p-6 flex flex-col gap-4">
          <p className="mono tag mb-2">[Continuous Journey]</p>
          {NAV_DESTINATIONS.map((dest, i) => {
            const isActive = activeSection === dest.id;
            return (
              <a
                key={dest.id}
                href={`#${dest.targetId}`}
                onClick={handleNavClick(dest.targetId)}
                className={`flex items-center justify-between p-3 rounded-lg border text-base font-medium transition-all ${
                  isActive
                    ? "bg-white/10 border-[var(--accent)] text-[var(--accent)]"
                    : "border-white/10 text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="mono text-xs text-[var(--mut)]">0{i + 1}</span>
                  <span>{dest.label}</span>
                </div>
                <span>↗</span>
              </a>
            );
          })}

          {onStartTour && (
            <button
              onClick={() => {
                setOpen(false);
                onStartTour();
              }}
              className="mt-4 flex items-center justify-center gap-2 p-3 rounded-lg border border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/10 font-mono text-xs"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Start Guided Tour</span>
            </button>
          )}

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2 mt-2">
            <button
              onClick={() => {
                setOpen(false);
                travelToWorkspace(navigate, "/story", activeSection);
              }}
              className="flex items-center justify-between p-3 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 text-base font-semibold transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-[var(--accent)]" />
                <span>Info Book · The Cosmic Chronicle</span>
              </div>
              <span>↗</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
