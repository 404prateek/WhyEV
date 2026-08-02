'use client';

import React from 'react';
import { InteractiveChargingMapModule } from '@/components/charging-map/InteractiveChargingMapModule';

export function ChargingMapView() {
  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-6 text-slate-900">
      {/* CLEAN SINGLE PAGE HEADER */}
      <div className="space-y-2 border-b border-slate-100 pb-6 text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Find Your Charging Station
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl">
          Locate nearby charging points, live availability, and verified community reviews.
        </p>
      </div>

      {/* INTERACTIVE CHARGING MAP MODULE (Contains Single Search Bar & Station Details Panel with Integrated Reviews) */}
      <div className="w-full">
        <InteractiveChargingMapModule />
      </div>
    </div>
  );
}
