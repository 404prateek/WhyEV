'use client';

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ShieldCheck, Battery, Calendar, Scale, Eye, CheckCircle2, Award, UserCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';
import { EmpanelledVehicle } from '@/types';
import { formatLakh } from '@/lib/utils';
import { VehicleDetailsModal } from '@/components/recommend/VehicleDetailsModal';
import { FloatingCompareBar } from '@/components/recommend/FloatingCompareBar';
import { CompareModal } from '@/components/recommend/CompareModal';

export function MarketplaceView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<EmpanelledVehicle | null>(null);
  const [comparedVehicles, setComparedVehicles] = useState<EmpanelledVehicle[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Filters State
  const [minBatteryHealth, setMinBatteryHealth] = useState(85);
  const [maxKmDriven, setMaxKmDriven] = useState(80000);
  const [certifiedOnly, setCertifiedOnly] = useState(true);

  const handleToggleCompare = (vehicle: EmpanelledVehicle) => {
    setComparedVehicles((prev) => {
      const exists = prev.some((v) => v.id === vehicle.id);
      if (exists) return prev.filter((v) => v.id !== vehicle.id);
      if (prev.length >= 4) return prev;
      return [...prev, vehicle];
    });
  };

  const filteredVehicles = useMemo(() => {
    return MOCK_EMPANELLED_VEHICLES.filter((v) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [searchQuery]);

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. DEDICATED HEADER & SEARCH SECTION */}
        <div className="space-y-4 border-b border-slate-100 pb-6 text-left">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Certified Used EVs
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl">
              Explore pre-inspected electric vehicles with 150-point diagnostics, certified cell health & battery warranties.
            </p>
          </div>

          {/* Search Bar & Filter Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-4xl">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pre-owned Nexon EV, ZS EV, Kona, or Tiago EV..."
                className="w-full h-12 pl-12 pr-10 rounded-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-3.5 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="h-12 px-6 rounded-full bg-white hover:bg-emerald-50 border border-slate-300 text-slate-800 font-extrabold text-xs flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs w-full sm:w-auto justify-center"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Used Filters</span>
            </button>
          </div>
        </div>

        {/* 2. CERTIFIED USED VEHICLE GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredVehicles.map((vehicle) => {
            const isCompared = comparedVehicles.some((v) => v.id === vehicle.id);
            const mockBatteryHealth = 92;
            const mockInspectionScore = 96;

            return (
              <div
                key={vehicle.id}
                className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Image & Certification Badge */}
                <div className="relative w-full h-36 sm:h-44 bg-slate-950 overflow-hidden">
                  <img
                    src={vehicle.imageUrl || '/explore/curvv-ev-desktop.png'}
                    alt={vehicle.model}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <ShieldCheck className="w-3 h-3 fill-white" />
                      <span>Certified Used</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold uppercase text-slate-400">{vehicle.make} · 2024 Model</div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="text-xs font-black text-emerald-600">
                      ₹{((vehicle.exShowroomPrice * 0.7) / 100000).toFixed(2)} Lakh <span className="text-[10px] text-slate-400 font-bold line-through">₹{formatLakh(vehicle.exShowroomPrice)}</span>
                    </div>
                  </div>

                  {/* Certified Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold border-t border-b border-slate-100 py-2">
                    <div className="flex items-center gap-1 text-slate-700">
                      <Battery className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{mockBatteryHealth}% Cell Health</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-700">
                      <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{mockInspectionScore}/100 Score</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-700">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1st Owner</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>3 yr Warranty</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleToggleCompare(vehicle)}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      isCompared
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{isCompared ? '✓ Selected' : 'Compare'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Comparison Bar */}
      <FloatingCompareBar
        selectedVehicles={comparedVehicles}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onClear={() => setComparedVehicles([])}
      />

      {/* Vehicle Details Modal */}
      <VehicleDetailsModal
        vehicle={selectedVehicle}
        isOpen={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
      />

      {/* Compare Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        vehicles={comparedVehicles}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveVehicle={(id) => setComparedVehicles((prev) => prev.filter((v) => v.id !== id))}
      />
    </div>
  );
}
