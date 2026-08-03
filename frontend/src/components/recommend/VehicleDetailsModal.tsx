'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Zap, ShieldCheck, ArrowRight, BatteryCharging, Gauge, Users, Sparkles, Scale, Info, Check, Image as ImageIcon, Star } from 'lucide-react';
import { EmpanelledVehicle } from '@/types';
import { formatLakh, formatINR } from '@/lib/utils';
import Link from 'next/link';

interface VehicleDetailsModalProps {
  vehicle: EmpanelledVehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onCompare?: (vehicle: EmpanelledVehicle) => void;
  isCompared?: boolean;
}

const MOCK_VARIANTS = [
  {
    name: 'Creative',
    price: '₹13.99 Lakh',
    battery: '30 kWh',
    range: '312 km',
    power: '127 bhp',
    charging: '3.3 kW AC / 50 kW DC',
    features: ['10.25-inch Touchscreen', 'Single Pane Sunroof', 'LED DRLs', 'Dual Airbags'],
  },
  {
    name: 'Accomplished',
    price: '₹15.49 Lakh',
    battery: '40.5 kWh',
    range: '425 km',
    power: '143 bhp',
    charging: '7.2 kW Fast Charger / 50 kW DC',
    features: ['Ventilated Front Seats', '360 Camera', 'Wireless Charger', '6 Airbags'],
  },
  {
    name: 'Empowered+',
    price: '₹17.49 Lakh',
    battery: '45 kWh',
    range: '489 km',
    power: '165 bhp',
    charging: '7.2 kW Fast Charger / 70 kW DC',
    features: ['Level 2 ADAS', 'Panoramic Sunroof', 'JBL 9-Speaker Audio', 'V2L & V2V Charging'],
  },
];

export function VehicleDetailsModal({
  vehicle,
  isOpen,
  onClose,
  onCompare,
  isCompared = false,
}: VehicleDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'variants' | 'specs' | 'savings'>('overview');
  const [selectedVariant, setSelectedVariant] = useState(MOCK_VARIANTS[0]);

  if (!isOpen || !vehicle) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 sm:p-8 space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto overflow-x-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header & Hero Image */}
          <div className="space-y-4 border-b border-slate-100 pb-6 pr-8 sm:pr-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-black text-emerald-700 tracking-wider uppercase block truncate">
                  {vehicle.make} · {vehicle.category}
                </span>
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight break-words">
                  {vehicle.make} {vehicle.model}
                </h2>
                <p className="text-xs sm:text-sm font-extrabold text-emerald-600">
                  Starting From {formatLakh(vehicle.exShowroomPrice)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onCompare && (
                  <button
                    onClick={() => onCompare(vehicle)}
                    className={`px-3.5 py-2 rounded-full text-xs font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCompared
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isCompared ? 'Compared ✓' : 'Compare'}</span>
                  </button>
                )}
                <Link
                  href={`/dealers?vehicle=${vehicle.id}`}
                  className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Connect Showroom</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Vehicle Hero Image */}
            <div className="relative w-full h-44 sm:h-72 rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={vehicle.imageUrl || '/explore/curvv-ev-desktop.png'}
                alt={vehicle.model}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-slate-950/85 text-emerald-400 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-slate-800 backdrop-blur-md">
                  Claimed Range: {vehicle.rangeKm} km
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-950/85 text-slate-200 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-slate-800 backdrop-blur-md">
                  Battery: {vehicle.batteryCapacityKwh} kWh
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Scrollable on phone to avoid overflow) */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto no-scrollbar whitespace-nowrap max-w-full">
            {[
              { id: 'overview', label: 'Overview & Why Fits' },
              { id: 'variants', label: 'Variant Inspector' },
              { id: 'specs', label: 'Full Specifications' },
              { id: 'savings', label: 'Government Savings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & WHY THIS FITS YOU */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Why This EV Fits You Card */}
              <div className="p-4 sm:p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Why This EV Fits You</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-800 font-medium leading-relaxed break-words">
                  {vehicle.whyThisFits ||
                    'Matches your daily commute distance, features fast charging support, and qualifies for full Delhi EV Policy 2026 incentives.'}
                </p>
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 min-w-0">
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 min-w-0">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400">Ex-Showroom</div>
                  <div className="text-sm sm:text-base font-black text-slate-900 truncate">{formatLakh(vehicle.exShowroomPrice)}</div>
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 min-w-0">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400">Battery</div>
                  <div className="text-sm sm:text-base font-black text-slate-900 truncate">{vehicle.batteryCapacityKwh} kWh</div>
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 min-w-0">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400">DC Fast Charge</div>
                  <div className="text-sm sm:text-base font-black text-slate-900 truncate">{vehicle.chargingTimeHours} Hours</div>
                </div>
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 min-w-0">
                  <div className="text-[10px] font-extrabold uppercase text-slate-400">Running Cost</div>
                  <div className="text-sm sm:text-base font-black text-emerald-600 truncate">₹{vehicle.runningCostPerKm}/km</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VARIANT INSPECTOR */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900">Available Variants & Pricing</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Compare prices, battery options, and feature differences across trim levels.
                </p>
              </div>

              {/* Variant Selection Buttons (Wrapping on phone) */}
              <div className="flex flex-wrap items-center gap-2">
                {MOCK_VARIANTS.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-2 rounded-full text-xs font-black border transition-all cursor-pointer ${
                      selectedVariant.name === v.name
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {v.name} ({v.price})
                  </button>
                ))}
              </div>

              {/* Selected Variant Detail Card */}
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">{selectedVariant.name} Trim</h4>
                    <p className="text-xs sm:text-sm font-extrabold text-emerald-600">{selectedVariant.price}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold w-fit">
                    Range: {selectedVariant.range}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px]">Battery Capacity</span>
                    <span className="font-extrabold text-slate-900">{selectedVariant.battery}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px]">Motor Power</span>
                    <span className="font-extrabold text-slate-900">{selectedVariant.power}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 font-bold block text-[10px]">Charging Support</span>
                    <span className="font-extrabold text-slate-900 break-words">{selectedVariant.charging}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Features</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedVariant.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="break-words">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FULL SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="space-y-4 text-xs font-medium text-slate-700">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 uppercase text-xs">Performance & Battery Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">Top Speed: <span className="font-bold text-slate-900">{vehicle.topSpeedKmvh} km/h</span></div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">Battery: <span className="font-bold text-slate-900">{vehicle.batteryCapacityKwh} kWh Lithium-ion</span></div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">Claimed Range: <span className="font-bold text-slate-900">{vehicle.rangeKm} km (ARAI)</span></div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">Charging Time: <span className="font-bold text-slate-900">{vehicle.chargingTimeHours} hours</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VISUALLY PROMINENT GOVERNMENT SAVINGS */}
          {activeTab === 'savings' && (
            <div className="p-4 sm:p-8 rounded-3xl bg-emerald-50 border-2 border-emerald-500/80 shadow-lg space-y-6 text-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                    <ShieldCheck className="w-4 h-4 fill-white" />
                    <span>Verified Government Incentives</span>
                  </div>
                  <h4 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                    Delhi EV Policy 2026 Savings Breakdown
                  </h4>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-300 shadow-sm text-left sm:text-right shrink-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Total Est. Savings</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700">
                    ₹{(vehicle.subsidyAmount + vehicle.scrappageBonus + 65000).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs font-bold">
                <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 space-y-1">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Eligible Central Incentive</span>
                  <span className="text-sm sm:text-base font-black text-slate-900">PM E-DRIVE Subsidy</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 space-y-1">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Eligible State Incentive</span>
                  <span className="text-sm sm:text-base font-black text-emerald-700">₹{vehicle.subsidyAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 space-y-1">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">100% Road Tax Waiver</span>
                  <span className="text-sm sm:text-base font-black text-emerald-700">100% Waived (~₹45,000)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 space-y-1">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Registration Fee Waiver</span>
                  <span className="text-sm sm:text-base font-black text-emerald-700">100% Free (~₹20,000)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 space-y-1">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Scrappage Bonus</span>
                  <span className="text-sm sm:text-base font-black text-emerald-700">₹{vehicle.scrappageBonus.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 space-y-1">
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Green Registration Pass</span>
                  <span className="text-sm sm:text-base font-black text-slate-900">Immediate Handoff</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
