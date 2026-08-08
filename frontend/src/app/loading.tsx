'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      {/* Animated SaaS Logo Container */}
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-2 shadow-sm">
          <img src="/whyev-logo-icon.png" alt="WhyEV Logo" className="w-10 h-10 object-contain animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/20 animate-ping" />
      </div>

      {/* Brand Title & Pulse Message */}
      <div className="space-y-1.5 max-w-xs">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">WhyEV</h3>
        <p className="text-xs text-slate-500 font-medium animate-pulse">
          Loading Delhi EV Policy 2026 intelligence...
        </p>
      </div>

      {/* Progress Bar Shimmer */}
      <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
        <div className="absolute inset-y-0 bg-emerald-600 rounded-full animate-shimmer" style={{ width: '40%' }} />
      </div>
    </div>
  );
}
