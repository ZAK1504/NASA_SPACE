import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TEAM_MEMBERS, TeamMember } from "../../data/team";
import TeamCard from "../about/TeamCard";
import TeamJourney from "../about/TeamJourney";
import WhyWeBuilt from "../about/WhyWeBuilt";
import TechnologyMarquee from "../about/TechnologyMarquee";
import StorybookConnection from "../about/StorybookConnection";
import { travelToWorkspace } from "../../lib/journeyState";
import { ArrowUp, Compass, Sparkles, BookOpen, X, CheckCircle2, History } from "lucide-react";

interface ChapterAboutProps {
  onScrollToTop: () => void;
}

export const ChapterAbout: React.FC<ChapterAboutProps> = ({ onScrollToTop }) => {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const row1 = TEAM_MEMBERS.slice(0, 3);
  const row2 = TEAM_MEMBERS.slice(3, 5);

  const handleOpenExplorer = () => {
    travelToWorkspace(navigate, "/explore", "about");
  };

  const handleOpenChronicle = () => {
    travelToWorkspace(navigate, "/story", "about");
  };

  return (
    <section
      id="about"
      data-tour="journey-about-section"
      className="chapter-about w-full relative z-10 flex flex-col pt-16 pb-20 selection:bg-[var(--accent)] selection:text-black overflow-hidden"
    >
      {/* 1. Cinematic Mission-to-About Atmosphere Transition & Beacon */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mb-16">
        {/* Subtle Ambient Orbital Rings */}
        <div className="orbit-container pointer-events-none" aria-hidden="true">
          <div className="orbit-ring orbit-1" />
          <div className="orbit-ring orbit-2" />
          <div className="orbit-ring orbit-3" />
        </div>

        {/* Chapter 06 Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-6 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
            CHAPTER 06 · BEHIND THE HORIZON
          </span>
        </motion.div>

        {/* Chapter Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extralight tracking-tight text-white mb-4 leading-tight"
        >
          Behind the Horizon<span className="text-[var(--accent)] font-normal">.</span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-2xl text-[var(--ink)] font-light tracking-tight mb-4 max-w-xl"
        >
          Meet the minds behind the mission.
        </motion.p>

        {/* Team Identity Tag */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="font-mono text-xs text-[var(--accent)] tracking-wider uppercase mb-6"
        >
          METEOR RIZZLERS · NASA SPACE APPS CHALLENGE · KERALA, INDIA
        </motion.p>

        {/* Compact Introduction Narrative */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl font-light mb-10"
        >
          We are <strong className="text-white font-medium">Meteor Rizzlers</strong>, a student-led team driven by curiosity and a shared belief that scientific discovery should be accessible to everyone. From exploring near-Earth objects to investigating the changing universe through SPHEREx, our journey is built on open data, creativity and a passion for technology.
        </motion.p>

        {/* Key Metrics Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl"
        >
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
        </motion.div>
      </div>

      {/* 2. Meet the Creators (Editorial 3+2 Grid with Modals) */}
      <section id="creators" className="w-full py-12 sm:py-16 relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
              <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
                THE METEOR RIZZLERS ROSTER
              </p>
            </div>
            <h3 className="text-3xl sm:text-5xl font-extralight tracking-tight text-white mb-3">
              Meet the Creators<span className="text-[var(--accent)] font-normal">.</span>
            </h3>
            <p className="text-sm sm:text-base text-white/60 font-light max-w-xl">
              Different perspectives. Shared curiosity. One vision for discovery.
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Row 1: 3 Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {row1.map((member) => (
                <TeamCard
                  key={member.id}
                  member={member}
                  onOpenDetail={(m) => setSelectedMember(m)}
                />
              ))}
            </div>

            {/* Row 2: 2 Centered Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {row2.map((member) => (
                <TeamCard
                  key={member.id}
                  member={member}
                  onOpenDetail={(m) => setSelectedMember(m)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Journey That Brought Us Here (Animated Timeline) */}
      <TeamJourney />

      {/* 4. Why We Built HORIZON (Philosophy & Authentic Open Science) */}
      <WhyWeBuilt />

      {/* 5. Engineered for Discovery (Infinite Technology Marquee) */}
      <TechnologyMarquee />

      {/* 6. The Cosmic Chronicle Connection Banner (Info Book Entry) */}
      <section className="w-full py-16 sm:py-20 relative z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-950/20 via-[#111117] to-orange-950/20 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
            <div className="flex items-start gap-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] flex-shrink-0 mt-1">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/20">
                    THE COSMIC CHRONICLE
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-2">
                  The Universe in 102 Colours<span className="text-[var(--accent)] font-normal">.</span>
                </h3>
                <p className="text-xs sm:text-sm text-white/65 leading-relaxed max-w-lg font-light">
                  Explore our dedicated illustrated storybook. Turn pages through the science of the infrared sky, galaxy formation, cosmic water ices, and genuine NASA SPHEREx discoveries.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenChronicle}
              className="group z-10 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[var(--accent)] text-white text-xs font-mono transition-all inline-flex items-center gap-2 cursor-pointer whitespace-nowrap hover:-translate-y-0.5 flex-shrink-0"
            >
              <span>READ THE COSMIC CHRONICLE</span>
              <BookOpen className="w-4 h-4 text-[var(--accent)] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Final Cinematic Journey Closing */}
      <section className="relative w-full py-24 sm:py-32 overflow-hidden flex items-center justify-center text-center border-t border-white/5">
        {/* Full-Width Atmospheric Celestial Panorama Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/spherex_dr1_allsky_rgb.png"
            alt="Authentic NASA SPHEREx All-Sky Infrared Panorama"
            className="w-full h-full object-cover object-center opacity-25 filter blur-[1px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080C] via-[#08080C]/85 to-[#08080C]" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#08080C]/70 to-[#08080C]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="font-mono text-xs text-white/80 tracking-widest uppercase">
              THE JOURNEY CONTINUES
            </span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-extralight tracking-tight text-white mb-4 leading-tight">
            The universe brought us together.<br />
            <span className="text-[var(--accent)] font-normal">Curiosity keeps us exploring.</span>
          </h3>

          <p className="text-sm sm:text-base text-white/70 max-w-2xl font-light leading-relaxed mb-10">
            SPHEREx HORIZON. Built on curiosity. Powered by open science.
          </p>

          {/* Dual CTAs: Back to Beginning & Explore the Sky */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full max-w-md">
            <button
              onClick={onScrollToTop}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-[#f4a272] to-[#ff7b3d] text-black font-semibold text-sm hover:brightness-110 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(244,162,114,0.3)] hover:shadow-[0_0_35px_rgba(244,162,114,0.5)] flex-1 hover:-translate-y-0.5"
            >
              <ArrowUp className="w-4 h-4 text-black" />
              <span>Back to Beginning</span>
            </button>

            <button
              onClick={handleOpenExplorer}
              className="h-12 px-6 rounded-2xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.15] hover:border-[var(--accent)] text-white font-semibold text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer flex-1 hover:-translate-y-0.5 shadow-sm"
            >
              <Compass className="w-4 h-4 text-[var(--accent)]" />
              <span>Explore the Sky</span>
            </button>
          </div>

          {/* Bottom Copyright & Verification Line */}
          <div className="mt-16 pt-8 border-t border-white/10 w-full flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-white/40 gap-4">
            <span>SPHEREx HORIZON · NASA Space Apps 2026</span>
            <span className="text-[var(--accent)] font-normal">Meteor Rizzlers · Kerala, India</span>
            <span>Open Science & Authentic Data</span>
          </div>
        </div>
      </section>

      {/* Accessible Detail Modal */}
      {selectedMember && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-modal-title"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#111117] border border-[var(--accent)]/30 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Close profile details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6 pb-6 border-b border-white/10">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/50 border border-white/15 flex-shrink-0">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs font-mono text-[var(--accent)] mb-1.5">
                  {selectedMember.currentRole}
                </div>
                <h3 id="member-modal-title" className="text-2xl font-bold text-white tracking-tight">
                  {selectedMember.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono text-white/50 mt-1">
                  <History className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>2025 NEO Tracker: {selectedMember.previousProjectRole}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">
                Mission Profile & Biography
              </h4>
              <p className="text-sm text-white/80 leading-relaxed font-light">
                {selectedMember.fullBio}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-mono text-[var(--accent)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
                <span>Key Engineering & Scientific Contributions</span>
              </h4>
              <ul className="space-y-2">
                {selectedMember.contributions.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-white/75">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2.5">
                Technical Expertise & Domains
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedMember.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ChapterAbout;
