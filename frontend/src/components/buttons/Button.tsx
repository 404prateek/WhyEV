'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'emerald' | 'dark' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'emerald',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      emerald:
        'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 border border-transparent',
      primary:
        'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 border border-transparent',
      secondary:
        'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/90 font-bold',
      outline:
        'bg-transparent hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 font-semibold',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent font-medium',
      dark:
        'bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md border border-transparent',
      amber:
        'bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold shadow-md border border-transparent',
    };

    const sizeStyles = {
      sm: 'h-9 px-4 text-xs rounded-full gap-1.5',
      md: 'h-11 px-6 text-xs sm:text-sm rounded-full gap-2',
      lg: 'h-13 px-8 text-sm sm:text-base rounded-full gap-2.5',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap select-none min-h-[44px]',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : 'w-auto',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
