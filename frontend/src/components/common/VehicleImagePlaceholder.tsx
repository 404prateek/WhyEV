'use client';

import React from 'react';
import { Car, Zap, Clock } from 'lucide-react';

interface VehicleImagePlaceholderProps {
  make: string;
  model: string;
  category?: string;
  className?: string;
}

export function VehicleImagePlaceholder({
  make,
  model,
  category = '4W',
  className = 'h-56 w-full',
}: VehicleImagePlaceholderProps) {
  return (
    <div
      className={`relative ${className} bg-slate-900 border-b border-slate-800 text-white flex flex-col justify-between p-5 overflow-hidden select-none group/placeholder`}
    >
      {/* Background Subtle Radial Grid Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Shimmer loading light bar */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none animate-shimmer" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-full bg-slate-800/90 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-slate-700">
          {make}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>{category} EV</span>
        </span>
      </div>

      {/* Center SVG Vehicle Silhouette & Make/Model Text */}
      <div className="relative z-10 my-auto text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
          <Car className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <div className="text-base font-extrabold text-white tracking-tight">{model}</div>
          <div className="text-[11px] text-slate-400 font-medium">Ex-Showroom Pan-India Pricing</div>
        </div>
      </div>

      {/* Bottom Watermark Tag */}
      <div className="relative z-10 text-[10px] text-slate-400 font-semibold bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 w-fit mx-auto flex items-center gap-1.5">
        <Clock className="w-3 h-3 text-emerald-400" />
        <span>Photo Pending Editorial Rights · Verified July 2026</span>
      </div>
    </div>
  );
}
