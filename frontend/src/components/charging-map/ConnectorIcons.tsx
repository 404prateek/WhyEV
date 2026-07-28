'use client';

import React from 'react';
import { Zap } from 'lucide-react';

interface ConnectorItem {
  type: string;
  total: number;
  available: number;
  busy: number;
  broken: number;
}

interface ConnectorIconsProps {
  connectors: ConnectorItem[];
  isFast?: boolean;
  maxPowerKw?: number;
}

export function ConnectorIcons({ connectors, isFast = true, maxPowerKw = 60 }: ConnectorIconsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
        <span>Available Connectors</span>
        {isFast && (
          <span className="text-emerald-400 font-extrabold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            {maxPowerKw} kW Ultra-Fast DC
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {connectors.map((c, idx) => (
          <div
            key={idx}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2"
          >
            <span className="font-extrabold text-white">{c.type}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                c.available > 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {c.available}/{c.total} Free
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
