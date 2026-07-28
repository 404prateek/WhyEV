'use client';

import React from 'react';
import { MapPin, CheckCircle2, Sparkles, Navigation } from 'lucide-react';

export function ChargingMapView() {
  const sampleStations = [
    { name: 'Tata Power EZ Charge - CP Inner Circle', status: 'Working (4/4 Free)', speed: '60 kW CCS2', confidence: '98%' },
    { name: 'Ather Grid - Okhla Ph 3', status: 'Busy (1 in Queue)', speed: 'Fast Grid', confidence: '95%' },
    { name: 'Statiq Charging Hub - Saket Select CITYWALK', status: 'Working (2/4 Free)', speed: '30 kW CCS2', confidence: '92%' },
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Phase 2 Preview · Verified Uptime Status Layer</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Delhi-NCR Verified Charging Network
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-normal">
          Solving the #1 adoption blocker (54% charging anxiety) by showing whether chargers actually work right now—not just their map location.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white border border-slate-200/90 h-[420px] shadow-sm flex flex-col justify-center items-center text-center space-y-4 relative overflow-hidden">
          <div className="space-y-4 max-w-md">
            <MapPin className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900">Interactive Map View Placeholder</h3>
            <p className="text-xs text-slate-500 font-normal">
              Integrates Google Maps API + Crowdsourced Uptime Confidence Layer.
            </p>
            <a
              href="https://maps.google.com/?q=EV+Charging+Station+Delhi"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              <span>Open in Google Maps</span>
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Nearby Verified Stations</h3>
          {sampleStations.map((st, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>{st.name}</span>
                <span className="text-emerald-700 text-[11px] font-semibold">{st.confidence} Score</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {st.status}
                </span>
                <span>{st.speed}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
