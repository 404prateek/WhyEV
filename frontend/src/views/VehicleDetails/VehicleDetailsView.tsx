'use client';

import React, { useState, useEffect } from 'react';
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
  Zap,
  Battery,
  ShieldCheck,
  Award,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { VehicleService } from '@/services/vehicleService';
import { subsidyApi } from '@/lib/api';
import { resolveVehicleImage } from '@/lib/utils/imageResolver';
import { formatLakh } from '@/lib/utils';
import { ShortlistCard } from '@/components/recommend/ShortlistCard';
import { CompareModal } from '@/components/recommend/CompareModal';
import { EmpanelledVehicle, Dealer } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface VehicleDetailsViewProps {
  vehicleId: string;
}

export function VehicleDetailsView({ vehicleId }: VehicleDetailsViewProps) {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [vehicle, setVehicle] = useState<EmpanelledVehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [similarEvs, setSimilarEvs] = useState<EmpanelledVehicle[]>([]);

  // Variant Selector State
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);

  // Live Subsidy Breakdown State
  const [subsidyBreakdown, setSubsidyBreakdown] = useState<{
    purchaseIncentive: number;
    scrappageBonus: number;
    roadTaxWaiverEstimated: number;
    totalBenefit: number;
    eligible: boolean;
    loading: boolean;
  }>({
    purchaseIncentive: 0,
    scrappageBonus: 0,
    roadTaxWaiverEstimated: 0,
    totalBenefit: 0,
    eligible: true,
    loading: false,
  });

  const [isSaved, setIsSaved] = useState(false);
  const [comparedVehicles, setComparedVehicles] = useState<EmpanelledVehicle[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load Live Vehicle Data
  useEffect(() => {
    setLoading(true);
    VehicleService.getVehicleBySlug(vehicleId)
      .then(async (fetchedVehicle) => {
        if (fetchedVehicle) {
          setVehicle(fetchedVehicle);
          const similar = await VehicleService.getSimilarVehicles(fetchedVehicle.id);
          setSimilarEvs(similar);
        }
      })
      .finally(() => setLoading(false));
  }, [vehicleId]);

  // Active Variant Derived Data
  const variants = vehicle?.availableVariants && vehicle.availableVariants.length > 0
    ? vehicle.availableVariants
    : vehicle
    ? [
        {
          id: `${vehicle.id}-base`,
          name: vehicle.variant || 'Standard Range',
          exShowroomPrice: vehicle.exShowroomPrice,
          batteryCapacityKwh: vehicle.batteryCapacityKwh,
          claimedRangeKm: vehicle.rangeKm,
          features: vehicle.features || [],
        },
      ]
    : [];

  const activeVariant = variants[selectedVariantIdx] || variants[0];
  const activeExShowroomPrice = activeVariant?.exShowroomPrice || vehicle?.exShowroomPrice || 0;
  const activeBatteryKwh = activeVariant?.batteryCapacityKwh || vehicle?.batteryCapacityKwh || 0;
  const activeRangeKm = activeVariant?.claimedRangeKm || vehicle?.rangeKm || 0;

  // Recalculate Live Subsidy via POST /api/v1/subsidy/calculate whenever vehicle or selected variant changes
  useEffect(() => {
    if (!vehicle) return;

    setSubsidyBreakdown((prev) => ({ ...prev, loading: true }));

    // Call live subsidy engine endpoint with active variant specs
    subsidyApi
      .calculateSubsidy({
        category: vehicle.category,
        batteryCapacityKwh: activeBatteryKwh,
        hasTradeInIce: true,
        isDelhiResident: true,
        price: activeExShowroomPrice,
        city: 'Delhi',
        regYear: 2026,
      })
      .then((res) => {
        setSubsidyBreakdown({
          purchaseIncentive: res.purchaseIncentive,
          scrappageBonus: res.scrappageBonus,
          roadTaxWaiverEstimated: res.roadTaxWaiverEstimated,
          totalBenefit: res.totalBenefit,
          eligible: res.eligible,
          loading: false,
        });
      })
      .catch(() => {
        setSubsidyBreakdown((prev) => ({ ...prev, loading: false }));
      });
  }, [vehicle, selectedVariantIdx, activeExShowroomPrice, activeBatteryKwh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading vehicle details from database...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-20 px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 font-black text-xl">
            404
          </div>
          <h2 className="text-2xl font-black text-slate-900">Vehicle Not Found</h2>
          <p className="text-xs text-slate-500 font-medium">
            The requested vehicle slug "{vehicleId}" does not exist in the live empanelled catalog.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse EV Marketplace</span>
          </Link>
        </div>
      </div>
    );
  }

  // Live Calculated Effective Price
  const effectivePrice = Math.max(
    0,
    activeExShowroomPrice - (subsidyBreakdown.totalBenefit || vehicle.subsidyAmount || 0)
  );

  const handleProtectedAction = (action: () => void, title?: string, subtitle?: string) => {
    // Sign-in is optional — execute action directly for all users
    action();
  };

  const heroImage = resolveVehicleImage(vehicle);

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-24">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-emerald-300 px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 text-left">
        {/* Top Header Bar */}
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back to Marketplace</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
              Verified Empanelled EV
            </span>
          </div>
        </div>

        {/* Hero Product Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Vehicle Image Stage */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 shadow-md">
              <img
                src={heroImage}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className="p-3 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white backdrop-blur-md transition-all shadow-md cursor-pointer"
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Price, Variant Selector & Live Subsidy Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {vehicle.make}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {vehicle.make} {vehicle.model}
              </h1>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 font-extrabold text-slate-700">
                  {vehicle.category} EV
                </span>
                <span>•</span>
                <span>{activeRangeKm} km Claimed Range</span>
                <span>•</span>
                <span>{activeBatteryKwh} kWh Pack</span>
              </div>
            </div>

            {/* VARIANT SELECTOR INTERACTIVE COMPONENT */}
            {variants.length > 1 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Select Variant / Battery Option
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {variants.map((v, idx) => (
                    <button
                      key={v.id || idx}
                      onClick={() => setSelectedVariantIdx(idx)}
                      className={`p-3 rounded-xl text-left border text-xs font-extrabold transition-all cursor-pointer ${
                        selectedVariantIdx === idx
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-black truncate">{v.name}</div>
                      <div className="text-[11px] opacity-90 font-medium">
                        {v.batteryCapacityKwh} kWh • {formatLakh(v.exShowroomPrice)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DYNAMIC LIVE PRICE CARD */}
            <div className="p-6 rounded-3xl bg-emerald-50/90 border border-emerald-200/90 shadow-sm space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Ex-Showroom Price
                  </span>
                  <div className="text-xl font-extrabold text-slate-700 line-through">
                    {formatLakh(activeExShowroomPrice)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                    Effective Price Post Subsidies
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-700">
                    {formatLakh(effectivePrice)}
                  </div>
                </div>
              </div>

              {/* Live Subsidy Breakdown details */}
              <div className="pt-3 border-t border-emerald-200/70 space-y-1.5 text-xs text-slate-700 font-medium">
                <div className="flex justify-between">
                  <span>State & Central Direct Incentives:</span>
                  <span className="font-bold text-emerald-800">
                    -₹{(subsidyBreakdown.purchaseIncentive + subsidyBreakdown.scrappageBonus).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>100% Delhi Road Tax & Reg Waiver:</span>
                  <span className="font-bold text-emerald-800">
                    -₹{subsidyBreakdown.roadTaxWaiverEstimated.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-200/40 text-emerald-900 font-black">
                  <span>Total Government Savings:</span>
                  <span>₹{subsidyBreakdown.totalBenefit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() =>
                  handleProtectedAction(
                    () => router.push(`/dealers?model=${vehicle.id}`),
                    'Dealer Connect Required Auth',
                    'Log in to connect with authorized Delhi NCR EV dealers.'
                  )
                }
                className="w-full h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Connect Authorized Dealer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Specifications & Overview Tabs */}
        <div className="pt-8 border-t border-slate-100 space-y-6">
          <h2 className="text-xl font-black text-slate-900">Vehicle Specifications</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Battery Capacity</span>
              <div className="text-base font-black text-slate-900">{activeBatteryKwh} kWh</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Claimed Range</span>
              <div className="text-base font-black text-slate-900">{activeRangeKm} km</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AC Charge Time</span>
              <div className="text-base font-black text-slate-900">{vehicle.chargingTimeHours || 4.5} Hours</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Speed</span>
              <div className="text-base font-black text-slate-900">{vehicle.topSpeedKmvh || 120} km/h</div>
            </div>
          </div>
        </div>

        {/* =========================================================
            VARIANT-WISE PRICE & SUBSIDY BREAKDOWN TABLE
        ========================================================= */}
        {variants.length > 0 && (
          <div className="pt-8 border-t border-slate-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {vehicle.make} {vehicle.model} Variant-Wise Pricing & Subsidies
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Compare specifications, battery options, ex-showroom prices, and post-subsidy savings for all variants.
                </p>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                {variants.length} Variants Available
              </span>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="p-4 pl-6">Variant Name</th>
                    <th className="p-4">Battery</th>
                    <th className="p-4">Range</th>
                    <th className="p-4">Key Features</th>
                    <th className="p-4">Ex-Showroom Price</th>
                    <th className="p-4 text-emerald-300">Govt. Savings</th>
                    <th className="p-4 pr-6 text-right">Effective Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {variants.map((v, idx) => {
                    const isSelected = selectedVariantIdx === idx;
                    // Compute estimated savings for each variant based on category & price ceiling
                    const roadTaxEst = Math.round(v.exShowroomPrice <= 3000000 ? v.exShowroomPrice * 0.12 : 0);
                    const directIncentiveEst = vehicle.category === '4W' && v.exShowroomPrice <= 3000000 ? 100000 : 0;
                    const totalSavingsEst = roadTaxEst + directIncentiveEst;
                    const netEffectiveEst = Math.max(0, v.exShowroomPrice - totalSavingsEst);

                    return (
                      <tr
                        key={v.id || idx}
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-50/80 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-4 pl-6 font-black text-slate-900 flex items-center gap-2">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />}
                          <span>{v.name}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-800">{v.batteryCapacityKwh} kWh</td>
                        <td className="p-4 font-bold text-slate-800">{v.claimedRangeKm} km</td>
                        <td className="p-4 text-slate-500 max-w-xs truncate">
                          {v.features?.join(', ') || 'Standard Features'}
                        </td>
                        <td className="p-4 font-extrabold text-slate-800">{formatLakh(v.exShowroomPrice)}</td>
                        <td className="p-4 font-bold text-emerald-700">
                          {totalSavingsEst > 0 ? `-${formatLakh(totalSavingsEst)}` : '₹0'}
                        </td>
                        <td className="p-4 pr-6 text-right font-black text-emerald-700 text-sm">
                          {formatLakh(netEffectiveEst)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VehicleDetailsView;
