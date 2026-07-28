'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BatteryCharging } from 'lucide-react';

interface ProgressIndicatorProps {
  progressPct: number;
}

export function ProgressIndicator({ progressPct }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-2 text-center">
      {/* Battery Percentage & Status Label */}
      <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 px-1">
        <div className="flex items-center gap-1.5 text-emerald-700">
          <BatteryCharging className="w-4 h-4 animate-bounce" />
          <span>Battery Charge Simulation</span>
        </div>
        <span className="font-mono text-sm text-emerald-600">{Math.round(progressPct)}%</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 rounded-full bg-slate-200 p-0.5 border border-slate-300/80 shadow-inner relative overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md relative"
          style={{ width: `${Math.min(100, Math.max(5, progressPct))}%` }}
          transition={{ ease: 'easeOut', duration: 0.2 }}
        >
          {/* Animated Glow Highlight on Bar Edge */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 rounded-full animate-pulse" />
        </motion.div>
      </div>
    </div>
  );
}
