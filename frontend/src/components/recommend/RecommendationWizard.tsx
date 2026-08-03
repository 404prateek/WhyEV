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
          CREATIVE RECOMMENDATION LOADING ANIMATION MODAL
      ========================================= */}
      <AnimatePresence>
        {isLoadingAnimation && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="max-w-lg space-y-8 w-full">
              {/* CREATIVE TEXT ABOVE THE ANIMATED CAR */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Please Wait · WhyEV Matchmaking Engine</span>
                </div>

                <div className="min-h-[64px] flex items-center justify-center">
                  <motion.h2
                    key={sentenceIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28 }}
                    className="text-xl sm:text-3xl font-black text-slate-100 tracking-tight"
                  >
                    {ANIMATION_SENTENCES[sentenceIndex]}
                  </motion.h2>
                </div>
              </div>

              {/* SLEEK EV DRIVING SMOOTHLY FROM LEFT TO RIGHT */}
              <div className="relative w-full h-28 overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center px-2">
                {/* Glowing Road Line */}
                <div className="absolute inset-x-0 bottom-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />
                <div className="absolute inset-x-0 bottom-4 h-0.5 border-b-2 border-dashed border-emerald-400/60" />

                {/* Car moving from -20% left to 100% right */}
                <motion.div
                  initial={{ x: '-20%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 3.2, ease: 'linear', repeat: Infinity }}
                  className="flex items-center gap-2 text-emerald-400 filter drop-shadow-[0_0_16px_rgba(16,185,129,0.9)]"
                >
                  <div className="relative flex items-center">
                    <Car className="w-14 h-14" />
                    <Zap className="w-5 h-5 text-emerald-300 fill-emerald-300 animate-pulse absolute -right-2 top-2" />
                  </div>
                  <div className="flex items-center gap-1 opacity-75">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================
          EXPANDED EV FILTERS & PREFERENCES DRAWER
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
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-black text-slate-900">EV Filters & Preferences</h3>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SECTION 1: BUDGET SLIDER & MANUAL INPUT */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Budget</h4>
                  <p className="text-[11px] text-slate-500 font-medium">What is your target budget for an EV?</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">₹0 Lakh</span>
                    <span className="text-emerald-700 font-black text-sm">₹{upperBudget} Lakh</span>
                    <span className="text-slate-500">₹50 Lakh</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={upperBudget}
                    onChange={(e) => setUpperBudget(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Manual Budget Entry (₹ Lakh):</label>
                    <input
                      type="number"
                      value={upperBudget}
                      onChange={(e) => setUpperBudget(Number(e.target.value) || 0)}
                      className="w-24 h-9 px-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-extrabold text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: COMMUTE DISTANCE SLIDER & MANUAL INPUT */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Daily Commute Distance</h4>
                  <p className="text-[11px] text-slate-500 font-medium">How far do you usually drive on an average day?</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">0 km</span>
                    <span className="text-emerald-700 font-black text-sm">{commuteDistance} km / day</span>
                    <span className="text-slate-500">150 km</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={commuteDistance}
                    onChange={(e) => setCommuteDistance(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Manual Commute Entry (km):</label>
                    <input
                      type="number"
                      value={commuteDistance}
                      onChange={(e) => setCommuteDistance(Number(e.target.value) || 0)}
                      className="w-24 h-9 px-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-extrabold text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: BRAND OPTION PILLS (No dropdown!) */}
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Vehicle Brand</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Select your preferred EV manufacturer</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['All', 'Tata', 'Mahindra', 'MG', 'Hyundai'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setFilterBrand(b)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                        filterBrand === b
                          ? 'bg-emerald-600 text-white border border-emerald-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {b === 'All' ? 'All Brands' : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 4: BODY STYLE OPTION PILLS */}
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Body Style</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Which body style matches your preference?</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['All', 'SUV', 'Hatchback', 'Sedan', 'Compact SUV', 'Luxury'].map((bs) => (
                    <button
                      key={bs}
                      onClick={() => setFilterBodyStyle(bs)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                        filterBodyStyle === bs
                          ? 'bg-emerald-600 text-white border border-emerald-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {bs === 'All' ? 'All Body Styles' : bs}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 5: PARKING LOCATION OPTION PILLS */}
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Parking Location</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Where do you usually park your vehicle at night?</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Apartment', 'Independent House', 'Villa', 'Society Parking', 'Office Parking'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedParking(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                        selectedParking === p
                          ? 'bg-emerald-600 text-white border border-emerald-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 6: INCENTIVES & FEATURES TOGGLES */}
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Features & Incentives</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Select required feature & subsidy criteria</p>
                </div>
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setFilterFastChargingOnly(!filterFastChargingOnly)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                      filterFastChargingOnly
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>DC Fast Charging Support</span>
                    <span className="text-emerald-700 font-black">{filterFastChargingOnly ? '✓ Active' : '+ Add'}</span>
                  </button>

                  <button
                    onClick={() => setFilterIncentiveOnly(!filterIncentiveOnly)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                      filterIncentiveOnly
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Government Incentive Eligible</span>
                    <span className="text-emerald-700 font-black">{filterIncentiveOnly ? '✓ Active' : '+ Add'}</span>
                  </button>

                  <button
                    onClick={() => setFilterSunroof(!filterSunroof)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                      filterSunroof
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Sunroof & ADAS Features</span>
                    <span className="text-emerald-700 font-black">{filterSunroof ? '✓ Active' : '+ Add'}</span>
                  </button>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm cursor-pointer shadow-md shadow-emerald-600/20 transition-all"
              >
                Apply Preferences & Filters
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
