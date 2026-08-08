'use client';

import React from 'react';

interface SaaSLogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function SaaSLogo({ className = '', iconOnly = false }: SaaSLogoProps) {
  return (
    <div className={`flex items-center gap-2 select-none cursor-pointer ${className}`}>
      <img
        src="/whyev-logo-icon.png"
        alt="WhyEV Logo"
        className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
      />
      {!iconOnly && (
        <div className="flex items-center">
          <div className="flex items-center text-xl font-black tracking-tight leading-none text-slate-900">
            <span>Why</span>
            <span className="text-emerald-600">EV</span>
          </div>
        </div>
      )}
    </div>
  );
}
