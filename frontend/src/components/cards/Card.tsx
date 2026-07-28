'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'outline' | 'flat' | 'gradient';
  hoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      hoverEffect = false,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: 'bg-white border border-slate-200/90 shadow-sm text-slate-900',
      glass: 'bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-md text-slate-900',
      outline: 'bg-transparent border border-slate-200 text-slate-900',
      flat: 'bg-slate-50 border border-slate-100 text-slate-900',
      gradient: 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-500/20 shadow-xl',
    };

    const paddingStyles = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10 sm:p-12',
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { y: -4 } : undefined}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'rounded-3xl transition-all duration-300 relative overflow-hidden',
          variantStyles[variant],
          paddingStyles[padding],
          hoverEffect && 'hover:shadow-xl hover:border-emerald-500/30',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
