import React from "react";

export interface ChapterAtmosphericSeparatorProps {
  fromChapter: string;
  toChapter: string;
  fromNumber: string;
  toNumber: string;
  label: string;
  accentColor?: string;
}

/**
 * Clean, Non-Curly Aerospace Chapter Separator.
 * Replaces cartoonish wavy sine banners with a sleek, hairline optical laser divider,
 * centered coordinates indicator, and atmospheric light wash.
 */
export const ChapterAtmosphericSeparator: React.FC<ChapterAtmosphericSeparatorProps> = ({
  fromChapter,
  toChapter,
  fromNumber,
  toNumber,
  label,
  accentColor = "var(--accent)",
}) => {
  return (
    <div
      aria-hidden="true"
      className="chapter-atmospheric-separator relative w-full h-16 sm:h-20 my-1 overflow-hidden pointer-events-none select-none flex items-center justify-center max-w-5xl mx-auto px-4"
    >
      {/* 1. Hairline Laser Beam with Soft Gradient Fade */}
      <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div
        className="absolute inset-x-20 sm:inset-x-32 h-[1px] opacity-70"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
          boxShadow: `0 0 10px ${accentColor}`,
        }}
      />

      {/* 2. Minimalist Aerospace Transit Badge */}
      <div className="relative z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-[#08080E]/90 backdrop-blur-xl border border-white/10 text-[10.5px] font-mono text-white/60 shadow-lg">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
        />
        <span className="font-semibold text-white/90">
          [{fromNumber} → {toNumber}]
        </span>
        <span className="text-white/25">·</span>
        <span className="tracking-wider uppercase text-white/70">
          {label}
        </span>
      </div>
    </div>
  );
};

export default ChapterAtmosphericSeparator;
