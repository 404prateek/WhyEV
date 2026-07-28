'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// SSR-safe dynamic import for Leaflet map component
const EvMapContainer = dynamic(
  () => import('./EvMapContainer').then((mod) => mod.EvMapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
          Loading Delhi NCR Interactive EV Map...
        </span>
      </div>
    ),
  }
);

export function InteractiveEvMap() {
  return <EvMapContainer />;
}
