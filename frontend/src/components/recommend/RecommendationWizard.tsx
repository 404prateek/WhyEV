'use client';

import React from 'react';
import { useIntakeStore, useAuthStore } from '@/lib/store';
import { formatLakh, formatINR } from '@/lib/utils';
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, ShieldCheck, Fuel } from 'lucide-react';
import { ShortlistCard } from './ShortlistCard';

export function RecommendationWizard() {
  const {
    currentStep,
    nextStep,
    prevStep,
    budgetMax,
    dailyCommuteKm,
    housingType,
    category,
    tradeInIce,
    showEffectivePrice,
    shortlist,
    updateIntake,
    toggleEffectivePrice,
  } = useIntakeStore();

  const { requestPermission } = useAuthStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Step 1 of 5</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Select Vehicle Category</h2>
              <p className="text-sm text-slate-600 font-normal">
                Only vehicles empanelled under the Delhi EV Policy Model Approval Committee list will be shown.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { cat: '2W', label: '2-Wheeler (Scooter/Bike)', icon: '🛵' },
                { cat: '3W', label: '3-Wheeler (Auto/Goods)', icon: '🛺' },
                { cat: '4W', label: '4-Wheeler (Car/SUV)', icon: '🚗' },
              ].map((item) => (
                <button
                  key={item.cat}
                  onClick={() => updateIntake({ category: item.cat as any })}
                  className={`p-8 rounded-3xl border text-center transition-all duration-200 ${
                    category === item.cat
                      ? 'bg-emerald-50/90 border-emerald-500 text-slate-900 shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <div className="text-base font-bold text-slate-900">{item.label}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Step 2 of 5</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Set Maximum Budget</h2>
              <p className="text-sm text-slate-600 font-normal">
                Our research shows cost opacity is the top distrust trigger. Toggle below to compare sticker vs. post-subsidy price.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-semibold">Maximum Budget:</span>
                <span className="text-3xl font-extrabold text-emerald-700">{formatLakh(budgetMax)}</span>
              </div>

              <input
                type="range"
                min={100000}
                max={2500000}
                step={50000}
                value={budgetMax}
                onChange={(e) => updateIntake({ budgetMax: Number(e.target.value) })}
                className="w-full accent-emerald-600 bg-slate-200 h-2.5 rounded-lg cursor-pointer"
              />

              {/* Price Toggle */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-sm">
                <span className="text-slate-700 font-medium">Show Effective Post-Subsidy Price:</span>
                <button
                  onClick={toggleEffectivePrice}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    showEffectivePrice
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {showEffectivePrice ? 'ON (Effective Price)' : 'OFF (Sticker Price)'}
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Step 3 of 5</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Daily Commute Distance</h2>
              <p className="text-sm text-slate-600 font-normal">
                Range anxiety is the #1 adoption blocker (54%). We add a 25% safety buffer for Delhi traffic congestion & AC usage.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-semibold">Daily Distance:</span>
                <span className="text-3xl font-extrabold text-emerald-700">{dailyCommuteKm} km / day</span>
              </div>

              <input
                type="range"
                min={10}
                max={150}
                step={5}
                value={dailyCommuteKm}
                onChange={(e) => updateIntake({ dailyCommuteKm: Number(e.target.value) })}
                className="w-full accent-emerald-600 bg-slate-200 h-2.5 rounded-lg cursor-pointer"
              />

              {/* Fuel Savings Calculation */}
              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <Fuel className="w-5 h-5 text-emerald-600" />
                  <span className="text-slate-800 font-medium">Estimated Annual Fuel Savings vs Petrol:</span>
                </div>
                <span className="font-extrabold text-emerald-700 text-base">
                  ~{formatINR(dailyCommuteKm * 300 * 4.5)} / yr
                </span>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Step 4 of 5</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Housing & Charging Setup</h2>
              <p className="text-sm text-slate-600 font-normal">
                Before recommending a home-charging-dependent model, we verify your parking setup.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { type: 'apartment', title: 'Apartment / Society', desc: 'Assigned parking space in building complex' },
                { type: 'independent_house', title: 'Independent House', desc: 'Dedicated driveway / garage with 15A socket' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => updateIntake({ housingType: item.type as any })}
                  className={`p-6 rounded-3xl border text-left transition-all ${
                    housingType === item.type
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-base font-bold text-slate-900 mb-1">{item.title}</div>
                  <div className="text-xs text-slate-500 font-normal">{item.desc}</div>
                </button>
              ))}
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between text-sm">
              <span className="text-slate-700 font-medium">Trading in an existing Petrol/Diesel vehicle?</span>
              <button
                onClick={() => updateIntake({ tradeInIce: !tradeInIce })}
                className={`px-4 py-2 rounded-full font-bold text-xs transition-all ${
                  tradeInIce ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tradeInIce ? 'YES (+₹25,000 Scrappage Bonus)' : 'NO'}
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Step 5 of 5</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Your Empanelled EV Shortlist</h2>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Model Approval Committee Empanelled</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {shortlist.map((v) => (
                <ShortlistCard key={v.id} vehicle={v} />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Wizard Step Progress Bar */}
      <div className="flex items-center justify-between mb-10 max-w-3xl mx-auto">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-3 flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                s === currentStep
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-110'
                  : s < currentStep
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              {s < currentStep ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : s}
            </div>
            {s < 5 && <div className={`flex-1 h-1 rounded-full ${s < currentStep ? 'bg-emerald-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[420px] max-w-4xl mx-auto">{renderStep()}</div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between max-w-4xl mx-auto pt-8 border-t border-slate-200">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="h-[48px] px-6 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 text-xs font-bold flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentStep < 5 ? (
          <button
            onClick={() => {
              if (currentStep === 2) requestPermission('location');
              nextStep();
            }}
            className="h-[48px] px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => requestPermission('notifications')}
            className="h-[48px] px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Enable 30-Day Deadline Alerts</span>
          </button>
        )}
      </div>
    </div>
  );
}
