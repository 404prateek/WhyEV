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
}

export function PersonalizedRecommendations({
  answers,
  onBackToShop,
  onCompare,
  comparedVehicles,
}: PersonalizedRecommendationsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const recommendedVehicles = MOCK_EMPANELLED_VEHICLES.slice(0, 5);

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

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. HEADING SECTION (Clean typography) */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Your Best EV Matches
        </h1>

        <p className="text-xs sm:text-base text-slate-600 font-medium">
          Based on your preferences, here are the EVs that best match your needs.
        </p>
      </div>

      {/* 2. REDESIGNED COMPACT EXPLORE MARKETPLACE CTA (Brand Green Button, No Right Arrow) */}
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
