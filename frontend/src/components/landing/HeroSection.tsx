'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Landmark, Zap, CheckCircle2, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroSearchBar } from './HeroSearchBar';

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const heroSlides = [
    {
      id: 1,
      image: '/hero-ev-car.png',
      headline: 'Find Your EV',
      subheading: 'Discover, compare, and choose the right electric car for your lifestyle.',
      ctaLabel: 'Explore EVs',
      ctaLink: '/recommend',
      icon: Sparkles,
      desktopAlign: 'left',
      mobileBgPos: '86% 62%',
      mobileOverlay: 'h-[68%] bg-gradient-to-b from-slate-950/85 via-slate-950/65 to-transparent',
    },
    {
      id: 2,
      image: '/hero-slide-2.png',
      headline: 'Know Your Savings',
      subheading: 'See every government incentive, tax benefit, waiver, and eligible offer before you buy your EV.',
      ctaLabel: 'View Savings',
      ctaLink: '/recommend',
      icon: Landmark,
      desktopAlign: 'right',
      mobileBgPos: 'center center',
      mobileOverlay: 'h-[68%] bg-gradient-to-b from-slate-950/85 via-slate-950/65 to-transparent',
    },
    {
      id: 3,
      image: '/hero-slide-3.jpg',
      headline: 'Charge with Confidence',
      subheading: 'Locate charging stations across India and plan every journey with confidence.',
      ctaLabel: 'Explore Charging Map',
      ctaLink: '/map',
      icon: Zap,
      desktopAlign: 'center',
      mobileBgPos: '35% center',
      mobileOverlay: 'h-[75%] bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-transparent',
    },
  ];

  const categoryChips = [
    { label: 'Under ₹15 Lakh', query: 'under 15 lakh' },
    { label: '400+ km Range', query: '400 km' },
    { label: 'Max Subsidy Savings', query: 'subsidy' },
    { label: 'Family Electric SUVs', query: 'SUV' },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  // 5.5-Second Auto-Rotation Timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const activeSlideData = heroSlides[currentSlide];

  // Helper classes for desktop alignment
  const getContainerAlignClass = (align: string) => {
    if (align === 'right') return 'md:items-end md:text-right md:ml-auto';
    if (align === 'center') return 'md:items-center md:text-center md:mx-auto';
    return 'md:items-start md:text-left md:mr-auto';
  };

  const getHeadingAlignClass = (align: string) => {
    if (align === 'right') return 'text-center md:text-right';
    if (align === 'center') return 'text-center md:text-center';
    return 'text-center md:text-left';
  };

  const getButtonJustifyClass = (align: string) => {
    if (align === 'right') return 'justify-center md:justify-end';
    if (align === 'center') return 'justify-center md:justify-center';
    return 'justify-center md:justify-start';
  };

  return (
    <section id="home" className="w-full bg-white space-y-6 sm:space-y-8">
      {/* 1. Responsive Multi-Slide Hero Carousel Banner (True Simultaneous Cross-Fade) */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="relative w-full h-[62vh] md:h-[82vh] min-h-[420px] md:min-h-[520px] max-h-[750px] overflow-hidden bg-slate-950 select-none"
      >
        {/* SLIDE BACKGROUND LAYERS (Simultaneous Cross-Fade: Zero Blank Frames or Flashes) */}
        {heroSlides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <motion.div
              key={slide.id}
              initial={false}
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {/* DESKTOP BACKGROUND IMAGE */}
              <img
                src={slide.image}
                alt={slide.headline}
                className="hidden md:block w-full h-full object-cover object-center"
              />

              {/* MOBILE BACKGROUND IMAGE */}
              <div
                className="md:hidden absolute inset-0 bg-no-repeat"
                style={{
                  backgroundImage: `url('${slide.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: slide.mobileBgPos,
                }}
              />

              {/* Desktop Overlay per Slide Position */}
              {slide.desktopAlign === 'left' && (
                <div className="hidden md:block absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-slate-950/95 via-slate-950/65 to-transparent" />
              )}
              {slide.desktopAlign === 'right' && (
                <div className="hidden md:block absolute inset-y-0 right-0 w-3/5 bg-gradient-to-l from-slate-950/95 via-slate-950/65 to-transparent" />
              )}
              {slide.desktopAlign === 'center' && (
                <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/45 to-slate-950/80" />
              )}

              {/* Mobile Top Text Gradient Overlay (Per-slide customized dark gradient) */}
              <div className={`md:hidden absolute top-0 inset-x-0 ${slide.mobileOverlay}`} />
            </motion.div>
          );
        })}

        {/* Hero Slide Content Layer */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex flex-col items-center justify-start md:justify-center pt-36 sm:pt-40 md:pt-0 z-10 pointer-events-none">
          {heroSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            if (!isActive) return null;

            const IconComponent = slide.icon;

            return (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`max-w-xl space-y-3 md:space-y-4 flex flex-col items-center pointer-events-auto ${getContainerAlignClass(slide.desktopAlign)}`}
              >
                {/* Headline */}
                <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md ${getHeadingAlignClass(slide.desktopAlign)}`}>
                  {slide.headline}
                </h1>

                {/* Subheading */}
                <p className={`text-xs sm:text-base lg:text-lg text-slate-200 font-medium leading-relaxed max-w-xs sm:max-w-lg drop-shadow-xs ${getHeadingAlignClass(slide.desktopAlign)}`}>
                  {slide.subheading}
                </p>

                {/* Primary Button */}
                <div className={`pt-1.5 sm:pt-4 flex w-full ${getButtonJustifyClass(slide.desktopAlign)}`}>
                  <Link
                    href={slide.ctaLink}
                    className="h-[44px] sm:h-[52px] px-6 sm:px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-emerald-900/30 hover:shadow-2xl flex items-center justify-center gap-2 sm:gap-2.5 w-fit cursor-pointer"
                  >
                    <IconComponent className="w-4 h-4 fill-white" />
                    <span>{slide.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop Left/Right Navigation Arrow Controls */}
        <div className="hidden md:flex absolute inset-y-0 right-6 items-center gap-2 z-20 pointer-events-none">
          <button
            onClick={prevSlide}
            className="p-2.5 rounded-full bg-slate-950/40 hover:bg-slate-950/70 border border-white/20 text-white backdrop-blur-md transition-all cursor-pointer pointer-events-auto hover:scale-110"
            title="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2.5 rounded-full bg-slate-950/40 hover:bg-slate-950/70 border border-white/20 text-white backdrop-blur-md transition-all cursor-pointer pointer-events-auto hover:scale-110"
            title="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Circular Carousel Indicator Dots (Centered beneath hero) */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {heroSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className="p-1 cursor-pointer focus:outline-none"
                title={`Go to slide ${idx + 1}`}
              >
                {isActive ? (
                  <motion.div
                    layoutId="activeHeroDot"
                    className="w-7 h-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/40"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40 hover:bg-white/80 transition-colors" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Marketplace EV Search */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <HeroSearchBar />
      </div>
    </section>
  );
}
