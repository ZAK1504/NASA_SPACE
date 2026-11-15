import React, { useLayoutEffect, useRef, useState } from "react";

export interface PillItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface PillSwitchProps {
  items: PillItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export const PillSwitch: React.FC<PillSwitchProps> = ({
  items,
  value,
  onChange,
  className = "",
}) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [box, setBox] = useState({ x: 0, w: 0 });
  const idx = Math.max(0, items.findIndex((i) => i.id === value));

  useLayoutEffect(() => {
    const place = () => {
      const el = refs.current[idx];
      if (el) {
        setBox({ x: el.offsetLeft, w: el.offsetWidth });
      }
    };
    place();
    window.addEventListener("resize", place);
    if ("fonts" in document) {
      document.fonts.ready.then(place);
    }
    return () => window.removeEventListener("resize", place);
  }, [idx, items.length]);

  return (
    <div className={`pill ${className}`} role="tablist">
      <span
        className="pill-bubble"
        style={{ transform: `translateX(${box.x}px)`, width: box.w }}
      />
      {items.map((it, i) => (
        <button
          key={it.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          role="tab"
          aria-selected={i === idx}
          className={i === idx ? "on" : ""}
          onClick={() => onChange(it.id)}
        >
          {it.icon && <i className="pill-ic">{it.icon}</i>}
          {it.label}
        </button>
      ))}
    </div>
  );
};

export default PillSwitch;
