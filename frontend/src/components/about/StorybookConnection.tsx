import React from "react";
import { BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { travelBackToJourney } from "../../lib/journeyState";

export const StorybookConnection: React.FC = () => {
  const navigate = useNavigate();

  const handleExploreStory = () => {
    // Return to Journey home where the storytelling narrative unfolds
    travelBackToJourney(navigate, "home");
  };

  return (
    <section className="w-full py-16 sm:py-20 relative z-10 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-950/20 via-[#111117] to-orange-950/20 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
          {/* Subtle Ambient Cosmic Light */}
          <div className="absolute inset-0 bg-radial from-[var(--accent)]/5 to-transparent pointer-events-none" />

          <div className="flex items-start gap-4 z-10">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] flex-shrink-0 mt-1">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/20">
                  COSMIC CHRONICLE
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-2">
                Every Mission Has a Story<b className="text-[var(--accent)] font-normal">.</b>
              </h3>
              <p className="text-xs sm:text-sm text-white/65 leading-relaxed max-w-lg">
                From the first ideas behind SPHEREx to the observations that continue to reshape our understanding of the universe, explore the real history behind the data.
              </p>
            </div>
          </div>

          <button
            onClick={handleExploreStory}
            className="group z-10 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[var(--accent)] text-white text-xs font-mono transition-all inline-flex items-center gap-2 cursor-pointer whitespace-nowrap hover:-translate-y-0.5 flex-shrink-0"
          >
            <span>EXPLORE THE STORY</span>
            <ArrowRight className="w-4 h-4 text-[var(--accent)] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default StorybookConnection;
