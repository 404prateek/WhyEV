'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { SaaSLogo } from '@/components/navbar/SaaSLogo';
import { ROUTES } from '@/routes/routes';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 text-slate-600 py-16 px-4 sm:px-6 lg:px-8 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        {/* Col 1: Brand & Purpose */}
        <div className="space-y-4">
          <Link href={ROUTES.HOME} className="inline-block">
            <SaaSLogo />
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-normal">
            The trusted lifecycle platform for EV buyers in India. Guiding you from "should I switch?" through subsidy claims, model selection, and battery trust.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            <span>Delhi EV Policy 2026 Live (Jul 2026 – Mar 2030)</span>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Core Modules</h4>
          <ul className="space-y-2.5 text-xs font-medium text-slate-600">
            <li>
              <Link href={ROUTES.SUBSIDY} className="hover:text-emerald-600 transition-colors">
                Delhi Subsidy Calculator 2026
              </Link>
            </li>
            <li>
              <Link href={ROUTES.RECOMMEND} className="hover:text-emerald-600 transition-colors">
                Empanelled EV Matcher & Savings
              </Link>
            </li>
            <li>
              <Link href={ROUTES.MAP} className="hover:text-emerald-600 transition-colors">
                Interactive Charging Station Map
              </Link>
            </li>
            <li>
              <Link href={ROUTES.DASHBOARD} className="hover:text-emerald-600 transition-colors">
                30-Day Post-RC Application Tracker
              </Link>
            </li>
            <li>
              <Link href={ROUTES.BATTERY_CERT} className="hover:text-emerald-600 transition-colors">
                Battery Health Certification
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact & Support */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Contact & Support</h4>
          <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
            <li>Email: <a href="mailto:support@whyev.in" className="hover:text-emerald-600 text-slate-700 font-semibold">support@whyev.in</a></li>
            <li>Location: Okhla Industrial Estate Phase 3, New Delhi</li>
            <li>Response Time: &lt; 24 Hours</li>
          </ul>
        </div>

        {/* Col 4: Official Policy Disclaimer */}
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Independent Guidance</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
            WhyEV is an independent decision guidance platform and is not an official government body. All Delhi EV policy terms reflect live 2026 guidelines.
          </p>
          <a
            href="https://ev.delhi.gov.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold hover:underline pt-1"
          >
            <span>Official Delhi EV Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>© 2026 WhyEV Platform. Team Zeta · Spark Fellowship 2026.</div>
        <div className="flex items-center gap-6 font-medium">
          <Link href={ROUTES.PROFILE} className="hover:text-slate-600 transition-colors">
            Privacy Settings
          </Link>
          <Link href={ROUTES.SUBSIDY} className="hover:text-slate-600 transition-colors">
            Delhi Policy 2026 FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
}
