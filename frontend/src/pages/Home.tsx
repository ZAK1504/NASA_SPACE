import React from "react";
import Satellite3D from "../components/ui/Satellite3D";
import Ribbon from "../components/ui/Ribbon";
import Pic from "../components/ui/Pic";
import { ClockCard, ChannelsCard, StatCard } from "../components/ui/Glass";
import { useScrollVars, useCountUp } from "../lib/hooks";
import Icon from "../components/ui/Icon";

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
    <div className="home-container">
      {/* 1 — Cinematic Hero */}
      <section className="hero" data-tour="home-hero">
        <div className="horizon" aria-hidden="true">
          <i />
          <i />
        </div>

        <div className="sat" data-par="0.12">
          <Satellite3D yaw={0.4} />
        </div>

        <div className="hero-copy">
          <p className="mono tag">[SPHEREx · DR1 & QR3 · NASA / IPAC IRSA]</p>
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
              className="btn white cursor-pointer"
              onClick={() => scrollTo("explorer")}
            >
              Explore the Sky <span>↓</span>
            </button>
            <button
              className="btn orange cursor-pointer"
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

      {/* 2 — "This is our amazing sky" */}
      <section className="amazing" data-tour="home-amazing">
        <div className="amazing-in">
          <div className="am-l rv">
            <p className="mono tag">[What is SPHEREx]</p>
            <h2>
              This is our <b>amazing sky</b>,
              <br />
              seen in every colour.
            </h2>
            <div className="blurb">
              <span className="ic">
                <Icon name="object" />
              </span>
              <p>
                SPHEREx is a NASA observatory that maps the whole sky in 102 infrared colours — four
                times over two years. Every pixel of the sky becomes a 0.75–5.0 µm spectrum.
              </p>
            </div>
          </div>

          <div className="am-r">
            <ClockCard />
            <ChannelsCard />
          </div>
        </div>

        <Ribbon className="amazing-ribbon" amp={34} />

        <div className="am-cards">
          <StatCard label="Wavelength range" value="0.75–5.0" unit=" µm" />
          <StatCard label="All-sky surveys" value="4" unit=" in 2 yrs" />
        </div>
      </section>

      {/* 3 — By the numbers */}
      <section className="facts" data-tour="home-facts">
        <p className="mono tag rv">[By the numbers]</p>
        <div className="facts-row">
          <Fact to={102} unit="" label="colour channels" />
          <Fact to={5} unit=" µm" label="reddest wavelength" dec={1} />
          <Fact to={4} unit="×" label="whole-sky passes" />
          <Fact to={2} unit=" yrs" label="prime mission" />
        </div>
      </section>

      {/* 4 — Four Doors */}
      <section className="doors" data-tour="home-doors">
        <p className="mono tag rv">[Pick a door]</p>
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

      {/* 5 — Transition bridge into Explorer */}
      <div className="py-14 text-center flex flex-col items-center justify-center">
        <p className="mono tag mb-2">[Continue scrolling]</p>
        <p className="text-sm text-[var(--mut)] mb-3">Next: All-Sky Survey & 102 Spectral Bands</p>
        <button
          onClick={() => scrollTo("explorer")}
          className="text-xs font-mono text-[var(--accent)] hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <span>Jump to Explorer</span>
          <span>↓</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
