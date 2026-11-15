import React from "react";
import { Compass, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { travelBackToJourney, travelToWorkspace } from "../../lib/journeyState";

interface AboutClosingProps {
  defaultReturnChapter?: string;
}

export const AboutClosing: React.FC<AboutClosingProps> = ({ defaultReturnChapter = "mission" }) => {
  const navigate = useNavigate();

  const handleReturnToJourney = () => {
    travelBackToJourney(navigate, defaultReturnChapter);
  };

  const handleOpenExplorer = () => {
    travelToWorkspace(navigate, "/explore", "explorer");
  };

  return (
    <section className="relative w-full py-24 sm:py-32 overflow-hidden flex items-center justify-center text-center">
      {/* Full-Width Atmospheric Celestial Panorama Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/spherex_dr1_allsky_rgb.png"
          alt="Authentic NASA SPHEREx All-Sky Infrared Panorama"
          className="w-full h-full object-cover object-center opacity-25 filter blur-[1px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080C] via-[#08080C]/85 to-[#08080C]" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#08080C]/70 to-[#08080C]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Top Mini Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="font-mono text-xs text-white/80 tracking-widest uppercase">
            YOUR SCIENTIFIC JOURNEY CONTINUES
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl sm:text-6xl font-extralight tracking-tight text-white mb-6 leading-tight">
          Beyond the Horizon Lies Discovery<b className="text-[var(--accent)] font-normal">.</b>
        </h2>

        {/* Narrative */}
        <p className="text-sm sm:text-base text-white/70 max-w-2xl font-light leading-relaxed mb-10">
          The data is real. The questions are yours. The next discovery is waiting.
        </p>

        {/* Two Balanced CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full max-w-md">
          {/* Primary CTA: Return to Journey */}
          <button
            onClick={handleReturnToJourney}
            className="h-12 px-6 rounded-2xl bg-gradient-to-r from-[#f4a272] to-[#ff7b3d] text-black font-semibold text-sm hover:brightness-110 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(244,162,114,0.3)] hover:shadow-[0_0_35px_rgba(244,162,114,0.5)] flex-1 hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
            <span>Return to Journey</span>
          </button>

          {/* Secondary CTA: Sky Explorer */}
          <button
            onClick={handleOpenExplorer}
            className="h-12 px-6 rounded-2xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.15] hover:border-[var(--accent)] text-white font-semibold text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer flex-1 hover:-translate-y-0.5 shadow-sm"
          >
            <Compass className="w-4 h-4 text-[var(--accent)]" />
            <span>Explore the Sky</span>
            <ArrowRight className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Team Signature */}
        <div className="mt-16 pt-8 border-t border-white/10 w-full flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-white/40 gap-4">
          <span>SPHEREx HORIZON · NASA Space Apps 2026</span>
          <span className="text-[var(--accent)] font-normal">Meteor Rizzlers · Kerala, India</span>
          <span>Open Science & Authentic Data</span>
        </div>
      </div>
    </section>
  );
};

export default AboutClosing;
