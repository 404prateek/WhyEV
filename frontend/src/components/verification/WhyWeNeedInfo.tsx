'use client';

import React from 'react';
import { ShieldCheck, MapPin, Zap, Home } from 'lucide-react';

const PURPOSES = [
  {
    title: 'Identity Verification',
    desc: 'Ensures subsidy applications are submitted by genuine Delhi residents and prevents duplicate claims.',
    icon: ShieldCheck,
  },
  {
    title: 'Address Verification',
    desc: 'Determines whether your residential address falls within Delhi state jurisdiction under EV Policy 2026.',
    icon: MapPin,
  },
  {
    title: 'Electricity Information',
    desc: 'Assesses home charger installation feasibility and checks if your DISCOM meter supports ₹2,000/kW subsidy.',
    icon: Zap,
  },
  {
    title: 'Property Verification',
    desc: 'Confirms whether your parking setup (stilt, garage, or society bay) is eligible for wallbox installation.',
    icon: Home,
  },
];

export function WhyWeNeedInfo() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Why We Need This Information</h3>
        <p className="text-xs text-slate-500 font-normal">
          Every piece of data serves an explicit purpose in securing your state subsidy approval.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PURPOSES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
