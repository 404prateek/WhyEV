'use client';

import React from 'react';
import { DealerUpdateItem } from '@/views/Dashboard/DashboardView';

interface DealerUpdatesTimelineProps {
  updates: DealerUpdateItem[];
}

export function DealerUpdatesTimeline({ updates }: DealerUpdatesTimelineProps) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-left">
      <div className="space-y-1 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Dealer Updates
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Recent status updates from verified EV dealerships
        </p>
      </div>

      <div className="space-y-3">
        {updates.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
                  <Icon className="w-4 h-4 text-slate-700" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900">{item.title}</div>
                  {item.dealerName && (
                    <div className="text-[11px] text-slate-500 font-medium">{item.dealerName}</div>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-slate-800">{item.timestamp}</div>
                <div className="text-[10px] font-semibold text-slate-400">{item.status}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
