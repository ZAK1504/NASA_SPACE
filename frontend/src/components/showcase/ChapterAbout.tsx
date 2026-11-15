import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TEAM_MEMBERS } from "../../data/team";
import { travelToWorkspace } from "../../lib/journeyState";
import { Users, ArrowRight, ArrowUp, Sparkles } from "lucide-react";

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
      className="chapter-about w-full min-h-[calc(100vh-70px)] py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative z-10 selection:bg-[var(--accent)] selection:text-black"
    >
      {/* 1. Left-aligned Chapter Number & Tag matching Chapters 01 - 05 */}
      <div className="w-full flex items-center gap-2 mb-4 sm:mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
        <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
          06 — ABOUT
        </p>
      </div>

      {/* 2. Centered Editorial Showcase Content */}
      <div className="flex flex-col items-center text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Main Headline */}
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extralight tracking-tight text-white mb-2 leading-tight">
            Behind the Horizon<span className="text-[var(--accent)] font-normal">.</span>
          </h2>

          {/* Supporting Headline */}
          <p className="text-lg sm:text-2xl text-[var(--ink)] font-light tracking-tight mb-4">
            Meet the minds behind the mission.
          </p>

          {/* Narrative Description (Humble, focused on curiosity & open science) */}
          <p className="text-sm sm:text-base text-white/75 leading-relaxed max-w-2xl font-light mb-10">
            We are <strong className="text-white font-medium">Meteor Rizzlers</strong>, a student-led team from Kerala, India, driven by curiosity and a shared passion for making the universe more accessible through technology and open science.
          </p>
        </motion.div>

        {/* 3. Compact Team Presentation (Portrait Cards for All 5 Creators) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 w-full max-w-6xl mb-10"
        >
          {TEAM_MEMBERS.map((member) => (
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

        {/* 4. Action Buttons & Return Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto"
        >
          {/* Main Action: Open Full About Page */}
          <button
            onClick={handleOpenFullAbout}
            className="group h-12 px-6 rounded-2xl bg-gradient-to-r from-[#f4a272] to-[#ff7b3d] text-black font-semibold text-sm hover:brightness-110 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(244,162,114,0.3)] hover:shadow-[0_0_35px_rgba(244,162,114,0.5)] w-full sm:w-auto flex-1 hover:-translate-y-0.5"
          >
            <Users className="w-4 h-4 text-black" />
            <span>Meet the Team & Scientific Mission</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Action: Back to Top of Journey */}
          <button
            onClick={onScrollToTop}
            className="group h-12 px-5 rounded-2xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.15] hover:border-[var(--accent)] text-white font-semibold text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto hover:-translate-y-0.5 shadow-sm"
          >
            <ArrowUp className="w-4 h-4 text-[var(--accent)] group-hover:-translate-y-0.5 transition-transform" />
            <span>Return to Beginning</span>
          </button>
        </motion.div>

        {/* Discreet Footer Note */}
        <div className="mt-8 text-xs font-mono text-white/40 flex items-center justify-center gap-2">
          <span>sphereXplorer</span>
          <span>·</span>
          <span>Open Science Platform</span>
          <span>·</span>
          <span>NASA Space Apps 2026</span>
        </div>
      </div>
    </section>
  );
};

export default ChapterAbout;
