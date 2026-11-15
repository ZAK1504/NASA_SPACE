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
 * Centrally Aligned Cinematic Chapter Showcase.
 * All typography (headlines, numbers, subtitles, narratives), visual centerpieces,
 * and action CTA buttons are symmetrically, centrally aligned with smooth page-to-page transitions.
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
      className={`chapter-showcase w-full min-h-[calc(100vh-70px)] py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center items-center text-center relative z-10 transition-all duration-700 ease-out select-none ${className}`}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto text-center my-auto">
        {/* 1. Centered Numbered Badge */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
          <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase text-center">
            {numberLabel}
          </p>
        </div>

        {/* 2. Centered Massive Headline */}
        <h2 className="text-5xl sm:text-7xl lg:text-8xl font-extralight tracking-tighter text-white uppercase leading-none mb-3 text-center">
          {displayTitle}
        </h2>

        {/* 3. Centered Subtitle */}
        <h3 className="text-xl sm:text-2xl font-light text-[var(--ink)] tracking-tight mb-3 text-center">
          {subtitle}
        </h3>

        {/* 4. Centered Narrative Description */}
        <div className="text-sm sm:text-base text-[var(--mut)] leading-relaxed mb-6 max-w-2xl mx-auto text-center">
          {narrative}
        </div>

        {/* 5. Centered Interactive Visual Centerpiece */}
        <div className="w-full flex items-center justify-center my-2 max-w-2xl mx-auto">
          {visual}
        </div>

        {/* 6. Centered Feature Actions / CTAs */}
        <div className="w-full max-w-3xl mx-auto flex items-center justify-center gap-3 mt-4">
          {actions}
        </div>

        {/* 7. Centered Next-Chapter Scroll Cue */}
        {nextChapterCue && (
          <div className="w-full flex justify-center pt-6 mt-2">
            <button
              onClick={() => onScrollToNext?.(nextChapterCue.id)}
              className="group flex flex-col items-center gap-1.5 text-white/40 hover:text-[var(--accent)] transition-all cursor-pointer select-none"
              title={`Scroll to Chapter ${nextChapterCue.number}: ${nextChapterCue.label}`}
            >
              <span className="font-mono text-[10px] tracking-widest uppercase">
                NEXT — {nextChapterCue.number} / {nextChapterCue.label}
              </span>
              <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ChapterShowcase;
