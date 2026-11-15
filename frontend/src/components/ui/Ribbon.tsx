import React, { useId, useMemo } from "react";

const L = 340; // wavelength of the wave
const N = 14;

interface RibbonProps {
  text?: string;
  amp?: number;
  className?: string;
  still?: boolean;
}

export const Ribbon: React.FC<RibbonProps> = ({
  text = "Let's explore ✱",
  amp = 34,
  className = "",
  still = false,
}) => {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  const d = useMemo(() => {
    let p = `M0 70 Q ${L / 4} ${70 - amp * 2} ${L / 2} 70`;
    for (let i = 1; i < N * 2; i++) {
      p += ` T ${(L / 2) * (i + 1)} 70`;
    }
    return p;
  }, [amp]);

  const unit = (text.toUpperCase() + "   ").repeat(1);
  const full = Array(N).fill(unit).join("");

  return (
    <div className={`ribbon ${still ? "still" : ""} ${className}`} aria-hidden="true">
      <svg width={N * L} height={140} viewBox={`0 0 ${N * L} 140`}>
        <path id={id} d={d} className="rb-band" />
        <text className="rb-text">
          <textPath href={`#${id}`} textLength={N * L - 40} lengthAdjust="spacing" startOffset="0">
            {full}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default Ribbon;
