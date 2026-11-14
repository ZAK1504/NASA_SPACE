import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0B1020] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]';

  const variants: Record<string, string> = {
    primary:
      'bg-gradient-to-r from-[#6EA8FE] to-[#5b95ea] text-[#0B1020] font-semibold border-[#6EA8FE] hover:shadow-glow-blue hover:brightness-105 focus:ring-[#6EA8FE]',
    glow:
      'bg-[#6EA8FE]/15 text-[#6EA8FE] border-[#6EA8FE]/50 hover:bg-[#6EA8FE]/25 hover:border-[#6EA8FE] hover:shadow-glow-blue focus:ring-[#6EA8FE]',
    secondary:
      'bg-[#151E30] text-[#6EA8FE] border-[#263247] hover:border-[#6EA8FE]/60 hover:bg-[#1a2540] focus:ring-[#6EA8FE]',
    ghost:
      'bg-transparent text-[#94A3B8] border-transparent hover:text-[#E8EDF5] hover:bg-[#1a2540]/60 hover:border-[#263247] focus:ring-[#263247]',
    danger:
      'bg-red-950/30 text-red-300 border-red-800/60 hover:bg-red-900/40 hover:border-red-700 focus:ring-red-500',
    amber:
      'bg-gradient-to-r from-[#F3B85B] to-[#e0a44a] text-[#0B1020] font-semibold border-[#F3B85B] hover:shadow-glow-amber hover:brightness-105 focus:ring-[#F3B85B]',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-2.5 text-base rounded-md',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
};
