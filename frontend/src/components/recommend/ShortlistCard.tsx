'use client';

import React from 'react';
import { EmpanelledVehicle } from '@/types';
import { formatINR, formatLakh } from '@/lib/utils';
import { CheckCircle2, Zap, ShieldCheck, ArrowRight, Bookmark, Sparkles, AlertCircle, Info } from 'lucide-react';
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

  const displayPrice = showEffectivePrice ? vehicle.effectivePrice : vehicle.exShowroomPrice;
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

        {/* Gated Empanelled Badge (Only shown when confirmed) */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 text-xs font-bold shadow-sm">
          {isEmpanelledConfirmed ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Delhi Empanelled</span>
            </>
          ) : (
            <>
              <Info className="w-4 h-4 text-amber-600" />
              <span className="text-amber-900">Empanelled List Pending</span>
            </>
          )}
        </div>

        {/* Save Toggle */}
        <button
          onClick={() => toggleSaveVehicle(vehicle.id)}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-emerald-600 shadow-sm transition-colors cursor-pointer"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600 text-emerald-600' : ''}`} />
        </button>

        {/* Category & Body Type Tag */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
            {vehicle.category} Segment
          </span>
          {vehicle.bodyType && (
            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 text-slate-300 text-[10px] font-bold border border-slate-800">
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

        {/* Price & Subsidy Box */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              {showEffectivePrice ? 'Effective Post-Subsidy Cost:' : 'Ex-Showroom Price:'}
            </span>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-emerald-700">{formatLakh(displayPrice)}</span>
              {vehicle.priceMinLakh && vehicle.priceMaxLakh && (
                <div className="text-[10px] text-slate-400 font-normal">
                  Range: ₹{vehicle.priceMinLakh}L - ₹{vehicle.priceMaxLakh}L
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
            <span className="text-slate-600 font-medium">Delhi Subsidy + Scrappage:</span>
            <span className="font-extrabold text-emerald-700">-{formatINR(vehicle.subsidyAmount + vehicle.scrappageBonus)}</span>
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

      {/* Footer CTA */}
      <div className="p-7 pt-0">
        <Link
          href={`/dealers?vehicle=${vehicle.id}`}
          className="w-full h-[48px] rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Connect to Empanelled Dealers</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
