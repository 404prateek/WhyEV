'use client';

import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { WhyWhyEV } from '@/components/landing/WhyWhyEV';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LiveMetrics } from '@/components/landing/LiveMetrics';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FinalCta } from '@/components/landing/FinalCta';

export function HomePage() {
  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans selection:bg-emerald-600 selection:text-white antialiased">
      <HeroSection />
      <ProblemSection />
      <WhyWhyEV />
      <HowItWorks />
      <LiveMetrics />
      <TestimonialsSection />
      <FinalCta />
    </div>
  );
}
