'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { SaaSLogo } from './SaaSLogo';

export function LandingFooter() {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 py-20 px-4 sm:px-6 lg:px-8 text-slate-600 text-sm">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Col 1: Vector Logo & Purpose */}
        <div className="space-y-5">
          <Link href="/">
            <SaaSLogo />
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs font-normal">
            The trusted lifecycle platform for EV buyers in India. Guiding you from "should I switch?" through subsidy claim, model selection, dealer connection, and battery trust.
          </p>
        </div>

        {/* Col 2: Navigation */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Navigation</h4>
          <ul className="space-y-2.5 text-xs font-medium">
            <li>
              <a href="#home" className="hover:text-emerald-600 transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-emerald-600 transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <Link href="/subsidy" className="hover:text-emerald-600 transition-colors">
                Subsidy Calculator 2026
              </Link>
            </li>
            <li>
              <Link href="/dealers" className="hover:text-emerald-600 transition-colors">
                Empanelled Dealers
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact & Support */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Contact & Support</h4>
          <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
            <li>Email: support@whyev.in</li>
            <li>Location: Okhla Industrial Estate Phase 3, New Delhi</li>
            <li>Delhi EV Policy 2026 Reference (GNCTD)</li>
          </ul>
        </div>

        {/* Col 4: Official Policy Disclaimer */}
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Independent Guidance</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
            WhyEV is an independent decision guidance platform and is not an official government body. All Delhi policy subsidy rules reflect live 2026 terms.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1440px] mx-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>© 2026 WhyEV Platform. Team Zeta · Spark Fellowship 2026.</div>
        <div className="flex items-center gap-6 font-medium">
          <a href="#" className="hover:text-slate-600">
            Twitter
          </a>
          <a href="#" className="hover:text-slate-600">
            LinkedIn
          </a>
          <a href="#" className="hover:text-slate-600">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-slate-600">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
