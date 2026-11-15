import React from "react";

export interface BrandSymbolProps {
  className?: string;
  size?: number;
}

/**
 * Original space-inspired graphical symbol for sphereXplorer:
 * - A minimal circular celestial sphere with fine coordinate guide arc.
 * - A dynamic tilted orbital arc swooping across the sphere in vibrant copper-orange (#F4A272).
 * - A radiant 4-point discovery star / spectral spark at the orbital node.
 */
export const BrandSymbol: React.FC<BrandSymbolProps> = ({
  className = "w-5 h-5 sm:w-6 sm:h-6",
  size,
}) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-symbol flex-shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="orbit-grad-brand" x1="2" y1="26" x2="30" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7B3D" />
          <stop offset="60%" stopColor="#F4A272" />
          <stop offset="100%" stopColor="#FFE0CC" />
        </linearGradient>
        <radialGradient id="sphere-core-brand" cx="16" cy="16" r="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F4A272" stopOpacity="0.4" />
          <stop offset="70%" stopColor="#1B1724" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0B0910" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Deep Space Central Core Glow */}
      <circle cx="16" cy="16" r="9" fill="url(#sphere-core-brand)" />

      {/* 2. Celestial Sphere Ring */}
      <circle
        cx="16"
        cy="16"
        r="8"
        stroke="#F3EFE8"
        strokeWidth="1.2"
        strokeOpacity="0.45"
      />

      {/* 3. Subtle Latitude Guide Arc */}
      <path
        d="M8.5 16C8.5 19.5 11.8 22.5 16 22.5C20.2 22.5 23.5 19.5 23.5 16"
        stroke="#F3EFE8"
        strokeWidth="0.8"
        strokeOpacity="0.3"
        strokeDasharray="1.5 2"
      />

      {/* 4. Tilted Elliptical Orbital Path (Dynamic 32-degree swoop) */}
      <ellipse
        cx="16"
        cy="16"
        rx="13.2"
        ry="5.2"
        transform="rotate(-32 16 16)"
        stroke="url(#orbit-grad-brand)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* 5. Radiant Spectral Discovery Spark at the Orbital Node */}
      <circle cx="25.5" cy="10" r="3.2" fill="#F4A272" fillOpacity="0.3" />
      <path
        d="M25.5 6.8L26.4 9.1L28.7 10L26.4 10.9L25.5 13.2L24.6 10.9L22.3 10L24.6 9.1Z"
        fill="#FFFFFF"
      />
      <circle cx="25.5" cy="10" r="1.1" fill="#FFFFFF" />
    </svg>
  );
};

export interface BrandWordmarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSymbol?: boolean;
}

/**
 * Authoritative sphereXplorer brand identity:
 * - Original space-inspired logo symbol (celestial sphere + copper-orange orbit + spectral spark).
 * - "sphere": smaller lowercase letters, warm off-white (#F3EFE8), medium weight.
 * - "XPLORER": larger uppercase letters, bold copper-orange (#F4A272), preserving the final R.
 * - Alignment: "sphere" sits at the vertical centre of the larger "XPLORER".
 * - Optical Kerning: Negative margin ensures ABSOLUTELY NO GAP between the final 'e' and 'X'.
 */
export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  className = "",
  size = "md",
  showSymbol = true,
}) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm sm:text-base",
    lg: "text-lg sm:text-xl",
  }[size];

  const symbolSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5 sm:w-6 sm:h-6",
    lg: "w-6 h-6 sm:w-7 sm:h-7",
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}
      aria-label="sphereXplorer"
      style={{ isolation: "isolate" }}
    >
      {/* 1. Original Space-Inspired Graphical Logo Symbol */}
      {showSymbol && <BrandSymbol className={symbolSizes} />}

      {/* 2. Continuous Typographic Wordmark with Zero Gap */}
      <span className={`brand-wordmark inline-flex items-center tracking-tight font-sans ${sizeClasses}`}>
        {/* Lowercase warm off-white "sphere" */}
        <span
          className="wordmark-sphere font-medium text-[#F3EFE8] leading-none"
          style={{
            fontSize: "0.86em",
            marginRight: "-0.12em", // Optical kerning: completely eliminates the gap between 'e' and 'X'
            transform: "translateY(-0.02em)", // Perfectly aligns 'sphere' to vertical centre of 'XPLORER'
            display: "inline-block",
          }}
        >
          sphere
        </span>

        {/* Uppercase copper-orange "XPLORER" */}
        <span
          className="wordmark-xplorer font-extrabold text-[#F4A272] leading-none uppercase tracking-tight"
          style={{
            fontSize: "1.34em",
            display: "inline-block",
            textShadow: "0 0 16px rgba(244, 162, 114, 0.45)",
          }}
        >
          XPLORER
        </span>
      </span>
    </div>
  );
};

export default BrandWordmark;
