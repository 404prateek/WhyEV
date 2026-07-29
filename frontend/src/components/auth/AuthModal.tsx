'use client';

import React, { useState } from 'react';
import { X, Smartphone, ArrowRight, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { authService } from '@/services/authService';

export function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, login } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const res = await authService.loginWithGoogle();
      // If Supabase is configured, this redirects the browser (no further code runs).
      // If using mock fallback (dev without Supabase), res.user is populated directly.
      if (res.success && res.user) {
        login(res.user);
        setAuthModalOpen(false);
      }
    } catch (e: any) {
      console.error('Google login error:', e.message);
    } finally {
      setGoogleLoading(false);
    }
  };

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
            Save your subsidy report, vehicle shortlist, and track your 30-day deadline
          </p>
        </div>

        {/* Google OAuth Button — Primary CTA */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-3 mb-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-700/60" />
          <span className="text-[11px] text-slate-500 font-medium">or use WhatsApp OTP</span>
          <div className="flex-1 h-px bg-slate-700/60" />
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
              {loading ? 'Sending OTP…' : 'Continue via WhatsApp OTP'}
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
              {loading ? 'Verifying…' : 'Verify & Enter Dashboard'}
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
