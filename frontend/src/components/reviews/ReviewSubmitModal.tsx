'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Upload, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/buttons/Button';
import { Review } from '@/types';
import { useAuthStore } from '@/lib/store';

interface ReviewSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetType: 'dealer' | 'charging_station';
  targetId: string;
  verifiedInteractionId: string;
  onReviewSubmitted?: (review: Review) => void;
}

export function ReviewSubmitModal({
  isOpen,
  onClose,
  targetName,
  targetType,
  targetId,
  verifiedInteractionId,
  onReviewSubmitted,
}: ReviewSubmitModalProps) {
  const { user } = useAuthStore();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Simulate photo compression and client preview
      const samplePhotos = [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
      ];
      if (photos.length < 5) {
        setPhotos((prev) => [...prev, samplePhotos[prev.length % samplePhotos.length]]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      const newReview: Review = {
        id: `rev-${Date.now()}`,
        targetType,
        targetId,
        targetName,
        userId: user?.id || 'usr-prateek-2026',
        userName: user?.name || 'Prateek Kumar',
        userCity: user?.city || 'New Delhi',
        rating,
        text: text || 'Great verified visit experience.',
        photos,
        createdAt: new Date().toISOString().split('T')[0],
        verifiedInteractionId,
        status: 'published',
      };

      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900 space-y-6"
        >
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>

          {showSuccess ? (
            /* Calm Success Pattern (250ms scale-in fade with green check circle) */
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="py-10 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Review Verified & Published!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto font-normal">
                Thank you for contributing to WhyEV's verified community network.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Header */}
              <div className="space-y-1 pt-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Interaction Unlocked
                </div>
                <h3 className="text-xl font-bold text-slate-900">Rate Your Visit</h3>
                <p className="text-xs text-slate-500 font-normal truncate">{targetName}</p>
              </div>

              {/* Star Rating Picker */}
              <div className="space-y-2 text-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="text-xs font-bold text-slate-700">Your Rating</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (hoverRating || rating)
                            ? 'text-emerald-500 fill-emerald-500'
                            : 'text-slate-300 fill-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Your Review</label>
                <textarea
                  rows={3}
                  placeholder="Share details about charger availability, showroom staff clarity, or vehicle condition..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-normal focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Photo Upload (max 5) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Attach Photos (Optional, max 5)</label>
                <div className="flex items-center gap-3">
                  <label className="h-14 w-14 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0">
                    <Upload className="w-4 h-4" />
                    <span className="text-[9px] font-bold mt-1">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleSimulatedPhotoUpload} />
                  </label>

                  <div className="flex items-center gap-2 overflow-x-auto">
                    {photos.map((p, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                        <img src={p} alt={`Upload preview ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button size="md" variant="emerald" fullWidth type="submit" isLoading={isSubmitting}>
                  Submit Verified Review
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
