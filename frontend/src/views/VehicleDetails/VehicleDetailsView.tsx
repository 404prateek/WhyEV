'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Heart,
  CheckCircle2,
  Star,
  Phone,
  Calendar,
} from 'lucide-react';
import { MOCK_EMPANELLED_VEHICLES, MOCK_DEALERS } from '@/lib/mock-data';
import { ShortlistCard } from '@/components/recommend/ShortlistCard';
import { CompareModal } from '@/components/recommend/CompareModal';
import { TestDriveModal } from '@/components/dealers/TestDriveModal';
import { EmpanelledVehicle, Dealer } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface VehicleDetailsViewProps {
  vehicleId: string;
}

export function VehicleDetailsView({ vehicleId }: VehicleDetailsViewProps) {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'specs' | 'whyFits' | 'incentives' | 'battery' | 'dealers'
  >('overview');

  const [comparedVehicles, setComparedVehicles] = useState<EmpanelledVehicle[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [selectedDealerForTestDrive, setSelectedDealerForTestDrive] = useState<Dealer | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const vehicle =
    MOCK_EMPANELLED_VEHICLES.find(
      (v) => v.id.toLowerCase() === vehicleId.toLowerCase() || v.model.toLowerCase().includes(vehicleId.toLowerCase())
    ) || MOCK_EMPANELLED_VEHICLES[0];

  const effectivePrice = Math.max(0, vehicle.exShowroomPrice - vehicle.subsidyAmount);
  const similarEvs = MOCK_EMPANELLED_VEHICLES.filter((v) => v.id !== vehicle.id).slice(0, 4);

  const handleToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleProtectedAction = (action: () => void, title: string, subtitle: string) => {
    if (!isAuthenticated) {
      openAuthModal(`/vehicle/${vehicle.id}`, title, subtitle);
      return;
    }
    action();
  };

  const handleToggleCompare = (simVeh: EmpanelledVehicle) => {
    setComparedVehicles((prev) => {
      const exists = prev.some((v) => v.id === simVeh.id);
      if (exists) return prev.filter((v) => v.id !== simVeh.id);
      if (prev.length >= 4) return prev;
      return [...prev, simVeh];
    });
  };

  const scrollToDealersSection = () => {
    setActiveTab('dealers');
    const el = document.getElementById('dealer-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const tabsList = [
    { id: 'overview', label: 'Overview' },
    { id: 'specs', label: 'Specifications' },
    { id: 'whyFits', label: 'Why It Fits You' },
    { id: 'incentives', label: 'Government Incentives' },
    { id: 'battery', label: 'Battery & Charging' },
    { id: 'dealers', label: 'Dealer Information' },
  ] as const;

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-24">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-emerald-300 px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Header Bar: Show ONLY Back to Marketplace Link */}
        <div className="border-b border-slate-100 pb-3">
          <Link
            href="/recommend"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back to Marketplace</span>
          </Link>
        </div>

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Vehicle Picture Only */}
          <div className="lg:col-span-7">
            <div className="relative w-full h-[280px] sm:h-[400px] rounded-3xl bg-slate-950 overflow-hidden shadow-md border border-slate-200">
              <img
                src={vehicle.imageUrl || '/explore/curvv-ev-desktop.png'}
                alt={vehicle.model}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Overview & CTAs */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-1.5">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-700">
                {vehicle.make}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {vehicle.make} {vehicle.model}
              </h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-extrabold whitespace-nowrap">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  <span>4.8 (124 Owner Reviews)</span>
                </span>
                <span className="text-xs text-slate-500 font-medium">• {vehicle.category} EV</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3.5 shadow-2xs">
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ex-Showroom Price</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  ₹{(vehicle.exShowroomPrice / 100000).toFixed(2)} Lakh
                </div>
              </div>

              {/* Highlighted Price & Tax Waiver Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-left">
                <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-emerald-950 whitespace-nowrap">
                  Effective Price Post Subsidies
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-700 tracking-tight">
                  ₹{(effectivePrice / 100000).toFixed(2)} Lakh
                </div>
                <div className="text-[11px] sm:text-xs text-emerald-800 font-bold leading-relaxed pt-0.5">
                  Includes ₹{(vehicle.subsidyAmount / 100000).toFixed(1)}L State & Central Subsidy + 100% Road Tax Waiver applied.
                </div>
              </div>

              {/* HERO CTAs (Single-line mobile phone text) */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={scrollToDealersSection}
                  className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] sm:text-xs whitespace-nowrap transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Connect Dealer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleProtectedAction(
                      () => {
                        setIsSaved(!isSaved);
                        handleToast(!isSaved ? 'Saved vehicle to shortlist!' : 'Removed from saved vehicles.');
                      },
                      'Sign in to Save Vehicles',
                      'Access your saved vehicles across all devices.'
                    );
                  }}
                  className={`py-3 px-3 rounded-2xl border text-[11px] sm:text-xs font-extrabold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSaved
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 shrink-0 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save Vehicle'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
            {tabsList.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT SECTIONS */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">Key Highlights</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Range</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{vehicle.rangeKm} km</div>
                <span className="text-[10px] sm:text-xs text-emerald-700 font-bold">ARAI Certified</span>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Battery</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{vehicle.batteryCapacityKwh} kWh</div>
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold">Liquid Cooled LFP</span>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Charging Time</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{vehicle.chargingTimeHours} Hours</div>
                <span className="text-[10px] sm:text-xs text-emerald-700 font-bold">0-80% DC Fast</span>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Top Speed</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{vehicle.topSpeedKmvh} km/h</div>
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold">Sports Mode</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider">Powertrain & Performance</h4>
                <div className="space-y-2 text-xs font-bold text-slate-700">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-400">Motor Type:</span>
                    <span>Permanent Magnet Synchronous</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-400">Max Power:</span>
                    <span>165 bhp</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-400">Max Torque:</span>
                    <span>215 Nm Instant</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-400">Battery Pack:</span>
                    <span>400V High Voltage LFP</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider">Dimensions & Safety</h4>
                <div className="space-y-2 text-xs font-bold text-slate-700">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-400">Ground Clearance:</span>
                    <span>190 mm</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-400">Boot Space:</span>
                    <span>500 Litres</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-400">Airbags:</span>
                    <span>6 Airbags Standard</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-400">Safety Rating:</span>
                    <span>5 Star Bharat NCAP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'whyFits' && (
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">Why It Fits You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  ✅
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Great for city commuting</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Compact turning radius & single-pedal drive in traffic.</p>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  ⚡
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Excellent fast charging network</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Compatible with over 8,500 public CCS2 fast chargers.</p>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  💰
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Fits your target budget</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Under your price target after state & central subsidies.</p>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  🛡️
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">Eligible for full state subsidy</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Saves up to ₹1,85,000 in total initial acquisition benefits.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'incentives' && (
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">Government Incentives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 sm:p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800">Central Incentive</span>
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-600 text-white text-[11px] sm:text-xs font-black whitespace-nowrap">₹1,50,000</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900">PM E-DRIVE Scheme 2026</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Capital subsidy provided by the Ministry of Heavy Industries, applied directly at dealer ex-showroom billing.
                </p>
                <div className="text-xs font-extrabold text-emerald-900 pt-1">
                  Eligibility: Domestic battery compliance certified.
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800">State Incentive</span>
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-600 text-white text-[11px] sm:text-xs font-black whitespace-nowrap">₹50k + 100% Tax Waiver</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900">Delhi EV Policy 2026</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Grants 100% road tax waiver (~₹45,000 value) and registration fee exemption across all Delhi RTOs.
                </p>
                <div className="text-xs font-extrabold text-emerald-900 pt-1">
                  Eligibility: Delhi RTO registration.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'battery' && (
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">Battery & Charging</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2 text-left">
                <span className="text-[10px] sm:text-[11px] font-black uppercase text-emerald-700 tracking-wider">Battery Capacity</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">{vehicle.batteryCapacityKwh} kWh</div>
                <p className="text-xs text-slate-500 font-medium">Liquid-cooled LFP pack with active thermal management.</p>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2 text-left">
                <span className="text-[10px] sm:text-[11px] font-black uppercase text-emerald-700 tracking-wider">DC Fast Charge</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">40 Mins</div>
                <p className="text-xs text-slate-500 font-medium">10% to 80% charge at 50kW+ public fast chargers.</p>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2 text-left">
                <span className="text-[10px] sm:text-[11px] font-black uppercase text-emerald-700 tracking-wider">AC Home Charger</span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">6.5 Hours</div>
                <p className="text-xs text-slate-500 font-medium">Full charge using 7.2 kW Wallbox AC Charger.</p>
              </div>
            </div>
          </div>
        )}

        {/* DEALER INFORMATION SECTION (Single-line mobile buttons) */}
        <div id="dealer-section" className="space-y-4 pt-2">
          {activeTab === 'dealers' && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Authorized Nearby Dealers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {MOCK_DEALERS.slice(0, 2).map((dealer) => (
                  <div key={dealer.id} className="p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-emerald-700">{dealer.city} Flagship</span>
                      <span className="text-xs font-bold text-slate-500">2.4 km away</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-black text-slate-900">{dealer.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{dealer.address}</p>
                      <div className="text-xs font-extrabold text-slate-700 pt-1">
                        Phone: <span className="text-emerald-700">{dealer.phone}</span>
                      </div>
                    </div>

                    {/* CTAs: Call Dealer BEFORE Book Test Drive (Single-line mobile phone text) */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${dealer.phone.replace(/\s+/g, '')}`}
                        className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] sm:text-xs whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Call ({dealer.phone})</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedDealerForTestDrive(dealer)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] sm:text-xs whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                      >
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Book Test Drive</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIMILAR ELECTRIC VEHICLES */}
        <div className="mt-10 p-5 sm:p-8 rounded-3xl bg-slate-50/70 border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Similar Electric Vehicles</h2>
              <p className="text-xs text-slate-500 font-medium">Explore alternative models in this segment</p>
            </div>
            <Link href="/recommend" className="text-xs font-black text-emerald-700 hover:underline whitespace-nowrap">
              Browse Catalogue →
            </Link>
          </div>

          <div className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar gap-4 sm:gap-5 w-full py-2">
            {similarEvs.map((simVeh) => {
              const isCompared = comparedVehicles.some((v) => v.id === simVeh.id);
              return (
                <div key={simVeh.id} className="snap-start shrink-0 w-[85%] sm:w-[45%] lg:w-[30%]">
                  <ShortlistCard
                    vehicle={simVeh}
                    onCompare={handleToggleCompare}
                    isCompared={isCompared}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Test Drive Booking Modal */}
      <TestDriveModal
        dealer={selectedDealerForTestDrive}
        onClose={() => setSelectedDealerForTestDrive(null)}
      />

      {/* Floating Compare Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        vehicles={comparedVehicles}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveVehicle={(id) => setComparedVehicles((prev) => prev.filter((v) => v.id !== id))}
      />
    </div>
  );
}
