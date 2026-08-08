'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, ShieldCheck, Battery, Calendar, Scale, Eye, CheckCircle2, Award, UserCheck, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VehicleService } from '@/services/vehicleService';
import { EmpanelledVehicle } from '@/types';
import { ShortlistCard } from '@/components/recommend/ShortlistCard';
import { FloatingCompareBar } from '@/components/recommend/FloatingCompareBar';
import { CompareModal } from '@/components/recommend/CompareModal';

export function MarketplaceView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [comparedVehicles, setComparedVehicles] = useState<EmpanelledVehicle[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Live Vehicle State
  const [vehicles, setVehicles] = useState<EmpanelledVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [filterBrand, setFilterBrand] = useState<string>('All');
  const [filterBodyStyle, setFilterBodyStyle] = useState<string>('All');

  useEffect(() => {
    setLoading(true);
    // Fetch live vehicle catalogue from backend via VehicleService
    VehicleService.getAllVehicles()
      .then((data) => {
        setVehicles(data);
      })
      .catch(() => {
        // Handled internally by VehicleService fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleCompare = (vehicle: EmpanelledVehicle) => {
    setComparedVehicles((prev) => {
      const exists = prev.some((v) => v.id === vehicle.id);
      if (exists) return prev.filter((v) => v.id !== vehicle.id);
      if (prev.length >= 4) return prev;
      return [...prev, vehicle];
    });
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterBrand !== 'All' && v.make.toLowerCase() !== filterBrand.toLowerCase()) return false;
      if (filterBodyStyle !== 'All' && !(v.bodyType || '').toLowerCase().includes(filterBodyStyle.toLowerCase())) return false;
      return true;
    });
  }, [vehicles, searchQuery, filterBrand, filterBodyStyle]);

  const BRANDS = ['All', 'Tata Motors', 'Mahindra', 'MG Motor', 'Hyundai', 'Ather Energy', 'TVS', 'Hero Vida', 'Ola Electric', 'BYD', 'VinFast'];
  const BODY_STYLES = ['All', 'SUV', 'Hatchback', 'Sedan', 'Scooter'];

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. DEDICATED HEADER & SEARCH SECTION */}
        <div className="space-y-4 border-b border-slate-100 pb-6 text-left">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              EV Marketplace
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl">
              Explore India's electric vehicles with verified battery specifications, state subsidies, and side-by-side comparison.
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
                placeholder="Search Nexon EV, Windsor, BE 6, Creta EV, Punch EV, Ather 450X..."
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
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Pills Quick Selection */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar">
            {BRANDS.slice(0, 8).map((brand) => (
              <button
                key={brand}
                onClick={() => setFilterBrand(brand)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  filterBrand === brand
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading live vehicle catalog from database...</p>
          </div>
        )}

        {/* 2. UNIFIED VEHICLE GRID */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredVehicles.map((vehicle) => {
              const isCompared = comparedVehicles.some((v) => v.id === vehicle.id);

              return (
                <ShortlistCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onCompare={handleToggleCompare}
                  isCompared={isCompared}
                />
              );
            })}
          </div>
        )}

        {/* Floating Compare Bar & Modal */}
        <FloatingCompareBar
          selectedVehicles={comparedVehicles}
          onOpenCompare={() => setIsCompareModalOpen(true)}
          onClear={() => setComparedVehicles([])}
        />

        <CompareModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          vehicles={comparedVehicles}
          onRemoveVehicle={(id) => setComparedVehicles((prev) => prev.filter((v) => v.id !== id))}
        />
      </div>
    </div>
  );
}

export default MarketplaceView;
