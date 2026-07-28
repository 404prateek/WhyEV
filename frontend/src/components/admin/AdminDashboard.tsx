'use client';

import React from 'react';
import { ShieldAlert, TrendingUp, Users, FileCheck, BatteryCharging } from 'lucide-react';

export function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Internal Ops Visibility Panel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            WhyEV Ops & Policy Management
          </h1>
        </div>

        <div className="px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          Environment: <span className="text-emerald-700 font-bold">Delhi EV Policy 2026 Engine</span>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Pre-Qualified Leads (Active)', val: '142', icon: Users },
          { label: 'Subsidy Claims In-Flight', val: '89', icon: FileCheck },
          { label: 'Battery Inspection Queue', val: '14 Pending', icon: BatteryCharging },
          { label: 'Partner Dealer Conversion Rate', val: '18.4%', icon: TrendingUp },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{m.label}</span>
                <Icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{m.val}</div>
            </div>
          );
        })}
      </div>

      {/* Policy Rules Versioning */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Government Scheme Rule Manager</h3>
            <p className="text-xs text-slate-500 font-normal">Versioned rules table (never overwrite, only append version)</p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            Live Version: GNCTD-2026-V1.2
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm space-y-2">
          <div className="flex justify-between text-slate-900 font-bold">
            <span>Current Rule: 4W Purchase Incentive Cap</span>
            <span className="text-emerald-700">₹1,50,000 (@ ₹10,000 / kWh)</span>
          </div>
          <p className="text-slate-500 text-xs font-normal">
            Changes require two-person review before publishing to live calculator.
          </p>
        </div>
      </div>
    </div>
  );
}
