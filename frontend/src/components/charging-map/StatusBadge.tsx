'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertOctagon, HelpCircle } from 'lucide-react';

export type StationStatusType = 'working' | 'busy' | 'broken' | 'unverified';

interface StatusBadgeProps {
  status: StationStatusType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StatusBadge({ status, size = 'md', showLabel = true }: StatusBadgeProps) {
  const config = {
    working: {
      label: 'Verified Working',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 ring-2 ring-emerald-500/20',
      dotClass: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    busy: {
      label: 'Occupied / Busy',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40 ring-2 ring-amber-500/20',
      dotClass: 'bg-amber-500',
      icon: Clock,
    },
    broken: {
      label: 'Reported Broken',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/40 ring-2 ring-rose-500/20',
      dotClass: 'bg-rose-500',
      icon: AlertOctagon,
    },
    unverified: {
      label: 'Unverified Status',
      badgeClass: 'bg-slate-800 text-slate-400 border-slate-700 ring-2 ring-slate-700/20',
      dotClass: 'bg-slate-400',
      icon: HelpCircle,
    },
  }[status];

  const IconComp = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-xs',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border backdrop-blur-md transition-all ${config.badgeClass} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotClass} shrink-0 animate-pulse`} />
      <IconComp className="w-3.5 h-3.5 shrink-0" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
