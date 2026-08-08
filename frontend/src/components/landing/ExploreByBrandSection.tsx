'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface BrandCardData {
  id: string;
  brand: string;
  vehicleName: string;
  price: string;
  desktopImage: string;
  mobileImage?: string;
}

const BRAND_CARDS: BrandCardData[] = [
  {
    id: 'tata-curvv-ev',
    brand: 'Tata Motors',
    vehicleName: 'Tata Curvv EV',
    price: 'Starting from ₹17.49 Lakh',
    desktopImage: '/explore/curvv-ev-desktop.png',
    mobileImage: '/explore/curvv-ev-mobile.png',
  },
  {
    id: 'mahindra-be6',
    brand: 'Mahindra',
    vehicleName: 'Mahindra BE 6',
    price: 'Starting from ₹18.90 Lakh',
    desktopImage: '/explore/be6-desktop.png',
  },
  {
    id: 'mg-windsor-ev',
    brand: 'MG Motor',
    vehicleName: 'MG Windsor EV',
    price: 'Starting from ₹13.50 Lakh',
    desktopImage: '/explore/windsor-desktop.png',
  },
  {
    id: 'hyundai-creta-electric',
    brand: 'Hyundai',
    vehicleName: 'Hyundai Creta Electric',
    price: 'Starting from ₹17.99 Lakh',
    desktopImage: '/explore/creta-desktop.png',
  },
  {
    id: 'tesla-model-y',
    brand: 'Tesla',
    vehicleName: 'Tesla Model Y',
    price: 'Starting from ₹50.00 Lakh',
    desktopImage: '/hero-slide-2.png',
  },
  {
    id: 'byd-seal',
    brand: 'BYD',
    vehicleName: 'BYD Seal',
    price: 'Starting from ₹41.00 Lakh',
    desktopImage: '/hero-slide-3.jpg',
  },
  {
    id: 'bmw-i4',
    brand: 'BMW',
    vehicleName: 'BMW i4',
    price: 'Starting from ₹72.50 Lakh',
    desktopImage: '/hero-slide-3.jpg',
  },
];

export function ExploreByBrandSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToCard = useCallback((index: number) => {
    setActiveIndex(index);
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.firstElementChild?.clientWidth || 600;
      const gap = 24;
      container.scrollTo({
        left: index * (cardWidth + gap),
        behavior: 'smooth',
      });
    }
  }, []);

  const nextCard = useCallback(() => {
    const nextIdx = (activeIndex + 1) % BRAND_CARDS.length;
    scrollToCard(nextIdx);
  }, [activeIndex, scrollToCard]);

  const prevCard = useCallback(() => {
    const prevIdx = (activeIndex - 1 + BRAND_CARDS.length) % BRAND_CARDS.length;
    scrollToCard(prevIdx);
  }, [activeIndex, scrollToCard]);

  // 6-Second Auto-Scroll Timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextCard();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextCard]);

  return (
    <section className="w-full bg-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Explore by Brand
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl">
              Discover India's leading electric vehicles from trusted manufacturers.
            </p>
          </div>

          {/* Controls Arrow Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={prevCard}
              className="p-3.5 rounded-full bg-slate-100 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 transition-all cursor-pointer hover:scale-105"
              title="Previous Brand"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextCard}
              className="p-3.5 rounded-full bg-slate-100 hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-700 transition-all cursor-pointer hover:scale-105"
              title="Next Brand"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FEATURED BRAND SNAP CAROUSEL */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="space-y-6"
        >
          <div
            ref={scrollContainerRef}
            onScroll={() => {
              if (scrollContainerRef.current) {
                const container = scrollContainerRef.current;
                const cardWidth = container.firstElementChild?.clientWidth || 600;
                const gap = 24;
                const index = Math.round(container.scrollLeft / (cardWidth + gap));
                if (index !== activeIndex && index >= 0 && index < BRAND_CARDS.length) {
                  setActiveIndex(index);
                }
              }
            }}
            className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar gap-5 sm:gap-8 w-full py-2 cursor-grab active:cursor-grabbing"
          >
            {BRAND_CARDS.map((card, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={card.id}
                  onClick={() => scrollToCard(idx)}
                  className={`snap-start shrink-0 w-[88%] md:w-[82%] lg:w-[84%] relative h-[480px] sm:h-[540px] lg:h-[580px] rounded-[24px] overflow-hidden border transition-all duration-500 bg-slate-950 shadow-xl hover:shadow-2xl flex flex-col justify-between p-6 sm:p-10 select-none ${
                    isActive
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-[1.005]'
                      : 'border-slate-800 opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Vehicle Background Image */}
                  <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                    <img
                      src={card.desktopImage}
                      alt={card.vehicleName}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  </div>

                  {/* Top Left: Brand Name */}
                  <div className="relative z-10 text-left">
                    <span className="text-xs sm:text-sm font-bold text-white tracking-widest uppercase drop-shadow-md">
                      {card.brand}
                    </span>
                  </div>

                  {/* Bottom Left: Vehicle Name & View Details CTA */}
                  <div className="relative z-10 space-y-4 sm:space-y-6 pt-16 text-left">
                    <div className="space-y-1">
                      <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                        {card.vehicleName}
                      </h3>
                      <p className="text-sm sm:text-lg font-extrabold text-emerald-400 drop-shadow-md">
                        {card.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Link
                        href={`/vehicle/${card.id}`}
                        className="h-[48px] px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm transition-all shadow-xl shadow-emerald-900/30 hover:shadow-2xl flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Indicator Dots */}
          <div className="flex items-center justify-center gap-2.5 pt-2">
            {BRAND_CARDS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToCard(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === activeIndex
                    ? 'w-8 bg-emerald-600 shadow-md shadow-emerald-600/40'
                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Go to brand ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
