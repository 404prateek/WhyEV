'use client';

import React from 'react';

interface SaaSLogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function SaaSLogo({ className = '', iconOnly = false }: SaaSLogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Modern SaaS Vector Mark */}
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[1px] shadow-md shadow-emerald-600/20 flex items-center justify-center shrink-0">
        <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center p-2 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-emerald-500/20 blur-sm pointer-events-none" />

          {/* EV Bolt & Car Contour Vector */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-5 h-5 text-emerald-400 relative z-10"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Car Contour */}
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H7c-.7 0-1.3.3-1.8.7C4.3 8.6 3 10 3 10s-2.7.6-4.5 1.1C-2.3 11.3-3 12.1-3 13v3c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
            {/* Electric Bolt */}
            <path d="M13 2L9 9h4l-1 7 6-8h-4l1-6z" fill="#10B981" stroke="none" />
          </svg>
        </div>
      </div>

      {!iconOnly && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center text-xl font-extrabold tracking-tight leading-none text-slate-900">
            <span>Why</span>
            <span className="text-emerald-600">EV</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
            Delhi EV Policy 2026 Engine
          </span>
        </div>
      )}
    </div>
  );
}
