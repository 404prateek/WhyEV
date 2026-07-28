'use client';

import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { useSubsidyStore, useAuthStore } from '@/lib/store';

export function SubsidyChecklist() {
  const { application } = useSubsidyStore();
  const { requestPermission } = useAuthStore();

  const steps = [
    {
      title: 'Step 1: Empanelled EV Purchase',
      desc: 'Buy an approved BEV model from a registered Delhi dealership.',
      status: 'completed',
    },
    {
      title: 'Step 2: Vehicle RC & Invoice Upload',
      desc: 'Upload RC smart card & dealer invoice within 30 days of registration.',
      status: 'pending',
    },
    {
      title: 'Step 3: Portal Claim Verification',
      desc: 'Transport Department verifies chassis number & battery kWh capacity.',
      status: 'upcoming',
    },
    {
      title: 'Step 4: Direct Bank Disbursal',
      desc: 'Subsidy amount credited directly to Aadhaar-linked bank account.',
      status: 'upcoming',
    },
  ];

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 space-y-8 shadow-sm">
      {/* Deadline Header Banner */}
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300 font-bold shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              30-Day Post-RC Filing Window Active
            </div>
            <div className="text-base font-extrabold text-slate-900">
              {application.daysRemaining} Days Remaining to Submit Claim
            </div>
          </div>
        </div>

        <button
          onClick={() => requestPermission('camera')}
          className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Upload className="w-4 h-4" />
          <span>Upload RC Photo Now</span>
        </button>
      </div>

      {/* Checklist Timeline */}
      <div className="space-y-5 pt-2">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Claim Process Checklist</h3>

        <div className="space-y-4">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${
                s.status === 'completed'
                  ? 'bg-emerald-50/70 border-emerald-200 text-slate-900'
                  : s.status === 'pending'
                  ? 'bg-white border-amber-300 shadow-sm text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-4">
                {s.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : s.status === 'pending' ? (
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 animate-bounce" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-slate-300 shrink-0" />
                )}
                <div>
                  <div className="text-sm font-bold text-slate-900">{s.title}</div>
                  <div className="text-xs text-slate-500 font-normal">{s.desc}</div>
                </div>
              </div>

              {s.status === 'pending' && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                  Action Required
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
