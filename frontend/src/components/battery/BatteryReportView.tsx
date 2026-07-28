'use client';

import React, { useState } from 'react';
import { MOCK_BATTERY_REPORT } from '@/lib/mock-data';
import { BatteryCharging, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { InspectionRequestModal } from './InspectionRequestModal';

export function BatteryReportView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const report = MOCK_BATTERY_REPORT;

  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>76% of Buyers Demand Certified Inspection Before Purchase</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Battery Health & Certification Engine
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-normal">
          Standardized 0-100 battery health scoring and QR-verifiable inspection reports for used EV buyers and sellers.
        </p>
      </div>

      {/* Main Certificate Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 space-y-8 shadow-xl relative overflow-hidden">
        {/* Certificate Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
              <BatteryCharging className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{report.makeModel}</h2>
              <p className="text-xs text-emerald-700 font-semibold">WhyEV Certified Battery Pass</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>QR Certificate Verified</span>
          </div>
        </div>

        {/* Score & Degradation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Health Score Dial */}
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-3 flex flex-col justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Battery Score</span>
            <div className="text-6xl font-extrabold text-emerald-600 tracking-tight">{report.batteryScore}</div>
            <div className="text-xs font-bold text-slate-900">State of Health: {report.healthStatus}</div>
          </div>

          {/* Life & Cycles */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
              <span className="text-slate-500">Est. Remaining Life:</span>
              <span className="font-extrabold text-slate-900">{report.estimatedRemainingYears} Years</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
              <span className="text-slate-500">Degradation:</span>
              <span className="font-extrabold text-slate-900">{report.degradationPct}%</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
              <span className="text-slate-500">Full Charge Cycles:</span>
              <span className="font-extrabold text-slate-900">{report.chargingCycleCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
              <span className="text-slate-500">Odometer Distance:</span>
              <span className="font-extrabold text-slate-900">{report.odometerKm.toLocaleString()} km</span>
            </div>
          </div>

          {/* QR Code Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <img src={report.qrCodeUrl} alt="QR Verification" className="w-24 h-24" />
            </div>
            <div className="text-xs font-bold text-slate-900">Public QR Verification Code</div>
            <div className="text-[11px] text-slate-400">Valid until {report.certificateValidUntil}</div>
          </div>
        </div>

        {/* Inspector Info */}
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            <span className="text-slate-800">Inspected by: {report.inspectorName}</span>
          </div>
          <span className="text-slate-500">Date: {report.inspectionDate}</span>
        </div>
      </div>

      {/* CTA Card */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Selling a Used EV in Delhi-NCR?</h3>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">Get a certified inspection report to command top resale price.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-[48px] px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>Request Inspection (₹999)</span>
        </button>
      </div>

      {/* Inspection Modal */}
      <InspectionRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
