'use client';

import React, { useState } from 'react';
import { Calculator, ShieldAlert, Download, Sparkles, MapPin } from 'lucide-react';
import { useSubsidyStore, useAuthStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import { PdfReportModal } from './PdfReportModal';
import { SubsidyChecklist } from './SubsidyChecklist';
import { DocumentUploadSection } from './DocumentUploadSection';
import { VehicleCategory } from '@/types';

export function SubsidyCalculator() {
  const { setPdfModalOpen } = useSubsidyStore();
  const { requestPermission } = useAuthStore();

  const [category, setCategory] = useState<VehicleCategory>('4W');
  const [batteryKwh, setBatteryKwh] = useState(40.5);
  const [hasScrappage, setHasScrappage] = useState(true);
  const [isDelhiResident, setIsDelhiResident] = useState(true);

  // Dynamic Policy Calculations (Delhi EV Policy 2026 Phase 1 Rules)
  let purchaseIncentive = 0;
  let scrappageBonus = hasScrappage ? (category === '4W' ? 25000 : 5000) : 0;
  let roadTaxWaiver = category === '4W' ? 125000 : 8000;

  if (category === '2W') {
    purchaseIncentive = Math.min(batteryKwh * 5000, 20000);
  } else if (category === '4W') {
    purchaseIncentive = Math.min(batteryKwh * 10000, 150000);
  } else {
    purchaseIncentive = 30000;
  }

  const totalBenefit = isDelhiResident ? purchaseIncentive + scrappageBonus + roadTaxWaiver : 0;

  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          <span>Delhi EV Policy 2026 Calculation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Calculate Your Exact EV Subsidy & Tax Waiver
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal">
          Reflects the live Delhi EV Policy 2026 (effective 1 July 2026 – 31 March 2030). Phased incentive step-downs mean timing matters.
        </p>

        {/* Dedicated Document Verification Page Link Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-emerald-200/90">
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
            className="py-2 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shrink-0 cursor-pointer shadow-sm"
          >
            Explore Verification Page →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Input Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <span>Eligibility Inputs</span>
            </h2>
            <button
              onClick={() => requestPermission('location')}
              className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Auto-Detect Residency</span>
            </button>
          </div>

          {/* 1. Category */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Vehicle Category</label>
            <div className="grid grid-cols-3 gap-3">
              {(['2W', '3W', '4W'] as VehicleCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    if (cat === '2W') setBatteryKwh(3.7);
                    if (cat === '4W') setBatteryKwh(40.5);
                    if (cat === '3W') setBatteryKwh(8.0);
                  }}
                  className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
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
              className="w-full accent-emerald-600 bg-slate-200 h-2.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* 3. Options */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-700 font-medium">Trading in an old Petrol/Diesel vehicle?</span>
              <button
                onClick={() => setHasScrappage(!hasScrappage)}
                className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all ${
                  hasScrappage ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {hasScrappage ? 'YES' : 'NO'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-700 font-medium">Delhi Address on Aadhaar / RC proof?</span>
              <button
                onClick={() => setIsDelhiResident(!isDelhiResident)}
                className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all ${
                  isDelhiResident ? 'bg-emerald-600 text-white shadow-sm' : 'bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                {isDelhiResident ? 'Verified Delhi' : 'Non-Delhi'}
              </button>
            </div>
          </div>
        </div>

        {/* Output Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 space-y-8 shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Financial Benefit</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Phase 1 Year 1
              </span>
            </div>

            {isDelhiResident ? (
              <div className="space-y-6">
                <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">{formatINR(totalBenefit)}</div>

                <div className="space-y-3 pt-3 border-t border-slate-100 text-xs sm:text-sm font-medium">
                  <div className="flex justify-between text-slate-600">
                    <span>Direct Purchase Incentive:</span>
                    <span className="font-bold text-slate-900">{formatINR(purchaseIncentive)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ICE Vehicle Scrappage Bonus:</span>
                    <span className="font-bold text-slate-900">{formatINR(scrappageBonus)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>100% Road Tax & Registration Waiver:</span>
                    <span className="font-bold text-slate-900">~{formatINR(roadTaxWaiver)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Ineligible for Delhi State Incentive
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Delhi EV Policy 2026 requires proof of residency (Aadhaar / RC address in NCT Delhi). State subsidies cannot be claimed on non-Delhi registered vehicles.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={() => setPdfModalOpen(true)}
              disabled={!isDelhiResident}
              className="w-full h-[52px] rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              <span>Generate Official PDF Eligibility Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* 30-Day Filing Checklist */}
      <SubsidyChecklist />

      {/* Dedicated Required Claim Documents Section */}
      <DocumentUploadSection />

      {/* PDF Modal */}
      <PdfReportModal />
    </div>
  );
}
