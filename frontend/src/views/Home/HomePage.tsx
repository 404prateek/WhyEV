'use client';

import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { ExploreByBrandSection } from '@/components/landing/ExploreByBrandSection';
import { DiscoverCtaSection } from '@/components/landing/DiscoverCtaSection';
import { ChargingShowcaseSection } from '@/components/landing/ChargingShowcaseSection';
import { IndiaMovingElectricSection } from '@/components/landing/IndiaMovingElectricSection';
import { OwnerReviewsSection } from '@/components/landing/OwnerReviewsSection';

export function HomePage() {
  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans selection:bg-emerald-600 selection:text-white antialiased">
      {/* 1. Hero & Interactive EV Search Bar */}
      <HeroSection />

      {/* 2. Explore by Brand Showcase (Tesla-inspired single featured card slider) */}
      <ExploreByBrandSection />

      {/* 3. Discover CTA Section (Never Miss an EV Opportunity) */}
      <DiscoverCtaSection />

      {/* 4. Find Your Charging Station Section (Abstract Animated Graphic) */}
      <ChargingShowcaseSection />

      {/* 5. India is Going Electric Section */}
      <IndiaMovingElectricSection />

      {/* 6. Hear From EV Owners Trust & Review Section */}
      <OwnerReviewsSection />
    </div>
  );
}
