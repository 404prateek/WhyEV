'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { authService } from '@/services/authService';

/**
 * /auth/callback
 *
 * Supabase redirects here after Google OAuth completes.
 * We read the session, build a UserProfile, store it, then redirect home.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function handleCallback() {
      try {
        // authService.getSessionUser() reads the Supabase session set by the OAuth redirect
        const user = await authService.getSessionUser();

        if (!user) {
          setStatus('error');
          setErrorMsg('Could not retrieve your account. Please try again.');
          return;
        }

        login(user);
        setStatus('success');

        // Redirect to home (or where they came from) after short delay
        setTimeout(() => router.push('/'), 1200);
      } catch (e: any) {
        setStatus('error');
        setErrorMsg(e?.message || 'Authentication failed. Please try again.');
      }
    }

    handleCallback();
  }, [login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-10 shadow-xl max-w-sm w-full text-center space-y-5">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <h2 className="text-lg font-extrabold text-slate-900">Signing you in…</h2>
            <p className="text-xs text-slate-500">Verifying your Google account with WhyEV.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-lg font-extrabold text-slate-900">Signed In!</h2>
            <p className="text-xs text-slate-500">Redirecting you to WhyEV…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-lg font-extrabold text-slate-900">Sign-In Failed</h2>
            <p className="text-xs text-rose-600">{errorMsg}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
