'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { SaaSLogo } from '@/components/navbar/SaaSLogo';
import { Button } from '@/components/buttons/Button';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/lib/store';
import { ROUTES } from '@/routes/routes';

export function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || ROUTES.DASHBOARD;
  const isSignUp = searchParams.get('mode') === 'signup';

  const { login } = useAuthStore();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setAuthError(null);
    try {
      const res = await authService.loginWithGoogle();
      if (res.success && res.user) {
        login(res.user);
        router.push(redirectUrl);
      }
    } catch (e: any) {
      console.error('Google login error:', e);
      setAuthError(e?.message || 'Google sign in failed. Please try again.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoadingEmail(true);
    try {
      const res = await authService.loginWithEmail(email);
      if (res.success) {
        login(res.user);
        router.push(redirectUrl);
      }
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-slate-900 relative"
      >
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
            Delhi Policy 2026 Ready
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="flex justify-center mb-2">
            <SaaSLogo />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isSignUp ? 'Create your WhyEV account' : 'Welcome back to WhyEV'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            Sign in to access your personalized EV recommendations, calculate Delhi 2026 subsidies, and track your 30-day post-RC deadline.
          </p>
        </div>

        {/* Primary CTA: Google OAuth */}
        <div className="space-y-3 pt-2">
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {authError}
            </div>
          )}
          <button
            onClick={handleGoogleLogin}
            disabled={loadingGoogle || loadingEmail}
            className="w-full h-12 px-6 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loadingGoogle ? 'Connecting Google...' : 'Continue with Google'}</span>
          </button>

          {!showEmailInput ? (
            <button
              onClick={() => setShowEmailInput(true)}
              className="w-full h-11 px-6 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>Continue with Email</span>
            </button>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-3 pt-1">
              <div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>
              <Button
                type="submit"
                isLoading={loadingEmail}
                fullWidth
                variant="emerald"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In with Email
              </Button>
            </form>
          )}
        </div>

        {/* Value Props List */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Official Delhi EV Policy 2026 Subsidy Calculator</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Rules-first Empanelled Model Matcher</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero sales spam calls guarantee</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-2 text-center text-[11px] text-slate-400 leading-normal">
          By signing in, you agree to WhyEV's <Link href="#" className="underline hover:text-slate-600">Terms of Service</Link> and <Link href="#" className="underline hover:text-slate-600">Privacy Policy</Link>.
        </div>
      </motion.div>
    </div>
  );
}
