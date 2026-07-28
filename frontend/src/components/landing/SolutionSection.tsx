'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, ShieldCheck, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SolutionSection() {
  return (
    <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>The WhyEV Solution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            One Intelligent Platform. <br />
            End-to-End EV Guidance.
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            WhyEV collapses subsidy navigation, model selection, dealer discovery, and battery trust into a single guided conversational experience.
          </p>
        </div>

        {/* Product Showcase Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl max-w-5xl mx-auto space-y-8"
        >
          {/* Mockup Header Toolbar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 font-mono text-[11px] text-slate-400">whyev.in/app/guidance</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Delhi EV Policy 2026 Engine Active</span>
            </div>
          </div>

          {/* Mockup Inner Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left AI Consultation Chat Simulation */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">AI Orchestrator Agent</div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    "Hi Abhishek! Based on your 42 km daily commute in Delhi and ₹16 Lakh budget, you qualify for ₹1,50,000 purchase incentive + ₹25,000 scrappage bonus under the Delhi EV Policy 2026."
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Empanelled Matcher Result</span>
                  <span className="text-emerald-600 text-[11px]">Effective Price View</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">Tata Nexon.ev (Long Range)</div>
                    <div className="text-[11px] text-slate-500">Sticker: ₹16,99,000</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-emerald-700 text-sm">₹15,49,000</div>
                    <div className="text-[10px] text-emerald-800 font-semibold">Post-Subsidy Cost</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Feature Highlights */}
            <div className="md:col-span-5 space-y-4 text-left">
              <h3 className="text-xl font-bold text-slate-900">AI-Guided Intelligence</h3>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>No static forms: conversational single-question dialogue flow.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Transparent rules engine explaining exact eligibility criteria.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Downloadable PDF report accepted by all empanelled showrooms.</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/recommend"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md"
                >
                  <span>Try AI Matcher Live</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
