'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Upload, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName?: string;
}

export function LeaveReviewModal({ isOpen, onClose, targetName = 'WhyEV Platform & Experience' }: LeaveReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [vehicle, setVehicle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 text-slate-900"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {isSubmitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Thank You!</h3>
              <p className="text-sm text-slate-500 font-medium">
                Your review has been submitted for moderation and will appear soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
                  <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                  <span>Share Your Experience</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Leave a Review
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Reviewing: <span className="font-bold text-slate-800">{targetName}</span>
                </p>
              </div>

              {/* Star Rating Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-black text-slate-700 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Vehicle Owned (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your EV Model (Optional)
                </label>
                <input
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  placeholder="e.g. Tata Curvv EV, MG Windsor EV..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your driving experience, charging efficiency, running cost savings..."
                  className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none"
                />
              </div>

              {/* Photos Upload Mock */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 text-center transition-colors cursor-pointer bg-slate-50">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-600">Upload photos (optional)</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Submit Review for Moderation</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
