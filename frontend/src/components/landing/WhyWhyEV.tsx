'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Store, FileCheck, BatteryCharging, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/buttons/Button';

export function WhyWhyEV() {
  const pillars = [
    {
      id: 'ai-recommendations',
      icon: Bot,
      title: 'Transparent AI Recommendations',
      subtitle: 'Rules-First Matching Engine',
      description:
        'Unlike dealer staff incentivized by sales margins, WhyEV uses a transparent rules-based ranker comparing empanelled EVs against your daily commute distance, home charging access, and budget.',
      points: [
        'Model-Approval-Committee empanelled vehicles only',
        'Sticker price vs. effective post-subsidy price toggle',
        'Transparent "why this fits" rationale card for every model',
      ],
      ctaText: 'Try EV Matcher',
      ctaHref: '/recommend',
      align: 'left',
    },
    {
      id: 'verified-dealers',
      icon: Store,
      title: 'Pre-Qualified Verified Dealers',
      subtitle: 'Zero Cold Calling Handoff',
      description:
        'You choose when and who receives your profile. Showrooms are matched only when you explicitly opt in, protecting you from aggressive outreach while giving dealers warm, decision-ready leads.',
      points: [
        'Verified Delhi-NCR empanelled showrooms only',
        'Doorstep or showroom test drive booking scheduler',
        'Exclusive dealer wallbox charger installation offers',
      ],
      ctaText: 'Explore Dealers',
      ctaHref: '/dealers',
      align: 'right',
    },
    {
      id: 'subsidy-guidance',
      icon: FileCheck,
      title: 'Delhi EV Policy 2026 Engine',
      subtitle: '30-Day RC Filing Window Tracker',
      description:
        'Reflects the live Delhi EV Policy 2026 (effective 1 July 2026). Automatically calculates purchase incentives, ICE scrappage bonuses, and 100% road tax waivers before the 30-day post-RC deadline expires.',
      points: [
        'Year 1/2/3 phased incentive step-down rules',
        '30-day deadline countdown with proactive SMS alerts',
        'Official downloadable PDF report accepted at showrooms',
      ],
      ctaText: 'Calculate Subsidy',
      ctaHref: '/subsidy',
      align: 'left',
    },
    {
      id: 'battery-certification',
      icon: BatteryCharging,
      title: 'Battery Health Certification',
      subtitle: 'Standardized NABL Inspection Score',
      description:
        '76% of used vehicle buyers demand a proper inspection report before purchase. WhyEV coordinates partner technician visits and issues a QR-verifiable 0-100 battery health score.',
      points: [
        'Time-boxed validity for real battery degradation tracking',
        'Public QR verification page (no login required for buyers)',
        'Odometer, charge cycles, and remaining life estimation',
      ],
      ctaText: 'Inspect Battery',
      ctaHref: '/battery-cert',
      align: 'right',
    },
  ];

  return (
    <section id="why-whyev" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <span>The WhyEV Difference</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Built to Replace Opacity <br />
            with Pure Transparency
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Every feature in WhyEV sits upstream of trust, putting power back in the buyer's hands.
          </p>
        </div>

        {/* Alternating Feature Showcase Rows */}
        <div className="space-y-16 sm:space-y-20">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            const isLeft = pillar.align === 'left';

            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center ${
                  isLeft ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Text Block */}
                <div className={`lg:col-span-6 space-y-5 ${isLeft ? '' : 'lg:order-2'}`}>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <Icon className="w-4 h-4 text-emerald-600" />
                    <span>{pillar.subtitle}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
                    {pillar.description}
                  </p>

                  <ul className="space-y-2.5 pt-1 text-sm text-slate-700 font-medium">
                    {pillar.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    <Link href={pillar.ctaHref}>
                      <Button size="md" variant="dark" rightIcon={<ArrowRight className="w-4 h-4 text-emerald-400" />}>
                        {pillar.ctaText}
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Visual Card Block */}
                <div className={`lg:col-span-6 ${isLeft ? '' : 'lg:order-1'}`}>
                  <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Module Showcase</div>
                      <div className="text-xl sm:text-2xl font-bold text-slate-900">{pillar.title}</div>
                      <p className="text-sm text-slate-500 leading-relaxed font-normal">
                        Integrated live into WhyEV's unified guided platform layer.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
