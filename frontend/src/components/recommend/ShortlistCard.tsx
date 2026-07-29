'use client';

import React from 'react';
import { EmpanelledVehicle } from '@/types';
import { formatINR, formatLakh } from '@/lib/utils';
import { CheckCircle2, Zap, ShieldCheck, Bookmark, Sparkles, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useIntakeStore } from '@/lib/store';
import { VehicleImagePlaceholder } from '@/components/common/VehicleImagePlaceholder';

interface ShortlistCardProps {
  vehicle: EmpanelledVehicle;
}

export function ShortlistCard({ vehicle }: ShortlistCardProps) {
  const { showEffectivePrice, savedVehicleIds, toggleSaveVehicle } = useIntakeStore();
  const isSaved = savedVehicleIds.includes(vehicle.id);

  // Dynamic line item math per vehicle
  const directSubsidy = vehicle.directSubsidy || 0;
  const roadTaxWaiver = vehicle.roadTaxWaiver || Math.round(vehicle.exShowroomPrice * 0.04);
  const scrappageBonus = vehicle.scrappageBonus || 0;
  const freeInsurance = vehicle.freeInsurance || (vehicle.category === '4W' ? 20000 : 8000);
  const freeRcRegistration = vehicle.freeRcRegistration || (vehicle.category === '4W' ? 5000 : 3000);

  // Total monetary price discount applied to on-road cost
  const totalPriceDiscount = directSubsidy + roadTaxWaiver + scrappageBonus;

  // Dynamic Effective On-Road Price per model
  const actualEffectivePrice = Math.max(0, vehicle.exShowroomPrice - totalPriceDiscount);

  // Dynamic Grand Total Delhi Policy Benefits (Cash + Non-cash Perks)
  const grandTotalPolicyBenefits = totalPriceDiscount + freeInsurance + freeRcRegistration;

  const displayPrice = showEffectivePrice ? actualEffectivePrice : vehicle.exShowroomPrice;
  const isEmpanelledConfirmed = vehicle.empanelledStatus === 'confirmed' || vehicle.empanelledStatus === true;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl flex flex-col justify-between group">
      {/* Header Image or Branded Silhouette Placeholder */}
      <div className="relative h-56 w-full bg-slate-900 overflow-hidden">
        {vehicle.imageUrl && vehicle.imageUrl.startsWith('http') ? (
          <img
            src={vehicle.imageUrl}
            alt={vehicle.model}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <VehicleImagePlaceholder make={vehicle.make} model={vehicle.model} category={vehicle.category} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

        {/* ── Slot 1: Top-Left (Empanelled Status Badge) ── */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 text-xs font-extrabold shadow-sm">
          {isEmpanelledConfirmed ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Delhi Empanelled</span>
            </>
          ) : (
            <>
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-amber-900">List Pending</span>
            </>
          )}
        </div>

        {/* ── Slot 2: Top-Right (Make Tag + Bookmark Button) ── */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-slate-800 shadow-sm">
            {vehicle.make}
          </span>
          <button
            onClick={() => toggleSaveVehicle(vehicle.id)}
            className="p-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-emerald-600 shadow-sm transition-colors cursor-pointer"
            title={isSaved ? 'Remove from saved' : 'Save vehicle'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-600 text-emerald-600' : ''}`} />
          </button>
        </div>

        {/* ── Slot 3: Bottom-Left (Category & Body Type Tags) ── */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
            {vehicle.category} SEGMENT
          </span>
          {vehicle.bodyType && (
            <span className="px-2 py-0.5 rounded-full bg-slate-950/80 text-slate-300 text-[10px] font-bold border border-slate-800">
              {vehicle.bodyType}
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-7 space-y-5 flex-1">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-600 tracking-wider uppercase">{vehicle.make}</span>
            {vehicle.dataSourceDate && (
              <span className="text-[10px] text-slate-400 font-medium">Verified {vehicle.dataSourceDate}</span>
            )}
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{vehicle.model}</h3>
          <p className="text-xs text-slate-500 font-medium truncate">{vehicle.variant}</p>
        </div>

        {/* BaaS Battery Subscription Banner if Available */}
        {vehicle.baasAvailable && (
          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-teal-600 shrink-0" />
              <span>BaaS Subscription: ₹{vehicle.baasPriceLakh}L base</span>
            </div>
            <span className="text-[10px] bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md font-bold">
              Battery Rental Option
            </span>
          </div>
        )}

        {/* Boundary Model Warning if Applicable */}
        {vehicle.boundaryModel && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{vehicle.boundaryNote || 'Boundary Model: Base variant under ₹30L; top trims exceed.'}</span>
          </div>
        )}

        {/* Price & Delhi EV Policy 2026 Detailed Breakdown Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/80 space-y-3">
          {/* Header Price Info */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Ex-Showroom Price</span>
              <span className="text-lg font-extrabold text-slate-900">{formatINR(vehicle.exShowroomPrice)}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-800 font-semibold block">Effective On-Road Price</span>
              <span className="text-2xl font-extrabold text-emerald-700">{formatLakh(vehicle.effectivePrice)}</span>
            </div>
          </div>

          {/* Line-Itemized Delhi EV Policy Savings Breakdown */}
          <div className="space-y-1.5 pt-3 border-t border-slate-200/70 text-xs">
            <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Delhi EV Policy 2026 Itemized Benefits</span>
            </div>

            {/* Direct Subsidy */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-200/40 gap-0.5 sm:gap-2">
              <span className="text-slate-600 font-medium">Direct Govt Purchase Subsidy:</span>
              <span className="font-extrabold text-emerald-700 shrink-0">
                {directSubsidy > 0 ? `-${formatINR(directSubsidy)}` : 'Exempt (Under ₹30L)'}
              </span>
            </div>

            {/* Road Tax Waiver */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-200/40 gap-0.5 sm:gap-2">
              <span className="text-slate-600 font-medium">100% Road Tax Waiver (4% Ex-Showroom):</span>
              <span className="font-extrabold text-emerald-700 shrink-0">
                -{formatINR(roadTaxWaiver)}
              </span>
            </div>

            {/* Scrappage Bonus */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-200/40 gap-0.5 sm:gap-2">
              <span className="text-slate-600 font-medium">Scrappage / Trade-In Bonus:</span>
              <span className="font-extrabold text-emerald-700 shrink-0">
                {scrappageBonus > 0 ? `-${formatINR(scrappageBonus)}` : '₹0 (Select Trade-In)'}
              </span>
            </div>

            {/* Free Insurance */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-200/40 gap-0.5 sm:gap-2">
              <span className="text-slate-600 font-medium">Free 1st-Year Comprehensive Insurance:</span>
              <span className="font-extrabold text-emerald-700 shrink-0">
                -{formatINR(freeInsurance)} (Govt Paid)
              </span>
            </div>

            {/* Free RC Registration */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 gap-0.5 sm:gap-2">
              <span className="text-slate-600 font-medium">Free RTO RC Registration:</span>
              <span className="font-extrabold text-emerald-700 shrink-0">
                -{formatINR(freeRcRegistration)} (100% Waived)
              </span>
            </div>

            {/* Total Benefits Banner */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs mt-2 shadow-xs">
              <span>Total Delhi Policy Benefits:</span>
              <span className="text-sm font-extrabold">
                -{formatINR(grandTotalPolicyBenefits)}
              </span>
            </div>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Real Range</div>
              <div className="font-bold text-slate-900">{vehicle.rangeKm} km / charge</div>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Running Cost</div>
              <div className="font-bold text-slate-900">₹{vehicle.runningCostPerKm}/km</div>
            </div>
          </div>
        </div>

        {/* Why this fits rationale */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-slate-700 space-y-1.5">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            <span>Why this fits your profile:</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">{vehicle.whyThisFits}</p>
        </div>
      </div>

      {/* Footer CTA — no dealer contact */}
      <div className="p-7 pt-0 flex gap-3">
        <Link
          href="/subsidy"
          className="flex-1 h-[48px] rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>View Full Subsidy Breakdown</span>
        </Link>
      </div>
    </div>
  );
}
