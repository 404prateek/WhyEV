'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Store, Car } from 'lucide-react';

export function DiscoverCtaSection() {
  return (
    <section className="w-full bg-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        {/* LEFT CARD: Never Miss an EV Opportunity */}
        <div className="rounded-3xl p-8 sm:p-10 bg-white border-2 border-emerald-500/70 hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-8 hover:-translate-y-1 group">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-[1.2]">
                Never Miss an EV Opportunity
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Discover the latest government incentives, manufacturer offers, EV launches, and policy updates—all in one place.
              </p>
            </div>
          </div>

          <div>
            <Link
              href="/live-feed"
              className="h-[48px] px-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer w-fit"
            >
              <span>Explore Savings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* RIGHT CARD: Marketplace */}
        <div className="rounded-3xl p-8 sm:p-10 bg-white border-2 border-emerald-500/70 hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-8 hover:-translate-y-1 group">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Store className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-[1.2]">
                Marketplace
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Browse India's growing electric vehicle marketplace.
              </p>
            </div>
          </div>

          {/* Two Side-by-Side Buttons */}
          <div className="flex flex-row items-center gap-3 flex-wrap sm:flex-nowrap">
            <Link
              href="/recommend"
              className="h-[48px] px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer flex-1"
            >
              <span>New</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/marketplace"
              className="h-[48px] px-6 rounded-full bg-white hover:bg-emerald-50 border-2 border-emerald-600 text-emerald-800 font-extrabold text-xs sm:text-sm transition-all shadow-2xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer flex-1"
            >
              <Car className="w-4 h-4 text-emerald-600" />
              <span>Used</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
