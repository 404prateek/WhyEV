'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  Flame,
  BatteryCharging,
  Calendar,
  Search,
  QrCode,
  CheckCircle2,
  Download,
  Share2,
  Copy,
  AlertTriangle,
  RotateCcw,
  Camera,
  X,
} from 'lucide-react';
import { InspectionRequestModal } from '@/components/battery/InspectionRequestModal';

export function BatteryCertView() {
  const [certInput, setCertInput] = useState('');
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);

  // Camera QR Scanner State & Ref
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Animated Count-Up Number State for Battery SOH
  const [countSoh, setCountSoh] = useState(0);

  const sampleReport = {
    id: 'NABL-EV-8842',
    sohScore: 92,
    sohPct: 92.4,
    grade: 'Grade A+',
    condition: 'Excellent Condition',
    conditionDesc: 'Expected battery performance remains close to original factory specifications.',
    vehicleModel: 'Tata Nexon EV Max (40.5 kWh)',
    odometer: '34,200 km',
    chargeCycles: '340 Cycles',
    remainingRangeKm: '385 km',
    batteryCapacity: '40.5 kWh',
    chargingEfficiency: '94.2%',
    estimatedRemainingYears: '7.5 Years',
    acDcRatio: '82% AC / 18% DC',
    cellDelta: '12 mV',
    resaleImpact: '+12% Resale Valuation',
    warrantyStatus: 'Active (8 Yrs / 1,60,000 km)',
    lastInspectionDate: '18 July 2026',
    inspectionAgency: 'NABL Certified Testing Lab #DEL-884',
    inspectorName: 'Dr. R. K. Sharma (Lead Battery Scientist)',
    verifiedDate: '18 July 2026',
    validUntil: '18 July 2027',
  };

  useEffect(() => {
    if (activeReport) {
      setCountSoh(0);
      const target = activeReport.sohScore;
      const duration = 1200;
      const steps = 30;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCountSoh(target);
          clearInterval(timer);
        } else {
          setCountSoh(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [activeReport]);

  const handleVerifyCert = (queryId?: string) => {
    const idToSearch = (queryId || certInput).trim();
    if (!idToSearch) return;

    setIsLoading(true);
    setIsEmptyState(false);
    setActiveReport(null);

    setTimeout(() => {
      setIsLoading(false);
      if (idToSearch.toUpperCase().includes('INVALID') || idToSearch.length < 3) {
        setIsEmptyState(true);
      } else {
        setActiveReport({ ...sampleReport, id: idToSearch.toUpperCase() });
      }
    }, 900);
  };

  // Camera QR Scanner Trigger
  const handleOpenQrScanner = async () => {
    setIsQrModalOpen(true);
    setCameraError(null);
    setIsCameraActive(false);

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } catch (err) {
        setCameraError('Camera access denied or unavailable. You can trigger a simulated scan below.');
      }
    } else {
      setCameraError('Camera access not supported on this browser device.');
    }
  };

  const handleCloseQrModal = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setIsQrModalOpen(false);
  };

  const handleSimulateQrScan = () => {
    handleCloseQrModal();
    setCertInput('NABL-EV-8842');
    handleVerifyCert('NABL-EV-8842');
  };

  // Interactive PDF Download Handler
  const handleDownloadPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Interactive Share Certificate Handler
  const handleShareCert = async () => {
    if (typeof navigator !== 'undefined' && navigator.share && activeReport) {
      try {
        await navigator.share({
          title: `WhyEV Battery Health Certificate - ${activeReport.id}`,
          text: `Verified NABL Battery Inspection Certificate for ${activeReport.vehicleModel}. SOH Score: ${activeReport.sohPct}%`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // Fallback to copy link
      }
    }
    handleCopyLink();
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2500);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const inspectionTimeline = [
    { title: 'Inspection Booked', date: '15 Jul 2026', done: true },
    { title: 'Doorstep Diagnostics', date: '18 Jul 2026', done: true },
    { title: 'NABL Certificate Generated', date: '18 Jul 2026', done: true },
    { title: 'Verified & Active', date: 'Valid till 2027', done: true },
  ];

  const recommendations = [
    { title: '20% to 80% Daily Charge Rule', desc: 'Keep daily state-of-charge between 20% and 80% to maximize cycle life.', icon: BatteryCharging },
    { title: 'AC Slow Charging Preference', desc: 'Use AC slow charging for daily commute to reduce cell thermal stress.', icon: Zap },
    { title: 'Shaded Parking in Summer', desc: 'Park in shaded areas during peak summer to prevent electrolyte degradation.', icon: Flame },
    { title: 'Normal Battery Performance', desc: 'Battery health is performing normally — continue current charging habits.', icon: CheckCircle2 },
  ];

  return (
    <div className="w-full bg-white text-slate-900 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-32 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
        {/* =========================================================
            1. HERO SECTION (Clean Heading without line divider)
        ========================================================= */}
        <div className="space-y-2 text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Battery Health & Inspection Engine
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-3xl leading-relaxed">
            Verify certified battery reports, inspect battery degradation trends, and access NABL-verified diagnostic passes.
          </p>
        </div>

        {/* =========================================================
            2. CERTIFICATE VERIFICATION LOOKUP CARD
        ========================================================= */}
        {!activeReport && !isEmptyState && !isLoading && (
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-left"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>NABL Verification Engine</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Verify a Battery Certificate
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Enter a Battery Certificate ID or scan a QR code to verify battery health before buying.
                </p>
              </div>

              {/* Input Form & Action Bar */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <div className="relative w-full flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      placeholder="Enter Certificate ID (e.g. NABL-EV-8842)..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-semibold transition-all"
                    />
                  </div>

                  <button
                    onClick={() => handleVerifyCert()}
                    disabled={!certInput.trim()}
                    className="w-full sm:w-auto h-[44px] px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-900/10 shrink-0"
                  >
                    Verify Certificate
                  </button>
                </div>

                {/* Quick Sample Auto-Fill Link & QR Trigger */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <button
                    onClick={() => {
                      setCertInput('NABL-EV-8842');
                      handleVerifyCert('NABL-EV-8842');
                    }}
                    className="font-extrabold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                  >
                    Try Sample Certificate: NABL-EV-8842 →
                  </button>

                  <button
                    onClick={handleOpenQrScanner}
                    className="font-extrabold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full border border-slate-200 transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Scan QR Code</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* =========================================================
            LOADING SKELETON STATE
        ========================================================= */}
        {isLoading && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded-full w-1/3" />
            <div className="h-40 bg-slate-100 rounded-3xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-100 rounded-2xl" />
              <div className="h-20 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        )}

        {/* =========================================================
            EMPTY STATE (NOT FOUND)
        ========================================================= */}
        {isEmptyState && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-md"
          >
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Certificate Not Found</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Please check the Certificate ID or try verifying sample certificate NABL-EV-8842.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setCertInput('NABL-EV-8842');
                  handleVerifyCert('NABL-EV-8842');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 cursor-pointer shadow-sm"
              >
                Load Sample Certificate
              </button>
              <button
                onClick={() => setIsEmptyState(false)}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 text-slate-800 font-extrabold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* =========================================================
            CERTIFICATE VERIFICATION RESULT & REPORT VIEW
        ========================================================= */}
        {activeReport && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 max-w-5xl mx-auto text-left"
          >
            {/* Certificate Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>NABL Verified Inspection Certificate</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Certificate ID: <span className="font-extrabold text-slate-900">{activeReport.id}</span> · Issued on {activeReport.verifiedDate}
                </p>
              </div>

              <button
                onClick={() => setActiveReport(null)}
                className="self-start sm:self-auto px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Verify Another Certificate</span>
              </button>
            </div>

            {/* BATTERY HEALTH SCORE & SUMMARY SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Circular Animated Health Indicator (WhyEV Brand Theme) */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  State of Health (SOH)
                </div>

                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="#e2e8f0" strokeWidth="7" fill="transparent" />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="#10b981"
                      strokeWidth="7"
                      fill="transparent"
                      strokeDasharray="264"
                      initial={{ strokeDashoffset: 264 }}
                      animate={{ strokeDashoffset: 264 - (264 * activeReport.sohScore) / 100 }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
                      {countSoh}%
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mt-1">
                      Health Score
                    </span>
                  </div>
                </div>

                <div className="px-4 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-200">
                  {activeReport.grade} · {activeReport.condition}
                </div>
              </div>

              {/* Condition Summary & Quick Metrics */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200/90 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <h3 className="text-lg font-black text-emerald-950">{activeReport.condition}</h3>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                    {activeReport.conditionDesc}
                  </p>
                </div>

                {/* Additional Surfaced Insights */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="text-[10px] font-black uppercase text-slate-400">Resale Impact</div>
                    <div className="text-sm font-black text-emerald-700">{activeReport.resaleImpact}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="text-[10px] font-black uppercase text-slate-400">Warranty Status</div>
                    <div className="text-sm font-black text-slate-900">{activeReport.warrantyStatus}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* COMPACT STATISTIC CARDS GRID (6 Cards) */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Battery Summary Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400">Capacity</div>
                  <div className="text-sm font-black text-slate-900">{activeReport.batteryCapacity}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400">Remaining SOH</div>
                  <div className="text-sm font-black text-emerald-700">{activeReport.sohPct}%</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400">Est. Range</div>
                  <div className="text-sm font-black text-slate-900">{activeReport.remainingRangeKm}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400">Charge Cycles</div>
                  <div className="text-sm font-black text-slate-900">{activeReport.chargeCycles}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400">Efficiency</div>
                  <div className="text-sm font-black text-emerald-700">{activeReport.chargingEfficiency}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400">Est. Life</div>
                  <div className="text-sm font-black text-slate-900">{activeReport.estimatedRemainingYears}</div>
                </div>
              </div>
            </div>

            {/* VISUAL HEALTH BREAKDOWN (Progress Bars) */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                Health Breakdown & Diagnostic Scores
              </h3>

              <div className="space-y-3 text-xs">
                {/* Degradation */}
                <div className="space-y-1">
                  <div className="flex justify-between font-extrabold text-slate-800">
                    <span>Capacity Retention</span>
                    <span className="text-emerald-700">{activeReport.sohPct}% (Optimal)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${activeReport.sohPct}%` }} />
                  </div>
                </div>

                {/* AC vs DC Ratio */}
                <div className="space-y-1">
                  <div className="flex justify-between font-extrabold text-slate-800">
                    <span>AC vs DC Fast Charging Ratio</span>
                    <span className="text-slate-900">{activeReport.acDcRatio}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                {/* Cell Voltage Delta */}
                <div className="space-y-1">
                  <div className="flex justify-between font-extrabold text-slate-800">
                    <span>Cell Voltage Balance</span>
                    <span className="text-emerald-700">{activeReport.cellDelta} (Balanced)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '95%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONABLE RECOMMENDATIONS (Small Premium Cards) */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Actionable Care Recommendations
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.map((rec, idx) => {
                  const Icon = rec.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-black text-slate-900">{rec.title}</div>
                        <div className="text-[11px] text-slate-500 font-medium leading-relaxed">{rec.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INSPECTION TIMELINE */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Inspection History & Verification Timeline
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {inspectionTimeline.map((step, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-slate-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{step.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">{step.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK ACTIONS BAR (CLICKABLE & FUNCTIONAL) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleDownloadPdf}
                className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/10"
              >
                <Download className="w-4 h-4" />
                <span>Download Certificate PDF</span>
              </button>

              <button
                onClick={handleShareCert}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>{isShared ? 'Shared! ✓' : 'Share Certificate'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
              >
                <Copy className="w-4 h-4 text-slate-600" />
                <span>{isCopied ? 'Link Copied! ✓' : 'Copy Certificate Link'}</span>
              </button>
            </div>

            {/* DOORSTEP INSPECTION CTA */}
            <div className="p-6 rounded-3xl bg-emerald-50/90 border border-emerald-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="space-y-0.5 text-left">
                <h4 className="text-base font-black text-emerald-950">Need a Doorstep Battery Inspection?</h4>
                <p className="text-xs text-emerald-800 font-medium">Get NABL-certified technician inspection for pre-owned EV buying/selling.</p>
              </div>

              <button
                onClick={() => setIsInspectionModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all cursor-pointer shrink-0 shadow-md shadow-emerald-600/20"
              >
                Book Inspection (₹999)
              </button>
            </div>
          </motion.div>
        )}

        {/* =========================================================
            EDUCATIONAL SECTION (HIDDEN WHEN activeReport IS DISPLAYED)
        ========================================================= */}
        {!activeReport && (
          <div id="educational-section" className="space-y-8 pt-6 text-left">
            <div className="max-w-3xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                What is Battery Health?
              </h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Battery health is a measure of usable capacity retained compared to factory specifications. A healthier battery delivers optimal range, performance, and resale value.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900">Key Degradation Factors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                    <Zap className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Frequent DC Fast Charge</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">High thermal loads during fast charging accelerate cell wear.</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
                    <Flame className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Extreme Ambient Heat</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Peak summer temperatures speed up internal chemical breakdown.</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                    <BatteryCharging className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Deep Discharges</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Draining the battery to 0% repeatedly reduces cycle life.</p>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Calendar Aging</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Natural gradual capacity loss over total ownership years.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CAMERA / SIMULATION QR SCANNER MODAL */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative"
            >
              <button
                onClick={handleCloseQrModal}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Scan Battery QR Code</h3>
                <p className="text-xs text-slate-500">Position the QR code inside the camera frame</p>
              </div>

              {/* Video Camera Container / Stream */}
              <div className="relative w-full h-56 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Animated Scanning Frame Overlay */}
                <div className="absolute inset-8 border-2 border-emerald-500 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-400 shadow-md shadow-emerald-400/80 animate-pulse" />
                </div>

                {!isCameraActive && !cameraError && (
                  <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-white text-xs font-bold gap-2">
                    <Camera className="w-4 h-4 animate-bounce" />
                    <span>Accessing Camera Stream...</span>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/90 p-4 flex flex-col items-center justify-center text-slate-300 text-xs text-center space-y-2">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                    <p className="leading-relaxed">{cameraError}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleSimulateQrScan}
                  className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-md shadow-emerald-900/10"
                >
                  Scan QR Sample (NABL-EV-8842)
                </button>
                <button
                  onClick={handleCloseQrModal}
                  className="w-full py-2.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inspection Booking Modal */}
      <InspectionRequestModal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
      />
    </div>
  );
}

export default BatteryCertView;
