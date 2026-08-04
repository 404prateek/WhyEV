'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Calculator,
  ShieldAlert,
  Download,
  Sparkles,
  MapPin,
  Loader2,
  AlertCircle,
  Info,
  ChevronDown,
  X,
  Search,
  Lock,
  SlidersHorizontal,
  CheckCircle2,
  HelpCircle,
  Calendar,
  Car,
} from 'lucide-react';
import { useSubsidyStore, useAuthStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import { PdfReportModal } from './PdfReportModal';
import { SubsidyChecklist } from './SubsidyChecklist';
import { DocumentUploadSection } from './DocumentUploadSection';
import { VehicleCategory, EmpanelledVehicle } from '@/types';
import { subsidyApi } from '@/lib/api';
import { SubsidyBreakdownCard } from './SubsidyBreakdownCard';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';

// All 36 Indian States and UTs — mirrors Python engine ALL_STATES
const ALL_CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi',
  'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad', 'Greater Noida',
  'Bhubaneswar', 'Patna', 'Nagpur',
];

interface CalcResult {
  purchaseIncentive: number;
  scrappageBonus: number;
  roadTaxWaiverEstimated: number;
  totalBenefit: number;
  eligible: boolean;
  reasonIfIneligible?: string;
  taxExemptionPct?: number;
  notes?: string[];
  isEstimate?: boolean;
}

export function SubsidyCalculator() {
  const { setPdfModalOpen, updateCalculation } = useSubsidyStore();
  const { requestPermission } = useAuthStore();

  // ── Selection Mode ──
  // 'vehicle' = Primary vehicle-first flow
  // 'category_fallback' = Fallback path for undecided users
  const [selectionMode, setSelectionMode] = useState<'vehicle' | 'category_fallback'>('vehicle');

  // ── Vehicle Autocomplete State ──
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<EmpanelledVehicle | null>(() => {
    return MOCK_EMPANELLED_VEHICLES.find((v) => v.id === 'tata-nexon-ev') || MOCK_EMPANELLED_VEHICLES[0] || null;
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ── Spec Inputs ──
  const [category, setCategory] = useState<VehicleCategory>(selectedVehicle?.category || '4W');
  const [price, setPrice] = useState<number>(selectedVehicle?.exShowroomPrice || 1000000);
  const [batteryKwh, setBatteryKwh] = useState<number>(selectedVehicle?.batteryCapacityKwh || 40.5);
  const [city, setCity] = useState<string>('Delhi');
  const [hasScrappage, setHasScrappage] = useState<boolean>(true);
  const [gvw, setGvw] = useState<number>(1.5);

  // ── Fallback Category & Budget State ──
  const [budgetTier, setBudgetTier] = useState<string>('10_20l');

  // ── Advanced Power-User Specs Toggle ──
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // ── Auto-Detected Policy Year ──
  // Auto-detected from today's date (July 2026 -> Year 1: 2026–27)
  const autoDetectedYear = useMemo(() => {
    const currentYear = new Date().getFullYear();
    if (currentYear <= 2026) return 1;
    if (currentYear === 2027) return 2;
    return 3;
  }, []);

  // ── Calculation State ──
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculated, setCalculated] = useState(false);
  const [devToast, setDevToast] = useState<{ message: string; visible: boolean } | null>(null);

  const isDelhiNcr = ['Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad', 'Greater Noida'].includes(city);

  // Filter empanelled vehicles matching search input
  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) return MOCK_EMPANELLED_VEHICLES;
    const query = vehicleSearch.toLowerCase();
    return MOCK_EMPANELLED_VEHICLES.filter(
      (v) =>
        v.make.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.variant.toLowerCase().includes(query) ||
        v.category.toLowerCase().includes(query)
    );
  }, [vehicleSearch]);

  // Handle model selection
  const handleSelectVehicle = (veh: EmpanelledVehicle) => {
    setSelectedVehicle(veh);
    setCategory(veh.category);
    setPrice(veh.exShowroomPrice);
    setBatteryKwh(veh.batteryCapacityKwh);
    setIsSearchOpen(false);
    setVehicleSearch('');
    setCalculated(false);
    setResult(null);
  };

  const handleCalculate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let calcPrice = price;
      let calcBattery = batteryKwh;
      let calcCat = category;

      if (selectionMode === 'vehicle' && selectedVehicle) {
        calcPrice = selectedVehicle.exShowroomPrice;
        calcBattery = selectedVehicle.batteryCapacityKwh;
        calcCat = selectedVehicle.category;
      } else if (selectionMode === 'category_fallback') {
        const budgetMap: Record<string, number> = {
          under_2l: 145000,
          '2_5l': 350000,
          '5_10l': 850000,
          '10_20l': 1400000,
          over_20l: 2500000,
        };
        calcPrice = budgetMap[budgetTier] || 1000000;
        if (calcCat === '2W') calcBattery = 3.7;
        if (calcCat === '3W') calcBattery = 8.0;
        if (calcCat === '4W') calcBattery = 40.5;
        if (calcCat === 'N1_goods') calcBattery = 20.0;
      }

      const res = await subsidyApi.calculateSubsidy({
        category: calcCat,
        batteryCapacityKwh: calcBattery,
        hasTradeInIce: hasScrappage,
        isDelhiResident: isDelhiNcr,
        price: calcPrice,
        city,
        regYear: autoDetectedYear,
        gvw,
      });

      const resultData = {
        ...res,
        isEstimate: selectionMode === 'category_fallback',
      };
      setResult(resultData);
      setCalculated(true);
      setDevToast(null);

      // ── Connect to PDF modal and subsidy store with REAL data ──
      const vehicleLabel =
        selectionMode === 'vehicle' && selectedVehicle
          ? `${selectedVehicle.make} ${selectedVehicle.model}`
          : getCategoryLabel(calcCat);
      const vehicleVariant =
        selectionMode === 'vehicle' && selectedVehicle ? selectedVehicle.variant : '';
      updateCalculation(
        res.purchaseIncentive,
        res.scrappageBonus,
        res.roadTaxWaiverEstimated,
        res.totalBenefit,
        vehicleLabel,
        vehicleVariant,
        city,
        calcCat
      );
    } catch (e: any) {
      const errorMsg = e?.message || 'Failed to calculate subsidy. Please try again.';
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Subsidy API Error]:', e);
        setDevToast({ message: errorMsg, visible: true });
      }
      setError(errorMsg);
      setResult(null);
      setCalculated(false);
    } finally {
      setLoading(false);
    }
  }, [
    selectionMode,
    selectedVehicle,
    price,
    batteryKwh,
    category,
    budgetTier,
    hasScrappage,
    isDelhiNcr,
    city,
    autoDetectedYear,
    gvw,
  ]);

  const getCategoryLabel = (cat: string) => {
    if (cat === '2W') return '2-Wheeler (Scooter/Bike)';
    if (cat === '3W') return '3-Wheeler (Auto)';
    if (cat === '4W') return '4-Wheeler Car';
    if (cat === 'N1_goods') return '4W Goods (N1)';
    return cat;
  };

  const priceLimits = {
    '2W':       { min: 50000,   max: 500000,  step: 5000 },
    '3W':       { min: 100000,  max: 800000,  step: 10000 },
    '4W':       { min: 500000,  max: 5000000, step: 50000 },
    'N1_goods': { min: 300000,  max: 3000000, step: 25000 },
  };
  const pl = priceLimits[category as keyof typeof priceLimits] || priceLimits['4W'];

  const batteryLimits = {
    '2W':       { min: 1.5, max: 6,   step: 0.1 },
    '3W':       { min: 3,   max: 15,  step: 0.5 },
    '4W':       { min: 15,  max: 100, step: 0.5 },
    'N1_goods': { min: 10,  max: 60,  step: 0.5 },
  };
  const bl = batteryLimits[category as keyof typeof batteryLimits] || batteryLimits['4W'];

  return (
    <div className="max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          <span>All-India EV Subsidy Calculation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Calculate Your Exact EV Subsidy & Tax Waiver
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal">
          Select your EV model to instantly auto-fill live policy rules (Delhi 2026 + all 36 States). No manual specification guessing required.
        </p>

        {/* Document Upload & AI Assist Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-emerald-200/90">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-slate-900">AI Vision Document Upload & Pre-fill</div>
              <div className="text-[11px] text-slate-600">Upload RC photo or invoice via drag-and-drop or mobile camera. Vision AI pre-fills fields for review.</div>
            </div>
          </div>
          <a
            href="/subsidy/document-verification"
            className="py-2 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shrink-0 cursor-pointer shadow-sm"
          >
            Explore Upload Flow →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ── Input Card ── */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <span>Eligibility Inputs</span>
            </h2>
            <button
              onClick={() => requestPermission('location')}
              className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Auto-Detect Location</span>
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => {
                setSelectionMode('vehicle');
                setCalculated(false);
                setResult(null);
              }}
              className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectionMode === 'vehicle'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-4 h-4 text-emerald-600" />
              <span>Which Vehicle?</span>
            </button>
            <button
              onClick={() => {
                setSelectionMode('category_fallback');
                setCalculated(false);
                setResult(null);
              }}
              className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectionMode === 'category_fallback'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>I Haven't Decided Yet</span>
            </button>
          </div>

          {/* Mode 1: Searchable Vehicle Picker */}
          {selectionMode === 'vehicle' && (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Empanelled EV Model
              </label>

              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={vehicleSearch}
                    onFocus={() => setIsSearchOpen(true)}
                    onChange={(e) => {
                      setVehicleSearch(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    placeholder={
                      selectedVehicle
                        ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.variant})`
                        : 'Search vehicle model (e.g. Nexon EV, Ather 450X, Comet...)'
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Search Autocomplete Dropdown Menu */}
                {isSearchOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-30 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl space-y-1 p-2">
                    {filteredVehicles.length > 0 ? (
                      filteredVehicles.map((veh) => (
                        <button
                          key={veh.id}
                          onClick={() => handleSelectVehicle(veh)}
                          className="w-full p-2.5 rounded-xl text-left hover:bg-emerald-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-slate-900">
                              {veh.make} {veh.model}
                            </div>
                            <div className="text-[11px] text-slate-500">{veh.variant}</div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-extrabold text-[10px] text-slate-700">
                              {veh.category}
                            </span>
                            <div className="font-bold text-emerald-700 text-[11px] mt-0.5">
                              {formatINR(veh.exShowroomPrice)}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No matching vehicle found in vehicles master.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Model Auto-Filled Specs Cards (Read-only) */}
              {selectedVehicle && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-extrabold text-slate-900">
                        {selectedVehicle.make} {selectedVehicle.model}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900">
                      {selectedVehicle.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Ex-Showroom Price Read-only Pill */}
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex flex-col justify-between">
                      <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>Ex-Showroom Price</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm mt-1">
                        {formatINR(selectedVehicle.exShowroomPrice)}
                      </div>
                      <div className="text-[9px] text-emerald-700 mt-0.5 font-medium">Auto-filled from DB</div>
                    </div>

                    {/* Battery Capacity Read-only Pill */}
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex flex-col justify-between">
                      <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>Battery Capacity</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm mt-1">
                        {selectedVehicle.batteryCapacityKwh} kWh
                      </div>
                      <div className="text-[9px] text-emerald-700 mt-0.5 font-medium">Auto-filled from DB</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Fallback Category & Budget Range */}
          {selectionMode === 'category_fallback' && (
            <div className="space-y-5">
              {/* Category Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Vehicle Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { cat: '2W', label: '2-Wheeler', icon: '🛵' },
                      { cat: '3W', label: '3-Wheeler', icon: '🛺' },
                      { cat: '4W', label: '4W Car', icon: '🚗' },
                      { cat: 'N1_goods', label: '4W Goods', icon: '🚛' },
                    ] as { cat: VehicleCategory; label: string; icon: string }[]
                  ).map(({ cat, label, icon }) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setCalculated(false);
                        setResult(null);
                      }}
                      className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        category === cat
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg">{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rough Budget Tier Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Rough Budget Range
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'under_2l', label: 'Under ₹2 Lakh' },
                    { id: '2_5l', label: '₹2L – ₹5 Lakh' },
                    { id: '5_10l', label: '₹5L – ₹10 Lakh' },
                    { id: '10_20l', label: '₹10L – ₹20 Lakh' },
                    { id: 'over_20l', label: 'Over ₹20 Lakh' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setBudgetTier(b.id);
                        setCalculated(false);
                        setResult(null);
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        budgetTier === b.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                This mode returns an estimated subsidy range for your category. Selecting a specific model gives exact figures.
              </p>
            </div>
          )}

          {/* City / State Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              City / State (Policy Location)
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setCalculated(false);
                  setResult(null);
                }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer pr-10"
              >
                {ALL_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {!isDelhiNcr && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                Only Delhi NCR cities qualify for the Delhi EV Policy 2026 purchase incentive.
              </p>
            )}
          </div>

          {/* Auto-Detected Policy Year Display (Read-Only) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-extrabold text-slate-900 block">
                  Policy Tier: Year {autoDetectedYear} ({autoDetectedYear === 1 ? '2026–27' : autoDetectedYear === 2 ? '2027–28' : '2028–29'})
                </span>
                <span className="text-[10px] text-slate-500">Auto-detected from today's date (July 2026)</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
              Active Tier
            </span>
          </div>

          {/* Scrappage Toggle */}
          <div className="space-y-3 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-700 font-medium">Trading in an old Petrol/Diesel vehicle?</span>
              <button
                onClick={() => {
                  setHasScrappage(!hasScrappage);
                  setCalculated(false);
                  setResult(null);
                }}
                className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                  hasScrappage ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {hasScrappage ? 'YES' : 'NO'}
              </button>
            </div>
          </div>

          {/* Advanced / Power-User Specs Toggle */}
          <div className="pt-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>{showAdvanced ? 'Hide Advanced Specs' : '⚙️ Advanced / I know my exact specs'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 animate-in fade-in">
                {/* Manual Price Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Manual Ex-Showroom Price</span>
                    <span className="font-extrabold text-emerald-700">{formatINR(price)}</span>
                  </div>
                  <input
                    type="range"
                    min={pl.min}
                    max={pl.max}
                    step={pl.step}
                    value={price}
                    onChange={(e) => {
                      setPrice(Number(e.target.value));
                      setCalculated(false);
                      setResult(null);
                    }}
                    className="w-full accent-emerald-600 bg-slate-200 h-2.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Manual Battery Capacity Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Manual Battery Capacity</span>
                    <span className="font-extrabold text-emerald-700">{batteryKwh} kWh</span>
                  </div>
                  <input
                    type="range"
                    min={bl.min}
                    max={bl.max}
                    step={bl.step}
                    value={batteryKwh}
                    onChange={(e) => {
                      setBatteryKwh(Number(e.target.value));
                      setCalculated(false);
                      setResult(null);
                    }}
                    className="w-full accent-emerald-600 bg-slate-200 h-2.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full h-[52px] rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calculating…</span>
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                <span>{selectionMode === 'category_fallback' ? 'Estimate My Subsidy Range' : 'Calculate Exact Subsidy'}</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── Output Card ── */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 space-y-8 shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {result?.isEstimate ? 'Estimated Subsidy Range' : 'Total Financial Benefit'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {getCategoryLabel(category)} · Year {autoDetectedYear}
              </span>
            </div>

            {!calculated && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Calculator className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  Select your vehicle model and click<br />"Calculate Subsidy" to view breakdown
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Querying live policy engine…</p>
              </div>
            )}

            {calculated && result && !loading && (
              <div className="space-y-6">
                {result.isEstimate && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <div className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800">
                      💡 ESTIMATED SUBSIDY RANGE
                    </div>
                    <p className="text-slate-600 font-normal">
                      This is an estimated figure based on category averages. Final subsidy is calculated when you select an exact vehicle model.
                    </p>
                  </div>
                )}

                <SubsidyBreakdownCard
                  data={{
                    vehicle_label:
                      selectionMode === 'vehicle' && selectedVehicle
                        ? `${selectedVehicle.make} ${selectedVehicle.model}`
                        : getCategoryLabel(category),
                    variant: selectedVehicle?.variant,
                    category,
                    ex_showroom_price: price,
                    direct_subsidy: result.purchaseIncentive,
                    scrappage_bonus: result.scrappageBonus,
                    road_tax_waiver: result.roadTaxWaiverEstimated,
                    total_benefit: result.totalBenefit,
                    eligible: result.eligible,
                    ineligible_reason: result.reasonIfIneligible,
                    has_scrapping: hasScrappage,
                  }}
                />

                {result.notes && result.notes.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {result.notes.map((note, i) => (
                      <p
                        key={i}
                        className={`text-[11px] px-3 py-2 rounded-xl border flex items-start gap-1.5 ${
                          note.startsWith('WARNING')
                            ? 'text-rose-700 bg-rose-50 border-rose-200'
                            : 'text-slate-600 bg-slate-50 border-slate-200'
                        }`}
                      >
                        <Info className="w-3 h-3 shrink-0 mt-0.5" />
                        {note}
                      </p>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={() => setPdfModalOpen(true)}
              disabled={!calculated || !result?.eligible}
              className="w-full h-[52px] rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Generate Official PDF Eligibility Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* 30-Day Filing Checklist */}
      <SubsidyChecklist />

      {/* Required Claim Documents */}
      <DocumentUploadSection />

      {/* PDF Modal */}
      <PdfReportModal />

      {/* Dev Mode Backend Contract Mismatch Dismissible Toast */}
      {process.env.NODE_ENV !== 'production' && devToast?.visible && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md p-4 rounded-2xl bg-rose-900 text-white shadow-2xl border border-rose-700 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs space-y-1">
            <div className="font-bold text-rose-200 uppercase tracking-wider text-[10px]">
              Dev Mode · Backend Contract Mismatch Error
            </div>
            <div className="font-mono text-xs text-rose-100 break-words leading-relaxed">
              {devToast.message}
            </div>
          </div>
          <button
            onClick={() => setDevToast({ message: devToast.message, visible: false })}
            className="text-rose-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss error toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
