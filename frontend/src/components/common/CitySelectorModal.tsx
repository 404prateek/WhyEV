'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Navigation, CheckCircle2, Search, Landmark, ShieldCheck, Store, Calendar } from 'lucide-react';
import { useCityStore, MEGA_CITIES_DICTIONARY } from '@/lib/store';

export function CitySelectorModal() {
  const { isCityModalOpen, closeCityModal, activeCityId, selectCity, openCityModal, isAutoDetecting, detectLocationGps } = useCityStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Prompt location selection automatically on initial load for first-time visitors
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const hasSet = localStorage.getItem('whyev_location_has_set');
        if (!hasSet) {
          openCityModal();
        }
      }
    } catch (e) {}
  }, [openCityModal]);

  if (!isCityModalOpen) return null;

  const megaCitiesList = Object.values(MEGA_CITIES_DICTIONARY);

  const filteredCities = megaCitiesList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-slate-900 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={closeCityModal}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Heading */}
          <div className="text-left space-y-2 pr-10 sm:pr-12 pt-1 sm:pt-0">
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              Select Your City
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              We personalize government subsidies, EV prices, and charging networks based on your location.
            </p>
          </div>

          {/* Auto Detect Location Button */}
          <button
            onClick={() => detectLocationGps()}
            disabled={isAutoDetecting}
            className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/90 hover:border-emerald-300 text-slate-900 font-bold text-xs transition-all flex items-center justify-center sm:justify-between cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2.5">
              <Navigation className={`w-4 h-4 text-emerald-600 ${isAutoDetecting ? 'animate-spin' : ''}`} />
              <span className="font-black text-xs text-slate-900 group-hover:text-emerald-800">
                {isAutoDetecting ? 'Detecting location...' : 'Auto-detect location'}
              </span>
            </div>
            <span className="hidden sm:inline text-emerald-700 font-extrabold text-xs">GPS Locate →</span>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your city"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* SIMPLIFIED MINIMAL CITY CARDS */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
              Select City
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCities.map((city) => {
                const isSelected = activeCityId === city.id;
                return (
                  <button
                    key={city.id}
                    onClick={() => selectCity(city.id)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-base sm:text-lg font-black text-slate-900">{city.name}</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                      </div>

                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Policy:</span>
                          <span className="font-extrabold text-slate-900">{city.policyTitle}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Active Until:</span>
                          <span className="font-bold text-emerald-800">{city.policyActiveUntil}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
