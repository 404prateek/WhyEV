'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { ShieldCheck, Lock, Phone, MapPin } from 'lucide-react';

export function ProfileView() {
  const { user } = useAuthStore();
  const [shareDataWithDealers, setShareDataWithDealers] = useState(false);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);

  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Profile Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 space-y-8 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-extrabold text-2xl">
            {user?.name.charAt(0) || 'A'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              {user?.name || 'Abhishek Sharma'}
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" /> {user?.phone || '+91 98765 43210'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" /> {user?.city || 'New Delhi'}
              </span>
            </p>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600">Profile Completion:</span>
            <span className="text-emerald-700 font-extrabold">{user?.profileCompletionPct || 85}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${user?.profileCompletionPct || 85}%` }} />
          </div>
        </div>
      </div>

      {/* Privacy & Handoff Settings */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 space-y-8 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <Lock className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Data Privacy & Dealer Handoff Controls</h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Auto-Share Specs with Empanelled Dealers</div>
              <p className="text-slate-500 text-xs font-normal mt-0.5">Allows matched dealers to view your daily commute distance and budget.</p>
            </div>
            <button
              onClick={() => setShareDataWithDealers(!shareDataWithDealers)}
              className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
                shareDataWithDealers ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {shareDataWithDealers ? 'ENABLED' : 'DISABLED (Protected)'}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">30-Day Post-RC Deadline SMS Alerts</div>
              <p className="text-slate-500 text-xs font-normal mt-0.5">Proactive reminders before your subsidy filing window expires.</p>
            </div>
            <button
              onClick={() => setDeadlineAlerts(!deadlineAlerts)}
              className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
                deadlineAlerts ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {deadlineAlerts ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
