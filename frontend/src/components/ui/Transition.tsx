import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface TransitionContextType {
  go: (to: string, label?: string) => void;
  phase: string;
}

const Ctx = createContext<TransitionContextType>({ go: () => {}, phase: "" });
export const useGo = () => useContext(Ctx).go;
export const usePhase = () => useContext(Ctx).phase;
const topPath = (p: string) => p.split("/")[1] || "";

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  const loc = useLocation();
  const cur = useRef(loc.pathname);
  cur.current = loc.pathname;
  const busy = useRef(false);
  const [phase, setPhase] = useState("");

  const go = useCallback(
    (to: string, _label?: string) => {
      if (busy.current) return;
      if (to === cur.current) {
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { duration: 1.3 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
      if (topPath(to) === topPath(cur.current) && topPath(to) !== "") {
        nav(to);
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo(0, 0);
        }
        return;
      }
      busy.current = true;
      setPhase("out");
      setTimeout(() => {
        nav(to);
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo(0, 0);
        }
        setPhase("in");
      }, 520);
      setTimeout(() => {
        setPhase("");
        busy.current = false;
      }, 1350);
    },
    [nav]
  );

  return <Ctx.Provider value={{ go, phase }}>{children}</Ctx.Provider>;
}

export default TransitionProvider;
