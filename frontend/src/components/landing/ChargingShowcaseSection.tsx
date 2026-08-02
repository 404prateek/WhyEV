'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Loader2 } from 'lucide-react';
import stationsData from '@/data/charging/chargingStations.json';
import { StationData } from '@/components/charging-map/PreviewPanel';

// SSR-Safe Dynamic Import for Leaflet Map Canvas
const MapCanvasContainer = dynamic(
  () => import('@/components/charging-map/MapCanvasContainer').then((mod) => mod.MapCanvasContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] sm:h-[460px] rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
          Loading Delhi NCR Charging Map Preview...
        </span>
      </div>
    ),
  }
);

export function ChargingShowcaseSection() {
  const [stations] = useState<StationData[]>(stationsData as StationData[]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setUserLocation([28.6139, 77.2090]); // Default Delhi NCR
        }
      );
    }
  };

  return (
    <section className="w-full bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-8">
        {/* CENTERED HEADER & DESCRIPTION */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Explore Charging Stations Near You
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            Find charging stations nearby before every journey.
          </p>
        </div>

        {/* CENTERED MAP PREVIEW CARD */}
        <div className="w-full">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl h-[380px] sm:h-[460px] bg-slate-950">
            {/* Leaflet Delhi NCR Map Canvas */}
            <MapCanvasContainer
              stations={stations}
              userLocation={userLocation}
              selectedStationId={null}
              onStationSelect={() => {}}
              onLocateMe={handleLocateMe}
            />

            {/* Bottom Right: Locate Me Button */}
            <div className="absolute bottom-4 right-4 z-20">
              <button
                onClick={handleLocateMe}
                className="h-10 px-4 rounded-full bg-white hover:bg-emerald-50 text-slate-900 font-extrabold text-xs transition-all shadow-md border border-slate-200 flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Locate Me</span>
              </button>
            </div>
          </div>
        </div>

        {/* CENTERED VIEW CHARGING MAP BUTTON */}
        <div>
          <Link
            href="/map"
            className="h-[52px] px-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/20 hover:shadow-xl flex items-center gap-2.5 cursor-pointer"
          >
            <span>View Charging Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
