'use client';

import React, { useState } from 'react';
import { EmpanelledVehicle } from '@/types';
import { formatLakh } from '@/lib/utils';
import { Eye, Scale, ShieldCheck, Check } from 'lucide-react';
import { useIntakeStore, useAuthStore } from '@/lib/store';
import { VehicleDetailsModal } from './VehicleDetailsModal';
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
    fullOverview: 'The PM E-DRIVE (FAME III successor) scheme provides direct central capital subsidies to accelerate electric mobility adoption across 4-wheelers and 2-wheelers.',
    whyQualify: 'Vehicle battery capacity exceeds 25 kWh and is certified by ARAI for domestic manufacturing compliance.',
    estimatedSavings: '₹1,50,000 Direct Incentive',
    eligibilityCriteria: [
      'Ex-showroom price under ₹25 Lakh ceiling',
      'Advanced chemistry battery pack certified for safety',
      'Aadhaar verified individual registration',
    ],
    calculationFormula: 'Incentive = ₹10,000 per kWh of battery capacity up to max cap of ₹1,50,000.',
    applicationType: 'Direct Dealer Instant Discount',
    officialLink: 'https://ev.delhi.gov.in/',
  },
  {
    id: 'delhi-ev-policy',
    title: 'Delhi EV Policy 2026',
    category: 'Delhi State Government',
    shortDesc: 'Comprehensive State EV Subsidy & Road Tax Waiver Framework',
    fullOverview: 'Delhi EV Policy 2026 grants purchase subsidies, 100% road tax waiver, and 100% registration fee exemption for residents of Delhi NCR.',
    whyQualify: 'Vehicle registered under RTO Delhi with valid local residence proof.',
    estimatedSavings: '₹1,85,000 Total State Benefit',
    eligibilityCriteria: [
      'Delhi RTO Registration',
      'First-time EV buyer subsidy tier',
      'Empanelled vehicle model status on Delhi EV Portal',
    ],
    calculationFormula: 'Total Benefit = Purchase Subsidy (₹30K) + Road Tax Exemption (₹1.2L) + Reg Waiver (₹35K).',
    applicationType: 'Automatic at RTO',
    officialLink: 'https://ev.delhi.gov.in/',
  },
];

export function ShortlistCard({ vehicle, onCompare, isCompared = false }: ShortlistCardProps) {
  const { showEffectivePrice } = useIntakeStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<BenefitSchemeDetail | null>(null);

  const displayPrice = showEffectivePrice ? vehicle.effectivePrice : vehicle.exShowroomPrice;

  return (
    <>
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-0.5">
        {/* Top: Landscape Image */}
        <div className="relative w-full h-36 sm:h-44 bg-slate-950 overflow-hidden">
          <img
            src={vehicle.imageUrl || '/explore/curvv-ev-desktop.png'}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        </div>

        {/* Middle: Brand, Model, Starting Price & CLICKABLE GOVERNMENT BENEFIT CHIPS */}
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {vehicle.make}
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug truncate">
              {vehicle.make} {vehicle.model}
            </h3>
            <div className="text-xs font-black text-slate-900">
              Starting From {formatLakh(displayPrice)}
            </div>
          </div>

          {/* CLICKABLE GOVERNMENT BENEFIT CHIPS */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Applicable Govt Benefits
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedScheme(MOCK_SCHEMES[0])}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>PM E-DRIVE</span>
              </button>
              <button
                onClick={() => setSelectedScheme(MOCK_SCHEMES[1])}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Delhi EV Policy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions: Compare (✓ Selected when active) & View Details */}
        <div className="p-3 pt-0 grid grid-cols-2 gap-2">
          {onCompare && (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal('/recommend', 'Sign in to Compare Models', 'Compare EV models side-by-side with specs and range breakdowns.');
                  return;
                }
                onCompare(vehicle);
              }}
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

          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal(
                  '/recommend',
                  'Sign in to View Complete EV Details',
                  'Sign in to unlock complete vehicle details, personalized subsidy calculations, comparisons, and saved vehicles.'
                );
                return;
              }
              setIsDetailsOpen(true);
            }}
            className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Govt Benefit Inspector Modal */}
      <GovtBenefitModal
        benefit={selectedScheme}
        isOpen={!!selectedScheme}
        onClose={() => setSelectedScheme(null)}
      />

      {/* Full Vehicle Details & Variant Inspector Modal */}
      <VehicleDetailsModal
        vehicle={vehicle}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onCompare={onCompare}
        isCompared={isCompared}
      />
    </>
  );
}
