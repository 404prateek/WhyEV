'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertOctagon, X, MapPin } from 'lucide-react';
import { StationStatusType } from './StatusBadge';

interface PassiveGeofenceBannerProps {
  stationName: string;
  onQuickReport: (status: StationStatusType) => void;
  onDismiss: () => void;
}

export function PassiveGeofenceBanner({
  stationName,
  onQuickReport,
  onDismiss,
}: PassiveGeofenceBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="w-full max-w-xl mx-auto p-4 rounded-3xl bg-white border border-emerald-200/90 shadow-lg text-slate-900 space-y-3 relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700">
          <MapPin className="w-4 h-4 text-emerald-600 animate-bounce" />
          <span>Geofence Detection · Nearby Charging Hub</span>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-slate-900">You're near {stationName}</h4>
        <p className="text-xs text-slate-600 font-normal">
          Is this charger currently working for EV drivers? 1-tap update:
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          onClick={() => onQuickReport('working')}
          className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 fill-white text-emerald-600" />
          <span>Working</span>
        </button>

        <button
          onClick={() => onQuickReport('busy')}
          className="py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Clock className="w-4 h-4 text-slate-950" />
          <span>Occupied</span>
        </button>

        <button
          onClick={() => onQuickReport('broken')}
          className="py-2.5 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Broken</span>
        </button>
      </div>
    </motion.div>
  );
}
