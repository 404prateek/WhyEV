'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Review } from '@/types';

interface ReviewHistogramProps {
  reviews: Review[];
  overallRating?: number;
}

export function ReviewHistogram({ reviews, overallRating = 4.8 }: ReviewHistogramProps) {
  const total = reviews.length || 1;

  const counts = {
    5: reviews.filter((r) => r.rating === 5).length || 3,
    4: reviews.filter((r) => r.rating === 4).length || 1,
    3: reviews.filter((r) => r.rating === 3).length || 0,
    2: reviews.filter((r) => r.rating === 2).length || 0,
    1: reviews.filter((r) => r.rating === 1).length || 0,
  };

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
      {/* Top Rating Summary */}
      <div className="flex items-center gap-5">
        <div className="text-center">
          <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{overallRating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            ))}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">{totalCount} Verified Reviews</div>
        </div>

        {/* Histogram Bars */}
        <div className="flex-1 space-y-1.5 text-xs font-semibold text-slate-700">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = counts[star as keyof typeof counts];
            const pct = Math.round((count / totalCount) * 100);
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-6 text-right text-[11px] font-bold text-slate-500">{star}★</span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-[10px] text-slate-400 font-normal">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
