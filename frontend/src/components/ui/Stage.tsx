import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import PillSwitch from "./PillSwitch";
import Ribbon from "./Ribbon";
import { ClockCard } from "./Glass";
import LinkMenu from "./LinkMenu";
import { PageDef, subPath } from "../../types/site";
import Icon from "./Icon";

export interface TitlePart {
  b?: string;
  [key: string]: any;
}

export interface StageProps {
  page: PageDef;
  sub?: string;
  bg?: { kind: string; seed?: number; hue?: number };
  title: (string | TitlePart)[];
  icon?: string;
  blurb?: string;
  cards?: React.ReactNode;
  ribbon?: boolean;
  children: React.ReactNode;
}

export const Stage: React.FC<StageProps> = ({
  page,
  sub,
  bg,
  title,
  icon = "sky",
  blurb = "",
  cards,
  ribbon = true,
  children,
}) => {
  const nav = useNavigate();
  const subs = page.subs;

  return (
    <>
      <main className="stage">
        <div className="stage-in">
          <header className="stage-head">
            <div className="sh-l">
              <p className="mono tag">
                [{page.label}
                {sub && subs ? ` / ${subs.find((s) => s.id === sub)?.label || sub}` : ""}]
              </p>
              <h1>
                {title.map((t, i) =>
                  typeof t === "object" && t.b ? (
                    <Fragment key={i}>
                      <b>{t.b}</b>
                      {/^[.,!?]/.test(typeof title[i + 1] === "string" ? (title[i + 1] as string) : "")
                        ? ""
                        : " "}
                    </Fragment>
                  ) : (
                    <Fragment key={i}>{typeof t === "string" ? t : ""} </Fragment>
                  )
                )}
              </h1>
              {blurb && (
                <div className="blurb">
                  <span className="ic">
                    <Icon name={icon} />
                  </span>
                  <p>{blurb}</p>
                </div>
              )}
            </div>
            <div className="sh-r">{cards || <ClockCard />}</div>
          </header>

          <section className="stage-body">{children}</section>
        </div>

        {ribbon && <Ribbon className="stage-ribbon" amp={26} />}

        {subs && subs.length > 0 && sub && (
          <PillSwitch
            className="stage-pill"
            items={subs}
            value={sub}
            onChange={(id) => nav(subPath(page, { id }))}
          />
        )}
      </main>
      <LinkMenu />
    </>
  );
};

export default Stage;
