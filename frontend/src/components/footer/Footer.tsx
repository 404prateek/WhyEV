'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, MapPin, HelpCircle } from 'lucide-react';
import { SaaSLogo } from '@/components/navbar/SaaSLogo';
import { ROUTES } from '@/routes/routes';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 text-slate-600 py-16 px-4 sm:px-6 lg:px-8 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        {/* Col 1: Brand & Purpose (Nationwide EV Platform) */}
        <div className="space-y-4">
          <Link href={ROUTES.HOME} className="inline-block">
            <SaaSLogo />
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-normal">
            Helping people across India discover EV incentives, compare electric vehicles, find charging stations, and make informed EV decisions.
          </p>
        </div>

        {/* Col 2: Company Navigation */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Company</h4>
          <ul className="space-y-2.5 text-xs font-medium text-slate-600">
            <li>
              <Link href="/profile#about" className="hover:text-emerald-600 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/profile#support" className="hover:text-emerald-600 transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/live-feed#faqs" className="hover:text-emerald-600 transition-colors">
                EV Guides & FAQs
              </Link>
            </li>
            <li>
              <Link href="/profile#careers" className="hover:text-emerald-600 transition-colors">
                Careers
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact & Support */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Contact & Support</h4>
          <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Email: <a href="mailto:support@whyev.in" className="hover:text-emerald-600 text-slate-700 font-semibold">support@whyev.in</a></span>
            </li>
            <li className="flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <Link href="/profile#support" className="hover:text-emerald-600 text-slate-700 font-semibold">
                Help & Support Center
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Pan-India Coverage</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Why Choose WhyEV Card */}
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Why Choose WhyEV</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
            Independent, nationwide guidance on electric vehicles, government incentives, charging networks, and ownership savings across all Indian states.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>© 2026 WhyEV. All rights reserved.</div>
        <div className="flex items-center gap-6 font-medium">
          <Link href="/profile#privacy" className="hover:text-emerald-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/profile#terms" className="hover:text-emerald-600 transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/live-feed#faqs" className="hover:text-emerald-600 transition-colors">
            FAQs
          </Link>
          <Link href="/profile#support" className="hover:text-emerald-600 transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
