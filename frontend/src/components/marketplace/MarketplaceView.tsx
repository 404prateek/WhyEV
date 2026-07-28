'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function MarketplaceView() {
  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Phase 2 Architected Feature · Certified Pre-Owned Only</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Used EV Certified Marketplace
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-normal">
          76% of respondents trust a used EV deal only when backed by an inspection report. Every listing here carries a WhyEV Battery Health Certificate.
        </p>
      </div>

      {/* Sample Listing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          {
            title: 'Tata Nexon EV Max (2023)',
            owner: 'Single Owner · 24,000 km',
            price: '₹10,80,000',
            score: 94,
            valid: 'Valid thru Jan 2027',
            image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
          },
          {
            title: 'Ather 450X Gen 3 (2023)',
            owner: 'First Owner · 12,500 km',
            price: '₹88,000',
            score: 91,
            valid: 'Valid thru Dec 2026',
            image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
          },
        ].map((item, idx) => (
          <div key={idx} className="rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden space-y-5 p-6">
            <div className="relative h-56 w-full bg-slate-100 rounded-2xl overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-emerald-800 text-xs font-bold shadow-sm">
                Battery Score: {item.score}/100
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{item.owner}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold text-emerald-700">{item.price}</div>
                <div className="text-[11px] text-slate-400 font-medium">{item.valid}</div>
              </div>
            </div>
            <Link
              href="/battery-cert"
              className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-900 text-xs font-bold transition-all text-center block"
            >
              Inspect QR Battery Report
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
