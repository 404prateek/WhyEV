'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react';

interface OwnerReview {
  id: string;
  name: string;
  city: string;
  vehicle: string;
  duration: string;
  rating: number;
  avatar: string;
  review: string;
}

const REVIEWS_DATA: OwnerReview[] = [
  {
    id: '1',
    name: 'Rohan Sharma',
    city: 'New Delhi',
    vehicle: 'Tata Curvv EV',
    duration: 'Driving for 8 months',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    review: 'Switching to Curvv EV cut my monthly fuel expenses from ₹14,000 to under ₹1,800. The Delhi EV policy subsidy process was smooth through WhyEV!',
  },
  {
    id: '2',
    name: 'Priya Nair',
    city: 'Bengaluru',
    vehicle: 'MG Windsor EV',
    duration: 'Driving for 5 months',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    review: 'Silent ride, instant torque, and zero tailpipe emissions. WhyEV helped me compare variants and find a verified showroom within 10 minutes.',
  },
  {
    id: '3',
    name: 'Anish Verma',
    city: 'Mumbai',
    vehicle: 'Mahindra BE 6',
    duration: 'Driving for 1 year',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    review: 'The charging station network in Maharashtra is expanding rapidly. Never had range anxiety on highways thanks to 60kW fast chargers.',
  },
  {
    id: '4',
    name: 'Kavita Menon',
    city: 'Chennai',
    vehicle: 'Hyundai Creta Electric',
    duration: 'Driving for 4 months',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    review: 'The total cost of ownership breakdown on WhyEV was 100% accurate. My family loves the spacious cabin and seamless home charging.',
  },
];

export function OwnerReviewsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToCard = (index: number) => {
    setActiveIndex(index);
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.firstElementChild?.clientWidth || 360;
      const gap = 24;
      container.scrollTo({
        left: index * (cardWidth + gap),
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="w-full bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Hear From EV Owners
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl">
              Real experiences from people who have already switched to electric.
            </p>
          </div>

          {/* Desktop Carousel Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scrollToCard(Math.max(0, activeIndex - 1))}
              className="p-3 rounded-full bg-slate-100 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollToCard(Math.min(REVIEWS_DATA.length - 1, activeIndex + 1))}
              className="p-3 rounded-full bg-slate-100 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* REVIEWS CAROUSEL CONTAINER */}
        <div
          ref={scrollContainerRef}
          className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar gap-6 w-full py-2"
        >
          {REVIEWS_DATA.map((rev, idx) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="snap-start shrink-0 w-[85%] sm:w-[45%] lg:w-[31.5%] rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Top Row: User Avatar & 5 Stars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
                    />
                    <div>
                      <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <span>{rev.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                      </div>
                      <div className="text-xs text-slate-400 font-semibold">
                        {rev.city} · {rev.vehicle}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stars Rating & Duration Badge */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold">
                    {rev.duration}
                  </span>
                </div>

                {/* Short Review Text */}
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed italic">
                  "{rev.review}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Pagination Indicator Dots */}
        <div className="flex items-center justify-center gap-2 pt-2 md:hidden">
          {REVIEWS_DATA.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToCard(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === activeIndex ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
