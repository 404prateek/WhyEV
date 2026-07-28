'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, CheckCircle2, Sparkles } from 'lucide-react';

export function VerificationHeroSection() {
  return (
    <div className="relative rounded-3xl bg-white p-8 sm:p-12 text-slate-900 overflow-hidden shadow-sm border border-slate-200/90">
      {/* Background Subtle Radial Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-6">
        {/* DigiLocker / Banking Level Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>DigiLocker & Banking KYC Standard Compliant</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Secure Document Verification
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
          We only collect the information required to determine your EV subsidy eligibility and provide personalised recommendations. Your data is encrypted using 256-bit SSL encryption.
        </p>

        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>256-Bit Encrypted</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>DigiLocker OCR</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero Ads Guaranteed</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Privacy Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
