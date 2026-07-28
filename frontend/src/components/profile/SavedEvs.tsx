'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ArrowUpRight, Battery, Zap, Sparkles } from 'lucide-react';
import { EmpanelledVehicle } from '@/types';
import { Button } from '@/components/buttons/Button';
import { ROUTES } from '@/routes/routes';

interface SavedEvsProps {
  vehicles: EmpanelledVehicle[];
  onRemove: (id: string) => void;
}

export function SavedEvs({ vehicles, onRemove }: SavedEvsProps) {
  if (vehicles.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-10 sm:p-14 shadow-sm text-center space-y-6 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">No Saved EVs Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto font-normal">
            Explore empanelled electric vehicles under the Delhi EV Policy 2026 and bookmark models for side-by-side comparison.
          </p>
        </div>
        <div className="pt-2">
          <Link href={ROUTES.RECOMMEND}>
            <Button size="md" variant="emerald" rightIcon={<ArrowUpRight className="w-4 h-4" />}>
              Explore Empanelled EVs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Saved Electric Vehicles</h3>
          <p className="text-xs text-slate-500 font-normal">Bookmarked models saved for comparison & dealer offers</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          {vehicles.length} Saved
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-4">
              {/* Image & Header */}
              <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
                {v.imageUrl && v.imageUrl.startsWith('http') ? (
                  <Image src={v.imageUrl} alt={v.model} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="text-center p-4">
                    <div className="text-base font-extrabold text-emerald-400">{v.make}</div>
                    <div className="text-xs font-bold text-slate-300">{v.model}</div>
                  </div>
                )}
                <button
                  onClick={() => onRemove(v.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shadow-sm cursor-pointer"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                  {v.make}
                </span>
              </div>

              {/* Title & Price */}
              <div>
                <h4 className="text-base font-bold text-slate-900">{v.model}</h4>
                <p className="text-xs text-slate-500 font-normal">{v.variant}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-slate-900">₹{(v.effectivePrice / 100000).toFixed(2)} Lakh</span>
                  <span className="text-xs text-slate-400 line-through">₹{(v.exShowroomPrice / 100000).toFixed(2)} Lakh</span>
                </div>
              </div>

              {/* Key Specs Pill Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Range</div>
                    <div className="font-bold text-slate-900">{v.rangeKm} km</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Battery className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Battery</div>
                    <div className="font-bold text-slate-900">{v.batteryCapacityKwh} kWh</div>
                  </div>
                </div>
              </div>

              {/* Subsidy Highlight */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Est. Delhi Subsidy: ₹{v.subsidyAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3 border-t border-slate-100">
              <Link href={ROUTES.RECOMMEND} className="flex-1">
                <Button size="sm" variant="emerald" fullWidth rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
