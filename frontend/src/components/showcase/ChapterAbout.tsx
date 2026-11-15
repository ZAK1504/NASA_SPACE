import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TEAM_MEMBERS } from "../../data/team";
import { travelToWorkspace } from "../../lib/journeyState";
import { Award, Users, ArrowRight, ArrowUp, Sparkles } from "lucide-react";

interface ChapterAboutProps {
  onScrollToTop: () => void;
}

export const ChapterAbout: React.FC<ChapterAboutProps> = ({ onScrollToTop }) => {
  const navigate = useNavigate();

  const handleOpenFullAbout = () => {
    travelToWorkspace(navigate, "/about", "about");
  };

  return (
    <section
      id="about"
      data-tour="journey-about-section"
      className="chapter-about w-full min-h-[calc(100vh-70px)] py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center relative z-10 selection:bg-[var(--accent)] selection:text-black"
    >
      {/* 1. Header & Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        {/* Chapter 06 Label */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
            CHAPTER 06 — ABOUT
          </span>
        </div>

        {/* Main Headline */}
        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extralight tracking-tight text-white mb-2 leading-tight">
          Behind the Horizon<span className="text-[var(--accent)] font-normal">.</span>
        </h2>

        {/* Supporting Headline */}
        <p className="text-lg sm:text-2xl text-[var(--ink)] font-light tracking-tight mb-4">
          Meet the minds behind the mission.
        </p>

        {/* Achievement Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-mono mb-6 shadow-sm">
          <Award className="w-4 h-4 text-[var(--accent)]" />
          <span className="font-semibold tracking-wide">NASA Space Apps 2025 Global Finalists</span>
        </div>

        {/* Narrative Description */}
        <p className="text-sm sm:text-base text-white/75 leading-relaxed max-w-2xl font-light mb-10">
          We are <strong className="text-white font-medium">Meteor Rizzlers</strong>, a student-led team from Kerala, India, driven by curiosity and a shared passion for making the universe more accessible through technology and open science.
        </p>
      </motion.div>

      {/* 2. Compact Team Presentation (Portrait Cards for All 5 Creators) */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 w-full max-w-6xl mb-10"
      >
        {TEAM_MEMBERS.map((member, idx) => (
          <div
            key={member.id}
            onClick={handleOpenFullAbout}
            className="group p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[var(--accent)]/50 backdrop-blur-sm flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.06] cursor-pointer shadow-sm relative overflow-hidden"
          >
            {/* Subtle Top Accent Indicator */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Avatar */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 rounded-full overflow-hidden border-2 border-white/15 group-hover:border-[var(--accent)] transition-all shadow-md">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Name */}
            <h4 className="text-xs sm:text-sm font-semibold text-white tracking-tight group-hover:text-[var(--accent)] transition-colors mb-1 line-clamp-1">
              {member.name}
            </h4>

            {/* Role */}
            <p className="text-[10px] sm:text-[11px] text-white/50 font-mono leading-tight line-clamp-2">
              {member.currentRole}
            </p>
          </div>
        ))}
      </motion.div>

      {/* 3. Primary Call to Action: Meet the Team & Return */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md"
      >
        {/* Primary CTA */}
        <button
          onClick={handleOpenFullAbout}
          className="group h-12 px-8 rounded-2xl bg-gradient-to-r from-[#f4a272] to-[#ff7b3d] text-black font-semibold text-sm hover:brightness-110 transition-all cursor-pointer inline-flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(244,162,114,0.3)] hover:shadow-[0_0_35px_rgba(244,162,114,0.5)] flex-1 hover:-translate-y-0.5"
        >
          <Users className="w-4 h-4 text-black" />
          <span>Meet the Team</span>
          <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Secondary Return Action */}
        <button
          onClick={onScrollToTop}
          className="h-12 px-5 rounded-2xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 hover:text-white font-mono text-xs transition-all inline-flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
          title="Return to Chapter 01 (Home)"
        >
          <ArrowUp className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Back to Top</span>
        </button>
      </motion.div>

      {/* 4. Elegant Bottom Branding Tag */}
      <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-white/40 max-w-4xl mx-auto w-full gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>sphereXplorer · METEOR RIZZLERS</span>
        </div>
        <span>EXPLORE THE UNIVERSE THROUGH NASA’S SPHEREx MISSION</span>
      </div>
    </section>
  );
};

export default ChapterAbout;
