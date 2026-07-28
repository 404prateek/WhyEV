'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Rohan Mehta',
      role: 'IT Consultant · Saket, Delhi',
      vehicle: 'Tata Nexon.ev (Long Range)',
      avatar: 'RM',
      quote:
        'I had zero idea about the 30-day post-RC deadline rule! WhyEV walked me through the Delhi EV Policy 2026 calculation step-by-step and helped me claim my ₹1,50,000 purchase incentive effortlessly.',
      rating: 5,
    },
    {
      name: 'Pooja Verma',
      role: 'Architect · Dwarka, Delhi',
      vehicle: 'Ather 450X Gen 3',
      avatar: 'PV',
      quote:
        'Showroom staff kept giving me conflicting numbers on road tax waivers. The WhyEV AI Assistant generated an official PDF eligibility report that the dealer accepted immediately.',
      rating: 5,
    },
    {
      name: 'Vikram Singh',
      role: 'Business Owner · Rohini, Delhi',
      vehicle: 'Tata Punch.ev',
      avatar: 'VS',
      quote:
        'No annoying sales calls! I set my 45 km daily commute, got matched with 2 empanelled cars, and connected with a verified Okhla dealer on my own terms.',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span>Verified User Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Trusted by Delhi EV Buyers
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Validated during Team Zeta's founder-led pilot in Delhi/NCR (N=50, July 2026).
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  ))}
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic font-normal">"{t.quote}"</p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t.name}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{t.role}</div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold shrink-0">
                  {t.vehicle}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
