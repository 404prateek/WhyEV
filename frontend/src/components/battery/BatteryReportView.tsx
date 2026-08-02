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
  Activity,
  AlertTriangle,
  Flame,
  Gauge,
  Sliders,
  Award,
  ArrowRight,
  Info,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { InspectionRequestModal } from './InspectionRequestModal';
import { formatINR } from '@/lib/utils';

export function BatteryReportView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tips' | 'factors' | 'comparison'>('overview');
  const report = MOCK_BATTERY_REPORT;

  const degradationTimeline = [
    { year: 'Year 1', healthPct: 98, km: '12,000 km', note: 'Factory Condition' },
    { year: 'Year 2', healthPct: 95, km: '24,000 km', note: 'Normal Initial Settlement' },
    { year: 'Year 3 (Current)', healthPct: 92, km: '28,450 km', note: 'Current Verified Score' },
    { year: 'Year 5', healthPct: 87, km: '60,000 km', note: 'Projected Healthy Range' },
    { year: 'Year 8', healthPct: 81, km: '100,000 km', note: 'Warranty Period Benchmark' },
    { year: 'Year 10', healthPct: 75, km: '130,000 km', note: 'Second Life Stationary' },
  ];

  const careTips = [
    {
      id: 'tip-1',
      title: 'Follow the 20% to 80% Daily Rule',
      icon: BatteryCharging,
      category: 'Charging Habit',
      summary: 'Keep daily state-of-charge between 20% and 80%. Only charge to 100% right before long road trips.',
      impact: 'Extends lithium cell cycle life by up to 300%',
    },
    {
      id: 'tip-2',
      title: 'Limit Consecutive DC Fast Charging',
      icon: Zap,
      category: 'Thermal Care',
      summary: 'Fast DC charging above 50 kW generates internal cell heat. Use AC slow charging overnight for daily commutes.',
      impact: 'Reduces thermal stress and anode plating',
    },
    {
      id: 'tip-3',
      title: 'Pre-Conditioning in Hot Indian Summers',
      icon: ThermometerSun,
      category: 'Climate Management',
      summary: 'Park in shaded areas during peak 45°C Delhi summer days and plug in to allow thermal management systems to run.',
      impact: 'Prevents accelerated electrolyte degradation',
    },
    {
      id: 'tip-4',
      title: 'Long-Term Parking Storage (50% SOC)',
      icon: RotateCcw,
      category: 'Storage',
      summary: 'If leaving your vehicle unused for more than 2 weeks, store at ~50% charge rather than 100% or 0%.',
      impact: 'Eliminates high-voltage calendar aging stress',
    },
  ];

  const degradationFactors = [
    {
      title: 'Fast Charging Frequency',
      weight: 'High Impact',
      icon: Zap,
      desc: 'Frequent DC fast charging (>3x/week) accelerates lithium plating at cell anodes.',
    },
    {
      title: 'Ambient Climate Temperature',
      weight: 'High Impact',
      icon: ThermometerSun,
      desc: 'Operating cells consistently above 40°C in Indian summer speeds up chemical breakdown.',
    },
    {
      title: 'Driving Style & Thermal Spikes',
      weight: 'Moderate Impact',
      icon: Flame,
      desc: 'Repeated hard accelerations cause high current discharge spikes, raising internal temperature.',
    },
    {
      title: 'Calendar Age & Storage State',
      weight: 'Moderate Impact',
      icon: Clock,
      desc: 'Batteries degrade naturally over time; storing at 100% SOC magnifies baseline aging.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12 text-slate-900">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Certified EV Battery Diagnostic Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          EV Battery Health & Longevity Engine
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal">
          Monitor state of health (SOH), understand cell degradation trends, access thermal care tips, and get certified inspection passes.
        </p>

        {/* Section Sub-Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="p-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1 text-xs font-bold text-slate-600 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Health Overview' },
              { id: 'tips', label: 'Battery Care Tips' },
              { id: 'factors', label: 'Degradation Factors' },
              { id: 'comparison', label: 'Battery Comparison' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. SECTION: BATTERY HEALTH OVERVIEW */}
      <div className="space-y-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-8 relative overflow-hidden">
          {/* Certificate Title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <BatteryCharging className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{report.makeModel}</h2>
                <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>WhyEV Certified Battery Pass · Verified Inspection</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>QR Certificate Verified</span>
            </div>
          </div>

          {/* Score & Health Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* SOH Score Dial */}
            <div className="p-6 rounded-3xl bg-slate-950 text-white text-center space-y-3 flex flex-col justify-center border border-slate-800 shadow-md">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">State of Health (SOH)</span>
              <div className="text-5xl sm:text-6xl font-black text-emerald-400 tracking-tight">{report.batteryScore}%</div>
              <div className="text-xs font-extrabold text-slate-200 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full w-fit mx-auto">
                Status: {report.healthStatus}
              </div>
            </div>

            {/* Remaining Capacity & Life */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 flex flex-col justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Usable Capacity</span>
              <div>
                <div className="text-3xl font-black text-slate-900">41.4 kWh</div>
                <div className="text-xs text-slate-500 font-medium">Original: 45.0 kWh Pack</div>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            {/* Est Life & Cycles */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 flex flex-col justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Battery Longevity</span>
              <div>
                <div className="text-3xl font-black text-slate-900">{report.estimatedRemainingYears} Years</div>
                <div className="text-xs text-slate-500 font-medium">{report.chargingCycleCount} Full Charge Cycles</div>
              </div>
              <div className="text-[11px] text-emerald-700 font-bold">Degradation Rate: {report.degradationPct}%</div>
            </div>

            {/* Public QR Code Box */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <img src={report.qrCodeUrl} alt="QR Verification" className="w-20 h-20" />
              </div>
              <div className="text-[11px] font-bold text-slate-900">Public QR Verification Pass</div>
              <div className="text-[10px] text-slate-400">Valid until {report.certificateValidUntil}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION: BATTERY INSIGHTS & DEGRADATION CURVE */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-emerald-600" />
              <span>Projected 10-Year Battery Degradation Curve</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Based on Delhi NCR climate cycles & 14,000 km annual drive pattern.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            8-Year Warranty Benchmark
          </span>
        </div>

        {/* Degradation Timeline Bars */}
        <div className="space-y-4 pt-2">
          {degradationTimeline.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-900">{item.year} ({item.km})</span>
                <span className="text-emerald-700">{item.healthPct}% Health ({item.note})</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.healthPct >= 90 ? 'bg-emerald-600' : item.healthPct >= 80 ? 'bg-teal-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${item.healthPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SECTION: BATTERY CARE TIPS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Essential EV Battery Care Practices</h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">Practical habits to maximize cell longevity in Indian conditions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {careTips.map((tip) => {
            const Icon = tip.icon;
            return (
              <div key={tip.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                    {tip.category}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-slate-900 leading-snug">{tip.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{tip.summary}</p>
                <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{tip.impact}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SECTION: DEGRADATION FACTORS GRID */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-950 text-white space-y-6 border border-slate-800 shadow-2xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Cell Physics Intelligence</span>
          <h3 className="text-2xl font-black text-white tracking-tight mt-1">What Accelerates Battery Aging?</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {degradationFactors.map((factor, idx) => {
            const Icon = factor.icon;
            return (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800">
                    {factor.weight}
                  </span>
                </div>
                <h5 className="text-sm font-extrabold text-white">{factor.title}</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed font-normal">{factor.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SECTION: HEALTHY VS DEGRADED COMPARISON MATRIX */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Healthy vs Degraded Battery Matrix</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Healthy Card */}
          <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-emerald-900">Healthy Battery (SOH 90-100%)</span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px]">Optimal</span>
            </div>
            <ul className="space-y-2 text-slate-700 font-medium">
              <li className="flex items-center gap-2">✓ Full rated driving range (e.g. 489 km)</li>
              <li className="flex items-center gap-2">✓ Low internal cell resistance (fast charge speed)</li>
              <li className="flex items-center gap-2">✓ Balanced cell voltages under heavy acceleration</li>
            </ul>
          </div>

          {/* Degraded Card */}
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-amber-950">Aged / Degraded Battery (SOH &lt; 75%)</span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[10px]">Action Required</span>
            </div>
            <ul className="space-y-2 text-slate-800 font-medium">
              <li className="flex items-center gap-2">⚠️ Reduced real range (~320 km)</li>
              <li className="flex items-center gap-2">⚠️ Higher internal resistance causing thermal throttle</li>
              <li className="flex items-center gap-2">⚠️ Recommended for second-life solar energy storage</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Card for Doorstep Inspection */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-black text-slate-900">Buying or Selling a Pre-Owned EV?</h3>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">Get an official 0-100 doorstep battery inspection report to command top resale price.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-[52px] px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>Book Doorstep Inspection (₹999)</span>
        </button>
      </div>

      {/* Inspection Modal */}
      <InspectionRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
