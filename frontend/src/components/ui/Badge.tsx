import React from 'react';

type BadgeVariant = 'default' | 'blue' | 'amber' | 'green' | 'red' | 'purple' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const styles: Record<BadgeVariant, { bg: string; dotColor: string }> = {
  default: { bg: 'bg-[#1a2540] text-[#94A3B8] border-[#263247]', dotColor: 'bg-[#94A3B8]' },
  blue:    { bg: 'bg-[#6EA8FE]/10 text-[#6EA8FE] border-[#6EA8FE]/30 shadow-sm shadow-[#6EA8FE]/10', dotColor: 'bg-[#6EA8FE]' },
  amber:   { bg: 'bg-[#F3B85B]/10 text-[#F3B85B] border-[#F3B85B]/30 shadow-sm shadow-[#F3B85B]/10', dotColor: 'bg-[#F3B85B]' },
  green:   { bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60', dotColor: 'bg-emerald-400' },
  red:     { bg: 'bg-red-950/40 text-red-400 border-red-800/60', dotColor: 'bg-red-400' },
  purple:  { bg: 'bg-purple-950/40 text-purple-300 border-purple-800/60', dotColor: 'bg-purple-400' },
  muted:   { bg: 'bg-[#0B1020]/80 text-[#94A3B8] border-[#263247]', dotColor: 'bg-[#94A3B8]' },
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
