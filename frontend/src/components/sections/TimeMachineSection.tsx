import React from "react";
import { ClockCard, StatCard } from "../ui/Glass";
import Icon from "../ui/Icon";
import { TimeMachine } from "../../pages/TimeMachine";
import { FlaskConical, ArrowDown } from "lucide-react";

interface TimeMachineSectionProps {
  onContinueToLabs?: () => void;
  isSectionActive?: boolean;
}

export const TimeMachineSection: React.FC<TimeMachineSectionProps> = ({
  onContinueToLabs,
  isSectionActive = true,
}) => {
  return (
    <section id="time-machine" className="w-full relative py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <header className="stage-head mb-6">
        <div className="sh-l">
          <p className="mono tag">[02 · VARIABLE SKY / TIME MACHINE]</p>
          <h2 className="text-3xl md:text-5xl font-light text-[var(--ink)] tracking-tight mt-1">
            Watch the sky <b className="text-[var(--accent)] font-semibold">change</b> over two years.
          </h2>
          <div className="blurb mt-3">
            <span className="ic">
              <Icon name="time" />
            </span>
            <p className="text-sm md:text-base text-[var(--mut)] max-w-2xl leading-relaxed">
              SPHEREx surveys the entire celestial sphere every six months. Compare multi-epoch observations
              across time to discover high-proper-motion stars, moving asteroids, and variable transients.
            </p>
          </div>
        </div>

        <div className="sh-r flex items-center gap-3">
          <ClockCard />
          <StatCard label="Survey pass" value="2" unit=" / 4" />
          <StatCard label="Multi-epoch targets" value="5" />
        </div>
      </header>

      {/* Hairline Divider (Zero Curly Waves) */}
      <div className="w-full my-4 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Genuine Time Machine Workspace */}
      <div className="time-machine-workspace w-full min-h-[620px] relative" data-lenis-prevent>
        <TimeMachine />
      </div>

      {/* Subtle section-end action: Continue to Labs */}
      <div className="mt-8 text-center flex flex-col items-center justify-center pt-6 border-t border-white/5">
        <p className="mono tag mb-2">[Journey Continues]</p>
        <p className="text-sm text-[var(--mut)] mb-3">Next: DAOStarFinder Discovery Lab & Light Curves</p>
        <button
          onClick={() => {
            if (onContinueToLabs) {
              onContinueToLabs();
            } else {
              const el = document.getElementById("labs");
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
          <FlaskConical className="w-4 h-4" />
          <span>Continue to Labs</span>
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};

export default TimeMachineSection;
