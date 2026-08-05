'use client';

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface TrustBadgeProps {
  confidencePct: number;
  reportCount: number;
  lastVerifiedMinutesAgo: number;
}

export function TrustBadge({
  confidencePct,
  reportCount,
  lastVerifiedMinutesAgo,
}: TrustBadgeProps) {
  const isHighConfidence = confidencePct >= 80;
  const isMediumConfidence = confidencePct >= 60 && confidencePct < 80;

  const colorClass = isHighConfidence
    ? 'text-emerald-950 bg-emerald-50/90 border-emerald-200'
    : isMediumConfidence
    ? 'text-amber-950 bg-amber-50/90 border-amber-200'
    : 'text-slate-900 bg-slate-50 border-slate-200';

  const iconColor = isHighConfidence
    ? 'text-emerald-600'
    : isMediumConfidence
    ? 'text-amber-600'
    : 'text-slate-500';

  const timeLabel =
    lastVerifiedMinutesAgo < 60
      ? `${lastVerifiedMinutesAgo} mins ago`
      : `${Math.round(lastVerifiedMinutesAgo / 60)} hrs ago`;

  return (
    <div className={`p-4 rounded-2xl border text-xs space-y-1.5 shadow-2xs ${colorClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-extrabold text-xs">
          <ShieldCheck className={`w-4 h-4 ${iconColor} shrink-0`} />
          <span>{confidencePct}% Community Confidence</span>
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{reportCount} Reports</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium pt-0.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          {isHighConfidence
            ? `${reportCount} recent driver reports agree · Verified ${timeLabel}`
            : 'Confidence decreases over time without new reports'}
        </span>
      </div>
    </div>
  );
}
