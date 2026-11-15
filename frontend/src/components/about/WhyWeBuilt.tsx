import React from "react";
import { ExternalLink, Sparkles, Globe, Database, BookOpen } from "lucide-react";

export const WhyWeBuilt: React.FC = () => {
  return (
    <section className="w-full py-16 sm:py-24 relative z-10 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-gradient-to-b from-[#111117] to-[#0b0b10] border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle warm accent lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/10 rounded-full filter blur-3xl pointer-events-none" />

          {/* Tag */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">
              PHILOSOPHY & SCIENTIFIC PURPOSE
            </p>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-5xl font-extralight tracking-tight text-white mb-6 leading-tight">
            The Universe Should Be Open to Everyone<b className="text-[var(--accent)] font-normal">.</b>
          </h2>

          {/* Narrative Paragraphs */}
          <div className="space-y-5 text-sm sm:text-base text-white/75 font-light leading-relaxed mb-8">
            <p>
              The universe is constantly changing. Stars move, light varies, and different wavelengths reveal completely different physical processes. Yet much of the data that allows us to investigate those changes remains locked behind specialized astronomical formats, complex FITS viewers, and steep mathematical prerequisites.
            </p>
            <p>
              NASA's SPHEREx mission is transforming what an all-sky spectral survey can reveal. By observing the entire celestial sphere across <strong className="text-white font-medium">102 nominal infrared wavelength channels</strong> (0.75 μm – 5.0 μm) and sharing its observations publicly through open science, it provides unprecedented opportunities to investigate cosmic inflation, galaxy evolution, and interstellar biogenic ices.
            </p>
            <p>
              We built <strong className="text-white font-medium">sphereXplorer</strong> to bring those opportunities directly into the hands of students, educators, and curious explorers everywhere. Through interactive sky spheres, multi-epoch observation playback, 102-channel spectral cross-sections, and calibrated photometry tools, we want users to move beyond simply looking at space — and begin asking their own scientific questions.
            </p>
          </div>

          {/* Closing Statement Quote */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border-l-2 border-[var(--accent)] mb-8">
            <p className="font-serif italic text-base sm:text-lg text-[var(--ink)]">
              "The universe is not a static picture. It is a story still being written."
            </p>
            <span className="block font-mono text-xs text-[var(--accent)] mt-2 uppercase tracking-wider">
              — Meteor Rizzlers · NASA Space Apps 2026
            </span>
          </div>

          {/* Official Verification Links */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap gap-4 items-center">
            <span className="font-mono text-xs text-white/40 uppercase">Official Mission References:</span>
            <a
              href="https://science.nasa.gov/mission/spherex/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--accent)] hover:text-white transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>NASA SPHEREx Mission</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://science.nasa.gov/open-science/spherex-universe-map/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--accent)] hover:text-white transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>NASA Open Science Universe Map</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href="https://caltech-ipac.github.io/spherex-archive-documentation/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--accent)] hover:text-white transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>IRSA SPHEREx Documentation</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyWeBuilt;
