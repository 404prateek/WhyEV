'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, ShieldAlert, Download, Sparkles, MapPin, Zap, Fuel, CheckCircle2, Lock, ArrowRight, ShieldCheck, Landmark, Coins, PiggyBank } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubsidyStore, useAuthStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import { PdfReportModal } from './PdfReportModal';
import { SubsidyChecklist } from './SubsidyChecklist';
import { DocumentUploadSection } from './DocumentUploadSection';
import { VehicleCategory, EmpanelledVehicle } from '@/types';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';
import { ShortlistCard } from '@/components/recommend/ShortlistCard';
import { vehicleApi, subsidyApi } from '@/lib/api';

export function SubsidyCalculator() {
  const { setPdfModalOpen } = useSubsidyStore();
  const { isAuthenticated, openAuthModal, requestPermission } = useAuthStore();

  const [category, setCategory] = useState<VehicleCategory>('4W');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [batteryKwh, setBatteryKwh] = useState(40.5);
  const [hasScrappage, setHasScrappage] = useState(true);
  const [isDelhiResident, setIsDelhiResident] = useState(true);

  // Live empanelled vehicles list
  const [catalogueVehicles, setCatalogueVehicles] = useState<EmpanelledVehicle[]>(MOCK_EMPANELLED_VEHICLES);

  // Live dynamic calculation state
  const [liveIncentive, setLiveIncentive] = useState<number | null>(null);
  const [liveScrappage, setLiveScrappage] = useState<number | null>(null);
  const [liveRoadTax, setLiveRoadTax] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    vehicleApi.listEmpanelled().then((res) => {
      if (isMounted && res && res.length > 0) {
        setCatalogueVehicles(res);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const categoryVehicles = catalogueVehicles.filter((v) => v.category === category);
  const selectedVeh = categoryVehicles.find((v) => v.id === selectedVehicleId);

  useEffect(() => {
    let isMounted = true;
    const estPrice = selectedVeh?.exShowroomPrice || (category === '4W' ? 1400000 : category === '2W' ? 120000 : 250000);
    subsidyApi.calculateSubsidy({
      category,
      batteryCapacityKwh: selectedVeh?.batteryCapacityKwh || batteryKwh,
      hasTradeInIce: hasScrappage,
      isDelhiResident,
      price: estPrice,
      city: isDelhiResident ? 'Delhi' : 'Other',
      regYear: new Date().getFullYear(),
    }).then((res) => {
      if (isMounted && res) {
        setLiveIncentive(res.purchaseIncentive);
        setLiveScrappage(res.scrappageBonus);
        setLiveRoadTax(res.roadTaxWaiverEstimated);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [category, selectedVehicleId, batteryKwh, hasScrappage, isDelhiResident]);

  // Fallback calculations if live endpoint is loading/unavailable
  let purchaseIncentive = liveIncentive ?? 0;
  let scrappageBonus = liveScrappage ?? (hasScrappage ? (category === '4W' ? 25000 : 5000) : 0);
  let roadTaxWaiver = liveRoadTax ?? (category === '4W' ? 125000 : 8000);

  if (liveIncentive === null) {
    if (category === '2W') {
      purchaseIncentive = Math.min(batteryKwh * 5000, 20000);
    } else if (category === '4W') {
      purchaseIncentive = Math.min(batteryKwh * 10000, 150000);
    } else {
      purchaseIncentive = 30000;
    }
  }

  const totalBenefit = isDelhiResident ? purchaseIncentive + scrappageBonus + roadTaxWaiver : 0;
  const estimatedFuelSavingsYr = category === '4W' ? 54000 : category === '2W' ? 24000 : 36000;

  // Filter matched empanelled vehicles for post-login report using live catalogue
  const matchedVehicles = catalogueVehicles.filter((v) => v.category === category);
  const finalMatched = matchedVehicles.length > 0 ? matchedVehicles : MOCK_EMPANELLED_VEHICLES.filter((v) => v.category === category);


  const handleUnlockFullReport = () => {
    if (!isAuthenticated) {
      openAuthModal(
        undefined,
        'Unlock Your Personalized EV Report',
        'Sign in with Google to view your complete Delhi Policy 2026 tax breakdown, 30-day post-RC claim tracker, and empanelled EV shortlist.'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12 text-slate-900">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Landmark className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Delhi EV Policy 2026 Calculation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Calculate Your Exact EV Subsidy & Tax Waiver
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal">
          Reflects the live Delhi EV Policy 2026 (effective 1 July 2026 – 31 March 2030). Instant calculation with no sign-in barrier required.
        </p>

        {/* Dedicated Document Verification Page Link Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 text-slate-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm border border-emerald-200/90">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-900">Secure DigiLocker Document Verification</div>
              <div className="text-[11px] text-slate-600">Learn what documents are required & how AI OCR extracts minimum data safely.</div>
            </div>
          </div>
          <a
            href="/subsidy/document-verification"
            className="py-2.5 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shrink-0 cursor-pointer shadow-sm text-center min-h-[44px] flex items-center justify-center"
          >
            Explore Verification Page →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-start">
        {/* Left Column: Interactive Calculator Inputs */}
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <span>Eligibility Inputs</span>
            </h2>
            <button
              onClick={() => requestPermission('location')}
              className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold min-h-[36px] cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Auto-Detect Residency</span>
            </button>
          </div>

          {/* 1. Category */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Vehicle Category</label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {(['2W', '3W', '4W'] as VehicleCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    if (cat === '2W') setBatteryKwh(3.7);
                    if (cat === '4W') setBatteryKwh(40.5);
                    if (cat === '3W') setBatteryKwh(8.0);
                  }}
                  className={`py-3 min-h-[48px] rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center ${
                    category === cat
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 1.5 Empanelled Vehicle Model Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Empanelled EV Model
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedVehicleId(id);
                const found = catalogueVehicles.find((v) => v.id === id);
                if (found && found.batteryCapacityKwh) {
                  setBatteryKwh(found.batteryCapacityKwh);
                }
              }}
              className="w-full h-11 px-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Custom / Manual Spec Calculator</option>
              {categoryVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.batteryCapacityKwh || 30} kWh) — ₹{(v.exShowroomPrice / 100000).toFixed(2)}L
                </option>
              ))}
            </select>
          </div>

          {/* 2. Battery Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs sm:text-sm font-semibold">
              <span className="text-slate-600">Battery Capacity (kWh)</span>
              <span className="font-extrabold text-emerald-700">{batteryKwh} kWh</span>
            </div>
            <input
              type="range"
              min={category === '2W' ? 2 : 15}
              max={category === '2W' ? 5 : 80}
              step={0.5}
              value={batteryKwh}
              onChange={(e) => setBatteryKwh(Number(e.target.value))}
              className="w-full accent-emerald-600 bg-slate-200 h-3 rounded-lg cursor-pointer"
            />
          </div>

          {/* 3. Options */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <span className="text-slate-700 font-medium">Trading in an old Petrol/Diesel vehicle?</span>
              <button
                onClick={() => setHasScrappage(!hasScrappage)}
                className={`px-4 py-2 min-h-[40px] rounded-full font-bold text-xs transition-all shrink-0 cursor-pointer ${
                  hasScrappage ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {hasScrappage ? 'YES' : 'NO'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <span className="text-slate-700 font-medium">Delhi Address on Aadhaar / RC proof?</span>
              <button
                onClick={() => setIsDelhiResident(!isDelhiResident)}
                className={`px-4 py-2 min-h-[40px] rounded-full font-bold text-xs transition-all shrink-0 cursor-pointer ${
                  isDelhiResident ? 'bg-emerald-600 text-white shadow-sm' : 'bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                {isDelhiResident ? 'Verified Delhi' : 'Non-Delhi'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output Card (Progressive Value-First Flow) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white space-y-6 shadow-2xl flex flex-col justify-between border border-slate-800">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Calculated Subsidy Result</span>
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Delhi Policy 2026 Phase 1</span>
              </span>
            </div>

            {isDelhiResident ? (
              <div className="space-y-5">
                {/* Immediate Summary Financial Totals */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Estimated State Subsidy</span>
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">{formatINR(purchaseIncentive)}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Total Financial Savings</span>
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">{formatINR(totalBenefit)}</span>
                  </div>
                </div>

                {/* Key Metrics: Fuel Savings & Running Cost Comparison */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                      <Fuel className="w-3.5 h-3.5" />
                      <span>Annual Fuel Savings</span>
                    </div>
                    <div className="font-extrabold text-white text-base">~{formatINR(estimatedFuelSavingsYr)} / yr</div>
                    <div className="text-[10px] text-slate-400">vs Petrol / Diesel ICE</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Running Cost</span>
                    </div>
                    <div className="font-extrabold text-white text-base">₹0.40 / km</div>
                    <div className="text-[10px] text-slate-400">vs ₹7.50 / km (Petrol)</div>
                  </div>
                </div>

                {/* Key Policy Insights */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Key Delhi Policy 2026 Insights:</span>
                  </div>
                  <ul className="space-y-1 text-slate-300 text-[11px] font-normal leading-relaxed pl-5 list-disc">
                    <li>100% Road Tax & Registration Fee Waived under Phase 1 (~{formatINR(roadTaxWaiver)} saved)</li>
                    <li>{hasScrappage ? `Scrappage bonus adds ${formatINR(scrappageBonus)} extra cash incentive` : 'Add an ICE trade-in to claim up to ₹25,000 extra scrappage bonus'}</li>
                  </ul>
                </div>

                {/* Conditional Full Breakdown View when Authenticated */}
                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.4 }}
                    className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 space-y-3 text-xs"
                  >
                    <div className="font-extrabold text-emerald-300 flex items-center justify-between">
                      <span>Itemized Policy Breakdown</span>
                      <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-md">UNLOCKED</span>
                    </div>
                    <div className="space-y-2 text-[11px] text-slate-300 font-medium pt-1">
                      <div className="flex justify-between">
                        <span>Direct Purchase Incentive:</span>
                        <span className="font-bold text-white">{formatINR(purchaseIncentive)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scrappage Bonus:</span>
                        <span className="font-bold text-white">{formatINR(scrappageBonus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Road Tax Waiver:</span>
                        <span className="font-bold text-white">~{formatINR(roadTaxWaiver)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 space-y-2">
                <div className="font-bold flex items-center gap-2 text-rose-400">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  Ineligible for Delhi State Incentive
                </div>
                <p className="text-slate-400 leading-relaxed font-normal">
                  Delhi EV Policy 2026 requires proof of residency (Aadhaar / RC address in NCT Delhi). State subsidies cannot be claimed on non-Delhi registered vehicles.
                </p>
              </div>
            )}
          </div>

          {/* Action Trigger Button: Unlocks Full Breakdown & Recommendations */}
          <div className="pt-2">
            {!isAuthenticated ? (
              <button
                onClick={handleUnlockFullReport}
                className="w-full h-[54px] rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 cursor-pointer transform hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>View Detailed Breakdown & Recommended EVs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setPdfModalOpen(true)}
                disabled={!isDelhiResident}
                className="w-full h-[52px] rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Generate Official PDF Eligibility Certificate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Authenticated Full Detailed Report & Recommendations */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12 pt-6"
        >
          {/* Matched Empanelled EV Shortlist */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Recommended Empanelled {category} EVs for Delhi NCR
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-normal mt-1">
                  Empanelled under Model Approval Committee. Pre-calculated with Delhi EV Policy 2026 subsidies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {finalMatched.map((vehicle) => (
                <ShortlistCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </div>

          {/* 30-Day Filing Checklist */}
          <SubsidyChecklist />

          {/* Dedicated Required Claim Documents Section */}
          <DocumentUploadSection />
        </motion.div>
      )}

      {/* PDF Modal */}
      <PdfReportModal />
    </div>
  );
}
