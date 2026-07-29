'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import { MOCK_USER_PROFILE } from '@/lib/mock-data';

function SupabaseAuthSync() {
  const { login, logout } = useAuthStore();

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Sync current session on mount (handles page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        login({
          ...MOCK_USER_PROFILE,
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
          email: u.email || '',
          avatarUrl: u.user_metadata?.avatar_url,
          isDelhiResident: false,
        });
      }
    });

    // Listen for sign-in / sign-out events (handles OAuth callback redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        login({
          ...MOCK_USER_PROFILE,
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
          email: u.email || '',
          avatarUrl: u.user_metadata?.avatar_url,
          isDelhiResident: false,
        });
      }
      if (event === 'SIGNED_OUT') {
        logout();
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

