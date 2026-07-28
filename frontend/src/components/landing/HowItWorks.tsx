'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sliders, Bot, FileCheck, Store, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/buttons/Button';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: Sliders,
      title: 'Tell us your needs',
      desc: 'Answer a few simple questions about your daily commute distance, home charging access, family size, and budget.',
    },
    {
      num: '02',
      icon: Bot,
      title: 'Discover your ideal EV',
      desc: 'Our rules-first AI engine shortlists 2-3 officially empanelled models with transparent "why this fits" explanations.',
    },
    {
      num: '03',
      icon: FileCheck,
      title: 'Check subsidy eligibility',
      desc: 'Calculate your exact purchase incentive, scrappage bonus, and road tax waivers under the live Delhi EV Policy 2026.',
    },
    {
      num: '04',
      icon: Store,
      title: 'Connect with verified dealers',
      desc: 'Opt-in to share your shortlisted specs with nearby showrooms for hassle-free test drives—never cold calls.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            How WhyEV Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            From "should I switch?" to driving home your new EV in four clear steps.
          </p>
        </div>

        {/* 4 Horizontal Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group relative"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-200">{step.num}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Timeline CTA */}
        <div className="text-center pt-4">
          <Link href="/recommend">
            <Button size="lg" variant="emerald" rightIcon={<ArrowRight className="w-4.5 h-4.5" />}>
              Start Step 1 Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
