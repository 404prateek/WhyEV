'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Store, Bot, BatteryCharging } from 'lucide-react';

export function TrustBar() {
  const trustPillars = [
    {
      icon: ShieldCheck,
      title: 'Government Policy Guidance',
      desc: 'Live Delhi EV Policy 2026 rules',
    },
    {
      icon: Store,
      title: 'Verified Dealers',
      desc: '18 empanelled showrooms in NCR',
    },
    {
      icon: Bot,
      title: 'AI Recommendations',
      desc: '100% transparent rules-first ranker',
    },
    {
      icon: BatteryCharging,
      title: 'Battery Certification',
      desc: 'Standardized 0-100 NABL health reports',
    },
  ];

  const stats = [
    { value: '₹1.42 Cr+', label: 'Subsidies Calculated' },
    { value: '28 Models', label: 'Empanelled EVs' },
    { value: '92%', label: 'Funnel Awareness Gap Solved' },
    { value: '100%', label: 'No Spam Data Privacy' },
  ];

  return (
    <section className="py-16 bg-slate-50/60 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{pillar.title}</div>
                  <div className="text-xs text-slate-500">{pillar.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Animated Platform Credibility Stats */}
        <div className="pt-6 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((st, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="space-y-1"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {st.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {st.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
