import React, { useState } from "react";
import Satellite3D from "../components/ui/Satellite3D";
import PillSwitch, { PillItem } from "../components/ui/PillSwitch";
import Ribbon from "../components/ui/Ribbon";
import LinkMenu from "../components/ui/LinkMenu";
import Pic from "../components/ui/Pic";
import { ClockCard, ChannelsCard, StatCard } from "../components/ui/Glass";
import { useGo } from "../components/ui/Transition";
import { useScrollVars, useCountUp } from "../lib/hooks";
import { firstPath, pageById } from "../types/site";
import Icon from "../components/ui/Icon";

interface DestItem extends PillItem {
  h: (string | { b: string })[];
  p: string;
}

const DEST: DestItem[] = [
  {
    id: "explorer",
    label: "Explorer",
    h: ["the beginning of a story between you and", { b: "the sky" }, "."],
    p: "Pan across the whole sky and tune it to any of 102 infrared colours with official NASA DR1 imagery.",
  },
  {
    id: "time",
    label: "Time Machine",
    h: ["a sky that is never", { b: "standing still" }, "."],
    p: "Scrub through multiple dated surveys and watch genuine brown dwarfs and stars move and fade.",
  },
  {
    id: "lab",
    label: "Lab",
    h: ["this is where you make a", { b: "discovery" }, "."],
    p: "Detect candidate changes with DAOStarFinder, save verified finds, and inspect genuine light curves.",
  },
  {
    id: "mission",
    label: "Mission",
    h: ["fly the", { b: "mission" }, "that maps it all."],
    p: "Meet the observatory, inspect technical systems, then put your eyes to work in the training game.",
  },
];

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

export const Home: React.FC = () => {
  const go = useGo();
  const [i, setI] = useState(0);
  const d = DEST[i] || DEST[0];
  useScrollVars("home");

  return (
    <>
      {/* 1 — Cinematic Hero */}
      <section className="hero" data-tour="home-hero">
        <div className="horizon" aria-hidden="true">
          <i />
          <i />
        </div>

        <div className="sat" data-par="0.12">
          <Satellite3D yaw={i * 1.1} />
        </div>

        <div className="hero-copy" key={d.id}>
          <p className="mono tag">[SPHEREx · DR1 & QR3 · NASA / IPAC IRSA]</p>
          <Headline parts={d.h} />
          <p className="hero-p">{d.p}</p>
          <button
            className="btn white"
            onClick={() => {
              const targetPage = pageById(d.id);
              if (targetPage) go(firstPath(targetPage), d.label);
            }}
          >
            Go to {d.label} <span>↗</span>
          </button>
        </div>

        <PillSwitch
          className="hero-pill"
          items={DEST}
          value={d.id}
          onChange={(id) => {
            const nextIdx = DEST.findIndex((x) => x.id === id);
            if (nextIdx !== -1) setI(nextIdx);
          }}
        />

        <div className="scroll-hint mono">
          <i />
          Scroll
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
            { d: DEST[0], k: "sky", s: 3, t: "Explore the sky", p: "Sky · Object · Spectral" },
            { d: DEST[1], k: "galaxy", s: 8, t: "Travel in time", p: "Two years of passes" },
            { d: DEST[2], k: "nebula", s: 5, t: "Make a discovery", p: "Discovery · Light curves" },
            { d: DEST[3], k: "band", s: 2, t: "Join the mission", p: "Observatory · Game" },
          ].map((c, n) => {
            const targetPage = pageById(c.d.id);
            const path = targetPage ? firstPath(targetPage) : "/";

            return (
              <a
                key={c.d.id}
                className="door rv"
                style={{ "--d": `${n * 80}ms` } as React.CSSProperties}
                href={path}
                onClick={(e) => {
                  e.preventDefault();
                  go(path, c.d.label);
                }}
              >
                <Pic kind={c.k} seed={c.s} w={480} h={600} alt="" />
                <i className="door-shade" />
                <span className="mono door-n">0{n + 1}</span>
                <span className="door-t">{c.t}</span>
                <span className="door-p mono">{c.p}</span>
                <span className="door-a">↗</span>
              </a>
            );
          })}
        </div>
      </section>

      <LinkMenu title="Or jump straight in" />
    </>
  );
};

export default Home;
