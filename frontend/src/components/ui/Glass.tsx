import React from "react";
import { useNow, useCountUp } from "../../lib/hooks";
import { chColor } from "../../lib/spec";

export function ClockCard({ label = "UTC" }: { label?: string }) {
  const n = useNow(1000);
  const h = n.getUTCHours();
  const m = n.getUTCMinutes();
  const s = n.getUTCSeconds();
  const p2 = (x: number) => String(x).padStart(2, "0");
  const ang = { h: (h % 12) * 30 + m * 0.5, m: m * 6 + s * 0.1, s: s * 6 };

  return (
    <div className="glass card-clock">
      <svg viewBox="-50 -50 100 100" className="dial" aria-hidden="true">
        <circle r="46" className="dial-ring" />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="0"
            y1="-41"
            x2="0"
            y2={i % 3 === 0 ? -35 : -38}
            transform={`rotate(${i * 30})`}
            className="dial-tick"
          />
        ))}
        <line x1="0" y1="3" x2="0" y2="-24" transform={`rotate(${ang.h})`} className="dial-h" />
        <line x1="0" y1="4" x2="0" y2="-34" transform={`rotate(${ang.m})`} className="dial-m" />
        <line x1="0" y1="8" x2="0" y2="-38" transform={`rotate(${ang.s})`} className="dial-s" />
        <circle r="2.4" className="dial-pin" />
      </svg>
      <div className="mono">
        {p2(h)} : {p2(m)} : {p2(s)} <span>({label})</span>
      </div>
    </div>
  );
}

export function ChannelsCard() {
  const [ref, v] = useCountUp(102, { dur: 1500 });
  return (
    <div className="glass card-people" ref={ref}>
      <div className="dots">
        {[8, 30, 52, 74, 96].map((c, i) => (
          <i key={c} style={{ background: chColor(c), zIndex: 5 - i }} />
        ))}
        <em>+97</em>
      </div>
      <div className="mono">
        <b>{v}</b> colour channels
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="glass card-stat">
      <small>{label}</small>
      <b>
        {value}
        {unit && <span>{unit}</span>}
      </b>
    </div>
  );
}
