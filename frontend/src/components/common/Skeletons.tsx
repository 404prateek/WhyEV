'use client';

import React from 'react';
import { SearchX, SlidersHorizontal, RefreshCw } from 'lucide-react';

export function VehicleCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden p-6 space-y-5 animate-pulse shadow-sm">
      {/* Header Image Skeleton */}
      <div className="h-52 w-full bg-slate-200 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
      </div>

      {/* Title & Subtitle Skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-20 bg-slate-200 rounded-md" />
        <div className="h-6 w-48 bg-slate-200 rounded-lg" />
        <div className="h-3 w-32 bg-slate-200 rounded-md" />
      </div>

      {/* Price Box Skeleton */}
      <div className="p-4 rounded-2xl bg-slate-100/70 h-20 flex justify-between items-center">
        <div className="space-y-1">
          <div className="h-2.5 w-24 bg-slate-200 rounded-md" />
          <div className="h-7 w-32 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-6 w-24 bg-slate-200 rounded-md" />
      </div>

      {/* 6-Metric Grid Skeleton */}
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-2xl" />
        ))}
      </div>

      {/* Button Skeleton */}
      <div className="h-12 bg-slate-200 rounded-full" />
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-slate-200 rounded-md" />
        <div className="h-6 w-6 bg-slate-200 rounded-full" />
      </div>
      <div className="h-9 w-44 bg-slate-200 rounded-xl" />
      <div className="h-3 w-56 bg-slate-200 rounded-md" />
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 animate-pulse">
      <div className="h-44 bg-slate-200 rounded-2xl" />
      <div className="h-3 w-24 bg-slate-200 rounded-md" />
      <div className="h-6 w-full bg-slate-200 rounded-lg" />
      <div className="h-3 w-3/4 bg-slate-200 rounded-md" />
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export function EmptyState({
  title = 'No EV Models Found',
  description = 'No empanelled vehicles match your selected filter criteria.',
  onReset,
  resetLabel = 'Reset All Filters',
}: EmptyStateProps) {
  return (
    <div className="p-10 sm:p-14 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4 max-w-md mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
        <SearchX className="w-7 h-7" />
      </div>
      <h4 className="text-xl font-black text-slate-900 tracking-tight">{title}</h4>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-2 py-2.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{resetLabel}</span>
        </button>
      )}
    </div>
  );
}
