'use client';

import React from 'react';

export function LiveStats() {
  const stats = [
    { label: 'Subsidies Calculated (Delhi 2026)', value: '₹1.42 Cr+' },
    { label: 'Empanelled Models Verified', value: '28 Models' },
    { label: 'Unclaimed Subsidy Funnel Gap', value: '92%' },
    { label: 'Verified Dealers Connected', value: '18 Showrooms' },
  ];

  return (
    <section className="py-12 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mb-1 tracking-tight">
              {stat.value}
            </div>
            <div className="text-xs font-semibold text-slate-300">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
