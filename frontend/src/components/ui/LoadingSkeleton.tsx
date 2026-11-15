import React from 'react';

interface SkeletonProps { className?: string; }

export const LoadingSkeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`skeleton rounded ${className}`} />
);

export const SkeletonLines: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`skeleton rounded h-3.5 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-[#111117] border border-[#262635] rounded p-4 space-y-3">
    <LoadingSkeleton className="h-5 w-2/3" />
    <LoadingSkeleton className="h-3 w-1/3" />
    <SkeletonLines lines={3} />
    <LoadingSkeleton className="h-8 w-24 mt-2" />
  </div>
);
