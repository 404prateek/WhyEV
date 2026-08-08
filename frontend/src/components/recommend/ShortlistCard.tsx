'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EmpanelledVehicle } from '@/types';
import { formatLakh } from '@/lib/utils';
import { resolveVehicleImage } from '@/lib/utils/imageResolver';
import { Eye, Scale, Check, Zap, Battery, ChevronDown } from 'lucide-react';
import { GovtBenefitModal, BenefitSchemeDetail } from './GovtBenefitModal';

interface ShortlistCardProps {
  vehicle: EmpanelledVehicle;
  onCompare?: (vehicle: EmpanelledVehicle) => void;
  isCompared?: boolean;
}

const MOCK_SCHEMES: BenefitSchemeDetail[] = [
  {
    id: 'pm-edrive',
    title: 'PM E-DRIVE Scheme 2026',
    category: 'Central Government',
    shortDesc: 'Ministry of Heavy Industries Demand Incentive for Electric Vehicles',
    fullOverview: 'The PM E-DRIVE scheme provides direct central capital subsidies to accelerate electric mobility adoption.',
    whyQualify: 'Vehicle battery capacity exceeds 25 kWh and is certified for domestic manufacturing compliance.',
    estimatedSavings: '₹1,50,000 Direct Incentive',
    eligibilityCriteria: [
      'Ex-showroom price under ceiling limit',
      'Advanced chemistry battery pack certified for safety',
      'Aadhaar verified individual registration',
    ],
    calculationFormula: 'Incentive = ₹10,000 per kWh up to max cap of ₹1,50,000.',
    applicationType: 'Direct Dealer Instant Discount',
    officialLink: 'https://ev.delhi.gov.in/',
  },
  {
    id: 'delhi-ev-policy',
    title: 'Delhi EV Policy 2026',
    category: 'Delhi State Government',
    shortDesc: 'Comprehensive State EV Subsidy & Road Tax Waiver Framework',
    fullOverview: 'Delhi EV Policy 2026 grants purchase subsidies, 100% road tax waiver, and 100% registration fee exemption.',
    whyQualify: 'Vehicle registered under RTO Delhi with valid local residence proof.',
    estimatedSavings: '₹1,85,000 Total State Benefit',
    eligibilityCriteria: [
      'Delhi RTO Registration',
      'First-time EV buyer subsidy tier',
      'Empanelled vehicle model status on Delhi EV Portal',
    ],
    calculationFormula: 'Total Benefit = Purchase Subsidy + Road Tax Exemption + Reg Waiver.',
    applicationType: 'Automatic at RTO',
    officialLink: 'https://ev.delhi.gov.in/',
  },
];

export function ShortlistCard({ vehicle, onCompare, isCompared = false }: ShortlistCardProps) {
  const router = useRouter();
  const [selectedScheme, setSelectedScheme] = useState<BenefitSchemeDetail | null>(null);

  // Hover & Expand States
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const displayPrice = vehicle.effectivePrice || vehicle.exShowroomPrice;
  const estimatedEmi = `₹${Math.round((displayPrice * 100000 * 0.02) / 12).toLocaleString('en-IN')}/mo`;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCompare) {
      onCompare(vehicle);
    }
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/vehicle/${vehicle.id}`);
  };

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group h-full cursor-pointer"
        onClick={handleViewDetailsClick}
      >
        {/* Card Header Image */}
        <div className="relative w-full h-44 bg-slate-950 overflow-hidden">
          <img
            src={resolveVehicleImage(vehicle)}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        </div>

        {/* Card Core Content */}
        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {vehicle.make}
              </div>
              {vehicle.availableVariants && vehicle.availableVariants.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
                  {vehicle.availableVariants.length} Variants
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-slate-900 leading-tight truncate">
              {vehicle.model}
            </h3>
            <div className="text-sm font-black text-emerald-700">
              {vehicle.priceMinLakh && vehicle.priceMaxLakh && vehicle.priceMinLakh !== vehicle.priceMaxLakh
                ? `₹${vehicle.priceMinLakh.toFixed(2)} – ₹${vehicle.priceMaxLakh.toFixed(2)} Lakh`
                : `Starting at ${formatLakh(displayPrice)}`}
            </div>
          </div>

          {/* Clean Government Incentives Badges */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Government Incentives Available
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedScheme(MOCK_SCHEMES[0]);
                }}
                className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>PM E-DRIVE</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedScheme(MOCK_SCHEMES[1]);
                }}
                className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Delhi EV Policy</span>
              </button>
            </div>
          </div>

          {/* Mobile Tap Toggle Indicator */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileExpanded(!isMobileExpanded);
            }}
            className="sm:hidden w-full pt-1 flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <span>{isMobileExpanded ? 'Hide Specs' : 'Tap for Highlights'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isMobileExpanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Inline Expanded Highlights */}
          <AnimatePresence>
            {isMobileExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="sm:hidden space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 overflow-hidden"
              >
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Range:</span>
                  <span className="font-extrabold text-slate-900">{vehicle.rangeKm} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Fast Charging:</span>
                  <span className="font-extrabold text-slate-900">{vehicle.chargingTimeHours}h (0-80%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Estimated EMI:</span>
                  <span className="font-extrabold text-emerald-700">{estimatedEmi}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ONLY TWO ACTIONS ON CARD: Compare & View Details */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {onCompare && (
              <button
                type="button"
                onClick={handleCompareClick}
                className={`py-2.5 px-2 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isCompared
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{isCompared ? '✓ Selected' : 'Compare'}</span>
              </button>
            )}

            <Link
              href={`/vehicle/${vehicle.id}`}
              onClick={(e) => e.stopPropagation()}
              className={`py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs ${
                !onCompare ? 'col-span-2' : ''
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Details</span>
            </Link>
          </div>
        </div>

        {/* Desktop Hover Info Panel */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="hidden sm:flex absolute inset-0 bg-slate-950/90 backdrop-blur-xl text-white p-5 flex-col justify-between z-30"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      {vehicle.make}
                    </div>
                    <h4 className="text-base font-black text-white">{vehicle.model}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-300">{estimatedEmi}</span>
                    <span className="text-[9px] text-slate-400 block">Est. EMI</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      <span>Range</span>
                    </div>
                    <div className="font-extrabold text-white">{vehicle.rangeKm} km</div>
                  </div>

                  <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Battery className="w-3 h-3 text-teal-400" />
                      <span>Battery</span>
                    </div>
                    <div className="font-extrabold text-white">{vehicle.batteryCapacityKwh || 40.5} kWh</div>
                  </div>

                  <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Charging Speed</div>
                    <div className="font-extrabold text-white">{vehicle.chargingTimeHours}h (0-80%)</div>
                  </div>

                  <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Top Speed</div>
                    <div className="font-extrabold text-white truncate">{vehicle.topSpeedKmvh || 150} km/h</div>
                  </div>
                </div>
              </div>

              {/* ONLY TWO ACTIONS ON HOVER: Compare & View Details */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {onCompare && (
                  <button
                    type="button"
                    onClick={handleCompareClick}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                      isCompared
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {isCompared ? '✓ Selected' : 'Quick Compare'}
                  </button>
                )}

                <Link
                  href={`/vehicle/${vehicle.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    !onCompare ? 'col-span-2' : ''
                  }`}
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Govt Benefit Inspector Modal */}
      <GovtBenefitModal
        benefit={selectedScheme}
        isOpen={!!selectedScheme}
        onClose={() => setSelectedScheme(null)}
      />
    </>
  );
}
