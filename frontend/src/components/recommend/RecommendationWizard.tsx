'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useCityStore } from '@/lib/store';
import { recommendationApi, vehicleApi } from '@/lib/api';
import { VehicleCategory } from '@/types';
import { SlidersHorizontal, X, Filter, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShortlistCard } from './ShortlistCard';
import { CompareModal } from './CompareModal';
import { FloatingCompareBar } from './FloatingCompareBar';
import { HeroSearchBar } from '@/components/landing/HeroSearchBar';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';
import { EmpanelledVehicle } from '@/types';
import { QuestionnaireStep, QuestionnaireAnswers } from './QuestionnaireStep';
import { EVLoadingScreen } from './EVLoadingScreen';
import { PersonalizedRecommendations } from './PersonalizedRecommendations';
import { useSearchParams } from 'next/navigation';

export type FlowState = 'shop' | 'questionnaire' | 'loading' | 'recommendations';

export function RecommendationWizard() {
  const searchParams = useSearchParams();
  const { activeCity } = useCityStore();

  // Active Navigation Flow State
  const [flowState, setFlowState] = useState<FlowState>('shop');
  const [userAnswers, setUserAnswers] = useState<QuestionnaireAnswers | undefined>(undefined);

  // Filter Drawer & Filter State (16 Criteria)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filterBrand, setFilterBrand] = useState<string>('All');
  const [filterVehicleType, setFilterVehicleType] = useState<string>('All');
  const [filterBodyStyle, setFilterBodyStyle] = useState<string>('All');
  const [filterSeating, setFilterSeating] = useState<string>('All');
  const [filterMinRange, setFilterMinRange] = useState<number>(0);
  const [filterMinBattery, setFilterMinBattery] = useState<number>(0);
  const [filterChargingTime, setFilterChargingTime] = useState<string>('All');
  const [filterFastChargingOnly, setFilterFastChargingOnly] = useState<boolean>(false);
  const [filterIncentiveOnly, setFilterIncentiveOnly] = useState<boolean>(false);
  const [filterMaxPriceLakh, setFilterMaxPriceLakh] = useState<number>(50);

  // Comparison State
  const [comparedVehicles, setComparedVehicles] = useState<EmpanelledVehicle[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Catalogue vehicles (loaded from live API, falls back to mock)
  const [catalogueVehicles, setCatalogueVehicles] = useState<EmpanelledVehicle[]>(MOCK_EMPANELLED_VEHICLES);
  // Recommendation results from POST /recommendations (set during loading phase)
  const [recommendedVehicles, setRecommendedVehicles] = useState<EmpanelledVehicle[]>([]);
  const apiResultRef = useRef<EmpanelledVehicle[] | null>(null);

  // Check URL query parameters & localStorage for first visit
  useEffect(() => {
    const flowParam = searchParams?.get('flow');
    if (flowParam === 'recommend') {
      setFlowState('questionnaire');
      return;
    }

    try {
      const hasVisited = localStorage.getItem('whyev_shop_visited');
      if (!hasVisited) {
        setFlowState('questionnaire');
      }
    } catch (e) {
      console.error(e);
    }
  }, [searchParams]);

  // Load live vehicle catalogue on mount; falls back to MOCK_EMPANELLED_VEHICLES if API is down
  useEffect(() => {
    vehicleApi.listEmpanelled().then((vehicles) => {
      if (vehicles.length > 0) setCatalogueVehicles(vehicles);
    });
  }, []);

  const handleSkipQuestionnaire = () => {
    try {
      localStorage.setItem('whyev_shop_visited', 'true');
    } catch (e) {}
    setFlowState('shop');
  };

  const handleToggleCompare = (vehicle: EmpanelledVehicle) => {
    setComparedVehicles((prev) => {
      const exists = prev.some((v) => v.id === vehicle.id);
      if (exists) return prev.filter((v) => v.id !== vehicle.id);
      if (prev.length >= 4) return prev;
      return [...prev, vehicle];
    });
  };

  const filteredVehicles = useMemo(() => {
    return catalogueVehicles.filter((vehicle) => {
      if (filterBrand !== 'All' && vehicle.make !== filterBrand) return false;
      if (
        filterBodyStyle !== 'All' &&
        !(vehicle.bodyType || '').toLowerCase().includes(filterBodyStyle.toLowerCase())
      )
        return false;
      if (filterFastChargingOnly && vehicle.chargingTimeHours > 2) return false;
      if (filterIncentiveOnly && !vehicle.subsidyAmount) return false;
      if (filterMinRange > 0 && vehicle.rangeKm < filterMinRange) return false;
      if (filterMinBattery > 0 && (vehicle.batteryCapacityKwh || 0) < filterMinBattery) return false;
      if (filterMaxPriceLakh < 50 && vehicle.exShowroomPrice > filterMaxPriceLakh * 100000) return false;

      return true;
    });
  }, [
    filterBrand,
    filterBodyStyle,
    filterFastChargingOnly,
    filterIncentiveOnly,
    filterMinRange,
    filterMinBattery,
    filterMaxPriceLakh,
  ]);

  const handleQuestionnaireComplete = (answers: QuestionnaireAnswers) => {
    try {
      localStorage.setItem('whyev_shop_visited', 'true');
    } catch (e) {}
    setUserAnswers(answers);
    setFlowState('loading');

    // Fire recommendation API during the loading animation (3.8 s window)
    const housingType = ['Independent House', 'Villa', 'Builder Floor', 'Gated Community', 'Farmhouse'].includes(answers.propertyType)
      ? 'independent_house' as const
      : 'apartment' as const;
    const category = (['2W', '4W'].includes(answers.vehicleType) ? answers.vehicleType : '4W') as VehicleCategory;

    recommendationApi.getRecommendationsFull({
      budgetMax: answers.maxBudget,
      category,
      dailyCommuteKm: answers.dailyCommute,
      housingType,
      tradeInIce: false,
      isDelhiResident: activeCity.id === 'delhi-ncr',
    }).then((result) => {
      if (result?.shortlist && result.shortlist.length > 0) {
        apiResultRef.current = result.shortlist;
      }
    });
  };

  const handleLoadingComplete = () => {
    if (apiResultRef.current && apiResultRef.current.length > 0) {
      setRecommendedVehicles(apiResultRef.current);
    }
    setFlowState('recommendations');
  };

  const BRANDS = ['All', 'Tata', 'MG', 'Mahindra', 'Hyundai', 'BYD', 'BMW', 'Kia'];
  const BODY_STYLES = ['All', 'SUV', 'Hatchback', 'Sedan', 'Compact SUV', 'MPV', 'Scooter', 'Motorcycle'];

  return (
    <div className={`w-full bg-white text-slate-900 min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 ${flowState === 'shop' ? 'pb-28' : 'pb-6'}`}>
      <AnimatePresence mode="wait">
        {/* STATE 1: SHOP */}
        {flowState === 'shop' && (
          <motion.div
            key="shop-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            {/* Header Section */}
            <div className="space-y-4 border-b border-slate-100 pb-6 text-left">
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  Find Your EV
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl">
                  Explore India's electric vehicles, compare models, and discover government subsidies.
                </p>
              </div>

              {/* Search Bar + CTA Buttons (Single-line mobile phone sizing) */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-4xl">
                <div className="w-full flex-1">
                  <HeroSearchBar />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  {/* Get Recommendations Button: Single line text formatting */}
                  <button
                    onClick={() => setFlowState('questionnaire')}
                    className="h-11 sm:h-12 px-3.5 sm:px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-md shadow-emerald-600/20 flex-1 sm:flex-none"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white shrink-0" />
                    <span className="hidden sm:inline">Get Personalized Recommendations</span>
                    <span className="sm:hidden">Get Recommendations</span>
                  </button>

                  {/* Filter Button: Single line text formatting */}
                  <button
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="h-11 sm:h-12 px-3.5 sm:px-5 rounded-full bg-white hover:bg-emerald-50 border-2 border-emerald-600 text-emerald-800 font-extrabold text-[11px] sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-2xs hover:shadow-sm shrink-0"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 shrink-0" />
                    <span>Filters</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Marketplace Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredVehicles.map((vehicle) => (
                <ShortlistCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onCompare={handleToggleCompare}
                  isCompared={comparedVehicles.some((v) => v.id === vehicle.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* STATE 2: QUESTIONNAIRE */}
        {flowState === 'questionnaire' && (
          <motion.div
            key="questionnaire-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <QuestionnaireStep
              onComplete={handleQuestionnaireComplete}
              onCancel={handleSkipQuestionnaire}
              onSkip={handleSkipQuestionnaire}
            />
          </motion.div>
        )}

        {/* STATE 3: LOADING ANIMATION */}
        {flowState === 'loading' && (
          <EVLoadingScreen onComplete={handleLoadingComplete} />
        )}

        {/* STATE 4: PERSONALIZED RECOMMENDATIONS */}
        {flowState === 'recommendations' && (
          <motion.div
            key="recommendations-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PersonalizedRecommendations
              answers={userAnswers}
              onBackToShop={() => setFlowState('shop')}
              onCompare={handleToggleCompare}
              comparedVehicles={comparedVehicles}
              vehicles={recommendedVehicles.length > 0 ? recommendedVehicles : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Compare Bar */}
      <FloatingCompareBar
        selectedVehicles={comparedVehicles}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onClear={() => setComparedVehicles([])}
      />

      {/* Side-by-Side Vehicle Compare Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        vehicles={comparedVehicles}
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
              className="w-full max-w-lg bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-black text-slate-900">Filters</h3>
                  </div>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="uppercase text-slate-400">Max Ex-Showroom Price</span>
                    <span className="text-emerald-700 font-extrabold">Under ₹{filterMaxPriceLakh} Lakh</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={1}
                    value={filterMaxPriceLakh}
                    onChange={(e) => setFilterMaxPriceLakh(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Vehicle Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', '2W (Scooter)', '4W (Car/SUV)', 'CV (Cargo)'].map((vt) => (
                      <button
                        key={vt}
                        onClick={() => setFilterVehicleType(vt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          filterVehicleType === vt
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {vt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Brand</label>
                  <div className="flex flex-wrap gap-2">
                    {BRANDS.map((b) => (
                      <button
                        key={b}
                        onClick={() => setFilterBrand(b)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
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

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Body Style</label>
                  <div className="flex flex-wrap gap-2">
                    {BODY_STYLES.map((bs) => (
                      <button
                        key={bs}
                        onClick={() => setFilterBodyStyle(bs)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
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

              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => {
                    setFilterBrand('All');
                    setFilterVehicleType('All');
                    setFilterBodyStyle('All');
                    setFilterSeating('All');
                    setFilterMinRange(0);
                    setFilterMinBattery(0);
                    setFilterChargingTime('All');
                    setFilterFastChargingOnly(false);
                    setFilterIncentiveOnly(false);
                    setFilterMaxPriceLakh(50);
                  }}
                  className="w-1/3 py-3 rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-2/3 py-3 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 cursor-pointer"
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
