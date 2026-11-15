import React from "react";
import { ArrowDown } from "lucide-react";

export interface ChapterShowcaseProps {
  id: string;
  numberLabel: string;
  displayTitle: string | React.ReactNode;
  subtitle: string;
  narrative: string | React.ReactNode;
  actions: React.ReactNode;
  visual: React.ReactNode;
  className?: string;
  dataTour?: string;
  nextChapterCue?: { id: string; label: string; number: string };
  onScrollToNext?: (id: string) => void;
  isActive?: boolean;
}

/**
 * Reusable two-column product showcase section.
 * Left: Numbered Label, Massive Typography, Subtitle, Narrative, Prominent CTAs.
 * Right: Interactive Visual Centerpiece.
 * Optimized vertical padding to eliminate excess space below and fit comfortably within the viewport.
 */
export const ChapterShowcase: React.FC<ChapterShowcaseProps> = ({
  id,
  numberLabel,
  displayTitle,
  subtitle,
  narrative,
  actions,
  visual,
  className = "",
  dataTour,
  nextChapterCue,
  onScrollToNext,
}) => {
  return (
    <section
      id={id}
      data-tour={dataTour}
      className={`chapter-showcase w-full min-h-[calc(100vh-70px)] py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative z-10 ${className}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full my-auto">
        {/* Left Side: Numbered Label, Massive Typography, Subtitle, Narrative, CTAs */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          {/* Chapter Number & Label */}
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
              {numberLabel}
            </p>
          </div>

          {/* Massive Expressive Display Headline */}
          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-extralight tracking-tighter text-white uppercase leading-none mb-3">
            {displayTitle}
          </h2>

          {/* Subtitle */}
          <h3 className="text-lg sm:text-xl font-light text-[var(--ink)] tracking-tight mb-3">
            {subtitle}
          </h3>

          {/* Narrative Supporting Story */}
          <div className="text-xs sm:text-sm text-[var(--mut)] leading-relaxed mb-6 max-w-lg">
            {narrative}
          </div>

          {/* Feature Actions / CTAs */}
          <div className="flex flex-col gap-3 w-full">
            {actions}
          </div>
        </div>

        {/* Right Side: Interactive Visual Centerpiece */}
        <div className="lg:col-span-7 flex items-center justify-center w-full">
          {visual}
        </div>
      </div>

      {/* Subtle, elegant Next-Chapter Cue */}
      {nextChapterCue && (
        <div className="w-full flex justify-center pt-3 pb-1">
          <button
            onClick={() => onScrollToNext?.(nextChapterCue.id)}
            className="group flex flex-col items-center gap-1 text-white/40 hover:text-[var(--accent)] transition-all cursor-pointer select-none"
            title={`Scroll to Chapter ${nextChapterCue.number}: ${nextChapterCue.label}`}
          >
            <span className="font-mono text-[10px] tracking-widest uppercase">
              NEXT — {nextChapterCue.number} / {nextChapterCue.label}
            </span>
            <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </section>
  );
};

export default ChapterShowcase;
