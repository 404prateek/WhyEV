'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ArrowRight, X } from 'lucide-react';
import { EmpanelledVehicle } from '@/types';

interface FloatingCompareBarProps {
  selectedVehicles: EmpanelledVehicle[];
  onOpenCompare: () => void;
  onClear: () => void;
}

export function FloatingCompareBar({ selectedVehicles, onOpenCompare, onClear }: FloatingCompareBarProps) {
  if (selectedVehicles.length === 0) return null;

  const canCompare = selectedVehicles.length >= 2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-full shadow-2xl p-3 px-5 text-white flex items-center justify-between gap-4"
      >
        {/* Left: Selection Count & Thumbnails */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
            {selectedVehicles.length}
          </div>
          <div className="text-xs font-bold truncate">
            <span>
              {selectedVehicles.length} {selectedVehicles.length === 1 ? 'Vehicle' : 'Vehicles'} Selected
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block">
              {canCompare ? 'Ready to compare specs' : 'Select at least 1 more'}
            </span>
          </div>
        </div>

        {/* Right: Compare Vehicles Primary Button & Clear Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear selections"
          >
            <X className="w-4 h-4" />
          </button>

          <button
            disabled={!canCompare}
            onClick={onOpenCompare}
            className={`h-10 px-5 rounded-full font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md ${
              canCompare
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Compare Vehicles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
