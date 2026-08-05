'use client';

import React, { useState } from 'react';
import { MOCK_BATTERY_REPORT } from '@/lib/mock-data';
import {
  BatteryCharging,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
  ThermometerSun,
  TrendingDown,
  Flame,
  Award,
} from 'lucide-react';
import { InspectionRequestModal } from './InspectionRequestModal';

export function BatteryReportView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tips' | 'factors' | 'comparison'>('overview');
  const report = MOCK_BATTERY_REPORT;

  const degradationTimeline = [
    { year: 'Year 1', healthPct: 98, km: '12,000 km', note: 'Factory Condition' },
    { year: 'Year 2', healthPct: 95, km: '24,000 km', note: 'Normal Settlement' },
    { year: 'Year 3 (Current)', healthPct: 92, km: '28,450 km', note: 'Verified Score' },
    { year: 'Year 5', healthPct: 87, km: '60,000 km', note: 'Healthy Range' },
    { year: 'Year 8', healthPct: 81, km: '100,000 km', note: 'Warranty Benchmark' },
  ];

  const careTips = [
    {
      id: 'tip-1',
      title: 'Follow the 20% to 80% Daily Rule',
      icon: BatteryCharging,
      category: 'Charging Habit',
      summary: 'Keep daily state-of-charge between 20% and 80%. Only charge to 100% before long trips.',
      impact: 'Extends lithium cell cycle life by up to 300%',
    },
    {
      id: 'tip-2',
      title: 'Limit Consecutive DC Fast Charging',
      icon: Zap,
      category: 'Thermal Care',
      summary: 'Fast DC charging generates internal cell heat. Use AC slow charging overnight for daily commutes.',
      impact: 'Reduces thermal stress and anode plating',
    },
    {
      id: 'tip-3',
      title: 'Pre-Conditioning in Hot Summers',
      icon: ThermometerSun,
      category: 'Climate Care',
      summary: 'Park in shaded areas during peak summer days to allow thermal management systems to run efficiently.',
      impact: 'Prevents accelerated electrolyte degradation',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 text-slate-900 font-sans text-left">
      {/* Header */}
      <div className="text-left space-y-3 border-b border-slate-100 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Certified EV Battery Diagnostic Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          EV Battery Health Engine
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl leading-relaxed">
          Monitor state of health (SOH), degradation trends, thermal care tips, and certified inspection passes.
        </p>

        {/* Section Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Health Overview' },
            { id: 'tips', label: 'Care Tips' },
            { id: 'factors', label: 'Degradation Factors' },
            { id: 'comparison', label: 'Matrix' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. SECTION: BATTERY HEALTH OVERVIEW */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <BatteryCharging className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{report.makeModel}</h2>
              <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                <Award className="w-3.5 h-3.5" />
                <span>WhyEV Certified Battery Pass</span>
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
            QR Certificate Verified
          </div>
        </div>

        {/* Score & Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-2 flex flex-col justify-center">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">State of Health</span>
            <div className="text-4xl font-black text-emerald-400">{report.batteryScore}%</div>
            <div className="text-[11px] font-extrabold text-slate-300">Status: {report.healthStatus}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Usable Capacity</span>
            <div className="text-2xl font-black text-slate-900">41.4 kWh</div>
            <div className="text-xs text-slate-500 font-medium">Original: 45.0 kWh Pack</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Longevity</span>
            <div className="text-2xl font-black text-slate-900">{report.estimatedRemainingYears} Years</div>
            <div className="text-xs text-emerald-700 font-bold">{report.chargingCycleCount} Charge Cycles</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center space-y-1">
            <img src={report.qrCodeUrl} alt="QR Code" className="w-14 h-14" />
            <div className="text-[10px] font-bold text-slate-900">Public Verification Pass</div>
          </div>
        </div>
      </div>

      {/* 2. DEGRADATION TIMELINE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-emerald-600" />
          <span>Projected Degradation Timeline</span>
        </h3>

        <div className="space-y-3">
          {degradationTimeline.map((item, idx) => (
            <div key={idx} className="space-y-1 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-slate-900">{item.year} ({item.km})</span>
                <span className="text-emerald-700">{item.healthPct}% Health ({item.note})</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${item.healthPct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white">Book Doorstep Battery Inspection</h3>
          <p className="text-xs text-slate-400 font-medium">Get an official 0-100 NABL battery inspection report for pre-owned EV resale.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-[44px] px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-sm shrink-0 cursor-pointer"
        >
          Book Inspection (₹999)
        </button>
      </div>

      <InspectionRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default BatteryReportView;
