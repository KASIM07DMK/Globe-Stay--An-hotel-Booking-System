import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#030712] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-gradient-to-r from-brand-950 via-brand-900 to-blue-950 text-white border border-blue-500/30 hover:border-blue-400 hover:shadow-glow-blue focus:ring-blue-500',
    secondary:
      'bg-slate-900/90 text-blue-100 hover:bg-slate-800 border border-blue-900/40 hover:border-blue-700/60 focus:ring-blue-400',
    accent:
      'bg-gradient-to-r from-blue-600 to-accent-500 text-white hover:from-blue-500 hover:to-accent-400 shadow-glow-blue border border-blue-400/30 focus:ring-accent-400',
    outline:
      'border border-blue-500/40 text-blue-200 bg-blue-950/20 hover:bg-blue-900/40 hover:border-blue-400 focus:ring-blue-400',
    ghost:
      'text-slate-300 hover:bg-blue-950/40 hover:text-blue-300 focus:ring-blue-400',
    danger:
      'bg-red-950 text-red-100 border border-red-700 hover:bg-red-900 focus:ring-red-500 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2.5 gap-2 h-10',
    lg: 'text-base px-6 py-3.5 gap-2.5 h-12',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
