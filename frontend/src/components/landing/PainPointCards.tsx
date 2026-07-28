'use client';

import React from 'react';
import { FileQuestion, SlidersHorizontal, Store, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function PainPointCards() {
  const painPoints = [
    {
      icon: FileQuestion,
      title: 'Subsidy Confusion & 30-Day Deadline',
      stat: '92% Never Claimed',
      description:
        'In our Delhi/NCR research, 92% of respondents never got past awareness or consideration of the EV subsidy. The government portal is confusing and requires filing within 30 days of RC issuance.',
      solution: 'Guided conversational eligibility check + 30-day filing tracker & pre-filled application.',
      linkText: 'Calculate Your Subsidy',
      linkHref: '/subsidy',
    },
    {
      icon: SlidersHorizontal,
      title: 'Model Choice & Range Anxiety',
      stat: '54% Range Blocker',
      description:
        'Overwhelmed by conflicting YouTube reviews and claims? Dealers do not explain which models are officially empanelled by the Model Approval Committee or what your true post-subsidy cost is.',
      solution: 'Transparent rules-based matcher comparing sticker price vs. effective price for your daily commute.',
      linkText: 'Match Your Model',
      linkHref: '/recommend',
    },
    {
      icon: Store,
      title: 'Showroom Bouncing & Dealer Pushiness',
      stat: '2 of 50 Trust Dealers',
      description:
        'Only 2 out of 50 surveyed buyers trust showroom staff. Buyers bounce between multiple dealerships receiving pushy sales pitches before knowing what they actually need.',
      solution: 'Pre-qualified lead handoff: Dealers see your profile only after you shortlist a model.',
      linkText: 'Find Empanelled Dealers',
      linkHref: '/dealers',
    },
  ];

  return (
    <section className="py-16 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12 space-y-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Built to Solve the <span className="text-emerald-400">3 Big EV Friction Points</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Directly informed by Team Zeta's Delhi/NCR primary research (N=50, July 2026).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {painPoints.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-emerald-950/40"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {item.stat}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
                <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {item.solution}
                </div>
                <Link
                  href={item.linkHref}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>{item.linkText}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
