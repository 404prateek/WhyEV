'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface DashboardHeroProps {
  displayName: string;
}

export function DashboardHero({ displayName }: DashboardHeroProps) {
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 text-left border-b border-slate-100 pb-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          {getGreetingTime()}, {displayName}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl leading-relaxed">
          Track your EV journey, recommendations and dealer activity in one place.
        </p>
      </div>

      {/* 3 Compact Quick Action Buttons (WhyEV Button Style, No Emojis, No Badges) */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Link
          href="/recommend?flow=questionnaire"
          className="h-[44px] px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>Continue EV Matcher</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </Link>

        <Link
          href="/recommend"
          className="h-[44px] px-6 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>View Saved Vehicles</span>
        </Link>

        <Link
          href="/subsidy"
          className="h-[44px] px-6 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span>Calculate Subsidy</span>
        </Link>
      </div>
    </div>
  );
}
