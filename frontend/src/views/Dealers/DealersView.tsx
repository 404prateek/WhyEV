'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Locate,
  Filter,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { MOCK_DEALERS } from '@/lib/mock-data';
import { Dealer } from '@/types';
import { DealerCard } from '@/components/dealers/DealerCard';
import { DealerDetailsModal } from '@/components/dealers/DealerDetailsModal';
import { TestDriveModal } from '@/components/dealers/TestDriveModal';

export function DealersView() {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Filter Criteria
  const [filterCity, setFilterCity] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterCategory, setFilterCategory] = useState<'All' | '4W' | '2W'>('All');
  const [filterMinRating, setFilterMinRating] = useState<number>(0);
  const [filterTestDriveOnly, setFilterTestDriveOnly] = useState(false);
  const [filterHomeTestDrive, setFilterHomeTestDrive] = useState(false);
  const [filterIncentiveSupport, setFilterIncentiveSupport] = useState(false);
  const [filterFinancing, setFilterFinancing] = useState(false);
  const [filterBatteryInspection, setFilterBatteryInspection] = useState(false);

  // Active Modals State
  const [selectedDealerForTestDrive, setSelectedDealerForTestDrive] = useState<Dealer | null>(null);
  const [selectedDealerDetails, setSelectedDealerDetails] = useState<Dealer | null>(null);

  // Filtered Dealer List Logic
  const filteredDealers = useMemo(() => {
    return MOCK_DEALERS.filter((dealer) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = dealer.name.toLowerCase().includes(q);
        const matchesCity = dealer.city.toLowerCase().includes(q);
        const matchesLocality = dealer.locality.toLowerCase().includes(q);
        const matchesBrand = dealer.empanelledModels.some((b) => b.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesLocality && !matchesBrand) return false;
      }

      // City filter
      if (filterCity !== 'All' && dealer.city.toLowerCase() !== filterCity.toLowerCase()) {
        return false;
      }

      // Brand filter
      if (filterBrand !== 'All' && !dealer.empanelledModels.some((b) => b.toLowerCase() === filterBrand.toLowerCase())) {
        return false;
      }

      // Minimum rating filter
      if (filterMinRating > 0 && dealer.rating < filterMinRating) {
        return false;
      }

      return true;
    });
  }, [
    searchQuery,
    filterCity,
    filterBrand,
    filterCategory,
    filterMinRating,
    filterTestDriveOnly,
    filterHomeTestDrive,
    filterIncentiveSupport,
    filterFinancing,
    filterBatteryInspection,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterCity('All');
    setFilterBrand('All');
    setFilterCategory('All');
    setFilterMinRating(0);
    setFilterTestDriveOnly(false);
    setFilterHomeTestDrive(false);
    setFilterIncentiveSupport(false);
    setFilterFinancing(false);
    setFilterBatteryInspection(false);
  };

  const CITIES = ['All', 'New Delhi', 'Gurugram', 'Noida', 'Mumbai', 'Bengaluru', 'Hyderabad'];
  const BRANDS = ['All', 'Tata', 'MG', 'Mahindra', 'BYD', 'Hyundai', 'BMW', 'Kia'];

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* =========================================================
            1. HERO SECTION
        ========================================================= */}
        <div className="space-y-4 border-b border-slate-100 pb-6 text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Connect with Verified EV Dealers
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-3xl">
            Browse verified dealerships, compare available brands, and choose when you're ready to share your interest.
          </p>
        </div>

        {/* =========================================================
            2. TRUST BANNER (MOST IMPORTANT SECTION)
        ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-emerald-50/90 border border-emerald-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden"
        >
          {/* Subtle Shield Background Vector */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Opt-In Privacy Model</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-950">
              Your information stays private until you choose to connect.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-800 font-medium leading-relaxed">
              WhyEV never shares your contact details automatically. Your preferences are only shared with a dealership after you explicitly request a quote, test drive, or dealer callback.
            </p>
          </div>

          {/* Three Trust Icons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 relative z-10 border-t border-emerald-200/60">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-emerald-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-emerald-950">Your data stays private</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-emerald-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-emerald-950">Verified dealerships only</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 border border-emerald-200/80 shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-extrabold text-emerald-950">You choose when to connect</span>
            </div>
          </div>
        </motion.div>

        {/* =========================================================
            3. SEARCH & FILTER BAR
        ========================================================= */}
        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-4xl">
          <div className="relative w-full flex-1">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by dealer, brand, locality or city..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium transition-all shadow-2xs"
            />
          </div>

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="w-full sm:w-auto h-11 px-6 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>Filters</span>
          </button>
        </div>

        {/* Active Filter Chips Bar */}
        {(filterCity !== 'All' || filterBrand !== 'All' || filterMinRating > 0) && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-bold">Active Filters:</span>
            {filterCity !== 'All' && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                City: {filterCity}
                <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setFilterCity('All')} />
              </span>
            )}
            {filterBrand !== 'All' && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                Brand: {filterBrand}
                <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setFilterBrand('All')} />
              </span>
            )}
            {filterMinRating > 0 && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                Rating: {filterMinRating}+ ★
                <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setFilterMinRating(0)} />
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer ml-2"
            >
              Reset All
            </button>
          </div>
        )}

        {/* =========================================================
            4. DEALER LISTING GRID (3-4 Desktop, 2 Tablet, 1 Mobile)
        ========================================================= */}
        {filteredDealers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredDealers.map((dealer) => (
              <DealerCard
                key={dealer.id}
                dealer={dealer}
                onBookTestDrive={(d) => setSelectedDealerForTestDrive(d)}
                onViewDealer={(d) => setSelectedDealerDetails(d)}
              />
            ))}
          </div>
        ) : (
          /* EMPTY STATE (IF NO DEALERS MATCH FILTERS) */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-xl"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
              <MapPin className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">No dealers found nearby.</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Try expanding your search radius or changing your filters.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Reset Filters
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 font-extrabold text-xs hover:bg-emerald-100 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Locate className="w-4 h-4 text-emerald-600" />
                <span>Locate Me</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* =========================================================
          5. FILTER DRAWER (Blurs background & opens panel)
      ========================================================= */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto text-slate-900"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-black text-slate-900">Dealer Filters</h3>
                  </div>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    aria-label="Close Filter Drawer"
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4 shrink-0 text-slate-700" />
                  </button>
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">City / Region</label>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setFilterCity(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                          filterCity === c
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Vehicle Brand</label>
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

                {/* Minimum Rating */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Dealer Rating</label>
                  <div className="flex gap-2">
                    {[0, 4.0, 4.5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setFilterMinRating(r)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                          filterMinRating === r
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {r === 0 ? 'All Ratings' : `${r}+ ★`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Switches */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-slate-800">Authorized Dealers Only</span>
                    <input
                      type="checkbox"
                      checked={filterTestDriveOnly}
                      onChange={(e) => setFilterTestDriveOnly(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-slate-800">Home Test Drive Available</span>
                    <input
                      type="checkbox"
                      checked={filterHomeTestDrive}
                      onChange={(e) => setFilterHomeTestDrive(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-bold text-slate-800">Govt Incentive Assistance</span>
                    <input
                      type="checkbox"
                      checked={filterIncentiveSupport}
                      onChange={(e) => setFilterIncentiveSupport(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Drawer Actions */}
              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={handleResetFilters}
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

      {/* =========================================================
          6. MODALS
      ========================================================= */}
      {/* Test Drive Booking Modal */}
      <TestDriveModal
        dealer={selectedDealerForTestDrive}
        onClose={() => setSelectedDealerForTestDrive(null)}
      />

      {/* Dealer Details Profile Drawer */}
      <DealerDetailsModal
        dealer={selectedDealerDetails}
        isOpen={!!selectedDealerDetails}
        onClose={() => setSelectedDealerDetails(null)}
        onBookTestDrive={(d) => {
          setSelectedDealerDetails(null);
          setSelectedDealerForTestDrive(d);
        }}
      />
    </div>
  );
}
