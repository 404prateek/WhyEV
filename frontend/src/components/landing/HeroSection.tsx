'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, BatteryCharging, Zap, CheckCircle2, TrendingUp, Store, Search } from 'lucide-react';
import { Button } from '@/components/buttons/Button';
import { ROUTES } from '@/routes/routes';

export function HeroSection() {
  return (
    <section id="home" className="relative w-full pt-12 pb-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-12 right-1/4 w-full max-w-[600px] h-[350px] sm:h-[500px] bg-emerald-50/60 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute top-44 left-10 w-full max-w-[450px] h-[300px] sm:h-[450px] bg-teal-50/40 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 space-y-6 text-left"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs sm:text-sm font-semibold shadow-xs">
            <span className="text-emerald-600 font-bold text-sm">⚡</span>
            <span>India's AI-Powered EV Buying Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.06]">
            Buy the Right EV. <br />
            Claim Every Subsidy. <br />
            <span className="text-emerald-600">All in One Place.</span>
          </h1>

          {/* Description */}
          <p className="w-full max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            WhyEV helps you discover the right electric vehicle, understand government subsidies under Delhi EV Policy 2026, compare ownership costs, and connect with verified dealers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link href={ROUTES.RECOMMEND}>
              <Button size="lg" variant="emerald" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start Your EV Journey
              </Button>
            </Link>

            <Link href={ROUTES.SUBSIDY}>
              <Button size="lg" variant="secondary">
                Explore Benefits
              </Button>
            </Link>
          </div>

          {/* Footnote Trust Markers */}
          <div className="pt-6 flex flex-wrap items-center gap-6 sm:gap-8 border-t border-slate-100 text-xs sm:text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>Delhi EV Policy 2026 Live</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>100% Empanelled Models</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>Zero Dealer Cold Calls</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative flex justify-center lg:justify-end"
        >
          {/* Dashboard Container */}
          <div className="relative w-full max-w-lg lg:max-w-xl">
            {/* Window Screenshot Mockup */}
            <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-slate-900/15 space-y-5">
              {/* App Navigation Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-mono text-[11px]">
                    <Search className="w-3 h-3" />
                    <span>app.whyev.in/matcher</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] font-bold">
                    Delhi Policy 2026 Live
                  </span>
                </div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Empanelled Winner</div>
                    <div className="text-base sm:text-lg font-extrabold text-slate-900">Tata Nexon.ev (Long Range)</div>
                  </div>
                </div>
              </div>

              {/* Specs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Real World Range</div>
                  <div className="text-xl font-extrabold text-slate-900">465 km</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">AC & Traffic Buffer Included</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-xs text-slate-500 font-medium">Effective Post-Subsidy Cost</div>
                  <div className="text-xl font-extrabold text-emerald-700">₹15,49,000</div>
                  <div className="text-[11px] text-slate-500 line-through">Sticker: ₹16,99,000</div>
                </div>
              </div>

              {/* Handoff Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-2">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AutoVikas Delhi · Verified Showroom</span>
                </div>
                <span className="text-emerald-400 font-bold">Pre-Qualified Lead</span>
              </div>
            </div>

            {/* Floating Glass Badges */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -left-3 sm:-left-5 bg-white/95 backdrop-blur-2xl border border-slate-200/90 p-3 rounded-2xl shadow-xl hidden sm:flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <BatteryCharging className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Battery Certificate</div>
                <div className="text-xs font-extrabold text-slate-900">Score 94/100 · NABL Verified</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 -right-3 sm:-right-5 bg-white/95 backdrop-blur-2xl border border-slate-200/90 p-3 rounded-2xl shadow-xl hidden sm:flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Delhi EV Subsidy</div>
                <div className="text-xs font-extrabold text-slate-900">₹3,00,000 Total Approved</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
