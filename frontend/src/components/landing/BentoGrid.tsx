'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, FileCheck, Store, BatteryCharging, Calculator, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function BentoGrid() {
  return (
    <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span>Platform Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Designed for Every Step <br className="hidden sm:inline" />
            of Your EV Journey
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Everything you need to evaluate, purchase, maintain, and eventually resell your EV.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
          {/* Bento Card 1: AI EV Recommendation (Large 7 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">01 · Matcher Engine</span>
              <h3 className="text-2xl font-bold text-slate-900">AI EV Recommendation</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                Rules-first matching engine comparing sticker price vs. effective post-subsidy price, battery range buffers, and charging availability.
              </p>
            </div>

            <div className="pt-8 flex items-center justify-between relative z-10 border-t border-slate-100 mt-6">
              <span className="text-xs font-semibold text-slate-500">100% Empanelled Vehicles Only</span>
              <Link href="/recommend" className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-emerald-600">
                <span>Start Intake</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>
          </motion.div>

          {/* Bento Card 2: Government Subsidy Calculator (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">02 · Core USP</span>
              <h3 className="text-2xl font-bold text-slate-900">Government Subsidy Calculator</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Delhi EV Policy 2026 eligibility check, purchase incentives, scrappage bonus, and 30-day deadline tracking.
              </p>
            </div>

            <div className="pt-8 flex items-center justify-between border-t border-slate-100 mt-6">
              <span className="text-xs font-semibold text-slate-500">PDF Report Generator</span>
              <Link href="/subsidy" className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-emerald-600">
                <span>Calculate Now</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>
          </motion.div>

          {/* Bento Card 3: Verified Dealer Network (4 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">03 · Showroom Handoff</span>
              <h3 className="text-xl font-bold text-slate-900">Verified Dealer Network</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect with pre-screened showrooms carrying your shortlisted models without receiving unwanted cold calls.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link href="/dealers" className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-emerald-600">
                <span>Browse Showrooms</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>
          </motion.div>

          {/* Bento Card 4: Battery Health Certification (4 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">04 · Trust Engine</span>
              <h3 className="text-xl font-bold text-slate-900">Battery Health Certification</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Certified technician inspection issuing a standardized 0-100 score and public QR verification link.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link href="/battery-cert" className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-emerald-600">
                <span>View Sample Cert</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>
          </motion.div>

          {/* Bento Card 5: Ownership Cost Calculator (4 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">05 · Financial Intelligence</span>
              <h3 className="text-xl font-bold text-slate-900">Ownership Cost Calculator</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Compare real 5-year fuel, maintenance, and resale value vs. equivalent petrol/diesel vehicles.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link href="/recommend" className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-emerald-600">
                <span>Compare Costs</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
