'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function IndiaMovingElectricSection() {
  const counterStats = [
    {
      value: '2.05M+',
      caption: 'EVs Sold (FY2025)',
    },
    {
      value: '22%',
      caption: 'Annual EV Growth',
    },
    {
      value: '29.1K+',
      caption: 'Public Charging Stations',
    },
    {
      value: '₹2K Cr',
      caption: 'Charging Infrastructure Investment',
    },
  ];

  return (
    <section className="w-full bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">
        {/* SECTION HEADER */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            India is Going Electric.<br className="hidden sm:inline" /> Are You Too?
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
            Join millions of Indians making the switch to cleaner, smarter mobility.
          </p>
        </div>

        {/* CENTER-ALIGNED CONCISE STATISTICS GRID (Desktop: 1 horizontal row (4 cols), Tablet & Mobile: 2 x 2 grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center max-w-5xl mx-auto">
          {counterStats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2 shadow-2xs hover:shadow-md transition-all flex flex-col justify-center items-center w-full"
            >
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-emerald-800">
                {stat.caption}
              </div>
            </motion.div>
          ))}
        </div>

        {/* SUBTLE CLOSING SENTENCE & SINGLE FIND YOUR EV CTA */}
        <div className="max-w-2xl mx-auto text-center space-y-6 pt-2">
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Millions of Indians are already saving on fuel, maintenance, and government incentives by switching to electric. Start your journey today.
          </p>

          <div className="flex justify-center">
            <Link
              href="/recommend"
              className="h-[50px] px-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-emerald-600/20 hover:shadow-2xl flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Find Your EV</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
