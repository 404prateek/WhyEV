'use client';

import React from 'react';

interface SaaSLogoProps {
  showLogo?: boolean;
}

export function SaaSLogo({ showLogo = true }: SaaSLogoProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer select-none">
      <img
        src="/whyev-logo-icon.png"
        alt="WhyEV Logo"
        className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform duration-300 shrink-0"
      />
      <div className="flex items-center">
        <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
          Why<span className="text-emerald-600">EV</span>
        </span>
      </div>
    </div>
  );
}
