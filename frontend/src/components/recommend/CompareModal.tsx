'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Zap, ShieldCheck, ArrowRight, BatteryCharging, Gauge, Users, Scale } from 'lucide-react';
import { EmpanelledVehicle } from '@/types';
import { formatLakh, formatINR } from '@/lib/utils';
import Link from 'next/link';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: EmpanelledVehicle[];
  onRemoveVehicle: (id: string) => void;
}

export function CompareModal({
  isOpen,
  onClose,
  vehicles,
  onRemoveVehicle,
}: CompareModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col justify-between text-slate-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Side-by-Side EV Comparison</span>
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Comparing {vehicles.length} EV Models</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Side-by-Side Matrix Table */}
          <div className="overflow-x-auto py-6 flex-1 no-scrollbar">
            {vehicles.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No vehicles selected for comparison. Select up to 4 EVs to compare specs side-by-side.
              </div>
            ) : (
              <div className="min-w-[640px] grid grid-cols-5 gap-4">
                {/* Metric Label Column */}
                <div className="col-span-1 space-y-6 text-xs font-bold text-slate-400 uppercase tracking-wider pt-24 border-r border-slate-100 pr-3">
                  <div>Ex-Showroom Price</div>
                  <div>Effective Post-Subsidy</div>
                  <div>Delhi Subsidy Benefit</div>
                  <div>Real World Range</div>
                  <div>Battery Capacity</div>
                  <div>Charging Time</div>
                  <div>Running Cost / km</div>
                  <div>Seating Capacity</div>
                  <div>Top Speed</div>
                  <div>Empanelled Status</div>
                </div>

                {/* Vehicle Columns */}
                {vehicles.map((v) => (
                  <div key={v.id} className="col-span-1 space-y-6 text-xs text-slate-800 relative bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveVehicle(v.id)}
                      className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Header Spec */}
                    <div className="h-20 space-y-1">
                      <div className="text-[10px] font-bold uppercase text-emerald-600">{v.make}</div>
                      <h4 className="text-base font-extrabold text-slate-900 leading-snug">{v.model}</h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate">{v.variant}</p>
                    </div>

                    <div className="font-extrabold text-slate-900 text-sm">{formatLakh(v.exShowroomPrice)}</div>

                    <div className="font-black text-emerald-700 text-base">{formatLakh(v.effectivePrice)}</div>

                    <div className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-[11px] w-fit">
                      -{formatINR(v.subsidyAmount + v.scrappageBonus)}
                    </div>

                    <div className="font-bold text-slate-900">{v.rangeKm} km</div>

                    <div className="font-bold text-slate-900">{v.batteryCapacityKwh} kWh</div>

                    <div className="font-medium text-slate-700">{v.chargingTimeHours} hrs AC</div>

                    <div className="font-bold text-slate-900">₹{v.runningCostPerKm} / km</div>

                    <div className="font-medium text-slate-700">{v.category === '2W' ? '2 (Scooter)' : v.bodyType?.includes('MPV') ? '7-Seater MPV' : '5-Seater SUV'}</div>

                    <div className="font-bold text-slate-900">{v.topSpeedKmvh} km/h</div>

                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Empanelled List Verified
                      </span>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/dealers?vehicle=${v.id}`}
                        onClick={onClose}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>Connect Dealer</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-4 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close Comparison
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
