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
import { useAuthStore, useSubsidyStore, useIntakeStore, useAiAgentStore } from '@/lib/store';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';
import { formatLakh, formatINR } from '@/lib/utils';

export function DashboardOverview() {
  const { user } = useAuthStore();
  const { application } = useSubsidyStore();
  const { savedVehicleIds } = useIntakeStore();
  const { sendMessage, setOpen } = useAiAgentStore();

  const savedVehicles = MOCK_EMPANELLED_VEHICLES.filter((v) => savedVehicleIds.includes(v.id));

  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {user?.name.split(' ')[0] || 'Abhishek'}! 👋
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            Personal Command Centre · Delhi EV Policy 2026 Active
          </p>
        </div>

        <button
          onClick={() => {
            setOpen(true);
            sendMessage('Suggest my next best action for my subsidy claim');
          }}
          className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
        >
          <Bot className="w-4 h-4" />
          <span>AI Next Best Action</span>
        </button>
      </div>

      {/* Hero 30-Day Deadline Banner Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-amber-50/80 border border-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300 font-bold shrink-0 mt-1">
            <Clock className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Highest-Stakes Action Item
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-200 text-amber-950">
                Day {30 - application.daysRemaining} of 30
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              {application.daysRemaining} Days Left to File Your Delhi EV Subsidy Claim
            </h2>
            <p className="text-sm text-slate-600 max-w-xl leading-relaxed font-normal">
              Applications filed after Day 30 post-RC issuance are rejected by the Transport Department. Total benefit calculated: <span className="font-bold text-emerald-700">{formatINR(application.totalBenefit)}</span>.
            </p>
          </div>
        </div>

        <Link
          href="/subsidy"
          className="w-full md:w-auto h-[52px] px-8 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span>Complete Claim Checklist</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: Subsidy Status */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 flex flex-col justify-between hover:shadow-xl transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Claim Pipeline</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Documents Pending
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{application.vehicleModelName}</h3>

            <div className="space-y-2.5 text-xs text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Calculated Subsidy:</span>
                <span className="font-bold text-slate-900">{formatINR(application.calculatedSubsidy)}</span>
              </div>
              <div className="flex justify-between">
                <span>Scrappage Bonus:</span>
                <span className="font-bold text-slate-900">{formatINR(application.scrappageBonus)}</span>
              </div>
              <div className="flex justify-between">
                <span>Road Tax Waiver:</span>
                <span className="font-bold text-slate-900">~{formatINR(application.taxWaiverEstimated)}</span>
              </div>
            </div>
          </div>

          <Link
            href="/subsidy"
            className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-900 text-xs font-bold transition-all text-center block"
          >
            Track 60-Day Disbursal Status
          </Link>
        </div>

        {/* Card 2: AI Suggestion Nudge */}
        <div className="p-8 rounded-3xl bg-white border border-emerald-200 shadow-sm space-y-6 flex flex-col justify-between hover:shadow-xl transition-all">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase">
              <Bot className="w-4 h-4 text-emerald-600" />
              <span>AI Next Best Suggestion</span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              "Abhishek, your daily commute of <span className="text-emerald-700 font-bold">42 km</span> makes the <span className="text-emerald-700 font-bold">Tata Nexon.ev</span> your top ROI model, saving ~₹54,000/yr in petrol costs."
            </p>
          </div>

          <button
            onClick={() => {
              setOpen(true);
              sendMessage('Tell me more about Tata Nexon.ev daily running cost breakdown');
            }}
            className="w-full py-3 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span>Discuss with AI Assistant</span>
          </button>
        </div>

        {/* Card 3: Inbound Dealer Offers */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 flex flex-col justify-between hover:shadow-xl transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase">
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Matched Offers</span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                1 Inbound
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-xs font-bold text-slate-900">AutoVikas Tata EV Zone</div>
              <p className="text-xs text-emerald-700 font-semibold">Free 7.2kW AC Wallbox Charger Installation</p>
            </div>
          </div>

          <Link
            href="/dealers"
            className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-900 text-xs font-bold transition-all text-center block"
          >
            View Empanelled Showrooms
          </Link>
        </div>
      </div>

      {/* Saved Shortlist */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-emerald-600" />
            <span>Saved Vehicle Shortlist</span>
          </h3>
          <Link href="/recommend" className="text-xs font-bold text-emerald-700 hover:underline">
            Re-rank Shortlist
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedVehicles.map((v) => (
            <div key={v.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={v.imageUrl} alt={v.model} className="w-16 h-16 rounded-2xl object-cover" />
                <div>
                  <h4 className="text-base font-bold text-slate-900">{v.model}</h4>
                  <div className="text-xs text-emerald-700 font-bold">{formatLakh(v.effectivePrice)} (Post-Subsidy)</div>
                </div>
              </div>

              <Link
                href={`/dealers?vehicle=${v.id}`}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all whitespace-nowrap shadow-sm"
              >
                Connect Dealer
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
