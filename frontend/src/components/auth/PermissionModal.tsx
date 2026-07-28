'use client';

import React from 'react';
import { MapPin, Bell, Camera, ShieldCheck, X } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export function PermissionModal() {
  const { isPermissionModalOpen, activePermissionRequest, closePermissionModal } = useAuthStore();

  if (!isPermissionModalOpen || !activePermissionRequest) return null;

  const contentMap = {
    location: {
      title: 'Delhi Residency Verification',
      icon: MapPin,
      desc: 'Delhi EV Policy 2026 subsidies apply strictly to Delhi/NCR residents. Granting location permission allows WhyEV to auto-verify your residency for immediate incentive calculation.',
      actionText: 'Allow Location Access',
    },
    notifications: {
      title: '30-Day Deadline Reminders',
      icon: Bell,
      desc: 'Subsidies must be filed within 30 days of RC issuance. Enable notifications so WhyEV can send proactive reminders at Day 20 and Day 25 to prevent missing out.',
      actionText: 'Enable Deadline Notifications',
    },
    camera: {
      title: 'RC Document Upload',
      icon: Camera,
      desc: 'WhyEV uses document pre-fill to extract RC and invoice fields automatically, reducing government paperwork friction.',
      actionText: 'Grant Camera / File Access',
    },
  };

  const current = contentMap[activePermissionRequest];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative text-center">
        <button
          onClick={closePermissionModal}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/50">
          <Icon className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-slate-100 mb-2">{current.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-6 px-2">{current.desc}</p>

        <div className="space-y-2">
          <button
            onClick={closePermissionModal}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-900/40"
          >
            {current.actionText}
          </button>

          <button
            onClick={closePermissionModal}
            className="w-full py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Skip for now
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Just-in-time permission · Revocable anytime in profile settings</span>
        </div>
      </div>
    </div>
  );
}
