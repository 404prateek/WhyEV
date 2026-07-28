'use client';

import React from 'react';
import { Lock, ShieldCheck, EyeOff, FileCheck } from 'lucide-react';

const TRUST_BADGES = [
  {
    title: 'Encrypted Upload',
    desc: 'All file transfers are encrypted using enterprise 256-bit SSL / TLS 1.3 encryption.',
    icon: Lock,
  },
  {
    title: 'Secure Processing',
    desc: 'Document OCR processing occurs in isolated encrypted memory containers.',
    icon: ShieldCheck,
  },
  {
    title: 'Privacy Protected',
    desc: 'We never sell, share, or monetize your documents for advertising purposes.',
    icon: EyeOff,
  },
  {
    title: 'Minimal Data Collection',
    desc: 'Only fields necessary for Delhi DISCOM subsidy approval are retained.',
    icon: FileCheck,
  },
];

export function PrivacySecuritySection() {
  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white text-slate-900 shadow-sm space-y-6 border border-slate-200/90">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Enterprise Grade Privacy & Security</span>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Data Is 100% Protected</h3>
        <p className="text-xs text-slate-500 font-normal">
          You remain in full control of your documents at all times. Delete or replace files with one click.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {TRUST_BADGES.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100/90 space-y-2.5 shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">{badge.title}</h4>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">{badge.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
