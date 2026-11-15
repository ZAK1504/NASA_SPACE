import React from 'react';

type BadgeVariant = 'default' | 'blue' | 'amber' | 'green' | 'red' | 'purple' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const styles: Record<BadgeVariant, { bg: string; dotColor: string }> = {
  default: { bg: 'bg-[#1c1c28] text-[#9E9AA7] border-[#262635]', dotColor: 'bg-[#9E9AA7]' },
  blue:    { bg: 'bg-[#F4A272]/10 text-[#F4A272] border-[#F4A272]/30 shadow-sm shadow-[#F4A272]/10', dotColor: 'bg-[#F4A272]' },
  amber:   { bg: 'bg-[#F3B85B]/10 text-[#F3B85B] border-[#F3B85B]/30 shadow-sm shadow-[#F3B85B]/10', dotColor: 'bg-[#F3B85B]' },
  green:   { bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60', dotColor: 'bg-emerald-400' },
  red:     { bg: 'bg-red-950/40 text-red-400 border-red-800/60', dotColor: 'bg-red-400' },
  purple:  { bg: 'bg-purple-950/40 text-purple-300 border-purple-800/60', dotColor: 'bg-purple-400' },
  muted:   { bg: 'bg-[#08080C]/80 text-[#9E9AA7] border-[#262635]', dotColor: 'bg-[#9E9AA7]' },
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '', dot = false }) => {
  const current = styles[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium border rounded-md transition-colors ${current.bg} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${current.dotColor} animate-pulse`} />
      )}
      {children}
    </span>
  );
};
