'use client';

import React, { useState } from 'react';
import { useIntakeStore, useAuthStore } from '@/lib/store';
import { formatLakh, formatINR } from '@/lib/utils';
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, ShieldCheck, Fuel, AlertCircle, X } from 'lucide-react';
import { ShortlistCard } from './ShortlistCard';
import { PropertySelectionGrid } from './PropertySelectionGrid';
import { EVLoadingScreen } from './EVLoadingScreen';
import { recommendationApi } from '@/lib/api';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';

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
  const [isLoadingScreenActive, setIsLoadingScreenActive] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleProceedFromProperty = () => {
    setIsLoadingScreenActive(true);
    setApiError(null);
  };

  const handleLoadingComplete = async () => {
    // Keep loading screen active WHILE fetching recommendations from backend API
    try {
      const user = useAuthStore.getState().user;
      const results = await recommendationApi.getRecommendations({
        budgetMax,
        category,
        dailyCommuteKm,
        housingType,
        tradeInIce,
        isDelhiResident: user?.isDelhiResident ?? true,
      });
      if (results && results.length > 0) {
        updateIntake({ shortlist: results });
        setApiError(null);
      } else {
        updateIntake({
          shortlist: MOCK_EMPANELLED_VEHICLES.filter((v) => v.category === category),
        });
        setApiError(null);
      }
    } catch (err: any) {
      console.warn('[RecommendationWizard] Fetching recommendations fallback:', err?.message || err);
      updateIntake({
        shortlist: MOCK_EMPANELLED_VEHICLES.filter((v) => v.category === category),
      });
      setApiError(null);
    }

    nextStep();
    setIsLoadingScreenActive(false);
  };

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
                  onClick={() => {
                    updateIntake({ category: item.cat as any });
                    // Auto-advance — no Continue click needed
                    setTimeout(() => nextStep(), 180);
                  }}
                  className={`p-8 rounded-3xl border text-center transition-all duration-200 cursor-pointer ${
                    category === item.cat
                      ? 'bg-emerald-50/90 border-emerald-500 text-slate-900 shadow-md scale-[1.02]'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/30 hover:scale-[1.01]'
                  }`}
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <div className="text-base font-bold text-slate-900">{item.label}</div>
                  <div className="mt-2 text-[11px] text-emerald-600 font-semibold opacity-0 group-hover:opacity-100">Tap to select →</div>
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
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Delhi Residential Property & Charging Setup
              </h2>
              <p className="text-sm text-slate-600 font-normal">
                Before recommending a home-charging-dependent model, select your exact Delhi property category to verify meter & parking feasibility.
              </p>
            </div>

            {/* Comprehensive 20 Delhi Property Types Grid */}
            <PropertySelectionGrid
              selectedPropertyId={housingType}
              onSelectProperty={(id) => {
                updateIntake({ housingType: id as any });
                // Auto-trigger calculation after short delay so user sees selection
                setTimeout(() => handleProceedFromProperty(), 300);
              }}
            />

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between text-sm">
              <span className="text-slate-700 font-medium">Trading in an existing Petrol/Diesel vehicle?</span>
              <button
                onClick={() => updateIntake({ tradeInIce: !tradeInIce })}
                className={`px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                  tradeInIce ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tradeInIce ? 'YES (+₹25,000 Scrappage Bonus)' : 'NO'}
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center font-medium">
              Select your property type above to auto-calculate recommendations ↑
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Step 5 of 5</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Your EV Matches & Savings</h2>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Delhi Empanelled Models</span>
                </div>
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="px-4 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Compare Shortlist
                </button>
              </div>
            </div>

            {/* Total Projected Savings Panel */}
            {(() => {
              const fuelSavings5Yrs = dailyCommuteKm * 300 * 4.5 * 5;
              const calcVehicleBenefit = (v: any) => {
                const direct = v.directSubsidy || v.subsidyAmount || 0;
                const tax = v.roadTaxWaiver || Math.round((v.exShowroomPrice || 0) * 0.04);
                const scrap = v.scrappageBonus || 0;
                const ins = v.freeInsurance || (v.category === '4W' ? 20000 : 8000);
                const rc = v.freeRcRegistration || (v.category === '4W' ? 5000 : 3000);
                return direct + tax + scrap + ins + rc;
              };
              const maxPolicyBenefit = shortlist.length > 0 ? Math.max(...shortlist.map(calcVehicleBenefit)) : 152960;
              const total5YrSavings = fuelSavings5Yrs + maxPolicyBenefit;

              return (
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Fuel className="w-64 h-64" />
                  </div>
                  
                  <div className="relative z-10 space-y-2 flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/30">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Delhi EV Policy 2026 Calculated Savings</span>
                    </div>
                    <h3 className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Your Total Projected 5-Year Savings</h3>
                    <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                      {formatINR(total5YrSavings)}
                    </div>
                    <p className="text-emerald-100 text-xs">
                      Combining 5-Year Petrol Fuel Savings ({dailyCommuteKm} km/day) + Delhi EV Policy 2026 Perks (Road Tax Waiver, Scrappage, Free Insurance & RC).
                    </p>
                  </div>

                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                      <div className="text-[10px] text-emerald-200 font-bold uppercase mb-1 flex items-center gap-1">
                        <Fuel className="w-3 h-3 text-emerald-300" />
                        <span>Fuel Savings (5 Yrs)</span>
                      </div>
                      <div className="text-xl font-extrabold text-white">{formatINR(fuelSavings5Yrs)}</div>
                      <div className="text-[10px] text-emerald-200 font-medium">@ {dailyCommuteKm} km/day vs Petrol</div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                      <div className="text-[10px] text-emerald-200 font-bold uppercase mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-300" />
                        <span>Max Delhi Policy Perks</span>
                      </div>
                      <div className="text-xl font-extrabold text-white">{formatINR(maxPolicyBenefit)}</div>
                      <div className="text-[10px] text-emerald-200 font-medium">Tax Waiver + Scrappage + Insurance</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {apiError && (
              <div className="p-6 rounded-3xl bg-amber-500/15 border-2 border-amber-500/60 shadow-lg text-slate-900 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                      ⚠️ Could Not Reach Live Backend Recommendations Service
                    </h4>
                    <p className="text-xs text-amber-900 font-medium">
                      Failed to fetch recommendations from backend API. Displaying fallback demo data for preview purposes.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-100/90 border border-amber-300/80 text-[11px] font-mono text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <strong>Failure Details:</strong> {apiError}
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 shrink-0 bg-amber-200/80 px-2 py-0.5 rounded">
                    Logged to Console (F12) 🔍
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {shortlist.map((v) => (
                <ShortlistCard key={v.id} vehicle={v} />
              ))}
            </div>

            {/* Upcoming 2026 EVs Section (Coming Soon) */}
            <div className="space-y-6 pt-10 border-t border-slate-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span>Pipeline Preview</span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Upcoming 2026 EVs (Coming Soon)</h3>
                <p className="text-xs text-slate-500 font-normal">
                  Models scheduled for India launch late 2026. Stored in pipeline and excluded from active claim calculation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { make: 'Toyota', model: 'Urban Cruiser EV / Ebella', note: 'e-Vitara-based, expected late 2026, mid-size SUV' },
                  { make: 'Mahindra', model: 'BE 07 / XEV 7e', note: '7-seat EV, expected Q1 2026' },
                  { make: 'Tata Motors', model: 'Safari EV', note: 'Diwali 2026 launch, Acti.ev+ platform' },
                  { make: 'Citroën', model: 'Basalt EV', note: 'Expected late 2026, estimated ₹14-17 Lakh' },
                  { make: 'Hyundai', model: 'Kona Electric (facelift)', note: 'Estimated Nov 2026, ₹24.75-25.75 Lakh' },
                  { make: 'VinFast', model: 'VF3', note: 'Micro EV, estimated ~₹10 Lakh' },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">{item.make}</div>
                    <div className="text-sm font-extrabold text-slate-900">{item.model}</div>
                    <p className="text-xs text-slate-500 font-medium">{item.note}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                      Coming Late 2026
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Full Screen EV Parallax Animated Loading Overlay */}
      {isLoadingScreenActive && (
        <EVLoadingScreen onComplete={handleLoadingComplete} />
      )}

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
          className="h-[48px] px-6 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {currentStep < 5 ? (
          // Step 1: hidden (auto-advances on card click)
          // Step 4: replaced by "Select above to continue" hint
          // Steps 2 & 3: show Continue button
          currentStep === 1 || currentStep === 4 ? null : (
            <button
              onClick={() => {
                if (currentStep === 2) requestPermission('location');
                nextStep();
              }}
              className="h-[48px] px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )
        ) : (
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Empanelled Match Complete</span>
          </div>
        )}
      </div>

      {/* EV Model Side-by-Side Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Model Side-by-Side Analysis</div>
                <h3 className="text-2xl font-extrabold text-slate-900">Compare Shortlisted EV Models</h3>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-3 bg-slate-50 font-bold text-slate-700 min-w-[170px]">Feature / Spec</th>
                    {shortlist.slice(0, 4).map((v) => (
                      <th key={v.id} className="p-3 font-extrabold text-slate-900 min-w-[180px]">
                        <div className="text-[10px] uppercase text-emerald-600 font-extrabold">{v.make}</div>
                        <div className="text-sm font-extrabold">{v.model}</div>
                        <div className="text-[11px] text-slate-500 font-medium truncate">{v.variant}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/50">Ex-Showroom Price</td>
                    {shortlist.slice(0, 4).map((v) => (
                      <td key={v.id} className="p-3 font-extrabold text-slate-900">{formatINR(v.exShowroomPrice)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/50">100% Road Tax Waiver</td>
                    {shortlist.slice(0, 4).map((v) => (
                      <td key={v.id} className="p-3 font-extrabold text-emerald-700">-{formatINR(v.roadTaxWaiver || Math.round(v.exShowroomPrice * 0.04))}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/50">Scrappage / Trade-In Bonus</td>
                    {shortlist.slice(0, 4).map((v) => (
                      <td key={v.id} className="p-3 font-extrabold text-emerald-700">-{formatINR(v.scrappageBonus || 0)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/50">Free Insurance + RC Waiver</td>
                    {shortlist.slice(0, 4).map((v) => (
                      <td key={v.id} className="p-3 font-extrabold text-emerald-700">-{formatINR((v.freeInsurance || 20000) + (v.freeRcRegistration || 5000))}</td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50/50 font-bold">
                    <td className="p-3 text-emerald-900 bg-emerald-100/50 font-extrabold">Effective On-Road Cost</td>
                    {shortlist.slice(0, 4).map((v) => (
                      <td key={v.id} className="p-3 font-extrabold text-emerald-800 text-sm">
                        {formatINR(Math.max(0, v.exShowroomPrice - ((v.directSubsidy || 0) + (v.roadTaxWaiver || Math.round(v.exShowroomPrice * 0.04)) + (v.scrappageBonus || 0))))}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/50">Real Range (km/charge)</td>
                    {shortlist.slice(0, 4).map((v) => (
                      <td key={v.id} className="p-3 font-bold text-slate-900">{v.rangeKm} km</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/50">Running Cost (₹/km)</td>
                    {shortlist.slice(0, 4).map((v) => (
                      <td key={v.id} className="p-3 font-bold text-slate-900">₹{v.runningCostPerKm}/km</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50/50">Battery Capacity</td>
                    {shortlist.slice(0, 4).map((v) => (
                      <td key={v.id} className="p-3 font-medium text-slate-700">{v.batteryCapacityKwh} kWh</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
