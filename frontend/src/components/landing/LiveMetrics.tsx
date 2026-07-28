'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function LiveMetrics() {
  const metrics = [
    { value: '₹1.42 Cr+', label: 'Subsidies Calculated', desc: 'Under Delhi Policy 2026' },
    { value: '18 Showrooms', label: 'Verified Dealers', desc: 'Pre-qualified lead handoff' },
    { value: '28 Models', label: 'Empanelled EVs', desc: 'Model Approval Committee' },
    { value: '100% Verified', label: 'Battery Certificates', desc: 'Standardized NABL reports' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/70 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span>Platform Credibility</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Live Platform Traction
          </h2>
          <p className="text-slate-600 text-sm font-normal">
            Real metrics driven by Team Zeta's Delhi/NCR EV guidance platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {metrics.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {m.value}
              </div>
              <div className="text-sm font-bold text-emerald-700">{m.label}</div>
              <div className="text-xs text-slate-500 font-normal">{m.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
