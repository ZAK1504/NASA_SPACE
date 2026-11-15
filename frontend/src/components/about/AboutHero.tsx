import React from "react";
import { Sparkles, Compass, Award, ArrowDown } from "lucide-react";

interface AboutHeroProps {
  onScrollToTeam: () => void;
}

export const AboutHero: React.FC<AboutHeroProps> = ({ onScrollToTeam }) => {
  const headlineWords = ["Behind", "the", "Horizon."];

  return (
    <section className="about-hero relative w-full flex flex-col items-center justify-center pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* 1. Ambient Cosmic Background Lighting */}
      <div className="hero-ambient-glow" aria-hidden="true" />

      {/* 2. Thin Orbital Rings Ambient Animation */}
      <div className="orbit-container" aria-hidden="true">
        <div className="orbit-ring orbit-1" />
        <div className="orbit-ring orbit-2" />
        <div className="orbit-ring orbit-3" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Top Badges */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md mb-8 shadow-sm">
          <span className="badge-pulse-dot" />
          <span className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
            METEOR RIZZLERS · NASA SPACE APPS CHALLENGE 2026
          </span>
        </div>

        {/* Massive Editorial Headline with Staggered Word Reveal */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extralight tracking-tighter text-white leading-none mb-6">
          {headlineWords.map((word, idx) => (
            <span
              key={word}
              className="hero-word-reveal mr-3 last:mr-0"
              style={{ animationDelay: `${0.1 + idx * 0.12}s` }}
            >
              {word === "Horizon." ? (
                <span className="text-white">
                  Horizon<b className="text-[var(--accent)] font-normal">.</b>
                </span>
              ) : (
                word
              )}
            </span>
          ))}
        </h1>

        {/* Supporting Headline & Opening Narrative */}
        <p className="text-xl sm:text-2xl font-light text-[var(--ink)] tracking-tight mb-4 max-w-2xl">
          Meet the minds behind the mission.
        </p>

        <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-2xl mb-4 font-normal">
          We are <strong className="text-white font-semibold">Meteor Rizzlers</strong>, a student-led team from Kerala, India, building interactive experiences that bring real astronomical data closer to everyone.
        </p>

        <p className="font-mono text-xs text-[var(--accent)] tracking-wider uppercase mb-10">
          Built on curiosity. Powered by open science.
        </p>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl mb-12">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
            <span className="text-2xl sm:text-3xl font-light text-white font-mono block">TOP 45</span>
            <span className="text-[10px] sm:text-xs font-mono text-white/50 tracking-wider uppercase">2025 Global Finalist</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
            <span className="text-2xl sm:text-3xl font-light text-[var(--accent)] font-mono block">102</span>
            <span className="text-[10px] sm:text-xs font-mono text-white/50 tracking-wider uppercase">Infrared Channels</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
            <span className="text-2xl sm:text-3xl font-light text-white font-mono block">5</span>
            <span className="text-[10px] sm:text-xs font-mono text-white/50 tracking-wider uppercase">Team Creators</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
            <span className="text-2xl sm:text-3xl font-light text-[var(--accent2)] font-mono block">100%</span>
            <span className="text-[10px] sm:text-xs font-mono text-white/50 tracking-wider uppercase">Open Science Data</span>
          </div>
        </div>

        {/* Scroll Indicator to Team */}
        <button
          onClick={onScrollToTeam}
          className="group inline-flex items-center gap-2 text-xs font-mono text-white/50 hover:text-[var(--accent)] transition-all cursor-pointer py-2 px-4 rounded-full border border-white/10 hover:border-[var(--accent)]/40 hover:bg-white/[0.04]"
        >
          <span>EXPLORE CREATORS & MISSION STORY</span>
          <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-1 transition-transform text-[var(--accent)]" />
        </button>
      </div>
    </section>
  );
};

export default AboutHero;
