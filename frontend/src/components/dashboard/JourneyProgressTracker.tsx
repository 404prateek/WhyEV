'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { JourneyStage } from '@/views/Dashboard/DashboardView';

interface JourneyProgressTrackerProps {
  stages: JourneyStage[];
  completionPct: number;
}

export function JourneyProgressTracker({ stages, completionPct }: JourneyProgressTrackerProps) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            EV Journey Progress
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {completionPct}% overall journey completed
          </p>
        </div>

        <Link
          href="/recommend?flow=recommend"
          className="h-[40px] px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer shrink-0"
        >
          <span>Continue Journey</span>
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </Link>
      </div>

      {/* Subtle Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
          style={{ width: `${completionPct}%` }}
        />
      </div>

      {/* Milestone Stages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`p-3.5 rounded-2xl border text-xs font-extrabold flex items-center gap-2.5 transition-all ${
              stage.isCompleted
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-2xs'
                : 'bg-slate-50/60 border-slate-200/80 text-slate-400'
            }`}
          >
            {stage.isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-300 shrink-0" />
            )}
            <div className="space-y-0.5 truncate">
              <div className="truncate">{stage.title}</div>
              {stage.completedAt && (
                <div className="text-[10px] text-emerald-700 font-semibold">{stage.completedAt}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
