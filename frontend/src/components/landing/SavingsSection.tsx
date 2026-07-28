'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Fuel, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SavingsSection() {
  const [dailyKm, setDailyKm] = useState(40);

  // Dynamic Financial Savings Calculations over 5 years
  const annualPetrolCost = dailyKm * 365 * 3.8; // ~₹3.8 per km petrol cost
  const annualEvCost = dailyKm * 365 * 0.7; // ~₹0.7 per km EV charging cost
  const annualFuelSavings = Math.round(annualPetrolCost - annualEvCost);
  const fiveYearFuelSavings = annualFuelSavings * 5;
  const delhiSubsidyBenefit = 175000; // Purchase + Scrappage
  const total5YearSavings = fiveYearFuelSavings + delhiSubsidyBenefit;

  return (
    <section id="savings" className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Financial ROI & Savings</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            See How Much You Could Save
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Real ownership math comparing fuel costs, maintenance, and Delhi EV Policy 2026 incentives.
          </p>
        </div>

        {/* Interactive Savings Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
        >
          {/* Controls */}
          <div className="md:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Interactive Calculator</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">Set Your Daily Commute</h3>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Daily Distance:</span>
                <span className="text-base font-extrabold text-slate-900">{dailyKm} km / day</span>
              </div>

              <input
                type="range"
                min={15}
                max={120}
                step={5}
                value={dailyKm}
                onChange={(e) => setDailyKm(Number(e.target.value))}
                className="w-full accent-emerald-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>15 km (City)</span>
                <span>60 km (NCR Commute)</span>
                <span>120 km (Long Range)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Assumes ₹102/L Petrol vs ₹8/unit electricity rate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Includes Delhi 100% road tax & registration fee waiver</span>
              </div>
            </div>
          </div>

          {/* Results Output */}
          <div className="md:col-span-6 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-900">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">5-Year Net Financial Benefit</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight mt-1">
                ₹{(total5YearSavings / 100000).toFixed(2)} Lakh
              </div>
              <div className="text-xs text-emerald-900 font-semibold mt-1">
                You could save ₹{(total5YearSavings / 100000).toFixed(2)} lakh over five years!
              </div>
            </div>

            {/* Breakdown Chart */}
            <div className="space-y-3 pt-4 border-t border-emerald-200/80 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">5-Year Fuel Savings vs Petrol:</span>
                <span className="font-extrabold text-slate-900">₹{fiveYearFuelSavings.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '75%' }} />
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-600">Delhi Subsidy & Scrappage:</span>
                <span className="font-extrabold text-slate-900">₹{delhiSubsidyBenefit.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/recommend"
                className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Calculate Your Full Breakdown</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
