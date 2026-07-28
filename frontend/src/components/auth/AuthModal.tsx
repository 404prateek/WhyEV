'use client';

import React, { useState } from 'react';
import { X, Smartphone, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-emerald-900/40 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Sign in to WhyEV</h3>
          <p className="text-xs text-slate-400 mt-1">
            Save your subsidy report, vehicle shortlist, and track 30-day deadline
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (WhatsApp Direct)</label>
              <div className="flex gap-2">
                <span className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-sm font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Sending OTP...' : 'Continue via WhatsApp OTP'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Enter 4-Digit OTP</label>
              <input
                type="text"
                placeholder="1234"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={4}
                className="w-full text-center tracking-[1em] text-lg bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify & Enter Dashboard'}
              <CheckCircle className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>We never sell your contact info to dealers without consent.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
