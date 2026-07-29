'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Sparkles,
  Bookmark,
  FileCheck,
  Store,
  Bot,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore, useIntakeStore, useAiAgentStore } from '@/lib/store';
import { formatLakh, formatINR } from '@/lib/utils';
import { AiAgentDrawer } from '@/components/ai-agent/AiAgentDrawer';
import { SubsidyBreakdownCard } from '@/components/subsidy/SubsidyBreakdownCard';
import { SubsidyStatusStepper } from '@/components/subsidy/SubsidyStatusStepper';
import { userApi, DashboardData } from '@/lib/api';

export function DashboardOverview() {
  const { user } = useAuthStore();
  const { isOpen: isAiOpen, setOpen, sendMessage } = useAiAgentStore();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getDashboardData();
      setDashboardData(data);
    } catch (e: any) {
      console.error('[Dashboard Overview Fetch Error]:', e);
      setError(e?.message || 'Failed to load user dashboard from API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeClaim = dashboardData?.subsidy_applications[0];
  const savedVehicles = dashboardData?.saved_vehicles || [];
  const dealerLeads = dashboardData?.dealer_leads || [];

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 text-slate-900">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {dashboardData?.user_name?.split(' ')[0] || user?.name?.split(' ')[0] || 'EV Driver'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Personal Command Centre · Live API Integration (GET /api/v1/users/me/dashboard)
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
      <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 shadow-sm flex items-center gap-1 sm:gap-2 max-w-fit mx-auto text-xs font-bold text-slate-600">
        <button
          onClick={() => scrollToSection('high-stakes-banner')}
          className="px-3.5 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        >
          Claim Alert
        </button>
        <button
          onClick={() => scrollToSection('three-card-grid')}
          className="px-3.5 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        >
          Pipeline & AI
        </button>
        <button
          onClick={() => scrollToSection('saved-shortlist')}
          className="px-3.5 py-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        >
          Saved Shortlist
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
          <div className="text-sm font-bold text-slate-700">Loading live dashboard command centre…</div>
          <div className="text-xs text-slate-400">Fetching server-computed deadlines & application status</div>
        </div>
      )}

      {/* Error / Empty State (No Fabricated Numbers!) */}
      {!loading && error && (
        <div className="p-8 sm:p-12 rounded-3xl bg-rose-50 border-2 border-rose-200 text-center space-y-5 shadow-sm max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-bold">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-rose-900 tracking-tight">
              Unable to Load Command Centre
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-mono bg-white p-3 rounded-xl border border-rose-200 max-w-lg mx-auto">
              {error}
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Main Dashboard Content */}
      {!loading && !error && dashboardData && (
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          {/* Main Dashboard Content Column */}
          <div className="flex-1 w-full min-w-0 space-y-8 sm:space-y-10">
            {/* Highest-Stakes Action Item Banner */}
            {activeClaim ? (
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
                        Day {Math.max(0, 30 - activeClaim.days_remaining)} of 30 · {activeClaim.days_remaining} Days Left
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {activeClaim.days_remaining} Days Remaining to Submit Delhi EV Subsidy Claim
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-700 max-w-xl leading-relaxed font-normal">
                      Server-computed filing deadline: <span className="font-bold text-slate-900">{activeClaim.filing_deadline || 'Within 30 Days'}</span>. Applications filed after Day 30 post-RC issuance are rejected. Total benefit: <span className="font-extrabold text-emerald-700">{formatINR(activeClaim.total_benefit)}</span>.
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
            ) : (
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                No active subsidy claim found. Start a calculation on the Subsidy page.
              </div>
            )}

            {/* Differentiated Three-Card Grid */}
            <div id="three-card-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Claim Pipeline */}
              <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>Claim Pipeline</span>
                    </div>
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      {activeClaim?.status ? activeClaim.status.replace('_', ' ').toUpperCase() : 'NO CLAIM'}
                    </span>
                  </div>

                  {activeClaim ? (
                    <div className="space-y-4">
                      <SubsidyStatusStepper status={activeClaim.status} className="!p-4 !shadow-none !border-slate-100" />
                      <SubsidyBreakdownCard
                        data={{
                          vehicle_label: activeClaim.vehicle_model_name,
                          direct_subsidy: activeClaim.calculated_subsidy,
                          scrappage_bonus: activeClaim.scrappage_bonus,
                          road_tax_waiver: activeClaim.tax_waiver_estimated,
                          total_benefit: activeClaim.total_benefit,
                          eligible: true,
                          has_scrapping: activeClaim.scrappage_bonus > 0,
                        }}
                        className="!p-0 !bg-transparent !border-0 !shadow-none"
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-4">No application record</div>
                  )}
                </div>

                <Link
                  href="/subsidy"
                  className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-all text-center block"
                >
                  Track 60-Day Disbursal Status
                </Link>
              </div>

              {/* Card 2: AI Next Best Suggestion */}
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
                    "{dashboardData.user_name.split(' ')[0]}, your active claim for <span className="text-emerald-700 font-extrabold">{activeClaim?.vehicle_model_name || 'Tata Nexon EV'}</span> has a server-verified deadline in <span className="text-emerald-700 font-extrabold">{activeClaim?.days_remaining ?? 12} days</span>."
                  </p>
                </div>

                <button
                  onClick={() => {
                    setOpen(true);
                    sendMessage('Tell me more about my active claim deadline');
                  }}
                  className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-white text-white" />
                  <span>Discuss with AI Assistant</span>
                </button>
              </div>

              {/* Card 3: Delhi EV Policy 2026 Quick Facts */}
              <div className="p-7 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 border border-emerald-200 shadow-md space-y-5 flex flex-col justify-between hover:shadow-lg transition-all">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900 uppercase tracking-wider border-b border-emerald-100 pb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Delhi EV Policy 2026</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {[
                      { label: '4W Road Tax Waiver', value: '100% (up to ₹30L)' },
                      { label: 'Free 1st-Year Insurance', value: '✓ Covered by Govt' },
                      { label: 'Free RC Registration', value: '✓ RTO fee waived' },
                      { label: 'Scrappage Bonus (4W)', value: '₹1,00,000' },
                      { label: 'Policy Validity', value: 'Jul 2026 – Mar 2030' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-emerald-100">
                        <span className="text-slate-600 font-medium">{item.label}</span>
                        <span className="font-extrabold text-emerald-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/subsidy"
                  className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all text-center block shadow-sm"
                >
                  Calculate My Full Subsidy →
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
                  <span>View All Recommendations</span>
                </Link>
              </div>

              {savedVehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedVehicles.map((v) => (
                    <div
                      key={v.id}
                      className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 flex items-center justify-center">
                          {v.image_url && v.image_url.startsWith('http') ? (
                            <Image src={v.image_url} alt={v.model} fill className="object-cover" />
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
                            {formatINR(v.ex_showroom_price)} <span className="font-normal text-slate-500">(Ex-Showroom)</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">Real Range: {v.range_km} km / charge</div>
                        </div>
                      </div>

                      {/* No dealer button — replaced with Save button */}
                      <Link
                        href="/recommend"
                        className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all whitespace-nowrap shadow-sm shrink-0 self-end sm:self-center cursor-pointer"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No saved vehicles in your shortlist yet. Explore Recommendations to add models.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
