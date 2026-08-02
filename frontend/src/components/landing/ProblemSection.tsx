'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, Store, BatteryCharging, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function ProblemSection() {
  const problems = [
    {
      icon: FileQuestion,
      badge: '92% Miss Out',
      title: 'Subsidy Portal Confusion',
      description: '92% of Delhi EV buyers miss state subsidies due to complex government paperwork & strict 30-day deadlines.',
      solution: 'Guided calculation engine with automatic 30-day deadline tracker.',
      actionText: 'Calculate Subsidy',
      href: '/subsidy',
    },
    {
      icon: Store,
      badge: '2 of 50 Trust Dealers',
      title: 'Pushy Showroom Sales Calls',
      description: 'Buyers get bombarded by cold calls from multiple showrooms before even choosing a model.',
      solution: 'Direct pre-qualified handoff: Showrooms contact you only when requested.',
      actionText: 'Browse Verified Showrooms',
      href: '/dealers',
    },
    {
      icon: BatteryCharging,
      badge: '76% Demand Proof',
      title: 'Used EV Battery Resale Anxiety',
      description: 'Fear of hidden cell degradation slashes resale value without independent battery verification.',
      solution: 'Certified technician report with 0-100 health certificate score.',
      actionText: 'Inspect Battery Health',
      href: '/battery-cert',
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span>Market Friction Points</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Why Buying an EV in India <br className="hidden sm:inline" />
            Feels So Confusing
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Directly informed by Team Zeta's Delhi/NCR primary research (N=50, July 2026).
          </p>
        </div>

        {/* 3 Premium White Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">{item.description}</p>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 space-y-4">
                  <div className="text-xs sm:text-sm text-emerald-700 font-semibold leading-relaxed flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                    <span>{item.solution}</span>
                  </div>

                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors"
                  >
                    <span>{item.actionText}</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
