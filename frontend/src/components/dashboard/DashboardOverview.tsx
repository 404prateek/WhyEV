'use client';

import React from 'react';
import {
  Clock,
  Sparkles,
  Bookmark,
  FileCheck,
  Store,
  Bot,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore, useSubsidyStore, useIntakeStore, useAiAgentStore } from '@/lib/store';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';
import { formatLakh, formatINR } from '@/lib/utils';
import { AiAgentDrawer } from '@/components/ai-agent/AiAgentDrawer';

export function DashboardOverview() {
  const { user } = useAuthStore();
  const { application } = useSubsidyStore();
  const { savedVehicleIds } = useIntakeStore();
  const { isOpen: isAiOpen, setOpen, sendMessage } = useAiAgentStore();

  const savedVehicles = MOCK_EMPANELLED_VEHICLES.filter((v) => savedVehicleIds.includes(v.id));

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 text-slate-900">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {user?.name.split(' ')[0] || 'Aishwarya'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Personal Command Centre · Delhi EV Policy 2026 Active Window
          </p>
        </div>

        {/* Top-Right AI Action Pill */}
        <button
          onClick={() => {
            setOpen(!isAiOpen);
            if (!isAiOpen) {
              sendMessage('Suggest my next best action for my subsidy claim');
            }
          }}
          className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Bot className="w-4 h-4" />
          <span>{isAiOpen ? 'Close AI Assistant' : 'AI Next Best Action'}</span>
        </button>
      </div>

      {/* Sticky Section Anchor Sub-Nav Bar */}
      <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 shadow-sm flex items-center gap-1 sm:gap-2 max-w-full overflow-x-auto no-scrollbar mx-auto text-xs font-bold text-slate-600 px-3">
        <button
          onClick={() => scrollToSection('high-stakes-banner')}
          className="px-3.5 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap min-h-[36px]"
        >
          Claim Alert
        </button>
        <button
          onClick={() => scrollToSection('three-card-grid')}
          className="px-3.5 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap min-h-[36px]"
        >
          Pipeline & AI
        </button>
        <button
          onClick={() => scrollToSection('saved-shortlist')}
          className="px-3.5 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap min-h-[36px]"
        >
          Saved Shortlist
        </button>
      </div>

      {/* Responsive Split-Pane Container (Prevents AI Panel Overlap!) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Main Dashboard Content Column (flex-1 min-w-0) */}
        <div className="flex-1 w-full min-w-0 space-y-8 sm:space-y-10">
          {/* Highest-Stakes Action Item Banner */}
          <div
            id="high-stakes-banner"
            className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-amber-50/90 border-2 border-amber-300/90 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden"
          >
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300 font-bold shrink-0 mt-1 shadow-xs">
                <Clock className="w-7 h-7 animate-pulse text-amber-700" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider bg-amber-200/80 px-2.5 py-0.5 rounded-md border border-amber-300">
                    Highest-Stakes Action Item
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-300 text-amber-950 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-700 animate-ping inline-block" />
                    Day {30 - application.daysRemaining} of 30 · {application.daysRemaining} Days Left
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {application.daysRemaining} Days Left to Claim {formatINR(application.totalBenefit)} Subsidy
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 max-w-xl font-medium">
                  Transport Department rule: Post-RC claims expire on Day 30. Pre-filled paperwork is ready for filing.
                </p>
              </div>
            </div>

            <Link
              href="/subsidy#required-documents"
              className="w-full md:w-auto h-[52px] px-8 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
            >
              <span>Complete Claim Checklist</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Differentiated Three-Card Grid */}
          <div id="three-card-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Claim Pipeline (Tabular / Neutral Status Card) */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Claim Pipeline</span>
                  </div>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    Documents Pending
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{application.vehicleModelName}</h3>

                {/* Tabular Financial Figures (Large/Bold Number Pattern) */}
                <div className="space-y-2.5 text-xs text-slate-600 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span>Direct Subsidy:</span>
                    <span className="font-extrabold text-slate-900 text-sm">{formatINR(application.calculatedSubsidy)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Scrappage Bonus:</span>
                    <span className="font-extrabold text-slate-900 text-sm">{formatINR(application.scrappageBonus)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Road Tax Waiver:</span>
                    <span className="font-extrabold text-slate-900 text-sm">~{formatINR(application.taxWaiverEstimated)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/subsidy"
                className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-all text-center block"
              >
                Track 60-Day Disbursal Status
              </Link>
            </div>

            {/* Card 2: AI Next Best Suggestion (Distinct AI Tinted & Sparkles Card) */}
            <div className="p-7 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 border border-emerald-300/90 shadow-md ring-1 ring-emerald-500/10 space-y-5 flex flex-col justify-between hover:shadow-lg transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span>AI Next Best Suggestion</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live Engine
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  "Aishwarya, your daily commute of <span className="text-emerald-700 font-extrabold">42 km</span> makes the <span className="text-emerald-700 font-extrabold">Tata Nexon.ev</span> your highest ROI vehicle, saving ~₹54,000/yr in petrol costs."
                </p>
              </div>

              <button
                onClick={() => {
                  setOpen(true);
                  sendMessage('Tell me more about Tata Nexon.ev daily running cost breakdown');
                }}
                className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-white text-white" />
                <span>Discuss with AI Assistant</span>
              </button>
            </div>

            {/* Card 3: Matched Offers (Warm Opportunity Notification Card) */}
            <div className="p-7 rounded-3xl bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border border-amber-200 shadow-md space-y-5 flex flex-col justify-between hover:shadow-lg transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Matched Offers</span>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
                    1 Inbound
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-amber-200/80 space-y-1 shadow-xs">
                  <div className="text-xs font-bold text-slate-900">Pragati Tata EV Zone (Okhla)</div>
                  <p className="text-xs text-emerald-700 font-extrabold">Free 7.2 kW AC Wallbox Charger Installation</p>
                </div>
              </div>

              <Link
                href="/dealers"
                className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold transition-all text-center block shadow-xs"
              >
                View Empanelled Showrooms →
              </Link>
            </div>
          </div>

          {/* Saved Vehicle Shortlist Section */}
          <div id="saved-shortlist" className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xl font-bold text-slate-900">Saved Vehicle Shortlist</h3>
              </div>
              <Link href="/recommend" className="text-xs font-extrabold text-emerald-700 hover:underline flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>Re-rank Shortlist</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedVehicles.map((v) => (
                <div
                  key={v.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 flex items-center justify-center">
                      {v.imageUrl && v.imageUrl.startsWith('http') ? (
                        <Image src={v.imageUrl} alt={v.model} fill className="object-cover" />
                      ) : (
                        <div className="text-center p-2">
                          <div className="text-xs font-extrabold text-emerald-400">{v.make.split(' ')[0]}</div>
                          <div className="text-[9px] font-bold text-slate-400 truncate max-w-[60px]">{v.model}</div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">{v.make}</div>
                      <h4 className="text-base font-extrabold text-slate-900">{v.model}</h4>
                      <div className="text-xs text-emerald-700 font-extrabold">
                        {formatLakh(v.effectivePrice)} <span className="font-normal text-slate-500">(Post-Subsidy)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">Real Range: {v.rangeKm} km / charge</div>
                    </div>
                  </div>

                  <Link
                    href={`/dealers?vehicle=${v.id}`}
                    className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all whitespace-nowrap shadow-sm shrink-0 self-end sm:self-center cursor-pointer"
                  >
                    Connect Dealer
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Docked AI Assistant Column in Split-Pane Layout (Zero Overlap!) */}
        {isAiOpen && (
          <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-24 z-30 transition-all duration-300">
            <AiAgentDrawer embedded />
          </div>
        )}
      </div>

      {/* Floating Bottom-Right AI Bubble Trigger (Reachable from any scroll position when closed) */}
      {!isAiOpen && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 p-3.5 sm:p-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2 border border-emerald-400/40 cursor-pointer"
          title="Open AI Assistant"
        >
          <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          <span className="text-xs font-bold pr-1 hidden sm:inline">Ask WhyEV AI</span>
        </button>
      )}
    </div>
  );
}
