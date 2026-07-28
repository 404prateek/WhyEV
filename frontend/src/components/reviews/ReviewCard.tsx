'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, ShieldCheck, Flag } from 'lucide-react';
import { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  compact?: boolean;
}

export function ReviewCard({ review, compact = false }: ReviewCardProps) {
  const [flagged, setFlagged] = useState(review.status === 'flagged');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleFlag = () => {
    setFlagged(!flagged);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className={`bg-white border border-slate-200/90 rounded-3xl ${compact ? 'p-5' : 'p-6 sm:p-7'} shadow-sm space-y-4 relative group`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center border border-emerald-200 shrink-0">
            {getInitials(review.userName)}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 leading-snug">{review.userName}</div>
            <div className="text-[11px] text-slate-500 font-normal">{review.userCity}</div>
          </div>
        </div>

        {/* Rating Stars & Date */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < review.rating ? 'text-emerald-500 fill-emerald-500' : 'text-slate-200 fill-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-normal">{review.createdAt}</span>
        </div>
      </div>

      {/* Verified Visit Badge */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Verified Visit</span>
        </div>

        {/* Report / Flag button with screen-reader label */}
        <button
          onClick={handleFlag}
          aria-label="Report review"
          title="Report review"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            flagged ? 'text-rose-600 bg-rose-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Review Text */}
      <p className={`text-slate-700 leading-relaxed font-normal ${compact ? 'text-xs line-clamp-3' : 'text-xs sm:text-sm'}`}>
        "{review.text}"
      </p>

      {/* Photos Thumbnail Grid */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {review.photos.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPhoto(imgUrl)}
              className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Image src={imgUrl} alt={`Review photo ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Photo Enlarge Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-lg w-full h-80 rounded-3xl overflow-hidden bg-slate-900 border border-slate-700">
            <Image src={selectedPhoto} alt="Review photo full" fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
