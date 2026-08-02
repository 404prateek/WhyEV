'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Award, Calendar, Wrench, Download, ArrowRight, Car, Zap, FileText } from 'lucide-react';

const INSPECTION_CATEGORIES = [
  { name: 'Exterior & Body Panels', score: '10/10', status: 'Passed' },
  { name: 'Interior & Controls', score: '9.8/10', status: 'Passed' },
  { name: 'High-Voltage Battery Pack', score: '10/10', status: 'Passed' },
  { name: 'Motor & Drivetrain', score: '9.9/10', status: 'Passed' },
  { name: 'CCS2 Charging Port & Locks', score: '10/10', status: 'Passed' },
  { name: 'Tyre Tread & Alignment', score: '9.2/10', status: 'Passed' },
  { name: 'Regen Braking & Hydraulics', score: '9.8/10', status: 'Passed' },
  { name: 'Suspension & Dampers', score: '9.5/10', status: 'Passed' },
  { name: 'Onboard Electronics & ADAS', score: '10/10', status: 'Passed' },
  { name: 'Accident & Structural History', score: 'Clean', status: 'Passed' },
];

export function DealersView() {
  const [overallScore] = useState(98);

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-slate-100 pb-6 text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            150-Point EV Inspection
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl">
            Verified technical inspection reports, cell degradation analysis, and certified dealer handoffs across Delhi NCR.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Inspection</span>
          </button>
          <button className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5" />
            <span>Book Certified Inspection</span>
          </button>
          <button className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 border border-slate-200">
            <Download className="w-3.5 h-3.5" />
            <span>Download Full Report</span>
          </button>
        </div>

        {/* OVERALL SCORE BANNER */}
        <div className="p-8 rounded-3xl bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
              <ShieldCheck className="w-4 h-4 fill-white" />
              <span>Certified 150-Point Inspection</span>
            </div>
            <h3 className="text-2xl font-black">Tata Curvv EV (Empowered Plus)</h3>
            <p className="text-xs text-slate-400 font-medium">Inspected on August 2026 by WhyEV Certified Engineers</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center shrink-0 min-w-[160px]">
            <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">Overall Score</span>
            <span className="text-4xl font-black text-white">{overallScore}/100</span>
            <span className="text-[10px] text-emerald-400 font-bold block pt-1">Grade A+ Certified</span>
          </div>
        </div>

        {/* 10 INSPECTION BREAKDOWN CATEGORIES */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900">Inspection Breakdown Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {INSPECTION_CATEGORIES.map((cat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-800">{cat.name}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-[11px]">
                  {cat.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
