'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { InteractiveChargingMapModule } from '@/components/charging-map/InteractiveChargingMapModule';
import { MOCK_REVIEWS } from '@/lib/mock-data';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewHistogram } from '@/components/reviews/ReviewHistogram';
import { ReviewSubmitModal } from '@/components/reviews/ReviewSubmitModal';
import { Review } from '@/types';
import { useAuthStore } from '@/lib/store';

export function ChargingMapView() {
  const { isAuthenticated } = useAuthStore();
  const [selectedCity, setSelectedCity] = useState('Delhi NCR');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState<Review[]>(MOCK_REVIEWS);

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-8 text-slate-900">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            WhyEV Tesla-Style EV Charging Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Real-time crowdsourced charger uptime status & community confidence scores in {selectedCity}.
          </p>
        </div>

        {/* City View Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">City View:</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
          >
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
          </select>
        </div>
      </div>

      {/* Main Tesla-Style EV Charging Station Map Module */}
      <div className="w-full">
        <InteractiveChargingMapModule />
      </div>

      {/* Verified Reviews Section Below Map */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-extrabold border border-emerald-200 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Customer Feedback</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Community Reviews & Charger Inspections
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Submissions require a verified appointment or charging transaction ID.
            </p>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer"
          >
            Write Verified Review
          </button>
        </div>

        {/* Rating Breakdown & Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
            <ReviewHistogram reviews={reviewsList} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            {reviewsList.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      <ReviewSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        targetName="Tata Power EZ Charge (CP Inner Circle)"
        targetType="charging_station"
        targetId="stn-tata-cp"
        verifiedInteractionId="chg-rep-cp-882"
        onReviewSubmitted={(newRev: Review) => setReviewsList([newRev, ...reviewsList])}
      />
    </div>
  );
}
