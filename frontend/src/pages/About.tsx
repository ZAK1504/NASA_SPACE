import React, { useEffect } from "react";
import AboutHero from "../components/about/AboutHero";
import TeamSection from "../components/about/TeamSection";
import TeamJourney from "../components/about/TeamJourney";
import WhyWeBuilt from "../components/about/WhyWeBuilt";
import TechnologyMarquee from "../components/about/TechnologyMarquee";
import StorybookConnection from "../components/about/StorybookConnection";
import AboutClosing from "../components/about/AboutClosing";
import "../styles/about.css";

interface AboutProps {
  defaultReturnChapter?: string;
}

export const About: React.FC<AboutProps> = ({ defaultReturnChapter = "mission" }) => {
  // Ensure the page initially opens at its top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const handleScrollToTeam = () => {
    const el = document.getElementById("creators");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="horizon-about">
      {/* 1. Cinematic Hero Section */}
      <AboutHero onScrollToTeam={handleScrollToTeam} />

      {/* 2. Meet the Creators (The central focus: 5 team profiles) */}
      <TeamSection />

      {/* 3. The Journey That Brought Us Here (Timeline: 2025 NEO Tracker, 2025 Global Finalist, 2026 SPHEREx HORIZON) */}
      <TeamJourney />

      {/* 4. Why We Built HORIZON (Editorial manifesto & authentic open-science purpose) */}
      <WhyWeBuilt />

      {/* 5. Engineered for Discovery (Seamless infinite technology marquee) */}
      <TechnologyMarquee />

      {/* 6. The Cosmic Chronicle Connection */}
      <StorybookConnection />

      {/* 7. Final Cinematic Closing */}
      <AboutClosing defaultReturnChapter={defaultReturnChapter} />
    </div>
  );
};

export default About;
