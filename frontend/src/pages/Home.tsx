import React from "react";
import Satellite3D from "../components/ui/Satellite3D";
import Ribbon from "../components/ui/Ribbon";
import Pic from "../components/ui/Pic";
import { ClockCard, ChannelsCard, StatCard } from "../components/ui/Glass";
import { useScrollVars, useCountUp, useReveal } from "../lib/hooks";
import Icon from "../components/ui/Icon";
import { ArrowDown, Sparkles } from "lucide-react";

interface HomeProps {
  onNavigateSection?: (sectionId: string) => void;
}

function Headline({ parts }: { parts: (string | { b: string })[] }) {
  return (
    <h1 className="hero-h">
      {parts.map((x, i) =>
        typeof x === "string" ? <span key={i}>{x} </span> : <b key={i}>{x.b}</b>
      )}
    </h1>
  );
}

function Fact({
  to,
  unit,
  label,
  dec = 0,
}: {
  to: number;
  unit: string;
  label: string;
  dec?: number;
}) {
  const [ref, v] = useCountUp(to, { decimals: dec });
  return (
    <div ref={ref} className="fact rv">
      <b>
        {v}
        <span>{unit}</span>
      </b>
      <small className="mono">{label}</small>
    </div>
  );
}

export const Home: React.FC<HomeProps> = ({ onNavigateSection }) => {
  useScrollVars("home");
  useReveal("home");

  const scrollTo = (id: string) => {
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        if (window.__lenis) {
          window.__lenis.scrollTo(el, { offset: -70, duration: 1.2 });
        } else {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <div className="home-container w-full relative">
      {/* 1 — Cinematic Hero (The Arrival) */}
      <section className="hero" data-tour="home-hero">
        <div className="horizon" aria-hidden="true">
          <i />
          <i />
        </div>

        {/* Atmospheric soft blending gradient between hero and persistent cosmos */}
        <div className="hero-atmosphere" aria-hidden="true" />

        <div className="sat" data-par="0.12">
          <Satellite3D yaw={0.4} />
        </div>

        <div className="hero-copy">
          <p className="mono tag">[SPHEREx · DR1 & QR3 · NASA Space Apps Challenge 2026]</p>
          <Headline
            parts={[
              "the beginning of a story between you and",
              { b: "the sky" },
              ".",
            ]}
          />
          <p className="hero-p">
            Pan across the whole sky and tune it to any of 102 infrared colours with official NASA
            DR1 imagery, genuine Level 2 FITS archives, and multi-epoch time-domain astronomy.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              className="btn white cursor-pointer shadow-lg hover:shadow-white/20"
              onClick={() => scrollTo("explorer")}
            >
              Explore the Sky <span>↓</span>
            </button>
            <button
              className="btn orange cursor-pointer shadow-lg hover:shadow-orange-500/20"
              onClick={() => scrollTo("time-machine")}
            >
              Time Machine <span>↓</span>
            </button>
          </div>
        </div>

        {/* Scroll indicator prompt */}
        <div className="scroll-hint mono">
          <i />
          Scroll to explore
        </div>
      </section>

      {/* 2 — Meet the Mission ("This is our amazing sky" — Cohesive Centered Scene) */}
      <section className="mission-intro w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10" data-tour="home-amazing">
        <div className="text-center max-w-3xl mx-auto mb-8 rv">
          <p className="mono tag inline-block mb-3">[What is SPHEREx]</p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-light text-[var(--ink)] tracking-tight leading-tight">
            This is our <b className="text-[var(--accent)] font-semibold">amazing sky</b>,
            <br />
            seen in every colour.
          </h2>
          <div className="blurb mt-5 flex items-start gap-4 text-left max-w-2xl mx-auto bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <span className="ic flex-shrink-0">
              <Icon name="object" />
            </span>
            <p className="text-sm md:text-base text-[var(--mut)] leading-relaxed">
              SPHEREx is a NASA observatory that maps the whole sky in 102 infrared colours — four
              times over two years. Every pixel of the sky becomes a calibrated 0.75–5.0 µm spectrum.
            </p>
          </div>
        </div>

        {/* Visual Connector: The "LET'S EXPLORE" Animated Ribbon flowing through the scene */}
        <div className="mission-ribbon-wrap w-full my-6 overflow-hidden">
          <Ribbon className="mission-ribbon" amp={22} />
        </div>

        {/* Cohesive Centered Mission HUD Grid (Zero Empty Space) */}
        <div className="mission-hud-grid grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-6 rv">
          <div className="flex justify-center">
            <ClockCard />
          </div>
          <div className="flex justify-center">
            <ChannelsCard />
          </div>
          <div className="flex justify-center">
            <StatCard label="Wavelength range" value="0.75–5.0" unit=" µm" />
          </div>
          <div className="flex justify-center">
            <StatCard label="All-sky surveys" value="4" unit=" in 2 yrs" />
          </div>
        </div>
      </section>

      {/* 3 — By the Numbers */}
      <section className="facts max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10" data-tour="home-facts">
        <p className="mono tag rv mb-4">[By the numbers]</p>
        <div className="facts-row">
          <Fact to={102} unit="" label="colour channels" />
          <Fact to={5} unit=" µm" label="reddest wavelength" dec={1} />
          <Fact to={4} unit="×" label="whole-sky passes" />
          <Fact to={2} unit=" yrs" label="prime mission" />
        </div>
      </section>

      {/* 4 — Four Doors (Pick a Door) */}
      <section className="doors max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10" data-tour="home-doors">
        <p className="mono tag rv mb-6">[Pick a door · Choose your destination]</p>
        <div className="doors-grid">
          {[
            {
              id: "explorer",
              target: "explorer",
              k: "sky",
              s: 3,
              t: "Explore the sky",
              p: "Sky · Object · Spectral",
            },
            {
              id: "time",
              target: "time-machine",
              k: "galaxy",
              s: 8,
              t: "Travel in time",
              p: "Two years of passes",
            },
            {
              id: "lab",
              target: "labs",
              k: "nebula",
              s: 5,
              t: "Make a discovery",
              p: "Discovery · Light curves",
            },
            {
              id: "mission",
              target: "mission",
              k: "band",
              s: 2,
              t: "Join the mission",
              p: "Observatory · Training",
            },
          ].map((c, n) => (
            <a
              key={c.id}
              className="door rv cursor-pointer"
              style={{ "--d": `${n * 80}ms` } as React.CSSProperties}
              href={`#${c.target}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(c.target);
              }}
            >
              <Pic kind={c.k} seed={c.s} w={480} h={600} alt="" />
              <i className="door-shade" />
              <span className="mono door-n">0{n + 1}</span>
              <span className="door-t">{c.t}</span>
              <span className="door-p mono">{c.p}</span>
              <span className="door-a">↓</span>
            </a>
          ))}
        </div>
      </section>

      {/* 5 — Concise Cinematic Gateway into Explorer */}
      <div className="home-gateway max-w-3xl mx-auto text-center py-12 px-4 relative z-10">
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-[var(--accent)] to-transparent mx-auto mb-4" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-mono mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ENTERING ALL-SKY SURVEY</span>
        </div>
        <h3 className="text-xl md:text-3xl font-light text-white mb-2">
          Ready to explore the <b className="text-[var(--accent)] font-semibold">whole sky</b> in 102 colours?
        </h3>
        <p className="text-xs md:text-sm text-[var(--mut)] mb-5 max-w-md mx-auto">
          Scroll down or click below to launch the interactive celestial sphere.
        </p>
        <button
          onClick={() => scrollTo("explorer")}
          className="btn orange cursor-pointer inline-flex items-center gap-2 shadow-lg"
        >
          <span>Dive into Explorer</span>
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Home;