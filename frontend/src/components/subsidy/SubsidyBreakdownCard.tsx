'use client';

import React from 'react';
import { ShieldAlert, CheckCircle2, Sparkles, Fuel, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export interface SubsidyBreakdownData {
  vehicle_label?: string;
  vehicle_name?: string;
  variant?: string;
  category?: string;
  direct_subsidy: number;
  scrappage_bonus: number;
  road_tax_waiver: number;
  free_insurance?: number;
  free_rc_registration?: number;
  total_benefit: number;
  eligible: boolean;
  ineligible_reason?: string;
  has_scrapping?: boolean;
  ex_showroom_price?: number;
  daily_km?: number;
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
    category = '4W',
    direct_subsidy,
    scrappage_bonus,
    road_tax_waiver,
    total_benefit,
    eligible,
    ineligible_reason,
    has_scrapping,
    ex_showroom_price = 1000000,
    daily_km = 45,
  } = data;

  const title = vehicle_name
    ? `${vehicle_name}${vehicleVariant ? ` · ${vehicleVariant}` : ''}`
    : vehicle_label || 'EV Subsidy Eligibility Breakdown';

  // Determine whether to show scrappage line item
  const showScrappage = has_scrapping !== undefined ? has_scrapping : scrappage_bonus > 0;

  // Delhi EV Policy 2026 — non-monetary benefits
  const freeInsurance = data.free_insurance ?? (category === '4W' ? 20000 : category === '3W' ? 12000 : 8000);
  const freeRcReg = data.free_rc_registration ?? (category === '4W' ? 5000 : category === '3W' ? 4000 : 3000);

  // Monetary discount applied to ex-showroom price
  const directSubsidyVal = category === '4W' ? 0 : direct_subsidy;
  const priceDiscount = directSubsidyVal + (showScrappage ? scrappage_bonus : 0) + road_tax_waiver;
  
  // Grand Total Benefits including non-cash perks
  const grandTotalPolicyBenefits = priceDiscount + freeInsurance + freeRcReg;

  // 5-Year Fuel Savings Estimate
  const savingsPerKmMap: Record<string, number> = {
    '2W': 1.88,
    '3W': 3.20,
    '4W': 5.31,
    'N1_goods': 3.50,
  };
  const netSavingsPerKm = savingsPerKmMap[category] || 5.31;
  const fuelSavings5Yrs = Math.round(daily_km * 365 * 5 * netSavingsPerKm);
  const grandTotal5YrSavings = fuelSavings5Yrs + grandTotalPolicyBenefits;

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
                <span className="text-slate-600">Direct Purchase Subsidy</span>
                <span className="font-bold text-slate-900 text-right">{category === '4W' ? 'Exempt (Under ₹30L)' : formatINR(directSubsidyVal)}</span>
              </div>

              {showScrappage && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Scrappage / Trade-In Bonus</span>
                  <span className="font-bold text-slate-900 text-right">{formatINR(scrappage_bonus)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-600">100% Road Tax Waiver</span>
                <span className="font-bold text-slate-900 text-right">{formatINR(road_tax_waiver)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">Free 1st-Year Comprehensive Insurance</span>
                <span className="font-bold text-slate-900 text-right">{formatINR(freeInsurance)} (Govt Paid)</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">Free RTO Registration Fee</span>
                <span className="font-bold text-slate-900 text-right">{formatINR(freeRcReg)} (100% Waived)</span>
              </div>

              {/* Total Line */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm font-extrabold">
                <span className="text-slate-900">Grand Total Policy Benefits</span>
                <span className="text-emerald-700 text-right">{formatINR(grandTotalPolicyBenefits)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-6 ${className}`}>
      {/* Header with Gazette Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold mb-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Delhi EV Policy 2026 Gazette Verified</span>
          </div>
          <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">{title}</h4>
        </div>
        {eligible ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Eligible</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 shrink-0">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
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
        /* Line Items & Total Benefits */
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itemized Govt Policy Perks</div>

          <div className="space-y-3 text-xs sm:text-sm">
            {/* Direct Subsidy */}
            <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Direct Purchase Subsidy</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700">
                  {category === '4W' ? 'Exempt (Under ₹30L)' : 'Cash Benefit'}
                </span>
              </div>
              <span className="font-extrabold text-slate-900 text-right">
                {category === '4W' ? '₹0' : formatINR(directSubsidyVal)}
              </span>
            </div>

            {/* Scrappage Bonus */}
            {showScrappage && (
              <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Scrappage / Trade-In Bonus</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    ICE Trade-In
                  </span>
                </div>
                <span className="font-extrabold text-emerald-700 text-right">-{formatINR(scrappage_bonus)}</span>
              </div>
            )}

            {/* Road Tax Waiver */}
            <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">100% Road Tax Waiver</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  4% Waived
                </span>
              </div>
              <span className="font-extrabold text-emerald-700 text-right">-{formatINR(road_tax_waiver)}</span>
            </div>

            {/* Free 1st-Year Insurance (Govt Paid) */}
            <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Free 1st-Year Comprehensive Insurance</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800">
                  Govt Paid
                </span>
              </div>
              <span className="font-extrabold text-emerald-700 text-right">-{formatINR(freeInsurance)}</span>
            </div>

            {/* Free RTO Registration (100% Waived) */}
            <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Free RTO RC Registration</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800">
                  100% Waived
                </span>
              </div>
              <span className="font-extrabold text-emerald-700 text-right">-{formatINR(freeRcReg)}</span>
            </div>
          </div>

          {/* Highlight Banner: Grand Total Delhi Policy Benefits */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 text-white shadow-lg space-y-2 border border-emerald-500/30 relative overflow-hidden">
            <div className="flex justify-between items-center text-xs text-emerald-200 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Grand Total Delhi Policy Benefits
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px]">Perks Included</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {formatINR(grandTotalPolicyBenefits)}
              </div>
              <div className="text-[11px] text-emerald-200 text-right font-medium">
                Cash Discounts + Free Insurance & RC
              </div>
            </div>
          </div>

          {/* 5-Year Total Financial Impact Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <Fuel className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900">Total Projected 5-Year Financial Savings</div>
                <div className="text-[11px] text-slate-500">Includes {formatINR(fuelSavings5Yrs)} 5-year petrol fuel savings (@ {daily_km} km/day)</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-base font-extrabold text-emerald-700">{formatINR(grandTotal5YrSavings)}</div>
              <div className="text-[10px] text-slate-400">Total 5-Yr Impact</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
