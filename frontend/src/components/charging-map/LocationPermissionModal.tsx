'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X } from 'lucide-react';
import { useCityStore } from '@/lib/store';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onNotNow: () => void;
}

export function LocationPermissionModal({ isOpen, onAllow, onNotNow }: LocationPermissionModalProps) {
  const { activeCity } = useCityStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 text-center space-y-6 overflow-hidden"
        >
          {/* Top Location Icon Visual */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
            <Navigation className="w-8 h-8 fill-emerald-500/20 text-emerald-600 animate-pulse" />
          </div>

          {/* Heading & Text */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Allow WhyEV to access your location?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              We use your location to auto-detect your city, center the charging map, and find nearby EV charging stations with live availability.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Currently Selected:</span>
            <span className="font-extrabold text-emerald-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{activeCity.name}</span>
            </span>
          </div>

          {/* Buttons: Allow | Not Now */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onNotNow}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
            >
              Not Now
            </button>

            <button
              type="button"
              onClick={onAllow}
              className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Allow
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
