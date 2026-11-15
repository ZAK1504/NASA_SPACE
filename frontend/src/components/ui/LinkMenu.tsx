import React from "react";
import { PAGES, firstPath } from "../../types/site";
import { useGo } from "./Transition";
import { useLocation } from "react-router-dom";

const BLURB: Record<string, string> = {
  home: "Back to the beginning",
  explorer: "Sky · Object · Spectral",
  time: "Watch the sky change",
  lab: "Discovery · Light Curves",
  mission: "Meet the observatory · Play",
};

interface LinkMenuProps {
  title?: string;
}

export const LinkMenu: React.FC<LinkMenuProps> = ({ title = "Where to next?" }) => {
  const go = useGo();
  const loc = useLocation();
  const here = loc.pathname.split("/")[1] || "";
  const items = PAGES.filter((p) => (p.path.split("/")[1] || "") !== here);

  return (
    <section className="linkmenu">
      <p className="mono tag rv">{title}</p>
      <ul>
        {items.map((p, i) => (
          <li key={p.id} className="rv" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
            <a
              href={firstPath(p)}
              onClick={(e) => {
                e.preventDefault();
                go(firstPath(p), p.label);
              }}
            >
              <span className="lm-name">{p.label}</span>
              <span className="lm-blurb mono">{BLURB[p.id]}</span>
              <span className="lm-arrow">↗</span>
            </a>
          </li>
        ))}
      </ul>
      <footer className="foot mono">
        <span>sphereXplorer · Cosmic Discovery Platform</span>
        <span>Data: NASA / IPAC IRSA · DR1 & QR3</span>
      </footer>
    </section>
  );
};

export default LinkMenu;
