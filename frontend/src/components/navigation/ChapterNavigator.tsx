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
      className="chapter-navigator fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end pointer-events-auto select-none"
      aria-label="Chapter Navigator"
    >
      <div className="relative flex flex-col items-end gap-6 py-4">
        {/* Continuous vertical tracking line */}
        <div className="absolute right-[5px] top-4 bottom-4 w-[1px] bg-white/10 pointer-events-none" />

        {/* Animated active indicator pip with warm orange glow */}
        <div
          className="absolute right-[3px] w-[5px] h-[5px] rounded-full bg-[var(--accent)] shadow-[0_0_12px_2px_rgba(244,162,114,0.7)] transition-all duration-500 ease-out pointer-events-none"
          style={{
            top: `${16 + safeIndex * 48}px`,
          }}
        />

        {/* Chapter items */}
        {CHAPTERS.map((ch, idx) => {
          const isActive = ch.id === activeChapter;
          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              className="group flex items-center gap-3 cursor-pointer py-1 text-right focus:outline-none"
              title={`Jump to Chapter ${ch.num}: ${ch.label}`}
            >
              <span
                className={`font-mono text-[10.5px] tracking-wider transition-all duration-300 ${
                  isActive
                    ? "text-white font-medium drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
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
              <span
                className={`w-[7px] h-[7px] rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-[var(--accent)] scale-125 shadow-[0_0_8px_rgba(244,162,114,0.8)]"
                    : "bg-white/20 group-hover:bg-white/50"
                }`}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default ChapterNavigator;