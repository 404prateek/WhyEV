'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { Dealer } from '@/types';
import { useRouter } from 'next/navigation';

interface TestDriveModalProps {
  dealer: Dealer | null;
  onClose: () => void;
}

export function TestDriveModal({ dealer, onClose }: TestDriveModalProps) {
  const router = useRouter();

  // Step state: 1 = Form, 2 = Confirmation Card, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [selectedModel, setSelectedModel] = useState<string>('Tata Nexon EV Max');
  const [preferredDate, setPreferredDate] = useState<string>('2026-08-06');
  const [preferredTime, setPreferredTime] = useState<string>('11:00 AM');
  const [contactChannel, setContactChannel] = useState<'phone' | 'email' | 'whatsapp'>('whatsapp');
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  // MANDATORY CONSENT CHECKBOX
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  if (!dealer) return null;

  const handleProceedToConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) return;
    setStep(2);
  };

  const handleFinalConfirm = () => {
    setStep(3);
  };

  const handleResetAndClose = () => {
    setStep(1);
    setConsentChecked(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 text-left">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-8 space-y-6 text-slate-900 max-h-[90vh] overflow-y-auto"
        >
          {/* Circular Close Button (Never overlaps title) */}
          <button
            onClick={handleResetAndClose}
            aria-label="Close Test Drive Modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold flex items-center justify-center transition-colors cursor-pointer z-20 shrink-0"
          >
            <X className="w-4 h-4 shrink-0 text-slate-700" />
          </button>

          {/* STEP 1: BOOKING DETAILS FORM */}
          {step === 1 && (
            <form onSubmit={handleProceedToConfirmation} className="space-y-5">
              {/* Title & Dealer Info */}
              <div className="space-y-1 pr-10 sm:pr-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Opt-In Privacy Booking</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Book a Test Drive
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {dealer.name} · {dealer.locality}, {dealer.city}
                </p>
              </div>

              {/* Model Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                  Select Preferred Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-emerald-500"
                >
                  {(dealer.empanelledModels || ['Tata Nexon EV', 'Tata Curvv EV', 'MG ZS EV']).map((m, idx) => (
                    <option key={idx} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Slot Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                    Time Slot
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
              </div>

              {/* Contact Preferences */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                  Contact Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                    { id: 'phone', label: 'Phone Call', icon: Phone },
                    { id: 'email', label: 'Email', icon: Mail },
                  ].map((ch) => {
                    const Icon = ch.icon;
                    const isSelected = contactChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setContactChannel(ch.id as any)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Inputs */}
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Your Full Name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-emerald-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number..."
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address..."
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* MANDATORY EXPLICIT CONSENT CHECKBOX */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-emerald-600 rounded shrink-0 cursor-pointer"
                  />
                  <span className="text-xs text-emerald-950 font-bold leading-relaxed">
                    I agree to share my contact information with this dealership for this booking.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!consentChecked || !userName || !userPhone}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <span>Continue to Booking Confirmation</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </form>
          )}

          {/* STEP 2: CONFIRMATION CARD */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-md">
                <ShieldCheck className="w-8 h-8 shrink-0" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">You're in control</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                  Your contact details will only be shared with <span className="font-extrabold text-slate-900">{dealer.name}, {dealer.locality}</span> for this test drive request.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Model:</span>
                  <span>{selectedModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Appointment Slot:</span>
                  <span>{preferredDate} at {preferredTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Channel:</span>
                  <span className="capitalize">{contactChannel}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalConfirm}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Confirm & Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SUCCESS SCREEN */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center py-4"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-xl shadow-emerald-600/30 animate-bounce">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Test Drive Requested</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-sm mx-auto">
                  The dealership will contact you shortly to confirm your appointment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer"
                >
                  Back to Dealers
                </button>
                <button
                  onClick={() => {
                    handleResetAndClose();
                    router.push('/recommend');
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Continue Browsing EVs
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
