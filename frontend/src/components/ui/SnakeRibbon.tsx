import React, { useId, useMemo } from "react";

export interface SnakeRibbonProps {
  text: string;
  gradientId?: string;
  startColor: string;
  endColor: string;
  textColor?: string;
  amp?: number;
  height?: number;
  className?: string;
  still?: boolean;
}

const L = 340; // Spatial period / wavelength of the wave
const N = 12;  // Total repeating wave cycles across the viewport

export const SnakeRibbon: React.FC<SnakeRibbonProps> = ({
  text,
  startColor,
  endColor,
  textColor = "#F3EFE8",
  amp = 26,
  height = 110,
  className = "",
  still = false,
}) => {
  const reactId = useId().replace(/:/g, "");
  const pathId = `rb-path-${reactId}`;
  const gradId = `rb-grad-${reactId}`;
  const glowId = `rb-glow-${reactId}`;

  // Generate smooth sine-like wave path across N wavelengths
  const pathD = useMemo(() => {
    const centerY = height / 2;
    let p = `M 0 ${centerY} Q ${L / 4} ${centerY - amp} ${L / 2} ${centerY}`;
    for (let i = 1; i < N * 2; i++) {
      p += ` T ${(L / 2) * (i + 1)} ${centerY}`;
    }
    return p;
  }, [amp, height]);

  // Construct continuous repeating string
  const unit = useMemo(() => {
    const formatted = text.trim().toUpperCase();
    return formatted.endsWith("✦") ? `${formatted}   ` : `${formatted} ✦   `;
  }, [text]);

  const fullText = useMemo(() => {
    return Array(N).fill(unit).join("");
  }, [unit]);

  const totalWidth = N * L;

  return (
    <div
      className={`snake-ribbon-container relative w-full overflow-hidden pointer-events-none select-none my-1 sm:my-2 ${className}`}
      style={{ height: `${height}px`, background: "transparent" }}
      aria-hidden="true"
    >
      <svg
        width={totalWidth}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        className={`snake-ribbon-svg block ${still ? "still" : ""}`}
        style={{
          willChange: "transform",
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={startColor} stopOpacity={0.7} />
            <stop offset="50%" stopColor={endColor} stopOpacity={0.85} />
            <stop offset="100%" stopColor={startColor} stopOpacity={0.7} />
          </linearGradient>

          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Subtle Outer Glow Halo */}
        <path
          d={pathD}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={amp * 1.55}
          strokeOpacity={0.06}
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />

        {/* 2. Semi-Translucent Ribbon Band */}
        <path
          d={pathD}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={30}
          strokeOpacity={0.16}
          strokeLinecap="round"
        />

        {/* 3. Delicate Center Track Wire */}
        <path
          id={pathId}
          d={pathD}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={1}
          strokeOpacity={0.4}
        />

        {/* 4. Animated Traveling Snake Text */}
        <text
          className="snake-ribbon-text"
          fill={textColor}
          dy="4.5"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <textPath
            href={`#${pathId}`}
            textLength={totalWidth - 40}
            lengthAdjust="spacing"
            startOffset="0"
          >
            {fullText}
          </textPath>
        </text>
      </svg>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Four Dedicated Inter-Chapter Snake Ribbons
// ----------------------------------------------------------------------------

/** Home → Explorer: Gold/Amber into Indigo/Violet */
export const HomeToExplorerRibbon: React.FC<{ still?: boolean }> = ({ still }) => (
  <SnakeRibbon
    text="LET'S EXPLORE ✦ BEYOND THE VISIBLE ✦ DISCOVER THE INFRARED UNIVERSE"
    startColor="#F4A272"
    endColor="#818CF8"
    textColor="#F3EFE8"
    amp={24}
    height={95}
    still={still}
    className="home-to-explorer-ribbon"
  />
);

/** Explorer → Time Machine: Indigo/Violet into Warm Amber */
export const ExplorerToTimeMachineRibbon: React.FC<{ still?: boolean }> = ({ still }) => (
  <SnakeRibbon
    text="THROUGH SPACE & TIME ✦ THE UNIVERSE DOESN'T STAND STILL ✦ REWIND THE SKY"
    startColor="#818CF8"
    endColor="#FF7B3D"
    textColor="#F3EFE8"
    amp={26}
    height={100}
    still={still}
    className="explorer-to-timemachine-ribbon"
  />
);

/** Time Machine → Labs: Warm Amber into Graphite & Cool-White */
export const TimeMachineToLabsRibbon: React.FC<{ still?: boolean }> = ({ still }) => (
  <SnakeRibbon
    text="EVERY CHANGE TELLS A STORY ✦ INVESTIGATE THE EVIDENCE ✦ DISCOVER MORE"
    startColor="#FF7B3D"
    endColor="#94A3B8"
    textColor="#F3EFE8"
    amp={22}
    height={95}
    still={still}
    className="timemachine-to-labs-ribbon"
  />
);

/** Labs → Mission: Neutral Scientific Tones into Midnight Blue & Warm Gold */
export const LabsToMissionRibbon: React.FC<{ still?: boolean }> = ({ still }) => (
  <SnakeRibbon
    text="YOUR DISCOVERY BEGINS ✦ EXPLORE THE UNKNOWN ✦ THE NEXT DISCOVERY COULD BE YOURS"
    startColor="#94A3B8"
    endColor="#F4A272"
    textColor="#F3EFE8"
    amp={24}
    height={95}
    still={still}
    className="labs-to-mission-ribbon"
  />
);

export default SnakeRibbon;
