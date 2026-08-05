'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark,
  ShieldCheck,
  Zap,
  Car,
  User,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Download,
  Bookmark,
  Building2,
  Tag,
  CreditCard,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';

export function SubsidyCalculatorView() {
  const router = useRouter();

  // Active Form Step (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  // Step 1: Personal Details
  const [fullName, setFullName] = useState('Aishwarya Dhanda');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [emailAddress, setEmailAddress] = useState('aishwarya@example.com');
  const [stateName, setStateName] = useState('Delhi NCR');
  const [cityName, setCityName] = useState('New Delhi');
  const [pinCode, setPinCode] = useState('110001');

  // Step 2: Identity Verification
  const [aadhaarNumber, setAadhaarNumber] = useState('XXXX-XXXX-8842');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [dlNumber, setDlNumber] = useState('');
  const [isFirstEv, setIsFirstEv] = useState<boolean>(true);

  // Step 3: Vehicle Selection Mode
  const [vehicleSelectionMode, setVehicleSelectionMode] = useState<'catalogue' | 'manual'>('catalogue');
  const [selectedCatalogueId, setSelectedCatalogueId] = useState<string>(MOCK_EMPANELLED_VEHICLES[0].id);

  // Manual Vehicle Inputs
  const [manufacturer, setManufacturer] = useState('Tata Motors');
  const [modelName, setModelName] = useState('Nexon EV');
  const [variantName, setVariantName] = useState('Empowered+ Long Range');
  const [vehicleCategory, setVehicleCategory] = useState<'4W' | '2W' | '3W' | 'Commercial'>('4W');
  const [exShowroomPrice, setExShowroomPrice] = useState<number>(1749000);
  const [batteryCapacity, setBatteryCapacity] = useState<number>(40.5);
  const [purchaseDate, setPurchaseDate] = useState('2026-08-15');

  // Step 4: Additional Eligibility
  const [purchaseType, setPurchaseType] = useState<'individual' | 'business'>('individual');
  const [hasScrappage, setHasScrappage] = useState<boolean>(true);
  const [isFemaleApplicant, setIsFemaleApplicant] = useState<boolean>(false);
  const [usageType, setUsageType] = useState<'residential' | 'commercial'>('residential');

  const selectedVehicleObj = MOCK_EMPANELLED_VEHICLES.find((v) => v.id === selectedCatalogueId);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Trigger Step 5 Calculation
      setCurrentStep(5);
      setIsCalculating(true);
      setTimeout(() => {
        setIsCalculating(false);
        setShowResults(true);
      }, 2200);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Calculations
  const calculatedExShowroom =
    vehicleSelectionMode === 'catalogue' && selectedVehicleObj
      ? selectedVehicleObj.exShowroomPrice
      : exShowroomPrice;

  const directStateSubsidy = 100000;
  const centralIncentive = 50000;
  const roadTaxWaiver = Math.round(calculatedExShowroom * 0.12);
  const scrappageBonus = hasScrappage ? 20000 : 0;
  const totalSavingsCalculated = directStateSubsidy + centralIncentive + roadTaxWaiver + scrappageBonus;
  const effectivePriceCalculated = Math.max(0, calculatedExShowroom - totalSavingsCalculated);

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* =========================================================
            HERO SECTION
        ========================================================= */}
        <div className="text-center space-y-4 border-b border-slate-100 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black">
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span>Official Policy Incentive Engine 2026</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Calculate Your EV Savings
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Find out the government incentives, subsidies, and tax benefits available for your next electric vehicle.
          </p>

          {!showResults && currentStep === 1 && (
            <button
              onClick={() => {
                const formEl = document.getElementById('subsidy-form-container');
                formEl?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-2 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/20 cursor-pointer transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              <span>Calculate Subsidy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* =========================================================
            CALCULATOR FORM CONTAINER
        ========================================================= */}
        <div id="subsidy-form-container" className="scroll-mt-24">
          {!showResults && !isCalculating && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
              {/* Step Progress Tracker Bar */}
              <div className="space-y-3 border-b border-slate-100 pb-6">
                <div className="flex items-center justify-between text-xs font-black text-slate-500">
                  <span className="uppercase tracking-wider text-emerald-700">
                    Step {currentStep} of 4: {['Personal Details', 'Identity Verification', 'Vehicle Details', 'Eligibility Criteria'][currentStep - 1]}
                  </span>
                  <span>{currentStep * 25}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${currentStep * 25}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-emerald-600 rounded-full"
                  />
                </div>
              </div>

              {/* =========================================================
                  STEP 1: PERSONAL DETAILS
              ========================================================= */}
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600" />
                      <span>Step 1: Personal Details</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Enter your contact information to fetch state-specific policy rules.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        placeholder="e.g. Aishwarya Dhanda"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Mobile Number</label>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        placeholder="10-digit mobile number"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        placeholder="name@domain.com"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Registration State</label>
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Other">Other State</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">City</label>
                      <input
                        type="text"
                        value={cityName}
                        onChange={(e) => setCityName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        placeholder="City name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">PIN Code</label>
                      <input
                        type="text"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        placeholder="6-digit PIN code"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =========================================================
                  STEP 2: IDENTITY VERIFICATION
              ========================================================= */}
              {currentStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>Step 2: Identity Verification</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Minimum required verification details for government incentive eligibility.
                    </p>
                  </div>

                  {/* Privacy Badge Card */}
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                      🔒 Your details are encrypted and used strictly for government eligibility calculation. WhyEV never shares your data without consent.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Aadhaar Number</label>
                      <input
                        type="text"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        placeholder="12-digit Aadhaar number"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">PAN Number</label>
                      <input
                        type="text"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        placeholder="10-character PAN"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                        Driving Licence Number <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={dlNumber}
                        onChange={(e) => setDlNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        placeholder="DL number if available"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Is this your first EV purchase?</label>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsFirstEv(true)}
                          className={`py-2.5 px-4 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                            isFirstEv
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Yes (First EV)
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFirstEv(false)}
                          className={`py-2.5 px-4 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                            !isFirstEv
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          No (Additional EV)
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =========================================================
                  STEP 3: VEHICLE DETAILS
              ========================================================= */}
              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Car className="w-5 h-5 text-emerald-600" />
                      <span>Step 3: Vehicle Details</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Select an electric vehicle from the WhyEV catalogue or enter specifications manually.
                    </p>
                  </div>

                  {/* Option Mode Toggle */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setVehicleSelectionMode('catalogue')}
                      className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        vehicleSelectionMode === 'catalogue'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Option A: Select from Catalogue
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleSelectionMode('manual')}
                      className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        vehicleSelectionMode === 'manual'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Option B: Enter Manually
                    </button>
                  </div>

                  {/* OPTION A: CATALOGUE SELECTOR */}
                  {vehicleSelectionMode === 'catalogue' ? (
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Select EV Model</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {MOCK_EMPANELLED_VEHICLES.map((veh) => {
                          const isSelected = selectedCatalogueId === veh.id;
                          return (
                            <button
                              key={veh.id}
                              type="button"
                              onClick={() => setSelectedCatalogueId(veh.id)}
                              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                                isSelected
                                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-900">{veh.make} {veh.model}</span>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                                <span>₹{(veh.exShowroomPrice / 100000).toFixed(2)} Lakh</span>
                                <span className="text-emerald-700">{veh.batteryCapacityKwh} kWh</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* OPTION B: MANUAL FIELDS */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Manufacturer</label>
                        <input
                          type="text"
                          value={manufacturer}
                          onChange={(e) => setManufacturer(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Model</label>
                        <input
                          type="text"
                          value={modelName}
                          onChange={(e) => setModelName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Variant</label>
                        <input
                          type="text"
                          value={variantName}
                          onChange={(e) => setVariantName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Vehicle Category</label>
                        <select
                          value={vehicleCategory}
                          onChange={(e) => setVehicleCategory(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="4W">4 Wheeler (Car / SUV)</option>
                          <option value="2W">2 Wheeler (Scooter / Bike)</option>
                          <option value="3W">3 Wheeler (Auto / Cargo)</option>
                          <option value="Commercial">Commercial EV Fleet</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Ex-Showroom Price (INR)</label>
                        <input
                          type="number"
                          value={exShowroomPrice}
                          onChange={(e) => setExShowroomPrice(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Battery Capacity (kWh)</label>
                        <input
                          type="number"
                          value={batteryCapacity}
                          onChange={(e) => setBatteryCapacity(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* =========================================================
                  STEP 4: ADDITIONAL ELIGIBILITY
              ========================================================= */}
              {currentStep === 4 && (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <span>Step 4: Additional Eligibility Questions</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Select policy criteria applicable to your purchase to unlock maximum bonus incentives.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Purchase Type */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Applicant Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPurchaseType('individual')}
                          className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                            purchaseType === 'individual'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Individual
                        </button>
                        <button
                          type="button"
                          onClick={() => setPurchaseType('business')}
                          className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                            purchaseType === 'business'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Business / Commercial
                        </button>
                      </div>
                    </div>

                    {/* Scrappage Bonus */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Existing Petrol/Diesel Scrappage?</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setHasScrappage(true)}
                          className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                            hasScrappage
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Yes (₹20,000 Bonus)
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasScrappage(false)}
                          className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                            !hasScrappage
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          No Scrappage
                        </button>
                      </div>
                    </div>

                    {/* Female Applicant */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Female Applicant Incentive Scheme?</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setIsFemaleApplicant(true)}
                          className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                            isFemaleApplicant
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFemaleApplicant(false)}
                          className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                            !isFemaleApplicant
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Primary Usage */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Primary Usage</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setUsageType('residential')}
                          className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                            usageType === 'residential'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Personal / Residential
                        </button>
                        <button
                          type="button"
                          onClick={() => setUsageType('commercial')}
                          className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                            usageType === 'commercial'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Taxi / Commercial Fleet
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Form Navigation Controls */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
                >
                  <span>{currentStep === 4 ? 'Calculate Subsidy' : 'Continue Step'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              STEP 5: LOADING ANIMATION
          ========================================================= */}
          {isCalculating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 animate-spin">
                <Zap className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Calculating Your EV Benefits...</h3>
                <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                  Cross-referencing {stateName} EV Policy 2026, PM E-DRIVE central incentives, and road tax waivers.
                </p>
              </div>
            </motion.div>
          )}

          {/* =========================================================
              RESULTS PAGE (PREMIUM CARDS BREAKDOWN)
          ========================================================= */}
          {showResults && !isCalculating && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Overall Summary Top Card */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Total Eligibility Breakdown</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">Estimated Savings Summary</h2>
                  </div>

                  <button
                    onClick={() => {
                      setShowResults(false);
                      setCurrentStep(1);
                    }}
                    className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    Recalculate
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-xs text-slate-400 font-medium">Estimated Total Savings</span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                      ₹{totalSavingsCalculated.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-xs text-slate-400 font-medium">Direct Bank Subsidy</span>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      ₹{(directStateSubsidy + centralIncentive).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-xs text-slate-400 font-medium">Effective Vehicle Price</span>
                    <div className="text-2xl sm:text-3xl font-black text-white">
                      ₹{effectivePriceCalculated.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* APPLICABLE SCHEMES CARDS */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-900">Applicable Subsidy Schemes</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Scheme Card 1 */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-black">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Eligible</span>
                      </span>
                      <span className="text-lg font-black text-emerald-700">₹{centralIncentive.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-slate-900">PM E-DRIVE Central Subsidy</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Central government incentive credited directly via FAME / PM E-DRIVE portal.
                      </p>
                    </div>
                  </div>

                  {/* Scheme Card 2 */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-black">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Eligible</span>
                      </span>
                      <span className="text-lg font-black text-emerald-700">₹{directStateSubsidy.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-slate-900">{stateName} EV Policy 2026</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        State government direct purchase subsidy transferred to registered buyer's bank account.
                      </p>
                    </div>
                  </div>

                  {/* Scheme Card 3 */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-black">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>100% Tax Waiver</span>
                      </span>
                      <span className="text-lg font-black text-emerald-700">₹{roadTaxWaiver.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-slate-900">Road Tax & Registration Fee Exemption</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Full exemption on RTO road tax and registration charges for electric vehicles.
                      </p>
                    </div>
                  </div>

                  {/* Scheme Card 4 */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-black">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bonus Active</span>
                      </span>
                      <span className="text-lg font-black text-emerald-700">₹{scrappageBonus.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-slate-900">Old ICE Vehicle Scrappage Bonus</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Additional incentive awarded upon submitting a valid RTO scrappage certificate.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
                <Link
                  href="/recommend"
                  className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs text-center transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Car className="w-4 h-4" />
                  <span>View Recommended EVs</span>
                </Link>

                <Link
                  href="/dealers"
                  className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Connect With Dealer</span>
                </Link>

                <button
                  onClick={() => alert('Downloading official subsidy breakdown report (PDF)...')}
                  className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Download Detailed Report</span>
                </button>

                <Link
                  href="/dashboard"
                  className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Bookmark className="w-4 h-4 text-emerald-600" />
                  <span>Save Results to Dashboard</span>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
