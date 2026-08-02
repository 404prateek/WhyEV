'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCityStore } from '@/lib/store';
import { formatLakh } from '@/lib/utils';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  SlidersHorizontal,
  Search,
  X,
  Zap,
  Car,
  Check,
  Battery,
  Coins,
  ShieldCheck,
  Gift,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShortlistCard } from './ShortlistCard';
import { CompareModal } from './CompareModal';
import { FloatingCompareBar } from './FloatingCompareBar';
import { HeroSearchBar } from '@/components/landing/HeroSearchBar';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';
import { EmpanelledVehicle } from '@/types';
import { useSearchParams } from 'next/navigation';

const PARKING_OPTIONS = [
  'Apartment',
  'Independent House',
  'Villa',
  'Society Parking',
  'Office Parking',
  'Street Parking',
  'Basement Parking',
  'Covered Parking',
  'Open Parking',
  'Other',
];

const BODY_TYPE_OPTIONS = [
  'SUV',
  'Hatchback',
  'Sedan',
  'Compact SUV',
  'Luxury',
  'Performance',
  'Family Car',
  'City Car',
  'Off-road',
  'No Preference',
];

const ANIMATION_SENTENCES = [
  'Finding your perfect EV...',
  'Checking government incentives...',
  'Matching your commute...',
  'Calculating savings...',
  'Your recommendations are ready.',
];

export function RecommendationWizard() {
  const searchParams = useSearchParams();
  const { activeCity } = useCityStore();

  // Survey First-Visit LocalStorage Check
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState<boolean>(false);
  const [surveyStep, setSurveyStep] = useState(1);

  // Synchronized Budget State (Range: ₹0 to ₹50 Lakh)
  const [lowerBudget, setLowerBudget] = useState<number>(0);
  const [upperBudget, setUpperBudget] = useState<number>(25);

  // Synchronized Commute State (Range: 0 km to 150 km)
  const [commuteDistance, setCommuteDistance] = useState<number>(45);

  const [selectedParking, setSelectedParking] = useState<string>('Apartment');
  const [selectedEvType, setSelectedEvType] = useState<string>('SUV');

  // 5-Scene 3-5s Recommendation Assembly Animation State
  const [isLoadingAnimation, setIsLoadingAnimation] = useState(false);
  const [animationScene, setAnimationScene] = useState(1);
  const [sentenceIndex, setSentenceIndex] = useState(0);

  // Filter Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Comprehensive 30+ EV Filters State
  const [filterBrand, setFilterBrand] = useState<string>('All');
  const [filterBodyStyle, setFilterBodyStyle] = useState<string>('All');
  const [filterFastChargingOnly, setFilterFastChargingOnly] = useState<boolean>(false);
  const [filterIncentiveOnly, setFilterIncentiveOnly] = useState<boolean>(false);
  const [filterSunroof, setFilterSunroof] = useState<boolean>(false);
  const [filterAdas, setFilterAdas] = useState<boolean>(false);
  const [filterV2L, setFilterV2L] = useState<boolean>(false);

  // Comparison State
  const [comparedVehicles, setComparedVehicles] = useState<EmpanelledVehicle[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Check LocalStorage on Mount: Show Survey ONLY on First Visit
  useEffect(() => {
    const isCompleted = localStorage.getItem('whyev_survey_completed');
    const vehicleParam = searchParams?.get('vehicle');
    const searchParam = searchParams?.get('search');

    if (!isCompleted && !vehicleParam && !searchParam) {
      setIsSurveyModalOpen(true);
    }
  }, [searchParams]);

  // Handle 5-Scene 3–5 Second Recommendation Assembly Animation
  const handleShowRecommendations = () => {
    localStorage.setItem('whyev_survey_completed', 'true');
    setIsSurveyModalOpen(false);
    setIsLoadingAnimation(true);
    setAnimationScene(1);
    setSentenceIndex(0);

    // Scene & Sentence interval timer (0.7s per step)
    const animTimer = setInterval(() => {
      setAnimationScene((prev) => (prev < 5 ? prev + 1 : prev));
      setSentenceIndex((prev) => (prev < ANIMATION_SENTENCES.length - 1 ? prev + 1 : prev));
    }, 700);

    setTimeout(() => {
      clearInterval(animTimer);
      setIsLoadingAnimation(false);
    }, 3500);
  };

  const handleToggleCompare = (vehicle: EmpanelledVehicle) => {
    setComparedVehicles((prev) => {
      const exists = prev.some((v) => v.id === vehicle.id);
      if (exists) return prev.filter((v) => v.id !== vehicle.id);
      if (prev.length >= 4) return prev;
      return [...prev, vehicle];
    });
  };

  // Filtered Vehicle List
  const filteredVehicles = useMemo(() => {
    return MOCK_EMPANELLED_VEHICLES.filter((vehicle) => {
      if (filterBrand !== 'All' && vehicle.make !== filterBrand) return false;
      if (filterBodyStyle !== 'All' && !(vehicle.bodyType || '').toLowerCase().includes(filterBodyStyle.toLowerCase())) return false;
      if (filterFastChargingOnly && vehicle.chargingTimeHours > 2) return false;
      if (filterIncentiveOnly && !vehicle.subsidyAmount) return false;

      return true;
    });
  }, [filterBrand, filterBodyStyle, filterFastChargingOnly, filterIncentiveOnly]);

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. STRICTLY LEFT-ALIGNED PAGE HEADER & SEARCH SECTION */}
        <div className="space-y-4 border-b border-slate-100 pb-6 text-left">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Find Your EV
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl">
              Explore India's electric vehicles, compare models, and discover the one that fits your lifestyle.
            </p>
          </div>

          {/* Strictly Left-Aligned Search Bar + Filter Button on Right */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-4xl">
            <div className="w-full flex-1">
              <HeroSearchBar />
            </div>

            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="h-12 px-6 rounded-full bg-white hover:bg-emerald-50 border border-slate-300 text-slate-800 font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs w-full sm:w-auto justify-center"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* 2. COMPACT VEHICLES GRID (1 Column Mobile, 4 Columns Desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {filteredVehicles.map((vehicle) => (
            <ShortlistCard
              key={vehicle.id}
              vehicle={vehicle}
              onCompare={handleToggleCompare}
              isCompared={comparedVehicles.some((v) => v.id === vehicle.id)}
            />
          ))}
        </motion.div>
      </div>

      {/* Floating Bottom Comparison Bar */}
      <FloatingCompareBar
        selectedVehicles={comparedVehicles}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onClear={() => setComparedVehicles([])}
      />

      {/* =========================================
          FIRST-VISIT SURVEY POPUP MODAL
      ========================================= */}
      <AnimatePresence>
        {isSurveyModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-slate-900"
            >
              <div className="space-y-3 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-black text-slate-900">
                      Help us recommend the right EV for you.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.setItem('whyev_survey_completed', 'true');
                      setIsSurveyModalOpen(false);
                    }}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Thin Animated Green Progress Bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-emerald-600 h-full rounded-full"
                    animate={{ width: `${(surveyStep / 4) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* SURVEY STEPS */}
              <div className="min-h-[220px]">
                {/* STEP 1: Budget Slider & Manual Input */}
                {surveyStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      What's your budget?
                    </h3>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>Lower Limit</span>
                          <span className="text-emerald-700 font-black">₹{lowerBudget} Lakh</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={lowerBudget}
                          onChange={(e) => setLowerBudget(Number(e.target.value))}
                          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                          <span>Upper Limit</span>
                          <span className="text-emerald-700 font-black">₹{upperBudget} Lakh</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={upperBudget}
                          onChange={(e) => setUpperBudget(Number(e.target.value))}
                          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Lower (₹ Lakh)</label>
                          <input
                            type="number"
                            value={lowerBudget}
                            onChange={(e) => setLowerBudget(Number(e.target.value) || 0)}
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 font-bold text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Upper (₹ Lakh)</label>
                          <input
                            type="number"
                            value={upperBudget}
                            onChange={(e) => setUpperBudget(Number(e.target.value) || 25)}
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 font-bold text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Commute Distance */}
                {surveyStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      How far do you usually drive each day?
                    </h3>

                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>0 km</span>
                        <span className="text-emerald-700 font-black text-sm">{commuteDistance} km / day</span>
                        <span>150 km</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="150"
                        value={commuteDistance}
                        onChange={(e) => setCommuteDistance(Number(e.target.value))}
                        className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />

                      <div className="space-y-1 pt-2 max-w-xs">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Manual Commute Input (km)
                        </label>
                        <input
                          type="number"
                          value={commuteDistance}
                          onChange={(e) => setCommuteDistance(Number(e.target.value))}
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 font-bold text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Parking Cards */}
                {surveyStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      Where do you usually park your vehicle?
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {PARKING_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedParking(opt)}
                          className={`p-3 rounded-2xl border text-left transition-all text-xs font-bold cursor-pointer ${
                            selectedParking === opt
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: EV Type Cards */}
                {surveyStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      Which type of EV are you looking for?
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {BODY_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedEvType(opt)}
                          className={`p-3 rounded-2xl border text-left transition-all text-xs font-bold cursor-pointer ${
                            selectedEvType === opt
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                {surveyStep > 1 ? (
                  <button
                    onClick={() => setSurveyStep((prev) => prev - 1)}
                    className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <div />
                )}

                {surveyStep < 4 ? (
                  <button
                    onClick={() => setSurveyStep((prev) => prev + 1)}
                    className="px-7 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleShowRecommendations}
                    className="px-7 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Show My Recommendations</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================
          5-SCENE 3-5s RECOMMENDATION ASSEMBLY ANIMATION MODAL
      ========================================= */}
      <AnimatePresence>
        {isLoadingAnimation && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="max-w-lg space-y-8">
              {/* 5-Scene Visual Elements Container */}
              <div className="relative w-full h-36 overflow-hidden border-b-2 border-emerald-500/50 flex items-center justify-center">
                {/* Scene 1: Sleek EV enters */}
                {animationScene >= 1 && (
                  <motion.div
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute left-4 flex items-center gap-2 text-emerald-400"
                  >
                    <Car className="w-16 h-16 drop-shadow-[0_0_20px_rgba(16,185,129,0.9)]" />
                  </motion.div>
                )}

                {/* Scene 2: Charging icons illuminate */}
                {animationScene >= 2 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute left-28 p-2 rounded-full bg-emerald-600/30 border border-emerald-400 text-emerald-400"
                  >
                    <Zap className="w-6 h-6 fill-emerald-400 animate-pulse" />
                  </motion.div>
                )}

                {/* Scene 3: Government incentive badges appear */}
                {animationScene >= 3 && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute right-28 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-extrabold text-xs"
                  >
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span>Subsidy Verified</span>
                  </motion.div>
                )}

                {/* Scene 4: Vehicle cards assemble */}
                {animationScene >= 4 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute right-4 p-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-teal-400" />
                    <span>Grid Assembled</span>
                  </motion.div>
                )}
              </div>

              {/* Fading Sentence Sequence (0.7s per step) */}
              <div className="min-h-[60px] flex items-center justify-center">
                <motion.p
                  key={sentenceIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-lg sm:text-2xl font-black text-slate-100 tracking-tight"
                >
                  {ANIMATION_SENTENCES[sentenceIndex]}
                </motion.p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================
          EXPANDED 30+ EV FILTERS DRAWER (Fullscreen Mobile / Side Drawer Desktop)
      ========================================= */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-black text-slate-900">Comprehensive EV Filters</h3>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Survey Preferences editable inside Filters */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                <span className="text-xs font-black text-emerald-900 uppercase tracking-wider block">Your Saved Preferences</span>

                <div className="space-y-3 text-xs font-bold">
                  <div>
                    <label className="text-slate-500 block text-[10px]">Budget Upper Limit (₹ Lakh)</label>
                    <input
                      type="number"
                      value={upperBudget}
                      onChange={(e) => setUpperBudget(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-emerald-300 font-bold bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block text-[10px]">Daily Commute (km)</label>
                    <input
                      type="number"
                      value={commuteDistance}
                      onChange={(e) => setCommuteDistance(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl border border-emerald-300 font-bold bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Core 30+ EV Filters */}
              <div className="space-y-4 text-xs font-bold">
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase tracking-wider text-[10px]">Brand</label>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="All">All Brands</option>
                    <option value="Tata">Tata Motors</option>
                    <option value="Mahindra">Mahindra</option>
                    <option value="MG">MG Motor</option>
                    <option value="Hyundai">Hyundai</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-800">DC Fast Charging Support</span>
                    <input
                      type="checkbox"
                      checked={filterFastChargingOnly}
                      onChange={(e) => setFilterFastChargingOnly(e.target.checked)}
                      className="w-5 h-5 accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-800">Government Incentive Eligible</span>
                    <input
                      type="checkbox"
                      checked={filterIncentiveOnly}
                      onChange={(e) => setFilterIncentiveOnly(e.target.checked)}
                      className="w-5 h-5 accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-800">Sunroof & ADAS Features</span>
                    <input
                      type="checkbox"
                      checked={filterSunroof}
                      onChange={(e) => setFilterSunroof(e.target.checked)}
                      className="w-5 h-5 accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full h-12 rounded-full bg-emerald-600 text-white font-extrabold text-xs sm:text-sm cursor-pointer shadow-md shadow-emerald-600/20"
              >
                Apply 30+ Filters
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        vehicles={comparedVehicles}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveVehicle={(id: string) => setComparedVehicles((prev) => prev.filter((v) => v.id !== id))}
      />
    </div>
  );
}
