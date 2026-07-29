'use client';

import React from 'react';
import { MapPin, Bell, Camera, ShieldCheck, X } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/buttons/Button';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center text-slate-900">
        <button
          onClick={closePermissionModal}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-600/10">
          <Icon className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-2">{current.title}</h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-6 px-2">{current.desc}</p>

        <div className="space-y-2.5">
          <Button 
            onClick={() => {
              if (activePermissionRequest === 'location' && 'geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                  () => closePermissionModal(),
                  () => closePermissionModal(),
                  { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
              } else {
                closePermissionModal();
              }
            }} 
            fullWidth 
            variant="emerald"
          >
            {current.actionText}
          </Button>

          <Button onClick={closePermissionModal} fullWidth variant="ghost" size="sm">
            Skip for now
          </Button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Just-in-time permission · Revocable anytime in profile settings</span>
        </div>
      </div>
    </div>
  );
}
