'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Navigation,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Coffee,
  Wifi,
  Car,
  Utensils,
  Sparkles,
} from 'lucide-react';
import { StationData } from './PreviewPanel';
import { StatusBadge } from './StatusBadge';
import { TrustBadge } from './TrustBadge';
import { ConnectorIcons } from './ConnectorIcons';
import { MOCK_REVIEWS } from '@/lib/mock-data';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { ReviewHistogram } from '@/components/reviews/ReviewHistogram';
import { ReviewSubmitModal } from '@/components/reviews/ReviewSubmitModal';
import { Review } from '@/types';

interface StationDetailPanelProps {
  station: StationData | null;
  onClose: () => void;
  onOpenReportModal: (stn: StationData) => void;
}

export function StationDetailPanel({
  station,
  onClose,
  onOpenReportModal,
}: StationDetailPanelProps) {
  // TODO(charging-integration): MOCK_REVIEWS retained — missing: station_review DB table
  // (no migration exists), GET /api/v1/charging/stations/{id}/reviews endpoint,
  // app/schemas/charging.py StationReviewOut Pydantic schema,
  // app/services/charging_service.py get_station_reviews() function, integration tests.
  // Expected API: GET /api/v1/charging/stations/{id}/reviews
  // Expected DB table(s): station_review
  const [reviewsList, setReviewsList] = useState<Review[]>(MOCK_REVIEWS);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  if (!station) return null;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;

  const getAmenityIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'cafe':
        return Coffee;
      case 'wifi':
        return Wifi;
      case 'parking':
        return Car;
      case 'food court':
      case 'food':
        return Utensils;
      default:
        return Sparkles;
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/40 backdrop-blur-md">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-xl h-full bg-white border-l border-slate-200/90 shadow-2xl text-slate-900 flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                    {station.operator}
                  </span>
                  <StatusBadge status={station.status} size="sm" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{station.name}</h2>
                <p className="text-xs text-slate-500 font-normal">{station.address}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Trust & Confidence Badge */}
              <TrustBadge
                confidencePct={station.confidencePct}
                reportCount={station.reportCount}
                lastVerifiedMinutesAgo={station.lastVerifiedMinutesAgo}
              />

              {/* Connectors & Ports Breakdown */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Connector Ports Breakdown
                </h4>
                <ConnectorIcons
                  connectors={station.connectors}
                  isFast={station.isFast}
                  maxPowerKw={station.maxPowerKw}
                />
              </div>

              {/* Live Status History Timeline */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Live Status History Timeline
                  </h4>
                  <button
                    onClick={() => onOpenReportModal(station)}
                    className="text-[11px] font-extrabold text-emerald-700 hover:underline cursor-pointer"
                  >
                    + Add Driver Report
                  </button>
                </div>

                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {station.timeline.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 relative z-10">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          item.status === 'working'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : item.status === 'busy'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-700 border border-rose-300'
                        }`}
                      >
                        {item.status === 'working' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : item.status === 'busy' ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <AlertOctagon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900">
                          {item.status === 'working'
                            ? 'Verified Working'
                            : item.status === 'busy'
                            ? 'Occupied / Busy'
                            : 'Reported Broken'}
                          <span className="text-slate-500 font-normal text-[11px] ml-2">
                            • {item.timeAgo}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          Reporter: {item.reporterType}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities Grid */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Available Amenities
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {station.amenities.map((item, idx) => {
                    const Icon = getAmenityIcon(item);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-2 text-slate-700 font-semibold"
                      >
                        <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Driver Uploaded Photos */}
              {station.photos.length > 0 && (
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Customer & Driver Uploaded Photos
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {station.photos.map((url, idx) => (
                      <div key={idx} className="relative h-28 rounded-2xl overflow-hidden border border-slate-200">
                        <img src={url} alt={`Station photo ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INTEGRATED COMMUNITY REVIEWS & RATINGS */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Verified Community Reviews
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">Ratings & Uptime feedback</p>
                  </div>

                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] transition-all cursor-pointer shadow-2xs"
                  >
                    Write Review
                  </button>
                </div>

                <ReviewHistogram reviews={reviewsList} />

                <div className="space-y-3 pt-2">
                  {reviewsList.map((rev) => (
                    <ReviewCard key={rev.id} review={rev} />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer CTAs (Matching homepage button styling) */}
            <div className="p-5 border-t border-slate-100 bg-white space-y-2.5">
              <button
                type="button"
                onClick={() => onOpenReportModal(station)}
                className="w-full py-3 px-4 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>Update Station Status</span>
              </button>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Navigation className="w-4 h-4 fill-white shrink-0" />
                <span>Open in Google Maps / Apple Maps</span>
              </a>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Write Review Modal */}
      <ReviewSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        targetName={station.name}
        targetType="charging_station"
        targetId={station.id}
        verifiedInteractionId={`chg-rep-${station.id}`}
        onReviewSubmitted={(newRev: Review) => setReviewsList([newRev, ...reviewsList])}
      />
    </>
  );
}
