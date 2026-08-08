'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Calendar,
  Navigation,
  ThumbsUp,
  CheckCircle2,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Dealer } from '@/types';

interface DealerDetailsModalProps {
  dealer: Dealer | null;
  isOpen: boolean;
  onClose: () => void;
  onBookTestDrive: (dealer: Dealer) => void;
}

interface Review {
  id: string;
  customerName: string;
  customerPhoto?: string;
  rating: number;
  date: string;
  isVerified: boolean;
  text: string;
  helpfulCount: number;
  images?: string[];
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    customerName: 'Rahul Verma',
    rating: 5,
    date: '24 July 2026',
    isVerified: true,
    text: 'Seamless purchase experience for my Tata Nexon EV! The sales team assisted with the Delhi EV policy registration and installed the Wallbox charger at my home within 24 hours.',
    helpfulCount: 42,
  },
  {
    id: 'rev-2',
    customerName: 'Priya Sharma',
    rating: 5,
    date: '12 July 2026',
    isVerified: true,
    text: 'Highly professional staff. Provided a comprehensive test drive covering both highway and city traffic. Transparency regarding subsidies and zero hidden charges.',
    helpfulCount: 29,
  },
  {
    id: 'rev-3',
    customerName: 'Amit Patel',
    rating: 4,
    date: '02 June 2026',
    isVerified: true,
    text: 'Good dealership with fast DC charging stations on site. Showroom staff guided me through the PM E-DRIVE central scheme documentation.',
    helpfulCount: 18,
  },
];

export function DealerDetailsModal({
  dealer,
  isOpen,
  onClose,
  onBookTestDrive,
}: DealerDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'reviews'>('overview');
  const [reviewSort, setReviewSort] = useState<'helpful' | 'newest' | 'highest' | 'lowest'>('helpful');
  const [callbackRequested, setCallbackRequested] = useState(false);

  if (!isOpen || !dealer) return null;

  const sortedReviews = [...MOCK_REVIEWS].sort((a, b) => {
    if (reviewSort === 'helpful') return b.helpfulCount - a.helpfulCount;
    if (reviewSort === 'highest') return b.rating - a.rating;
    if (reviewSort === 'lowest') return a.rating - b.rating;
    return b.id.localeCompare(a.id);
  });

  const handleRequestCallback = () => {
    setCallbackRequested(true);
    setTimeout(() => setCallbackRequested(false), 3500);
  };

  const handleGetDirections = () => {
    if (typeof window !== 'undefined') {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(dealer.name + ' ' + dealer.locality)}`, '_blank');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-6 overflow-y-auto text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-8 space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto"
        >
          {/* Circular Close Button (Never overlaps title) */}
          <button
            onClick={onClose}
            aria-label="Close Dealer Details Modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold flex items-center justify-center transition-colors cursor-pointer z-20 shrink-0"
          >
            <X className="w-4 h-4 shrink-0 text-slate-700" />
          </button>

          {/* Toast Notification */}
          {callbackRequested && (
            <div className="fixed top-20 right-4 z-50 bg-slate-900 text-emerald-400 px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Callback requested! Dealer representative will call you shortly.</span>
            </div>
          )}

          {/* Header & Dealership Banner */}
          <div className="space-y-4 border-b border-slate-100 pb-6 pr-10 sm:pr-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>✔ Verified Dealership Partner</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {dealer.name}
                </h2>
                <div className="text-xs text-slate-500 font-bold flex items-center gap-2 flex-wrap">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{dealer.locality}, {dealer.city}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-amber-600 font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-500 shrink-0" />
                    <span>{dealer.rating} ({dealer.reviewCount} Reviews)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center gap-2 flex-wrap shrink-0 pt-1 sm:pt-0">
                <button
                  onClick={() => onBookTestDrive(dealer)}
                  className="px-4 sm:px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Book Test Drive</span>
                </button>
                <button
                  onClick={handleRequestCallback}
                  className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>Request Callback</span>
                </button>
                <button
                  onClick={handleGetDirections}
                  className="px-3.5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer border border-slate-200 shrink-0"
                  title="Get Directions"
                >
                  <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
                </button>
              </div>
            </div>

            {/* Photo Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 h-44 sm:h-56">
              <div className="sm:col-span-2 rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={dealer.imageUrl || '/explore/curvv-ev-desktop.png'}
                  alt={dealer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:grid grid-rows-2 gap-3">
                <div className="rounded-2xl overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80"
                    alt="Showroom Lounge"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80"
                    alt="Fast Charger Bay"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Navigation Tabs (Scrollable on Mobile) */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview & Facilities' },
              { id: 'inventory', label: 'Inventory & Subsidies' },
              { id: 'reviews', label: `Reviews (${dealer.reviewCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & FACILITIES */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Brands Carried */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Brands Carried</h4>
                <div className="flex flex-wrap gap-2">
                  {dealer.empanelledModels.map((brand, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-extrabold"
                    >
                      {brand} Authorized
                    </span>
                  ))}
                </div>
              </div>

              {/* Showroom Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Business Hours</span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900">Mon - Sun: 09:30 AM - 08:00 PM (Open Today)</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Certified Facilities</span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900">50kW DC Fast Charger, Customer Lounge, Test Drive Hub</div>
                </div>
              </div>

              {/* Google Maps Preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Location Preview</h4>
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-200">{dealer.name}</div>
                    <div className="text-[11px] text-slate-400">{dealer.locality}, {dealer.city} NCR</div>
                  </div>
                  <button
                    onClick={handleGetDirections}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Open Maps</span>
                    <Navigation className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY & SUBSIDIES */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Government Incentive Assistance Available</span>
                </div>
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  This dealership provides instant RTO road tax exemption filing and PM E-DRIVE central subsidy claim support.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">In-Stock Empanelled Vehicles</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Tata Nexon EV Max', 'Tata Curvv EV', 'MG ZS EV Excite', 'Mahindra XUV400'].map((model, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900">{model}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold shrink-0">In Stock</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS SECTION */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Review Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="text-xs font-black text-slate-900">
                  Showing {sortedReviews.length} Verified Customer Reviews
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Sort by:</span>
                  <select
                    value={reviewSort}
                    onChange={(e) => setReviewSort(e.target.value as any)}
                    className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-extrabold text-slate-800 focus:outline-none"
                  >
                    <option value="helpful">Most Helpful</option>
                    <option value="newest">Newest</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {sortedReviews.map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                          {rev.customerName[0]}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900">{rev.customerName}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{rev.date}</div>
                        </div>
                      </div>

                      {rev.isVerified && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold shrink-0">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500 shrink-0" />
                      ))}
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      "{rev.text}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <button className="flex items-center gap-1 hover:text-emerald-700 font-bold cursor-pointer">
                        <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
                        <span>Helpful ({rev.helpfulCount})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
