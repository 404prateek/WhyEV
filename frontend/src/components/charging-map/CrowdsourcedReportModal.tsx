'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, AlertOctagon, Sparkles, Heart } from 'lucide-react';
import { StationStatusType } from './StatusBadge';

interface CrowdsourcedReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  stationId: string;
  onReportSubmitted: (status: StationStatusType, note?: string) => void;
}

export function CrowdsourcedReportModal({
  isOpen,
  onClose,
  stationName,
  stationId,
  onReportSubmitted,
}: CrowdsourcedReportModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<StationStatusType>('working');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO(charging-integration): Local-only optimistic update retained — missing:
    //   station_checkin DB table (no migration exists),
    //   POST /api/v1/charging/checkins endpoint,
    //   app/schemas/charging.py CheckinCreateIn / CheckinOut Pydantic schemas,
    //   app/services/charging_service.py create_checkin() business logic,
    //   Bayesian occupancy aggregation service, integration tests.
    // Expected API: POST /api/v1/charging/checkins
    // Expected DB table(s): station_checkin, station_health
    // Until all six conditions are met: report is applied as a local optimistic state update only
    // and is NOT persisted to any database.
    onReportSubmitted(selectedStatus, note);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setNote('');
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 relative overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {isSubmitted ? (
            /* Positive Feedback Screen */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Heart className="w-8 h-8 fill-emerald-600 text-emerald-600 animate-bounce" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Thank You!</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed font-normal">
                Your report for <span className="text-emerald-700 font-bold">{stationName}</span> has been published. You're helping nearby EV drivers make better decisions.
              </p>
            </div>
          ) : (
            /* Report Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                  <span>Crowdsourced Community Check</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Report Status for {stationName}
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Select current operational status. Takes less than 10 seconds.
                </p>
              </div>

              {/* Status 1-Tap Option Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Current Station Status:</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('working')}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      selectedStatus === 'working'
                        ? 'bg-emerald-600 text-white font-extrabold border-emerald-600 shadow-md scale-102'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs font-bold">Working</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('busy')}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      selectedStatus === 'busy'
                        ? 'bg-amber-500 text-slate-950 font-extrabold border-amber-500 shadow-md scale-102'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                    <span className="text-xs font-bold">Occupied</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('broken')}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      selectedStatus === 'broken'
                        ? 'bg-rose-600 text-white font-extrabold border-rose-600 shadow-md scale-102'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <AlertOctagon className="w-5 h-5" />
                    <span className="text-xs font-bold">Broken</span>
                  </button>
                </div>
              </div>

              {/* Optional Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Optional Driver Note:</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., 'Only Gun #1 working' or 'Long queue of cabs'"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer"
              >
                Submit Community Report
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
