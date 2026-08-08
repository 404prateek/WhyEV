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
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        className="fixed top-[72px] sm:top-20 left-1/2 -translate-x-1/2 z-40 w-[94vw] sm:w-auto max-w-lg bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-full shadow-2xl p-2 px-3 sm:p-2.5 sm:px-4 text-white flex items-center justify-between gap-2 overflow-hidden"
      >
        {/* Left: Selection Count & Label */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[11px] sm:text-xs shrink-0 shadow-md">
            {selectedVehicles.length}
          </div>
          <div className="text-[11px] sm:text-xs font-bold truncate">
            <span className="truncate">
              {selectedVehicles.length} {selectedVehicles.length === 1 ? 'Selected' : 'Selected'}
            </span>
          </div>
        </div>

        {/* Right: Compare Vehicles Button & Clear Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onClear}
            className="p-1 sm:p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Clear selections"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            disabled={!canCompare}
            onClick={onOpenCompare}
            className={`h-8 sm:h-9 px-3 sm:px-4 rounded-full font-extrabold text-[11px] sm:text-xs whitespace-nowrap transition-all flex items-center justify-center gap-1.5 shadow-md shrink-0 ${
              canCompare
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span>Compare Vehicles</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
