'use client';

import React from 'react';
import { ShieldCheck, Eye, Lock, FileSpreadsheet } from 'lucide-react';

export function TrustSection() {
  const trustGuarantees = [
    {
      icon: Lock,
      title: 'We never sell your data to dealers until you say go',
      desc: 'No cold calls, no unwanted SMS blasts. Dealers are matched only when you explicitly click "Connect with Dealer" after shortlisting a model.',
    },
    {
      icon: Eye,
      title: '100% Rules-First Transparent Ranker',
      desc: 'Our recommendation engine ranks empanelled EVs purely on your budget, commute distance, and charging access—never on dealer ad spend.',
    },
    {
      icon: FileSpreadsheet,
      title: 'Downloadable Official Eligibility Report',
      desc: 'Receive a structured PDF report citing exact Delhi EV Policy 2026 clauses, incentive breakdown, and filing dates to bring directly to any dealership.',
    },
  ];

  return (
    <section className="py-16 px-4 lg:px-8 bg-slate-900/40 border-y border-emerald-900/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Built on Uncompromising Transparency</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Why Delhi EV Buyers Trust WhyEV
          </h2>
          <p className="text-xs text-slate-400">
            Research shows peer testimony (42%) is trusted above official government portals (30%) due to conflicting information. We fix the trust gap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustGuarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
