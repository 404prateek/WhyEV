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
    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
    : isMediumConfidence
    ? 'text-amber-400 bg-amber-950/60 border-amber-500/30'
    : 'text-slate-400 bg-slate-900 border-slate-800';

  const timeLabel =
    lastVerifiedMinutesAgo < 60
      ? `${lastVerifiedMinutesAgo} mins ago`
      : `${Math.round(lastVerifiedMinutesAgo / 60)} hrs ago`;

  return (
    <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-extrabold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{confidencePct}% Community Confidence</span>
        </div>
        <span className="text-[10px] font-semibold opacity-80">{reportCount} Reports</span>
      </div>

      <div className="flex items-center gap-1 text-[11px] opacity-90 font-normal">
        <Info className="w-3 h-3 shrink-0" />
        <span>
          {isHighConfidence
            ? `${reportCount} recent driver reports agree · Verified ${timeLabel}`
            : 'Confidence decreases over time without new reports'}
        </span>
      </div>
    </div>
  );
}
