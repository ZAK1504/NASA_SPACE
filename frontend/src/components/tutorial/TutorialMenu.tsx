import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Play, CheckCircle2, X, Compass, Layers, Clock, Sparkles } from 'lucide-react';
import { useGuidedTour } from '../../hooks/useGuidedTour';
import { useLocation } from 'react-router-dom';

export const TutorialMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { startTour, isTourCompleted, availableTours } = useGuidedTour();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Determine current recommended tour based on route
  const getRecommendedTourId = (): string => {
    if (location.pathname.includes('/spectral')) return 'spectral-explorer';
    if (location.pathname.includes('/time-machine')) return 'time-machine';
    if (location.pathname.includes('/discovery-lab')) return 'discovery-lab';
    if (location.pathname.includes('/objects')) return 'object-explorer';
    return 'getting-started';
  };

  const recommendedId = getRecommendedTourId();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111117] hover:bg-[#1C283F] border border-[#262635] text-xs font-medium text-[#F4A272] hover:text-[#93c5fd] transition-all shadow-sm"
        title="Interactive Guided Tours"
        aria-label="Tutorial"
      >
        <HelpCircle className="w-3.5 h-3.5 text-[#F4A272]" />
        <span>How to Use</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#111117] border border-[#262635] rounded-xl shadow-2xl z-50 p-3 animate-fade-in text-[#F3EFE8]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#262635]">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#F4A272]" />
              <span className="text-xs font-semibold tracking-wide uppercase text-[#9E9AA7]">
                Interactive Tours
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#9E9AA7] hover:text-[#F3EFE8] rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {availableTours.map((tour) => {
              const completed = isTourCompleted(tour.id);
              const isRecommended = tour.id === recommendedId;

              return (
                <div
                  key={tour.id}
                  onClick={() => {
                    setIsOpen(false);
                    startTour(tour.id);
                  }}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isRecommended
                      ? 'bg-[#181822] border-[#F4A272] shadow-[0_0_15px_rgba(244,162,114,0.2)]'
                      : 'bg-[#111117]/70 border-[#262635] hover:bg-[#181822] hover:border-[#F4A272]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#F3EFE8] flex items-center gap-1.5">
                      {tour.id === 'getting-started' && <Sparkles className="w-3.5 h-3.5 text-[#F3B85B]" />}
                      {tour.id === 'spectral-explorer' && <Layers className="w-3.5 h-3.5 text-[#F4A272]" />}
                      {tour.id === 'object-explorer' && <Compass className="w-3.5 h-3.5 text-[#A78BFA]" />}
                      {tour.id === 'time-machine' && <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />}
                      {tour.id === 'discovery-lab' && <Compass className="w-3.5 h-3.5 text-[#34D399]" />}
                      {tour.title}
                    </span>
                    {completed ? (
                      <span className="flex items-center gap-1 text-[10px] text-[#4ADE80]">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : isRecommended ? (
                      <span className="text-[10px] bg-[#F4A272]/20 text-[#F4A272] px-1.5 py-0.5 rounded font-mono">
                        Here
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-[#9E9AA7] leading-tight line-clamp-2">
                    {tour.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-[#262635] text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                startTour('getting-started');
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-[#F4A272] to-[#FF7B3D] hover:brightness-110 text-black font-semibold text-xs font-medium rounded-md transition-all shadow"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Start Overview Tour</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
