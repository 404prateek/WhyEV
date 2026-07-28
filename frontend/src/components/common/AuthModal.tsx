'use client';

import React, { useState } from 'react';
import { X, Smartphone, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { Button } from '@/components/buttons/Button';

export function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, login } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    setLoading(true);
    await authApi.requestOtp(phone);
    setLoading(false);
    setStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await authApi.verifyOtp(phone, otp);
    setLoading(false);
    login(res.user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Sign in to WhyEV</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Save your subsidy report, vehicle shortlist, and track 30-day deadline
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number (WhatsApp Direct)</label>
              <div className="flex gap-2">
                <span className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              variant="emerald"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue via WhatsApp OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Enter 4-Digit OTP</label>
              <input
                type="text"
                placeholder="1234"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={4}
                className="w-full text-center tracking-[1em] text-lg bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-mono"
                required
              />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              fullWidth
              variant="emerald"
              rightIcon={<CheckCircle className="w-4 h-4" />}
            >
              Verify & Enter Dashboard
            </Button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>We never sell your contact info to dealers without consent.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
