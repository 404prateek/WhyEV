'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, ArrowRight } from 'lucide-react';
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

  const rows = [
    {
      id: 'exShowroom',
      label: 'Ex-Showroom Price',
      getValue: (v: EmpanelledVehicle) => (
        <span className="font-extrabold text-slate-900 text-[11px] sm:text-xs">{formatLakh(v.exShowroomPrice)}</span>
      ),
    },
    {
      id: 'effectivePrice',
      label: 'Effective Price',
      getValue: (v: EmpanelledVehicle) => (
        <span className="font-black text-emerald-700 text-xs sm:text-sm">{formatLakh(v.effectivePrice)}</span>
      ),
    },
    {
      id: 'subsidy',
      label: 'Subsidy Benefit',
      getValue: (v: EmpanelledVehicle) => (
        <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] sm:text-[11px]">
          -{formatINR(v.subsidyAmount + v.scrappageBonus)}
        </span>
      ),
    },
    {
      id: 'range',
      label: 'Real World Range',
      getValue: (v: EmpanelledVehicle) => (
        <span className="font-bold text-slate-900 text-[11px] sm:text-xs">{v.rangeKm} km</span>
      ),
    },
    {
      id: 'battery',
      label: 'Battery Pack',
      getValue: (v: EmpanelledVehicle) => (
        <span className="font-bold text-slate-900 text-[11px] sm:text-xs">{v.batteryCapacityKwh} kWh</span>
      ),
    },
    {
      id: 'charging',
      label: 'Charging Time',
      getValue: (v: EmpanelledVehicle) => (
        <span className="font-medium text-slate-700 text-[10px] sm:text-xs">{v.chargingTimeHours} hrs AC</span>
      ),
    },
    {
      id: 'runningCost',
      label: 'Running Cost',
      getValue: (v: EmpanelledVehicle) => (
        <span className="font-bold text-slate-900 text-[11px] sm:text-xs">₹{v.runningCostPerKm}/km</span>
      ),
    },
    {
      id: 'topSpeed',
      label: 'Top Speed',
      getValue: (v: EmpanelledVehicle) => (
        <span className="font-bold text-slate-900 text-[11px] sm:text-xs">{v.topSpeedKmvh} km/h</span>
      ),
    },
    {
      id: 'cta',
      label: 'Dealer Action',
      getValue: (v: EmpanelledVehicle) => (
        <Link
          href={`/vehicle/${v.id}`}
          onClick={onClose}
          className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] sm:text-[11px] flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shadow-2xs"
        >
          <span>View Details</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="w-full max-w-6xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-slate-900"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Side-by-Side Comparison</span>
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                Comparing {vehicles.length} EV Models
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Matrix Comparison Table */}
          <div className="overflow-auto py-3 flex-1 no-scrollbar">
            {vehicles.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs sm:text-sm">
                No vehicles selected for comparison.
              </div>
            ) : (
              <div className="min-w-max space-y-2">
                {/* Header Row: Vehicle Cards */}
                <div className="flex items-stretch gap-2 sm:gap-3 border-b border-slate-100 pb-3">
                  {/* Metric Label Header Spacer */}
                  <div className="w-[100px] sm:w-[140px] shrink-0 sticky left-0 z-20 bg-white p-2 flex items-end">
                    <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider">
                      Specifications
                    </span>
                  </div>

                  {/* Vehicle Header Cards */}
                  {vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="w-[130px] sm:w-[180px] shrink-0 bg-slate-50 border border-slate-200/80 p-2.5 rounded-2xl relative flex flex-col justify-between"
                    >
                      <button
                        onClick={() => onRemoveVehicle(v.id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove vehicle"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-0.5 pr-4">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-700 block">
                          {v.make}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate leading-snug">
                          {v.model}
                        </h4>
                      </div>

                      <div className="mt-2 h-14 sm:h-18 w-full rounded-xl bg-slate-950 overflow-hidden">
                        <img
                          src={v.imageUrl || '/hero-ev-car.png'}
                          alt={v.model}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Matrix Rows */}
                {rows.map((r, rIdx) => (
                  <div
                    key={r.id}
                    className={`flex items-center gap-2 sm:gap-3 py-2 px-1 rounded-xl transition-colors ${
                      rIdx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    {/* Sticky Metric Label */}
                    <div className="w-[100px] sm:w-[140px] shrink-0 sticky left-0 z-10 bg-inherit text-[10px] sm:text-xs font-extrabold text-slate-500 pr-2 truncate">
                      {r.label}
                    </div>

                    {/* Metric Value per Vehicle */}
                    {vehicles.map((v) => (
                      <div
                        key={v.id}
                        className="w-[130px] sm:w-[180px] shrink-0 text-center flex items-center justify-center"
                      >
                        {r.getValue(v)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="border-t border-slate-100 pt-3 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
