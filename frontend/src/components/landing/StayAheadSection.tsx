'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';

export function StayAheadSection() {
  return (
    <section className="w-full bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
      <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>EV Intelligence Hub</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Stay Ahead
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Latest EV policies, new launches, charging updates, and government incentives—all in one place.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            href="/live-feed"
            className="h-[50px] px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-emerald-600/20 hover:shadow-2xl flex items-center gap-2.5 cursor-pointer"
          >
            <span>Explore Discover</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
