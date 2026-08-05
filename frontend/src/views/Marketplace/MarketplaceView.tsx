'use client';

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ShieldCheck, Battery, Calendar, Scale, Eye, CheckCircle2, Award, UserCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';
import { EmpanelledVehicle } from '@/types';
import { ShortlistCard } from '@/components/recommend/ShortlistCard';
import { FloatingCompareBar } from '@/components/recommend/FloatingCompareBar';
import { CompareModal } from '@/components/recommend/CompareModal';

export function MarketplaceView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [comparedVehicles, setComparedVehicles] = useState<EmpanelledVehicle[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Filters State
  const [filterBrand, setFilterBrand] = useState<string>('All');
  const [filterBodyStyle, setFilterBodyStyle] = useState<string>('All');

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
      if (filterBrand !== 'All' && v.make !== filterBrand) return false;
      if (filterBodyStyle !== 'All' && !(v.bodyType || '').toLowerCase().includes(filterBodyStyle.toLowerCase())) return false;
      return true;
    });
  }, [searchQuery, filterBrand, filterBodyStyle]);

  const BRANDS = ['All', 'Tata', 'MG', 'Mahindra', 'Hyundai', 'BYD', 'BMW', 'Kia'];
  const BODY_STYLES = ['All', 'SUV', 'Hatchback', 'Sedan'];

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
                placeholder="Search Nexon EV, Windsor, BE 6, Creta EV, Punch EV..."
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
        </div>

        {/* 2. UNIFIED VEHICLE GRID (Using exact same ShortlistCard component as Recommendation Results) */}
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
      </div>

      {/* Floating Comparison Bar */}
      <FloatingCompareBar
        selectedVehicles={comparedVehicles}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onClear={() => setComparedVehicles([])}
      />

      {/* Compare Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        vehicles={comparedVehicles}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveVehicle={(id) => setComparedVehicles((prev) => prev.filter((v) => v.id !== id))}
      />

      {/* Filter Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-black text-slate-900">Filter Catalogue</h3>
                  </div>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Brand</label>
                  <div className="flex flex-wrap gap-2">
                    {BRANDS.map((b) => (
                      <button
                        key={b}
                        onClick={() => setFilterBrand(b)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                          filterBrand === b
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body Style Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Body Format</label>
                  <div className="flex flex-wrap gap-2">
                    {BODY_STYLES.map((bs) => (
                      <button
                        key={bs}
                        onClick={() => setFilterBodyStyle(bs)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                          filterBodyStyle === bs
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {bs}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Actions */}
              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => {
                    setFilterBrand('All');
                    setFilterBodyStyle('All');
                    setSearchQuery('');
                  }}
                  className="w-1/3 py-3 rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-2/3 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
