'use client';

import React from 'react';
import { Zap, Store, Layers, Filter, RefreshCw } from 'lucide-react';

export type LayerFilter = 'all' | 'chargers' | 'dealers';
export type StatusFilter = 'all' | 'working' | 'busy' | 'maintenance';

interface EvMapFiltersProps {
  layer: LayerFilter;
  setLayer: (l: LayerFilter) => void;
  status: StatusFilter;
  setStatus: (s: StatusFilter) => void;
  onReset: () => void;
}

export function EvMapFilters({
  layer,
  setLayer,
  status,
  setStatus,
  onReset,
}: EvMapFiltersProps) {
  return (
    <div className="p-4 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs font-bold text-slate-200">
      {/* Left: Layer Toggle */}
      <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
        <button
          onClick={() => setLayer('all')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            layer === 'all'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Layers</span>
        </button>

        <button
          onClick={() => setLayer('chargers')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            layer === 'chargers'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Chargers</span>
        </button>

        <button
          onClick={() => setLayer('dealers')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            layer === 'dealers'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Store className="w-3.5 h-3.5 text-blue-400" />
          <span>Empanelled Dealers</span>
        </button>
      </div>

      {/* Right: Status Filter & Reset */}
      <div className="flex items-center justify-between sm:justify-end gap-3 flex-1">
        {layer !== 'dealers' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1 hidden md:flex">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 text-xs font-semibold cursor-pointer"
            >
              <option value="all">All Charger Statuses</option>
              <option value="working">Working Only (100% Available)</option>
              <option value="busy">Busy (Limited Guns)</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        )}

        <button
          onClick={onReset}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Reset Filters"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </div>
  );
}
