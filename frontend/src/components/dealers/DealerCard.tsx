'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Star,
  MapPin,
  ShieldCheck,
  Tag,
  Calendar,
  CheckCircle2,
  Phone,
  Clock,
  Car,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import { Dealer } from '@/types';

interface DealerCardProps {
  dealer: Dealer;
  onBookTestDrive: (dealer: Dealer) => void;
  onViewDealer: (dealer: Dealer) => void;
}

export function DealerCard({ dealer, onBookTestDrive, onViewDealer }: DealerCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const mockServices = [
    'Test Drives',
    'Financing',
    'Trade-In',
    'Battery Inspection',
    'Delivery Support',
  ];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group text-left"
    >
      {/* Dealer Image Header & Badges */}
      <div className="relative w-full h-44 bg-slate-950 overflow-hidden">
        <img
          src={dealer.imageUrl || '/explore/curvv-ev-desktop.png'}
          alt={dealer.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Verified Dealer Badge */}
        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 fill-white shrink-0" />
          <span>✔ Verified Dealer</span>
        </div>

        {/* Distance Badge */}
        <div className="absolute bottom-3 left-4 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-full border border-slate-800 flex items-center gap-1 shrink-0">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span>{dealer.distanceKm} km away</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Dealer Name & Location */}
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
              {dealer.name}
            </h3>
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{dealer.locality}</span>
              <span>•</span>
              <span>{dealer.city}</span>
            </div>
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
              <span>{dealer.rating}</span>
            </div>
            <span className="text-xs text-slate-500 font-semibold">({dealer.reviewCount} Reviews)</span>
          </div>

          {/* Compact Brand Chips */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
              Supported Brands
            </span>
            <div className="flex flex-wrap gap-1.5">
              {dealer.empanelledModels.map((brand, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-extrabold"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>

          {/* Available Services Pills */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
              Available Services
            </span>
            <div className="flex flex-wrap gap-1.5">
              {mockServices.map((service, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-bold"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons (Aligned on Phone View) */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => onBookTestDrive(dealer)}
            className="py-2.5 px-2 sm:px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] sm:text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Book Test Drive</span>
          </button>

          <button
            onClick={() => onViewDealer(dealer)}
            className="py-2.5 px-2 sm:px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] sm:text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>View Dealer</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* Desktop Hover Summary Overlay Panel */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="hidden lg:flex absolute inset-0 bg-slate-950/92 backdrop-blur-xl text-white p-6 flex-col justify-between z-30"
          >
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">
                    Verified Dealership
                  </span>
                  <h4 className="text-base font-black text-white">{dealer.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 shrink-0" />
                    {dealer.rating}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">({dealer.reviewCount} Reviews)</span>
                </div>
              </div>

              {/* Highlights Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Experience</div>
                  <div className="font-extrabold text-white">8+ Years Operating</div>
                </div>

                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Verified Deliveries</div>
                  <div className="font-extrabold text-white">1,250+ EV Deliveries</div>
                </div>

                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Avg Response Time</div>
                  <div className="font-extrabold text-emerald-400">Responds within 25 mins</div>
                </div>

                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Test Drive Slots</div>
                  <div className="font-extrabold text-emerald-400">3 Slots Open Today</div>
                </div>
              </div>

              {/* Current Offers Tag */}
              {dealer.exclusiveOffer && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-[11px] text-emerald-300 font-bold flex items-start gap-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{dealer.exclusiveOffer}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onBookTestDrive(dealer)}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all cursor-pointer text-center"
              >
                Book Test Drive
              </button>
              <button
                onClick={() => onViewDealer(dealer)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition-all cursor-pointer text-center"
              >
                View Dealer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
