'use client';

import React from 'react';

export function SaaSLogo() {
  return (
    <div className="flex items-center gap-2.5 group cursor-pointer">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-white"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
          Why<span className="text-emerald-600">EV</span>
        </span>
        <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase leading-none mt-0.5">
          Delhi Policy 2026
        </span>
      </div>
    </div>
  );
}
