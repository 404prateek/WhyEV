'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { RecentActivityItem } from '@/views/Dashboard/DashboardView';

interface RecentActivityTimelineProps {
  activities: RecentActivityItem[];
}

export function RecentActivityTimeline({ activities }: RecentActivityTimelineProps) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-left">
      <div className="space-y-1 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Recent Activity
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Your recent interactions on WhyEV
        </p>
      </div>

      <div className="space-y-3">
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.id}
              href={act.targetUrl}
              className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 flex items-center justify-between gap-4 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {act.activity} {act.vehicleName && <span className="font-extrabold">{act.vehicleName}</span>}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Click to continue</div>
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{act.timestamp}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
