'use client';

import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export interface SubsidyBreakdownData {
  vehicle_label?: string;
  vehicle_name?: string;
  variant?: string;
  direct_subsidy: number;
  scrappage_bonus: number;
  road_tax_waiver: number;
  total_benefit: number;
  eligible: boolean;
  ineligible_reason?: string;
  has_scrapping?: boolean;
}

interface SubsidyBreakdownCardProps {
  data: SubsidyBreakdownData;
  className?: string;
  variant?: 'default' | 'compact' | 'pdf';
}

export function SubsidyBreakdownCard({
  data,
  className = '',
  variant = 'default',
}: SubsidyBreakdownCardProps) {
  const {
    vehicle_label,
    vehicle_name,
    variant: vehicleVariant,
    direct_subsidy,
    scrappage_bonus,
    road_tax_waiver,
    total_benefit,
    eligible,
    ineligible_reason,
    has_scrapping,
  } = data;

  const title = vehicle_name
    ? `${vehicle_name}${vehicleVariant ? ` · ${vehicleVariant}` : ''}`
    : vehicle_label || 'EV Subsidy Eligibility Breakdown';

  // Determine whether to show scrappage line item
  const showScrappage = has_scrapping !== undefined ? has_scrapping : scrappage_bonus > 0;

  if (variant === 'pdf') {
    return (
      <div className={`rounded-2xl border border-slate-200 overflow-hidden text-xs ${className}`}>
        {/* PDF Header */}
        <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 flex justify-between items-center border-b border-slate-200">
          <span>{title}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold ${
            eligible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {eligible ? 'Eligible' : 'Ineligible'}
          </span>
        </div>

        <div className="p-4 space-y-2.5 bg-white">
          {!eligible ? (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Not Eligible</span>
              </div>
              <p className="text-slate-600 font-normal">
                {ineligible_reason || 'Vehicle does not meet state policy criteria.'}
              </p>
            </div>
          ) : (
            <>
              {/* Line Items */}
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Direct Subsidy</span>
                <span className="font-bold text-slate-900 text-right">{formatINR(direct_subsidy)}</span>
              </div>

              {showScrappage && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Scrappage Bonus</span>
                  <span className="font-bold text-slate-900 text-right">{formatINR(scrappage_bonus)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-600">Road Tax Waiver</span>
                <span className="font-bold text-slate-900 text-right">{formatINR(road_tax_waiver)}</span>
              </div>

              {/* Total Line */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm font-extrabold">
                <span className="text-slate-900">Total Benefit</span>
                <span className="text-emerald-700 text-right">{formatINR(total_benefit)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">{title}</h4>
        {eligible ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Eligible</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Ineligible</span>
          </span>
        )}
      </div>

      {!eligible ? (
        /* Ineligible State */
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Not eligible</span>
          </div>
          <p className="text-slate-600 font-medium leading-relaxed">
            {ineligible_reason || 'Vehicle does not qualify for state subsidy incentives.'}
          </p>
        </div>
      ) : (
        /* Line Items & Total */
        <div className="space-y-3 text-xs sm:text-sm font-medium">
          {/* Direct Subsidy */}
          <div className="flex justify-between items-center text-slate-600">
            <span>Direct Subsidy</span>
            <span className="font-bold text-slate-900 text-right">{formatINR(direct_subsidy)}</span>
          </div>

          {/* Scrappage Bonus (Only if scrapping=true) */}
          {showScrappage && (
            <div className="flex justify-between items-center text-slate-600">
              <span>Scrappage Bonus</span>
              <span className="font-bold text-slate-900 text-right">{formatINR(scrappage_bonus)}</span>
            </div>
          )}

          {/* Road Tax Waiver */}
          <div className="flex justify-between items-center text-slate-600">
            <span>Road Tax Waiver</span>
            <span className="font-bold text-slate-900 text-right">{formatINR(road_tax_waiver)}</span>
          </div>

          {/* Total Line visually separated with divider */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm sm:text-base font-extrabold">
            <span className="text-slate-900">Total Benefit</span>
            <span className="text-emerald-700 font-extrabold text-right">{formatINR(total_benefit)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
