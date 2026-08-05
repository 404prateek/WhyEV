'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export interface QuestionnaireAnswers {
  vehicleType: string;
  minBudget: number;
  maxBudget: number;
  dailyCommute: number;
  propertyType: string;
}

interface QuestionnaireStepProps {
  onComplete: (answers: QuestionnaireAnswers) => void;
  onCancel: () => void;
  onSkip?: () => void;
}

// Removed Three Wheeler as requested
const VEHICLE_TYPES = [
  { id: '2W', label: 'Two Wheeler', icon: '🏍' },
  { id: '4W', label: 'Four Wheeler', icon: '🚗' },
  { id: 'CV', label: 'Commercial Vehicle', icon: '🚚' },
];

const PROPERTY_TYPES = [
  { id: 'Apartment', label: 'Apartment' },
  { id: 'Independent House', label: 'Independent House' },
  { id: 'Villa', label: 'Villa' },
  { id: 'Builder Floor', label: 'Builder Floor' },
  { id: 'Gated Community', label: 'Gated Community' },
  { id: 'PG', label: 'PG' },
  { id: 'Hostel', label: 'Hostel' },
  { id: 'Farmhouse', label: 'Farmhouse' },
  { id: 'Commercial Property', label: 'Commercial Property' },
  { id: 'Other', label: 'Other' },
];

export function QuestionnaireStep({ onComplete, onCancel, onSkip }: QuestionnaireStepProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Total 4 Steps (Body style question removed)

  const [vehicleType, setVehicleType] = useState<string>('4W');
  const [minBudget, setMinBudget] = useState<number>(500000);
  const [maxBudget, setMaxBudget] = useState<number>(2500000);
  const [dailyCommute, setDailyCommute] = useState<number>(45);
  const [propertyType, setPropertyType] = useState<string>('Apartment');

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete({
        vehicleType,
        minBudget,
        maxBudget,
        dailyCommute,
        propertyType,
      });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onCancel();
    }
  };

  const formatBudgetDisplay = (val: number) => {
    if (val >= 100000) {
      const lakhs = val / 100000;
      return `₹${lakhs.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2 sm:py-4 px-3 sm:px-6">
      {/* Top Visual Progress Loader Line ONLY (No text, numbers, or percentages) */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-full bg-emerald-600 rounded-full"
        />
      </div>

      {onSkip && (
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors cursor-pointer"
          >
            Skip to Marketplace →
          </button>
        </div>
      )}

      {/* QUESTION SCREENS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-sm space-y-4 sm:space-y-6"
        >
          {/* =========================================================
              QUESTION 1: EV TYPE (3 Options: 2W, 4W, CV)
          ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                What type of EV are you looking for?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-1">
                {VEHICLE_TYPES.map((type) => {
                  const isSelected = vehicleType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setVehicleType(type.id)}
                      className={`p-4 md:p-6 rounded-2xl border-2 transition-all flex flex-col justify-between text-left cursor-pointer min-h-[90px] md:min-h-[120px] ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-600 text-emerald-950 font-black shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 font-bold'
                      }`}
                    >
                      <span className="text-2xl sm:text-4xl mb-2">{type.icon}</span>
                      <span className="text-xs sm:text-base">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================
              QUESTION 2: BUDGET
          ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                What is your budget?
              </h2>

              <div className="grid grid-cols-2 gap-3 md:gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] md:text-xs font-extrabold text-slate-600 uppercase">Min Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    max={maxBudget}
                    step={10000}
                    value={minBudget}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(Number(e.target.value), maxBudget));
                      setMinBudget(val);
                    }}
                    className="w-full h-10 md:h-12 px-3 md:px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs md:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] md:text-xs font-extrabold text-slate-600 uppercase">Max Price (₹)</label>
                  <input
                    type="number"
                    min={minBudget}
                    max={5000000}
                    step={10000}
                    value={maxBudget}
                    onChange={(e) => {
                      const val = Math.min(5000000, Math.max(Number(e.target.value), minBudget));
                      setMaxBudget(val);
                    }}
                    className="w-full h-10 md:h-12 px-3 md:px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs md:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs md:text-sm font-bold text-slate-600">
                    <span>Min Slider</span>
                    <span className="text-emerald-700 font-extrabold">{formatBudgetDisplay(minBudget)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5000000}
                    step={25000}
                    value={minBudget}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val <= maxBudget) setMinBudget(val);
                    }}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs md:text-sm font-bold text-slate-600">
                    <span>Max Slider</span>
                    <span className="text-emerald-700 font-extrabold">{formatBudgetDisplay(maxBudget)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5000000}
                    step={25000}
                    value={maxBudget}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= minBudget) setMaxBudget(val);
                    }}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              QUESTION 3: DAILY TRAVEL DISTANCE
          ========================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                How far do you usually travel each day?
              </h2>

              <div className="space-y-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] md:text-xs font-extrabold text-slate-600 uppercase">Distance in Kilometres</label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={dailyCommute}
                    onChange={(e) => setDailyCommute(Math.max(5, Math.min(300, Number(e.target.value))))}
                    className="w-full h-10 md:h-12 px-3 md:px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs md:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs md:text-sm font-bold text-slate-600">
                    <span>5 km</span>
                    <span className="text-emerald-700 font-extrabold">{dailyCommute} km / day</span>
                    <span>300+ km</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={300}
                    step={5}
                    value={dailyCommute}
                    onChange={(e) => setDailyCommute(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              QUESTION 4: HOME / PROPERTY TYPE (Final Question)
          ========================================================= */}
          {currentStep === 4 && (
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                What type of home do you live in?
              </h2>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-h-[320px] md:max-h-[380px] overflow-y-auto pr-1">
                {PROPERTY_TYPES.map((prop) => {
                  const isSelected = propertyType === prop.id;
                  return (
                    <button
                      key={prop.id}
                      type="button"
                      onClick={() => setPropertyType(prop.id)}
                      className={`p-3 md:p-4 rounded-xl border transition-all text-left text-xs md:text-sm font-bold cursor-pointer select-none ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-600 text-emerald-950 font-black shadow-xs'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {prop.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-3.5 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>{currentStep === 1 ? 'Cancel' : 'Previous'}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-5 md:px-7 py-2 md:py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs md:text-sm transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>{currentStep === totalSteps ? 'Get Recommendations' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
