'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/buttons/Button';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      openAuthModal(pathname);
    }
  }, [mounted, isAuthenticated, pathname, openAuthModal]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50/50">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Sign in Required</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Please sign in with Google to access your personalized EV recommendations, Delhi 2026 subsidy reports, and 30-day post-RC tracker.
          </p>
          <div className="pt-2">
            <Button size="md" variant="emerald" onClick={() => openAuthModal(pathname)}>
              Sign In to Access Feature
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
