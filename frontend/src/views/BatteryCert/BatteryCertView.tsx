'use client';

import React, { useState } from 'react';
import { ShieldCheck, Battery, Zap, AlertCircle, FileText, Upload, RefreshCw, Calendar, CheckCircle2, Download, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function BatteryCertView() {
  const [healthScore] = useState(96);
  const [degradationPct] = useState(4.2);
  const [realRangeKm] = useState(412);

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header (No floating badge!) */}
        <div className="space-y-2 border-b border-slate-100 pb-6 text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Battery Health Intelligence
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl">
            Real-time SOH (State of Health) cell diagnostics, degradation rate analytics, and verified battery certification.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Run Battery Check</span>
          </button>
          <button className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Battery Report</span>
          </button>
          <button className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 border border-slate-200">
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
          </button>
        </div>

        {/* MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Large Circular Score Indicator */}
          <div className="p-8 rounded-3xl bg-slate-950 text-white space-y-6 flex flex-col items-center text-center shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Verified Battery SOH</span>
              <h3 className="text-xl font-black">Tata Curvv EV (45 kWh Pack)</h3>
            </div>

            {/* Large Circular Gauge */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="264"
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 - (264 * healthScore) / 100 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">{healthScore}%</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Excellent</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 text-xs font-bold pt-2 border-t border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">Degradation</span>
                <span className="text-rose-400 text-sm font-black">{degradationPct}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">Est. Real Range</span>
                <span className="text-emerald-400 text-sm font-black">{realRangeKm} km</span>
              </div>
            </div>
          </div>

          {/* Right Column (2 cols): History & Tips */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Fast Charging %</span>
                <div className="text-xl font-black text-slate-900">28% Fast DC</div>
              </div>
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Warranty Status</span>
                <div className="text-xl font-black text-emerald-600">Active (8 Years)</div>
              </div>
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Rec. Service</span>
                <div className="text-xl font-black text-slate-900">In 4,500 km</div>
              </div>
            </div>

            {/* Battery Tips */}
            <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-3">
              <h4 className="text-sm font-black text-emerald-900">Battery Longevity Recommendations</h4>
              <div className="space-y-2 text-xs font-bold text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Maintain daily state-of-charge between 20% and 80% for maximum lifespan.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Avoid continuous high-power DC fast charging under extreme direct sunlight.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
