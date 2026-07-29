'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { SaaSLogo } from '@/components/navbar/SaaSLogo';
import { Button } from '@/components/buttons/Button';
import { useAuthStore } from '@/lib/store';
import { authService } from '@/services/authService';

export function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, targetRedirectUrl, login } = useAuthStore();
  const [isSignInMode, setIsSignInMode] = useState(true);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while modal is open & add Escape key listener
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setAuthError(null);
    try {
      const res = await authService.loginWithGoogle();
      if (res.success) {
        login(res.user);
        const redirect = targetRedirectUrl;
        closeAuthModal();
        if (redirect) {
          router.push(redirect);
        }
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
        const redirect = targetRedirectUrl;
        closeAuthModal();
        if (redirect) {
          router.push(redirect);
        }
      }
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeAuthModal();
    }
  };

  return (
    <AnimatePresence>
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-opacity"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900 space-y-6"
        >
          {/* Close Button (X) */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center space-y-3 pt-1">
            <div className="flex justify-center mb-2">
              <SaaSLogo />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isSignInMode ? 'Welcome to WhyEV' : 'Join WhyEV Today'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-normal max-w-xs mx-auto">
              Sign in to access your EV recommendations, Delhi Policy 2026 subsidies, and 30-day post-RC tracker.
            </p>
          </div>

          {/* Primary CTA: Google OAuth */}
          <div className="space-y-3 pt-1">
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

            {/* Divider */}
            <div className="flex items-center gap-3 my-3 text-slate-400">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">OR</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Secondary Email Auth Option */}
            {!showEmailInput ? (
              <button
                onClick={() => setShowEmailInput(true)}
                className="w-full h-11 px-6 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Continue with Email</span>
              </button>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-3">
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
                  Continue with Email
                </Button>
              </form>
            )}
          </div>

          {/* Toggle Mode */}
          <div className="text-center pt-2 text-xs text-slate-500 font-medium">
            {isSignInMode ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignInMode(false)}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignInMode(true)}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>

          {/* Footer Security Note */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Privacy Guarantee · Zero sales spam calls</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
