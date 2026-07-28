'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { MOCK_REVIEWS } from '@/lib/mock-data';
import { ReviewCard } from '@/components/reviews/ReviewCard';

export function RealReviewsSection() {
  const topReviews = MOCK_REVIEWS.slice(0, 4);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Verified Customer Community</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Real Reviews from <br className="hidden sm:inline" />
            Verified EV Buyers
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            100% of reviews on WhyEV are gated by completed dealer test drives & verified charger uptime visits.
          </p>
        </div>

        {/* 4 Proof Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topReviews.map((rev, idx) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <ReviewCard review={rev} compact />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
