'use client';

import React from 'react';
import { Zap, Store, Navigation, Clock, AlertTriangle } from 'lucide-react';

export function EvMapLegend() {
  return (
    <div className="p-4 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-slate-200 text-xs space-y-3 shadow-xl">
      <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
        <span>Map Legend</span>
        <span className="text-emerald-400">Delhi NCR Live</span>
      </div>

      <div className="space-y-2 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-600 border border-emerald-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            <Zap className="w-3 h-3 fill-white" />
          </div>
          <span>EV Fast Charger (Working)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-amber-500 border border-amber-300 flex items-center justify-center text-slate-950 text-[10px] font-bold shrink-0">
            <Clock className="w-3 h-3" />
          </div>
          <span>EV Fast Charger (Busy / In Use)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-rose-600 border border-rose-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            <AlertTriangle className="w-3 h-3" />
          </div>
          <span>Charger Under Maintenance</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            <Store className="w-3 h-3" />
          </div>
          <span>Empanelled EV Showroom</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-teal-500 border border-teal-300 animate-pulse flex items-center justify-center text-slate-950 text-[10px] font-bold shrink-0">
            <Navigation className="w-3 h-3 fill-slate-950" />
          </div>
          <span>Your Location (GPS)</span>
        </div>
      </div>
    </div>
  );
}
