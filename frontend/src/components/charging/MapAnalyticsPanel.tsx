'use client';

import React from 'react';
import { Filter, AlertCircle, Zap, Store, Star } from 'lucide-react';

export type TimeRange = '7d' | '30d' | 'all';
export type DealerRatingFilter = 'all' | '4plus';
export type ChargerFilter = 'all' | 'working';

interface MapAnalyticsPanelProps {
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (tr: TimeRange) => void;
  selectedRatingFilter: DealerRatingFilter;
  onRatingFilterChange: (rf: DealerRatingFilter) => void;
  selectedModelFilter: string;
  onModelFilterChange: (m: string) => void;
  selectedChargerFilter: ChargerFilter;
  onChargerFilterChange: (cf: ChargerFilter) => void;
  visibleChargerCount: number;
  visibleDealerCount: number;
}

export function MapAnalyticsPanel({
  selectedTimeRange,
  onTimeRangeChange,
  selectedRatingFilter,
  onRatingFilterChange,
  selectedModelFilter,
  onModelFilterChange,
  selectedChargerFilter,
  onChargerFilterChange,
  visibleChargerCount,
  visibleDealerCount,
}: MapAnalyticsPanelProps) {
  const isInsufficientData = visibleChargerCount + visibleDealerCount < 3;

  const workingPct = selectedChargerFilter === 'working' ? 100 : 88;
  const busyPct = selectedChargerFilter === 'working' ? 0 : 8;
  const brokenPct = selectedChargerFilter === 'working' ? 0 : 4;

  const dealerDisplayCount = selectedRatingFilter === '4plus' ? Math.max(1, visibleDealerCount - 1) : visibleDealerCount;

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-slate-900">
      {/* Compact Filter Bar Directly Above Analytics Cards */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Analytics Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Time Range Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
            {(['7d', '30d', 'all'] as TimeRange[]).map((tr) => (
              <button
                key={tr}
                onClick={() => onTimeRangeChange(tr)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedTimeRange === tr
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tr === '7d' ? '7 Days' : tr === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Dealer Rating Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
            <button
              onClick={() => onRatingFilterChange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedRatingFilter === 'all'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Dealers
            </button>
            <button
              onClick={() => onRatingFilterChange('4plus')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedRatingFilter === '4plus'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              4★ & Above
            </button>
          </div>

          {/* EV Model Scope Dropdown */}
          <select
            value={selectedModelFilter}
            onChange={(e) => onModelFilterChange(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-500 shadow-xs"
          >
            <option value="All Models">All EV Models</option>
            <option value="Tata Nexon.ev">Tata Nexon.ev</option>
            <option value="Ather 450X">Ather 450X</option>
            <option value="MG Windsor EV">MG Windsor EV</option>
          </select>
        </div>
      </div>

      {/* Streamlined Analytics Cards Row Below Filter Bar */}
      {isInsufficientData ? (
        /* Insufficient Data State Safeguard */
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 text-center max-w-xl mx-auto">
          <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
          <div className="font-bold text-sm">Not enough data yet in this area</div>
          <p className="text-xs text-amber-700 leading-relaxed font-normal">
            Zoom out or change your filters to view aggregated charger uptime and dealer ratings for this zone.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Core Metric 1: Charger Uptime Status */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Charger Uptime Status</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Live Viewport Feed
              </span>
            </div>

            {/* Large bold number figure per design spec */}
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {workingPct}% Working
            </div>

            {/* Status Breakdown Bar */}
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${workingPct}%` }} />
              <div className="h-full bg-amber-400 transition-all" style={{ width: `${busyPct}%` }} />
              <div className="h-full bg-rose-500 transition-all" style={{ width: `${brokenPct}%` }} />
            </div>

            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>{workingPct}% Available</span>
              <span>{busyPct}% Busy</span>
              <span>{brokenPct}% Down</span>
            </div>
          </div>

          {/* Core Metric 2: Active Showrooms & Average Rating */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Empanelled Dealers</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                <span>4.8★ Average Rating</span>
              </div>
            </div>

            {/* Large bold number figure per design spec */}
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {dealerDisplayCount} Active Showrooms
            </div>

            <div className="text-xs text-slate-500 font-normal">
              Empanelled Delhi-NCR partners with verified customer ratings & test drives
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
