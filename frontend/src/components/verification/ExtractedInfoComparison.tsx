'use client';

import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export function ExtractedInfoComparison() {
  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Data Extraction Transparency Guarantee</span>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Information We Extract from Your RC</h3>
        <p className="text-xs text-slate-500 font-normal">
          We use AI Vision OCR to extract only the minimum fields required for Delhi EV Policy 2026 subsidy eligibility verification. All extracted data is shown to you for review before submission.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* WHAT WE EXTRACT (✓) */}
        <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200/80 space-y-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-800 border-b border-emerald-200/80 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
            <span>WHAT WE EXTRACT (RC / INVOICE)</span>
          </div>

          <ul className="space-y-3 text-xs text-slate-800 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <strong className="text-slate-900">RC Number:</strong> Unique registration certificate identifier — required to file the subsidy claim on the GNCTD portal.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <strong className="text-slate-900">Registration Date:</strong> Used to compute the mandatory 30-day deadline for subsidy filing.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <strong className="text-slate-900">Vehicle Category (2W / 4W):</strong> Determines the applicable subsidy tier and scrappage bonus under Delhi EV Policy 2026.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <strong className="text-slate-900">Chassis Number:</strong> Cross-referenced with the empanelled vehicle database to verify eligibility.
              </div>
            </li>
          </ul>
        </div>

        {/* WHAT WE DO NOT COLLECT (✗) */}
        <div className="p-6 rounded-3xl bg-rose-50/60 border border-rose-200/80 space-y-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-rose-800 border-b border-rose-200/80 pb-3">
            <XCircle className="w-5 h-5 text-rose-600 fill-rose-100" />
            <span>WHAT WE NEVER COLLECT OR DISPLAY</span>
          </div>

          <ul className="space-y-3 text-xs text-slate-800 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <div>
                <strong className="text-slate-900">Aadhaar Number for display:</strong> Number is masked immediately upon verification — never stored in plain text.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <div>
                <strong className="text-slate-900">Biometric Information:</strong> No fingerprints or iris scans are ever accessed or stored.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <div>
                <strong className="text-slate-900">Bank Account Details:</strong> Only the GNCTD subsidy DISCOM credit destination is used — not stored by WhyEV.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <div>
                <strong className="text-slate-900">Financial / Tax History:</strong> No income, ITR, or property valuation data is accessed or collected.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
