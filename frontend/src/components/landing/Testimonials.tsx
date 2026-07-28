'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

export function Testimonials() {
  const reviews = [
    {
      name: 'Rohan Mehta',
      locality: 'Saket, New Delhi',
      vehicle: 'Tata Nexon.ev (Long Range)',
      quote:
        'I had zero idea about the 30-day deadline after RC issuance! WhyEV walked me through the Delhi EV Policy 2026 calculation step-by-step and saved me ₹1,50,000 on my purchase.',
      rating: 5,
    },
    {
      name: 'Pooja Verma',
      locality: 'Dwarka, New Delhi',
      vehicle: 'Ather 450X Gen 3',
      quote:
        'Showroom staff kept giving me conflicting figures on registration fee waivers. The WhyEV AI Assistant generated an official PDF report that the dealer accepted immediately without argument.',
      rating: 5,
    },
    {
      name: 'Vikram Singh',
      locality: 'Rohini, New Delhi',
      vehicle: 'Tata Punch.ev',
      quote:
        'No annoying sales calls! I set my 45 km daily commute, got matched with 2 empanelled cars, and connected with the nearest verified Okhla dealer on my terms.',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
      <div className="text-center mb-12 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Sourced from Delhi EV Buyers
        </h2>
        <p className="text-xs text-slate-400">Validated during Team Zeta's founder-led pilot in Delhi/NCR.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div key={idx} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-1 text-emerald-400">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">"{rev.quote}"</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-100">{rev.name}</div>
                <div className="text-[10px] text-slate-400">{rev.locality}</div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/20">
                {rev.vehicle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
