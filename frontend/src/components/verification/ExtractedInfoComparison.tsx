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
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Information We Extract</h3>
        <p className="text-xs text-slate-500 font-normal">
          We use automated AI OCR to extract only the minimum data required for Delhi EV Policy subsidy filing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* WHAT WE EXTRACT (✓) */}
        <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200/80 space-y-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-800 border-b border-emerald-200/80 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
            <span>WHAT WE EXTRACT (ONLY NECESSARY DATA)</span>
          </div>

          <ul className="space-y-3 text-xs text-slate-800 font-medium">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <strong className="text-slate-900">Applicant Full Name:</strong> Verifies genuine application submission.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <strong className="text-slate-900">Delhi Address:</strong> Confirms Delhi jurisdiction eligibility for state subsidy.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <strong className="text-slate-900">Electricity CA Number & Discom:</strong> Connects EV charger to tariff meter.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <div>
                <strong className="text-slate-900">Sanctioned Electrical Load (kW):</strong> Assesses 3.3kW / 7.2kW charger feasibility.
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
                <strong className="text-slate-900">Aadhaar Number for display:</strong> Number is masked immediately upon verification.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <div>
                <strong className="text-slate-900">Biometric Information:</strong> No fingerprints or iris scans are ever accessed.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <div>
                <strong className="text-slate-900">Bank Account Details:</strong> Only subsidy DISCOM account credit destination is used.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">✗</span>
              <div>
                <strong className="text-slate-900">Unrelated Property History:</strong> No financial valuations or tax amounts collected.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
