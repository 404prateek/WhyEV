'use client';

import React from 'react';
import { Zap, ShieldCheck, Clock, Check, Filter } from 'lucide-react';

export interface FilterState {
  fastOnly: boolean;
  availableOnly: boolean;
  verifiedOnly: boolean;
  openNow: boolean;
  connectorType: string; // 'All' | 'CCS2' | 'Type 2' | 'GB/T'
  operator: string; // 'All' | 'Tata Power' | 'Statiq' | 'BluSmart' | 'Zeon'
}

interface FilterChipsBarProps {
  filters: FilterState;
  onFilterChange: (updated: FilterState) => void;
  onReset: () => void;
}

export function FilterChipsBar({ filters, onFilterChange, onReset }: FilterChipsBarProps) {
  const toggleKey = (key: keyof FilterState) => {
    onFilterChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  const isAnyActive =
    filters.fastOnly ||
    filters.availableOnly ||
    filters.verifiedOnly ||
    filters.openNow ||
    filters.connectorType !== 'All' ||
    filters.operator !== 'All';

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 text-xs font-bold whitespace-nowrap min-w-max">
        <div className="flex items-center gap-1 text-slate-500 text-[11px] uppercase tracking-wider pr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Fast Charging Only */}
        <button
          onClick={() => toggleKey('fastOnly')}
          className={`px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
            filters.fastOnly
              ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Fast Charging DC</span>
          {filters.fastOnly && <Check className="w-3 h-3 text-white ml-0.5" />}
        </button>

        {/* Currently Available */}
        <button
          onClick={() => toggleKey('availableOnly')}
          className={`px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
            filters.availableOnly
              ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${filters.availableOnly ? 'bg-white' : 'bg-emerald-500'} animate-ping`} />
          <span>Available Guns Free</span>
          {filters.availableOnly && <Check className="w-3 h-3 text-white ml-0.5" />}
        </button>

        {/* Verified Only */}
        <button
          onClick={() => toggleKey('verifiedOnly')}
          className={`px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
            filters.verifiedOnly
              ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>90%+ Confidence</span>
          {filters.verifiedOnly && <Check className="w-3 h-3 text-white ml-0.5" />}
        </button>

        {/* Open 24/7 */}
        <button
          onClick={() => toggleKey('openNow')}
          className={`px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
            filters.openNow
              ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-sm'
              : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Open 24/7</span>
          {filters.openNow && <Check className="w-3 h-3 text-white ml-0.5" />}
        </button>

        {/* Connector Type Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 text-slate-700">
          <span className="text-[10px] text-slate-500 px-2 uppercase font-bold">Plug:</span>
          {['All', 'CCS2', 'Type 2', 'GB/T'].map((plug) => (
            <button
              key={plug}
              onClick={() => onFilterChange({ ...filters, connectorType: plug })}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                filters.connectorType === plug
                  ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {plug}
            </button>
          ))}
        </div>

        {/* Reset Filters */}
        {isAnyActive && (
          <button
            onClick={onReset}
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer ml-1"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
