'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-emerald-900/30 text-slate-400 py-12 px-4 lg:px-8 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1: Brand & Purpose */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-slate-950 font-bold">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold text-slate-100 tracking-tight">WhyEV</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The trusted lifecycle platform for EV buyers in Delhi/NCR. Guiding you from "should I switch?" through subsidy claim, model selection, dealer connection, and battery trust.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Updated for Delhi EV Policy 2026 (1 July 2026 – 31 March 2030)</span>
          </div>
        </div>

        {/* Col 2: Core Funnels */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Core Modules</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/subsidy" className="hover:text-emerald-400 transition-colors">
                Delhi Subsidy Calculator (2026)
              </Link>
            </li>
            <li>
              <Link href="/recommend" className="hover:text-emerald-400 transition-colors">
                Empanelled EV Matcher & Savings
              </Link>
            </li>
            <li>
              <Link href="/dealers" className="hover:text-emerald-400 transition-colors">
                Verified Dealer Discovery & Offers
              </Link>
            </li>
            <li>
              <Link href="/battery-cert" className="hover:text-emerald-400 transition-colors">
                Battery Inspection & Health Score
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                30-Day Post-RC Filing Tracker
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Research Insights */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Why Trust WhyEV</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-1.5 text-slate-400">
              <span className="text-emerald-400 font-bold">•</span>
              92% of Delhi residents miss out on subsidies due to confusion. We fix that.
            </li>
            <li className="flex items-start gap-1.5 text-slate-400">
              <span className="text-emerald-400 font-bold">•</span>
              Zero cold calls: Dealers get your profile only after you shortlist a model.
            </li>
            <li className="flex items-start gap-1.5 text-slate-400">
              <span className="text-emerald-400 font-bold">•</span>
              100% transparent rules-based ranker—no hidden sales commissions.
            </li>
          </ul>
        </div>

        {/* Col 4: Policy & Official Disclaimer */}
        <div className="space-y-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>Independent Platform</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            WhyEV is an independent EV decision guidance platform. We are not a government body or official Transport Department portal.
          </p>
          <a
            href="https://ev.delhi.gov.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline font-medium"
          >
            Delhi EV Portal Official Link <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>© 2026 WhyEV Platform. Team Zeta · Spark Fellowship 2026.</div>
        <div className="flex gap-4">
          <Link href="/profile" className="hover:text-slate-300">
            Privacy Settings
          </Link>
          <Link href="/subsidy" className="hover:text-slate-300">
            Delhi Policy 2026 FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
}
