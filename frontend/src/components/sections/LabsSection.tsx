import React, { useState, useEffect } from "react";
import PillSwitch from "../ui/PillSwitch";
import Ribbon from "../ui/Ribbon";
import { ClockCard, StatCard } from "../ui/Glass";
import Icon from "../ui/Icon";
import { DiscoveryLab } from "../../pages/DiscoveryLab";
import { LightCurves } from "../../pages/LightCurves";
import { MyDiscoveries } from "../../pages/MyDiscoveries";
import { Rocket, ArrowDown, BookOpen, Layers } from "lucide-react";

export type LabsSubTab = "discovery" | "light-curves";

interface LabsSectionProps {
  initialSub?: LabsSubTab;
  initialNestedJournal?: boolean;
  onContinueToMission?: () => void;
  isSectionActive?: boolean;
}

const COPY: Record<
  LabsSubTab,
  {
    title: (string | { b: string })[];
    icon: string;
    blurb: string;
    metricLabel: string;
    metricVal: string;
    metricUnit?: string;
  }
> = {
  discovery: {
    title: ["This is where", { b: "discovery" }, "begins."],
    icon: "discovery",
    blurb:
      "Candidates the pipeline flagged as odd. Run DAOStarFinder point-source detection, perform image difference subtraction, and save discoveries to your research journal.",
    metricLabel: "Challenge targets",
    metricVal: "5",
  },
  "light-curves": {
    title: ["Fold time into a", { b: "pattern" }, "."],
    icon: "curve",
    blurb:
      "A star that pulses looks messy over time. Analyze multi-epoch photometric light curves, identify Mira variables, brown dwarf stability, and YSO accretion flares.",
    metricLabel: "Photometry cadence",
    metricVal: "6",
    metricUnit: " mo",
  },
};

const SUB_ITEMS = [
  { id: "discovery", label: "Discovery" },
  { id: "light-curves", label: "Light Curves" },
];

export const LabsSection: React.FC<LabsSectionProps> = ({
  initialSub = "discovery",
  initialNestedJournal = false,
  onContinueToMission,
  isSectionActive = true,
}) => {
  const [sub, setSub] = useState<LabsSubTab>(initialSub);
  const [discoveryView, setDiscoveryView] = useState<"diff" | "journal">(
    initialNestedJournal ? "journal" : "diff"
  );

  useEffect(() => {
    if (initialSub) setSub(initialSub);
  }, [initialSub]);

  useEffect(() => {
    if (initialNestedJournal) {
      setSub("discovery");
      setDiscoveryView("journal");
    }
  }, [initialNestedJournal]);

  const c = COPY[sub];

  return (
    <section id="labs" className="w-full relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <header className="stage-head mb-8">
        <div className="sh-l">
          <p className="mono tag">
            [03 · WORKSTATION / {sub.toUpperCase().replace("-", " ")}]
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

      {/* Decorative Ribbon Divider */}
      <Ribbon className="stage-ribbon my-4" amp={22} />

      {/* Internal Active Workspace Shell */}
      <div className="labs-workspace w-full min-h-[580px] relative transition-opacity duration-300">
        {sub === "discovery" && (
          <div className="w-full animate-fadeIn" data-lenis-prevent>
            {/* Nested Discovery Tab Switcher (Difference & Stacking vs My Discoveries Journal) */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10 flex-wrap gap-3">
              <div className="inline-flex p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                <button
                  onClick={() => setDiscoveryView("diff")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono rounded-full transition-all cursor-pointer ${
                    discoveryView === "diff"
                      ? "bg-gradient-to-r from-[#ff7b3d] to-[#f4a272] text-black font-semibold shadow-md"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Difference & Stacking</span>
                </button>
                <button
                  onClick={() => setDiscoveryView("journal")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono rounded-full transition-all cursor-pointer ${
                    discoveryView === "journal"
                      ? "bg-gradient-to-r from-[#ff7b3d] to-[#f4a272] text-black font-semibold shadow-md"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>My Discoveries Journal</span>
                </button>
              </div>

              <div className="text-xs text-[var(--mut)] font-mono">
                {discoveryView === "diff"
                  ? "DAOStarFinder point-source extraction & 3-panel difference analysis"
                  : "Persistent scientific log of saved candidate discoveries"}
              </div>
            </div>

            {discoveryView === "diff" ? <DiscoveryLab /> : <MyDiscoveries />}
          </div>
        )}

        {sub === "light-curves" && (
          <div className="w-full animate-fadeIn" data-lenis-prevent>
            <LightCurves />
          </div>
        )}
      </div>

      {/* Contextual Bottom Navigation (Constrained strictly to Labs) */}
      <div className="sticky bottom-6 z-30 flex flex-col items-center justify-center mt-10 pointer-events-none">
        <div className="pointer-events-auto shadow-2xl backdrop-blur-xl bg-black/60 rounded-full border border-white/10 p-1">
          <PillSwitch
            className="stage-pill"
            items={SUB_ITEMS}
            value={sub}
            onChange={(id) => setSub(id as LabsSubTab)}
          />
        </div>
      </div>

      {/* Subtle section-end action: Continue to Mission */}
      <div className="mt-12 text-center flex flex-col items-center justify-center pt-8 border-t border-white/5">
        <p className="mono tag mb-2">[Journey Continues]</p>
        <p className="text-sm text-[var(--mut)] mb-3">Next: Observatory Systems & Guided Missions</p>
        <button
          onClick={() => {
            if (onContinueToMission) {
              onContinueToMission();
            } else {
              const el = document.getElementById("mission");
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
          <Rocket className="w-4 h-4" />
          <span>Continue to Mission</span>
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

export default LabsSection;
