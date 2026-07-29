'use client';

import React from 'react';
import { CheckCircle2, HelpCircle } from 'lucide-react';
import { ApplicationStatus } from '@/types';

export const KNOWN_STATUSES: { key: ApplicationStatus; label: string; description: string; stepIndex: number }[] = [
  { key: 'calculated', label: 'Calculated', description: 'Subsidy amount estimated by policy engine', stepIndex: 1 },
  { key: 'documents_pending', label: 'Docs Pending', description: 'Upload RC & Aadhaar for verification', stepIndex: 2 },
  { key: 'submitted', label: 'Submitted', description: 'Application filed with Transport Department', stepIndex: 3 },
  { key: 'disbursed', label: 'Disbursed', description: 'Funds credited directly to bank account', stepIndex: 4 },
];

interface SubsidyStatusStepperProps {
  status: string | ApplicationStatus;
  className?: string;
}

export function SubsidyStatusStepper({ status, className = '' }: SubsidyStatusStepperProps) {
  // Normalize & validate status against the 4 PRD enum values
  const normalizedStatus = (status || '').toLowerCase().trim();
  const matchedStepIndex = KNOWN_STATUSES.findIndex((s) => s.key === normalizedStatus);

  // Defined Fallback for unexpected/unknown status values (never renders blank!)
  const isKnown = matchedStepIndex !== -1;
  const currentStep = isKnown ? matchedStepIndex + 1 : 1;
  const activeLabel = isKnown
    ? KNOWN_STATUSES[matchedStepIndex].label
    : `Processing Status (${status || 'Calculated'})`;

  return (
    <div className={`w-full p-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-6 ${className}`}>
      {/* Header Status Badge */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Subsidy Claim Lifecycle</span>
          <h4 className="text-base font-extrabold text-slate-900 mt-0.5">{activeLabel}</h4>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
            isKnown
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-amber-100 text-amber-900 border border-amber-300'
          }`}
        >
          {isKnown ? (
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse inline-block" />
          ) : (
            <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
          )}
          <span>{isKnown ? status.replace('_', ' ').toUpperCase() : 'PENDING REVIEW'}</span>
        </span>
      </div>

      {/* 4-Step Visual Stepper Bar */}
      <div className="relative flex items-center justify-between w-full px-2">
        {/* Progress Line Behind Circles */}
        <div className="absolute top-1/2 left-6 right-6 h-1 bg-slate-100 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-6 h-1 bg-emerald-500 -translate-y-1/2 transition-all duration-500 z-0"
          style={{
            width: `${Math.max(0, Math.min(100, ((currentStep - 1) / (KNOWN_STATUSES.length - 1)) * 90))}%`,
          }}
        />

        {KNOWN_STATUSES.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : isCurrent
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 animate-pulse'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
              </div>

              <div className="mt-2 text-center max-w-[85px]">
                <div className={`text-[11px] font-extrabold ${isCurrent || isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unknown Status Warning Alert (if unexpected value passed) */}
      {!isKnown && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Application status '{status}' is being processed by the Transport Department. Defaulting to Step 1 (Calculated).</span>
        </div>
      )}
    </div>
  );
}
