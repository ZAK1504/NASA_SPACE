import React from "react";

export interface ChapterDef {
  id: string;
  num: string;
  label: string;
}

export const CHAPTERS: ChapterDef[] = [
  { id: "home", num: "01", label: "HOME" },
  { id: "explorer", num: "02", label: "EXPLORE" },
  { id: "time-machine", num: "03", label: "TIME" },
  { id: "labs", num: "04", label: "LABS" },
  { id: "mission", num: "05", label: "MISSION" },
];

interface ChapterNavigatorProps {
  activeChapter: string;
  onSelectChapter: (chapterId: string) => void;
}

/**
 * Right-side vertical chapter progress navigator inspired by ZENVYX service showcase.
 * Displays HOME 01, EXPLORE 02, TIME 03, LABS 04, MISSION 05 with a thin tracking line
 * and animated warm-orange active indicator.
 */
export const ChapterNavigator: React.FC<ChapterNavigatorProps> = ({
  activeChapter,
  onSelectChapter,
}) => {
  const activeIndex = CHAPTERS.findIndex((c) => c.id === activeChapter);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <aside
      className="chapter-navigator fixed right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-end pointer-events-auto select-none pr-1"
      aria-label="Chapter Navigator"
    >
      <div className="relative flex flex-col items-end gap-5 py-4">
        {/* Continuous vertical tracking line */}
        <div className="absolute right-[5px] top-3 bottom-3 w-[1px] bg-white/10 pointer-events-none" />

        {/* Chapter items with integrated active indicator */}
        {CHAPTERS.map((ch, idx) => {
          const isActive = ch.id === activeChapter;
          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              className="group relative flex items-center gap-3 cursor-pointer py-1.5 text-right focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] rounded"
              title={`Jump to Chapter ${ch.num}: ${ch.label}`}
            >
              <span
                className={`font-mono text-[10.5px] tracking-wider transition-all duration-300 ${
                  isActive
                    ? "text-white font-medium drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
                    : "text-white/40 group-hover:text-white/80"
                }`}
              >
                {ch.label}
              </span>

              <span
                className={`font-mono text-[10px] tracking-widest transition-all duration-300 ${
                  isActive
                    ? "text-[var(--accent)] font-semibold"
                    : "text-white/30 group-hover:text-[var(--accent)]/70"
                }`}
              >
                {ch.num}
              </span>

              {/* Node dot on the line */}
              <span className="relative flex items-center justify-center w-[11px] h-[11px]">
                {isActive && (
                  <span className="absolute w-[11px] h-[11px] rounded-full bg-[var(--accent)]/30 animate-ping" />
                )}
                <span
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-[7px] h-[7px] bg-[var(--accent)] shadow-[0_0_10px_rgba(244,162,114,0.9)] scale-125"
                      : "w-[5px] h-[5px] bg-white/20 group-hover:bg-white/50"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default ChapterNavigator;