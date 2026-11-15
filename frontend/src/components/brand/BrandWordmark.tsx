import React from "react";

export interface BrandWordmarkProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Authoritative continuous sphereXPLORER brand wordmark.
 * - "sphere": smaller lowercase letters, warm off-white (#F3EFE8), medium weight.
 * - "XPLORER": larger uppercase letters, bold copper-orange (#F4A272), preserving the final R.
 * - Alignment: "sphere" sits at the vertical centre of the larger "XPLORER".
 * - Optical Kerning: Negative margin ensures ABSOLUTELY NO GAP between the final 'e' and 'X'.
 */
export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm sm:text-base",
    lg: "text-lg sm:text-xl",
  }[size];

  return (
    <span
      className={`brand-wordmark inline-flex items-center tracking-tight select-none font-sans ${sizeClasses} ${className}`}
      aria-label="sphereXplorer"
      style={{ isolation: "isolate" }}
    >
      {/* Lowercase warm off-white "sphere" */}
      <span
        className="font-medium text-[#F3EFE8] leading-none"
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
        className="font-extrabold text-[#F4A272] leading-none uppercase tracking-tight"
        style={{
          fontSize: "1.34em",
          display: "inline-block",
          textShadow: "0 0 16px rgba(244, 162, 114, 0.45)",
        }}
      >
        XPLORER
      </span>
    </span>
  );
};

export default BrandWordmark;
