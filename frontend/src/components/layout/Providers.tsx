'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';

function SupabaseAuthSync() {
  const { login, logout } = useAuthStore();

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const buildUser = (u: any) => ({
      id: u.id,
      name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'New User',
      email: u.email || '',
      phone: u.phone || u.user_metadata?.phone || '',
      avatarUrl: u.user_metadata?.avatar_url || '',
      state: 'Delhi',
      city: 'New Delhi',
      memberSince: 'Just now',
      isDelhiResident: true,
      housingType: 'apartment' as const,
      hasAssignedParking: true,
      hasHomeCharger: false,
      dailyCommuteKm: 30,
      budgetMin: 500000,
      budgetMax: 1500000,
      familySize: 4,
      preferredCategory: '4W' as const,
      tradeInIceVehicle: false,
      profileCompletionPct: 60,
      savedReports: [],
    });

    // Sync current session on mount (handles page refresh & OAuth hash redirects)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        login(buildUser(session.user));
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        // No active Supabase session -> clear any stale state and pop up sign-in modal
        logout();

        const isOAuthCallback = typeof window !== 'undefined' && (
          window.location.hash.includes('access_token') ||
          window.location.search.includes('code=')
        );

        if (!isOAuthCallback) {
          useAuthStore.getState().setAuthModalOpen(true);
        }
      }
    });

    // Listen for sign-in / sign-out events (handles OAuth callback redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        login(buildUser(session.user));
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
      if (event === 'SIGNED_OUT') {
        logout();
        useAuthStore.getState().setAuthModalOpen(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [login, logout]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthSync />
      {children}
    </QueryClientProvider>
  );
}

