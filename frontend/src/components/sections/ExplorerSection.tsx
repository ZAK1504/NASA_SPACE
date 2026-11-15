import React, { useState, useEffect } from "react";
import PillSwitch from "../ui/PillSwitch";
import { ClockCard, StatCard } from "../ui/Glass";
import Icon from "../ui/Icon";
import { ExploreSky } from "../../pages/ExploreSky";
import { ObjectExplorer } from "../../pages/ObjectExplorer";
import { ObjectDetail } from "../../pages/ObjectDetail";
import { SpectralExplorer } from "../../pages/SpectralExplorer";
import { ArrowDown, Clock } from "lucide-react";

export type ExplorerSubTab = "sky" | "object" | "spectral";

interface ExplorerSectionProps {
  initialSub?: ExplorerSubTab;
  initialObjectId?: string;
  onContinueToTimeMachine?: () => void;
  isSectionActive?: boolean;
}

const COPY: Record<
  ExplorerSubTab,
  {
    title: (string | { b: string })[];
    icon: string;
    blurb: string;
    metricLabel: string;
    metricVal: string;
    metricUnit?: string;
  }
> = {
  sky: {
    title: ["Tune the", { b: "whole sky" }, "to any colour."],
    icon: "sky",
    blurb:
      "Move across the celestial sphere with Aladin Lite and explore 102 infrared channels with official SPHEREx DR1 all-sky cube layers.",
    metricLabel: "Sky covered",
    metricVal: "100",
    metricUnit: " %",
  },
  object: {
    title: ["Pick an", { b: "object" }, "and read its light."],
    icon: "object",
    blurb:
      "Every galaxy, brown dwarf and young stellar object carries a fingerprint in its spectrum. Inspect native cutouts, Gaia DR3 vectors, and calibrated metadata.",
    metricLabel: "Challenge targets",
    metricVal: "5",
  },
  spectral: {
    title: ["Read the", { b: "spectrum" }, "like a story."],
    icon: "spectral",
    blurb:
      "Dips and bumps mark cosmic molecules — water ice, carbon dioxide, and CO. Synchronize 100-plane cube playback or extract point spectra.",
    metricLabel: "Spectral range",
    metricVal: "0.75–5.0",
    metricUnit: " µm",
  },
};

const SUB_ITEMS = [
  { id: "sky", label: "Sky" },
  { id: "object", label: "Object" },
  { id: "spectral", label: "Spectral" },
];

export const ExplorerSection: React.FC<ExplorerSectionProps> = ({
  initialSub = "sky",
  initialObjectId,
  onContinueToTimeMachine,
  isSectionActive = true,
}) => {
  const [sub, setSub] = useState<ExplorerSubTab>(initialSub);
  const [selectedObjectId, setSelectedObjectId] = useState<string | undefined>(initialObjectId);

  // Synchronize when initial props change
  useEffect(() => {
    if (initialSub) setSub(initialSub);
  }, [initialSub]);

  useEffect(() => {
    if (initialObjectId) setSelectedObjectId(initialObjectId);
  }, [initialObjectId]);

  const c = COPY[sub];

  return (
    <section id="explorer" className="w-full relative py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <header className="stage-head mb-6">
        <div className="sh-l">
          <p className="mono tag">
            [01 · ALL-SKY SURVEY / {sub.toUpperCase()}]
          </p>
          <h2 className="text-3xl md:text-5xl font-light text-[var(--ink)] tracking-tight mt-1">
            {c.title.map((t, idx) =>
              typeof t === "string" ? (
                <span key={idx}>{t} </span>
              ) : (
                <b key={idx} className="text-[var(--accent)] font-semibold">
                  {t.b}{" "}
                </b>
              )
            )}
          </h2>
          <div className="blurb mt-3">
            <span className="ic">
              <Icon name={c.icon} />
            </span>
            <p className="text-sm md:text-base text-[var(--mut)] max-w-2xl leading-relaxed">
              {c.blurb}
            </p>
          </div>
        </div>

        <div className="sh-r flex items-center gap-3">
          <ClockCard />
          <StatCard label={c.metricLabel} value={c.metricVal} unit={c.metricUnit} />
        </div>
      </header>

      {/* Hairline Divider (Zero Curly Waves) */}
      <div className="w-full my-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Internal Active Workspace Shell */}
      <div className="explorer-workspace w-full min-h-[580px] relative transition-opacity duration-300">
        {sub === "sky" && (
          <div className="w-full animate-fadeIn" data-lenis-prevent>
            <ExploreSky />
          </div>
        )}

        {sub === "object" && (
          <div className="w-full animate-fadeIn" data-lenis-prevent>
            {selectedObjectId ? (
              <ObjectDetail />
            ) : (
              <ObjectExplorer />
            )}
          </div>
        )}

        {sub === "spectral" && (
          <div className="w-full animate-fadeIn" data-lenis-prevent>
            <SpectralExplorer />
          </div>
        )}
      </div>

      {/* Contextual Bottom Navigation (Constrained strictly to Explorer) */}
      <div className="sticky bottom-6 z-30 flex flex-col items-center justify-center mt-10 pointer-events-none">
        <div className="pointer-events-auto shadow-2xl backdrop-blur-xl bg-black/60 rounded-full border border-white/10 p-1">
          <PillSwitch
            className="stage-pill"
            items={SUB_ITEMS}
            value={sub}
            onChange={(id) => setSub(id as ExplorerSubTab)}
          />
        </div>
      </div>

      {/* Subtle section-end action: Continue to Time Machine */}
      <div className="mt-8 text-center flex flex-col items-center justify-center pt-6 border-t border-white/5">
        <p className="mono tag mb-2">[Journey Continues]</p>
        <p className="text-sm text-[var(--mut)] mb-3">Next: Two Years of Multi-Epoch Astrometry</p>
        <button
          onClick={() => {
            if (onContinueToTimeMachine) {
              onContinueToTimeMachine();
            } else {
              const el = document.getElementById("time-machine");
              if (el) {
                if (window.__lenis) {
                  window.__lenis.scrollTo(el, { offset: -70, duration: 1.4 });
                } else {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }
            }
          }}
          className="btn orange flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Clock className="w-4 h-4" />
          <span>Continue to Time Machine</span>
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

export default ExplorerSection;
