import { UserProfile } from '@/types';
import { MOCK_USER_PROFILE } from '@/lib/mock-data';
import { getSupabaseClient } from '@/lib/supabaseClient';

export interface AuthProvider {
  loginWithGoogle(): Promise<{ success: boolean; user: UserProfile }>;
  loginWithEmail(email: string): Promise<{ success: boolean; user: UserProfile }>;
  logout(): Promise<void>;
}

/**
 * Real Supabase Google OAuth Service.
 *
 * When NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY are set:
 *   - loginWithGoogle() triggers real Google OAuth via Supabase.
 *   - The backend validates the resulting JWT using SUPABASE_JWT_SECRET.
 *
 * When Supabase env vars are NOT set (local dev without Supabase):
 *   - Falls back to a mock user so development continues without credentials.
 */
class SupabaseAuthService implements AuthProvider {
  async loginWithGoogle(): Promise<{ success: boolean; user: UserProfile }> {
    const supabase = getSupabaseClient();

    if (!supabase) {
      // No Supabase credentials configured — use mock in dev
      console.warn('[WhyEV] Supabase not configured. Using mock Google login.');
      await new Promise((resolve) => setTimeout(resolve, 600));
      const mockUser: UserProfile = {
        ...MOCK_USER_PROFILE,
        id: `google-dev-${Date.now()}`,
        name: 'Dev User',
        email: 'dev@whyev.in',
        isDelhiResident: true,
      };
      return { success: true, user: mockUser };
    }

    // Real Supabase OAuth — redirects to Google consent screen
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[WhyEV] Google OAuth error:', error.message);
      throw new Error(error.message);
    }

    // The OAuth flow redirects the browser; execution stops here.
    // The callback page (/auth/callback) will call getSessionUser().
    return { success: true, user: MOCK_USER_PROFILE }; // placeholder, callback handles real user
  }

  async loginWithEmail(email: string): Promise<{ success: boolean; user: UserProfile }> {
    const supabase = getSupabaseClient();

    if (!supabase) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const emailUser: UserProfile = {
        ...MOCK_USER_PROFILE,
        id: `usr-email-${Date.now()}`,
        name: email.split('@')[0] || 'User',
        email,
        isDelhiResident: true,
      };
      return { success: true, user: emailUser };
    }

    // Send magic link / OTP via Supabase
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw new Error(error.message);
    return { success: true, user: MOCK_USER_PROFILE };
  }

  async logout(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  /**
   * Build a UserProfile from the current Supabase session.
   * Called from the OAuth callback route.
   */
  async getSessionUser(): Promise<UserProfile | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    // Retry up to 3 times to allow Supabase SDK time to parse session from hash / storage
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user;
      
      if (sessionUser) {
        const fullName = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'New User';
        return {
          id: sessionUser.id,
          name: fullName,
          email: sessionUser.email || '',
          avatarUrl: sessionUser.user_metadata?.avatar_url || '',
          phone: sessionUser.phone || sessionUser.user_metadata?.phone || '',
          state: 'Delhi',
          city: 'New Delhi',
          memberSince: 'Just now',
          isDelhiResident: true,
          housingType: 'apartment',
          hasAssignedParking: true,
          hasHomeCharger: false,
          dailyCommuteKm: 30,
          budgetMin: 500000,
          budgetMax: 1500000,
          familySize: 4,
          preferredCategory: '4W',
          tradeInIceVehicle: false,
          profileCompletionPct: 60,
          savedReports: [],
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    const { data: userData } = await supabase.auth.getUser();
    const u = userData.user;
    if (!u) return null;

    const fullName = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'New User';
    return {
      id: u.id,
      name: fullName,
      email: u.email || '',
      avatarUrl: u.user_metadata?.avatar_url || '',
      phone: u.phone || u.user_metadata?.phone || '',
      state: 'Delhi',
      city: 'New Delhi',
      memberSince: 'Just now',
      isDelhiResident: true,
      housingType: 'apartment',
      hasAssignedParking: true,
      hasHomeCharger: false,
      dailyCommuteKm: 30,
      budgetMin: 500000,
      budgetMax: 1500000,
      familySize: 4,
      preferredCategory: '4W',
      tradeInIceVehicle: false,
      profileCompletionPct: 60,
      savedReports: [],
    };
  }
}

export const authService = new SupabaseAuthService();
