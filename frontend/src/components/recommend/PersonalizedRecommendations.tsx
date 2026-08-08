'use client';

import React, { useState, useRef, useCallback } from 'react';
import { EmpanelledVehicle } from '@/types';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';
import { QuestionnaireAnswers } from './QuestionnaireStep';
import { ShortlistCard } from './ShortlistCard';

interface PersonalizedRecommendationsProps {
  answers?: QuestionnaireAnswers;
  onBackToShop: () => void;
  onCompare: (vehicle: EmpanelledVehicle) => void;
  comparedVehicles: EmpanelledVehicle[];
  vehicles?: EmpanelledVehicle[];
}

export function PersonalizedRecommendations({
  answers,
  onBackToShop,
  onCompare,
  comparedVehicles,
  vehicles,
}: PersonalizedRecommendationsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const recommendedVehicles = vehicles && vehicles.length > 0
    ? vehicles.slice(0, 5)
    : MOCK_EMPANELLED_VEHICLES.slice(0, 5);

  const scrollToCard = useCallback((index: number) => {
    setActiveIndex(index);
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.firstElementChild?.clientWidth || 340;
      const gap = 20;
      container.scrollTo({
        left: index * (cardWidth + gap),
        behavior: 'smooth',
      });
    }
  }, []);

  // 5-Year Projected Savings Calculations
  const dailyKm = answers?.dailyCommute || 42;
  const total5YrKm = dailyKm * 365 * 5;
  const category = answers?.vehicleType || '4W';

  const petrolCostPerKm = category === '2W' ? 2.20 : category === 'CV' ? 7.50 : 6.50;
  const evCostPerKm = category === '2W' ? 0.32 : category === 'CV' ? 1.40 : 1.18;
  const fuelSavings5Yr = Math.round(total5YrKm * (petrolCostPerKm - evCostPerKm));

  const topVehicle = recommendedVehicles[0];
  const directSub = topVehicle?.subsidyAmount || (category === '2W' ? 18500 : 150000);
  const scrapSub = topVehicle?.scrappageBonus || 25000;
  const roadTaxSub = (topVehicle as any)?.roadTaxWaiver || Math.round((topVehicle?.exShowroomPrice || 1200000) * 0.04);
  const insSub = (topVehicle as any)?.freeInsurance || (category === '2W' ? 8000 : 20000);
  const rcSub = (topVehicle as any)?.freeRcRegistration || (category === '2W' ? 3000 : 5000);

  const maxPolicyPerks = (topVehicle as any)?.totalBenefit || (directSub + scrapSub + roadTaxSub + insSub + rcSub);
  const totalProjectedSavings = fuelSavings5Yr + maxPolicyPerks;

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. HEADING SECTION (Clean typography) */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-1">
          <span>STEP 5 OF 5</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Your EV Matches &amp; Savings
        </h1>

        <p className="text-xs sm:text-base text-slate-600 font-medium">
          Based on your preferences, here are your projected 5-year savings and best matching EVs.
        </p>
      </div>

      {/* 2. 5-YEAR SAVINGS BANNER CARD */}
      <div className="w-full bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
              <span>✨ Delhi EV Policy 2026 Calculated Savings</span>
            </div>

            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-black tracking-wider text-emerald-300 uppercase">
                YOUR TOTAL PROJECTED 5-YEAR SAVINGS
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
                ₹{totalProjectedSavings.toLocaleString('en-IN')}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl leading-relaxed">
              Combining 5-Year Petrol Fuel Savings ({dailyKm} km/day) + Delhi EV Policy 2026 Perks (Road Tax Waiver, Scrappage, Free Insurance &amp; RC).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full lg:w-auto shrink-0">
            <div className="bg-emerald-900/40 border border-emerald-700/50 backdrop-blur-md p-4 rounded-2xl space-y-1 min-w-[200px]">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                ⛽ FUEL SAVINGS (5 YRS)
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                ₹{fuelSavings5Yr.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-300 font-bold">
                @ {dailyKm} km/day vs Petrol
              </div>
            </div>

            <div className="bg-emerald-900/40 border border-emerald-700/50 backdrop-blur-md p-4 rounded-2xl space-y-1 min-w-[200px]">
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                🛡️ MAX DELHI POLICY PERKS
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                ₹{maxPolicyPerks.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-300 font-bold">
                Tax Waiver + Scrappage + Insurance
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. REDESIGNED COMPACT EXPLORE MARKETPLACE CTA */}
      <div className="text-center p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 max-w-xl mx-auto shadow-2xs">
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-black text-slate-900">
            Didn't find exactly what you're looking for?
          </h3>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            Explore our complete EV catalogue with advanced filters and compare every available model.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={onBackToShop}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
          >
            <span>Explore Marketplace</span>
          </button>
        </div>
      </div>

      {/* 3. RECOMMENDED EV CAROUSEL */}
      <div className="space-y-4 pt-2">
        <div
          ref={scrollContainerRef}
          onScroll={() => {
            if (scrollContainerRef.current) {
              const container = scrollContainerRef.current;
              const cardWidth = container.firstElementChild?.clientWidth || 340;
              const gap = 20;
              const index = Math.round(container.scrollLeft / (cardWidth + gap));
              if (index !== activeIndex && index >= 0 && index < recommendedVehicles.length) {
                setActiveIndex(index);
              }
            }
          }}
          className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar gap-5 w-full py-2 cursor-grab active:cursor-grabbing"
        >
          {recommendedVehicles.map((vehicle, idx) => {
            const isCompared = comparedVehicles.some((v) => v.id === vehicle.id);

            return (
              <div
                key={vehicle.id}
                onClick={() => scrollToCard(idx)}
                className={`snap-start shrink-0 w-[85%] sm:w-[48%] lg:w-[31%] transition-all duration-300 ${
                  idx === activeIndex ? 'scale-[1.005]' : 'opacity-95'
                }`}
              >
                <ShortlistCard
                  vehicle={vehicle}
                  onCompare={onCompare}
                  isCompared={isCompared}
                />
              </div>
            );
          })}
        </div>

        {/* Small Pagination Dots */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {recommendedVehicles.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToCard(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === activeIndex
                  ? 'w-6 bg-emerald-600'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
