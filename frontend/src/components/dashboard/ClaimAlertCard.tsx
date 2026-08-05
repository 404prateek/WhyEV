'use client';

import React from 'react';
import Link from 'next/link';
import { Landmark, ArrowRight, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export type ClaimStageStatus =
  | 'active'
  | 'submitted'
  | 'under_verification'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'completed'
  | 'no_claim';

export interface ClaimAlertData {
  status: ClaimStageStatus;
  title?: string;
  schemeName?: string;
  subsidyAmountFormatted?: string;
  remainingDays?: number;
  deadlineDate?: string;
  currentStageName?: string;
  supportingMessage?: string;
  progressPct?: number;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
}

interface ClaimAlertCardProps {
  claimData?: ClaimAlertData;
}

export function ClaimAlertCard({ claimData }: ClaimAlertCardProps) {
  // If no claim data or status is 'no_claim', render the empty state
  if (!claimData || claimData.status === 'no_claim') {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5 text-slate-600" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-slate-900">No Active Subsidy Claims</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                You haven't initiated a state or central EV subsidy claim yet.
              </p>
            </div>
          </div>

          <Link
            href="/subsidy"
            className="h-[40px] px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span>Calculate Subsidy Eligibility</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>
      </div>
    );
  }

  // Dynamic Status Badges & Styling Map
  const getStatusBadge = (status: ClaimStageStatus) => {
    switch (status) {
      case 'active':
        return { label: 'Claim Window Open', color: 'bg-amber-50 text-amber-900 border-amber-200' };
      case 'submitted':
      case 'under_verification':
        return { label: 'Under Verification', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
      case 'approved':
      case 'completed':
        return { label: 'Claim Approved', color: 'bg-emerald-100 text-emerald-950 border-emerald-300' };
      case 'rejected':
        return { label: 'Action Required', color: 'bg-rose-50 text-rose-900 border-rose-200' };
      case 'expired':
        return { label: 'Claim Expired', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { label: 'Active Claim', color: 'bg-amber-50 text-amber-900 border-amber-200' };
    }
  };

  const badge = getStatusBadge(claimData.status);
  const progressPct = claimData.progressPct ?? 50;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left">
      {/* Header Row: Scheme Title & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              {claimData.title || claimData.schemeName || 'Direct State EV Subsidy'}
            </h3>
            {claimData.currentStageName && (
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Current Stage: <span className="text-slate-900 font-extrabold">{claimData.currentStageName}</span>
              </p>
            )}
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-black border self-start sm:self-auto ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Dynamic Key Metric Summary (Amount, Remaining Days, Deadline) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {claimData.subsidyAmountFormatted && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Subsidy Amount</div>
            <div className="text-xl font-black text-emerald-700">{claimData.subsidyAmountFormatted}</div>
          </div>
        )}

        {claimData.remainingDays !== undefined && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Time Remaining</div>
            <div className="text-xl font-black text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{claimData.remainingDays} Days</span>
            </div>
          </div>
        )}

        {claimData.deadlineDate && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Claim Deadline</div>
            <div className="text-sm font-black text-slate-900 pt-1">{claimData.deadlineDate}</div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-600">
          <span>Subsidy Application Progress</span>
          <span className="text-emerald-700 font-extrabold">{progressPct}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Supporting Message & Dynamic Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {claimData.supportingMessage && (
          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{claimData.supportingMessage}</span>
          </p>
        )}

        <Link
          href={claimData.primaryCtaUrl || '/subsidy'}
          className="h-[40px] px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <span>{claimData.primaryCtaLabel || 'Track Claim Application'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </Link>
      </div>
    </div>
  );
}
