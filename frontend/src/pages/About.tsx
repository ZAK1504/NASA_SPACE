import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TextType from "../components/ui/TextType";
import DecryptedText from "../components/ui/DecryptedText";
import AnimatedText from "../components/ui/AnimatedText";
import AnimatedCharacters from "../components/ui/AnimatedCharacters";
import { TEAM_MEMBERS, TECHNOLOGIES, TeamMember } from "../data/team";
import { travelBackToJourney, travelToWorkspace } from "../lib/journeyState";
import { Compass, ArrowLeft, ArrowRight, X, CheckCircle2, History, Award } from "lucide-react";
import "../styles/about.css";

interface AboutProps {
  defaultReturnChapter?: string;
}

export const About: React.FC<AboutProps> = ({ defaultReturnChapter = "mission" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 160]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.85]);

  const handleReturnToJourney = () => {
    travelBackToJourney(navigate, defaultReturnChapter);
  };

  const handleOpenExplorer = () => {
    travelToWorkspace(navigate, "/explore", "explorer");
  };

  // Logo Loop Animation Component with Authentic sphereXplorer Stack
  const LogoLoop = () => {
    return (
      <div className="logo-loop-container" aria-label="Authentic technologies powering sphereXplorer">
        <div className="logo-loop-track-wrapper">
          <div className="logo-loop-track">
            {/* Render logos two times for seamless 50% loop */}
            {[...TECHNOLOGIES, ...TECHNOLOGIES].map((tech, index) => (
              <motion.div
                key={`${tech.name}-${index}`}
                className="logo-loop-item"
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 },
                }}
              >
                <div className="logo-loop-card">
                  <div className="logo-loop-name">{tech.name}</div>
                  <div className="logo-loop-category">{tech.category}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="about-page" ref={containerRef}>
      {/* Hero Section with Parallax & Animated Text */}
      <motion.section
        className="about-hero"
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
      >
        <div className="about-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-badge"
          >
            <span className="badge-dot" />
            <AnimatedCharacters text="METEOR RIZZLERS · NASA SPACE APPS 2026" delay={0.3} />
          </motion.div>

          <h1 className="about-hero-title">
            <span className="hero-headline-line block text-white font-extralight">
              Behind the Horizon<span className="text-[var(--accent)] font-normal">.</span>
            </span>
            <span className="hero-headline-line block text-[var(--accent)] font-light mt-1 text-2xl sm:text-4xl lg:text-5xl">
              From Curiosity to Discovery<span className="text-white font-extralight">.</span>
            </span>
          </h1>

          <AnimatedText
            text="We are Meteor Rizzlers, a student-led team from Kerala, India, building interactive experiences that bring real astronomical data closer to everyone."
            className="about-hero-description"
            delay={0.4}
          />

          {/* Hero Stats Grid (Humble, balanced 3-stat scientific summary) */}
          <motion.div
            className="hero-stats-grid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="hero-stat-card">
              <div className="stat-number">102</div>
              <div className="stat-label">Infrared Channels</div>
            </div>
            <div className="hero-stat-card">
              <div className="stat-number">5</div>
              <div className="stat-label">Team Creators</div>
            </div>
            <div className="hero-stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">Open Science Data</div>
            </div>
          </motion.div>
        </div>

        {/* Animated Background Orbital Rings */}
        <div className="hero-bg-animation">
          <div className="orbit-ring orbit-1" />
          <div className="orbit-ring orbit-2" />
          <div className="orbit-ring orbit-3" />
        </div>
      </motion.section>

      {/* Team Section with ReactBits 3D Tilt Animations */}
      <section className="about-section team-section" id="creators">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-title">
              <AnimatedText text="Meet the Creators" />
            </h2>
            <AnimatedText
              text="Different perspectives. Shared curiosity. One vision for discovery."
              className="section-subtitle"
              delay={0.2}
            />
          </motion.div>

          <div className="team-grid">
            {TEAM_MEMBERS.map((member, index) => (
              <motion.div
                key={member.id}
                className="team-card"
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  y: 60,
                  rotateX: 15,
                  filter: "blur(10px)",
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  rotateX: 0,
                  filter: "blur(0px)",
                }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                  ease: [0.25, 0.4, 0.25, 1],
                  scale: {
                    type: "spring",
                    damping: 20,
                    stiffness: 100,
                  },
                }}
                whileHover={{
                  y: -18,
                  scale: 1.03,
                  transition: {
                    type: "spring",
                    damping: 15,
                    stiffness: 300,
                  },
                }}
                onClick={() => setSelectedMember(member)}
              >
                <motion.div
                  className="team-card-inner"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Rotating Spring Avatar with Shine Sweep */}
                  <motion.div
                    className="team-avatar"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.15 + 0.2,
                      duration: 0.6,
                      type: "spring",
                      damping: 12,
                      stiffness: 100,
                    }}
                    whileHover={{
                      scale: 1.15,
                      rotate: 5,
                      transition: { duration: 0.3 },
                    }}
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="team-avatar-img"
                    />
                  </motion.div>

                  {/* Name with DecryptedText Cyber Scramble on Hover */}
                  <motion.h3
                    className="team-name"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
                  >
                    <DecryptedText text={member.name} interval={35} />
                  </motion.h3>

                  {/* Role */}
                  <motion.p
                    className="team-role"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.4, duration: 0.5 }}
                  >
                    {member.currentRole}
                  </motion.p>

                  {/* Bio */}
                  <motion.p
                    className="team-bio"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.5, duration: 0.5 }}
                  >
                    {member.shortBio}
                  </motion.p>

                  {/* Expertise Tags with Spring Pop */}
                  <motion.div
                    className="team-expertise"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.6, duration: 0.5 }}
                  >
                    {member.skills.map((skill, idx) => (
                      <motion.span
                        key={idx}
                        className="expertise-tag"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.15 + 0.65 + idx * 0.06,
                          type: "spring",
                          damping: 15,
                          stiffness: 200,
                        }}
                        whileHover={{
                          scale: 1.1,
                          backgroundColor: "rgba(244, 162, 114, 0.25)",
                          transition: { duration: 0.2 },
                        }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section with Infinite Logo Loop */}
      <section className="about-section tech-section">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-title">
              <AnimatedText text="Powered by Innovation" />
            </h2>
            <AnimatedText
              text="Engineered with genuine NASA open science data, high-performance astrophysics pipelines, and WebGL rendering"
              className="section-subtitle"
              delay={0.2}
            />
          </motion.div>

          {/* Infinite Logo Loop */}
          <LogoLoop />
        </div>
      </section>

      {/* Impact Story Section with Animated Text */}
      <section className="about-section story-section">
        <div className="section-container">
          <motion.div
            className="story-content-simple"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <div className="story-text-center">
              <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <AnimatedCharacters text="The Universe Should Be Open to Everyone" />
              </motion.h2>
              <div className="story-divider" />

              <AnimatedText
                text="The universe is constantly changing. Stars move, light varies, and different wavelengths reveal completely different physical processes. Yet much of the data that allows us to investigate those changes remains locked behind specialized astronomical formats and steep mathematical prerequisites."
                className="story-paragraph-pro"
                delay={0.2}
              />

              <AnimatedText
                text="NASA's SPHEREx mission is transforming what an all-sky spectral survey can reveal. By observing the entire celestial sphere across 102 nominal infrared wavelength channels and sharing its observations publicly, it provides unprecedented opportunities to investigate cosmic history."
                className="story-paragraph-pro"
                delay={0.3}
              />

              <AnimatedText
                text="We built sphereXplorer to bring those opportunities directly into the hands of students, educators, and curious explorers everywhere. Through interactive sky spheres, multi-epoch observation playback, and calibrated photometry tools, we want users to move beyond simply looking at space—and begin asking their own scientific questions."
                className="story-paragraph-pro"
                delay={0.4}
              />

              {/* Seamless Editorial Quote Reveal (Eliminates character-by-character glitch & text-clip flashes) */}
              <motion.div
                className="story-highlight-quote"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.85,
                      ease: [0.16, 1, 0.3, 1],
                      staggerChildren: 0.22,
                      delayChildren: 0.15,
                    },
                  },
                }}
              >
                <motion.span
                  className="block text-xl sm:text-2xl lg:text-3xl font-light text-white tracking-tight mb-2"
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  The universe is not a static picture.
                </motion.span>
                <motion.span
                  className="block text-xl sm:text-2xl lg:text-3xl font-medium text-[#F4A272] tracking-tight"
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  It is a story still being written.
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Full-Screen Edge-to-Edge Astronomical Panorama Finale */}
      <section className="about-finale relative w-full min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden border-t border-white/10">
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.08 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: "easeOut" }}
        >
          <img
            src="/spherex_dr1_allsky_rgb.png"
            alt="Authentic NASA SPHEREx All-Sky Infrared Panorama"
            className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.15]"
          />
          {/* Subtle gradient vignette for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/70 pointer-events-none" />
        </motion.div>

        <motion.div
          className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center flex flex-col items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.22, delayChildren: 0.2 },
            },
          }}
        >
          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 35 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
            }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extralight tracking-tight text-white mb-6 leading-tight"
          >
            Beyond the Horizon <span className="text-[var(--accent)] font-normal">Lies Discovery.</span>
          </motion.h2>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 25 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
            }}
            className="text-base sm:text-xl text-white/80 font-light max-w-xl mx-auto mb-10 leading-relaxed drop-shadow"
          >
            The data is real. The questions are yours. The next discovery is waiting.
          </motion.p>

          {/* Staggered Dual Action CTAs */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={handleReturnToJourney}
              className="w-full sm:w-auto h-12 px-7 rounded-2xl bg-gradient-to-r from-[#f4a272] to-[#ff7b3d] text-black font-semibold text-sm hover:brightness-110 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(244,162,114,0.35)] hover:shadow-[0_0_35px_rgba(244,162,114,0.55)] hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4 text-black" />
              <span>Return to Journey</span>
            </button>
            <button
              onClick={handleOpenExplorer}
              className="w-full sm:w-auto h-12 px-7 rounded-2xl border border-white/25 bg-white/[0.08] hover:bg-white/[0.15] hover:border-[var(--accent)] text-white font-semibold text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 shadow-sm backdrop-blur-md"
            >
              <Compass className="w-4 h-4 text-[var(--accent)]" />
              <span>Explore the Sky</span>
              <ArrowRight className="w-4 h-4 text-white/50" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Detail Modal for Selected Member */}
      {selectedMember && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-modal-title"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedMember(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
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
              <p className="text-sm text-white/80 leading-relaxed">
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
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default About;
