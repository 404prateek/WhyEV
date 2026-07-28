'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ConsentSectionProps {
  onFinalSubmit: () => void;
}

export function ConsentSection({ onFinalSubmit }: ConsentSectionProps) {
  const [consentChecked, setConsentChecked] = useState(false);

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-emerald-50/80 text-slate-900 shadow-sm space-y-6 border border-emerald-200/90">
      <div className="space-y-2">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Applicant Authorization & Consent</h3>
        <p className="text-xs text-slate-600 font-normal leading-relaxed">
          Please confirm consent before submitting extracted information for your Delhi EV Policy 2026 subsidy application.
        </p>
      </div>

      {/* Consent Checkbox Box */}
      <label className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-emerald-300 cursor-pointer select-none shadow-xs">
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer"
        />
        <span className="text-xs text-slate-800 font-medium leading-relaxed">
          I confirm that the uploaded documents belong to me or I am authorised to use them. I consent to the extraction of only the information necessary to evaluate my EV subsidy eligibility under the Delhi EV Policy 2026.
        </span>
      </label>

      {/* Privacy Policy & Terms Links */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-2 border-t border-emerald-200">
        <div className="flex items-center gap-4 text-slate-600 font-medium">
          <Link href="/privacy" className="hover:text-emerald-700 underline transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-emerald-700 underline transition-colors">
            Terms of Service
          </Link>
        </div>

        {/* Final CTA */}
        <button
          onClick={onFinalSubmit}
          disabled={!consentChecked}
          className="py-3.5 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <span>Confirm & Proceed to Subsidy Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
