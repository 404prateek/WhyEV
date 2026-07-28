import { UserProfile } from '@/types';
import { MOCK_USER_PROFILE } from '@/lib/mock-data';

export interface AuthProvider {
  loginWithGoogle(): Promise<{ success: boolean; user: UserProfile }>;
  loginWithEmail(email: string): Promise<{ success: boolean; user: UserProfile }>;
  logout(): Promise<void>;
}

/**
 * Modular Auth Client Service
 * Can be connected to Firebase Auth, Auth.js (NextAuth), or Supabase Auth.
 */
class GoogleOAuthService implements AuthProvider {
  async loginWithGoogle(): Promise<{ success: boolean; user: UserProfile }> {
    // Simulated Google OAuth Popup / Provider exchange delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const googleUser: UserProfile = {
      ...MOCK_USER_PROFILE,
      id: `google-usr-${Date.now()}`,
      name: 'Aishwarya Sharma',
      email: 'aishwarya@gmail.com',
      isDelhiResident: true,
    };

    return {
      success: true,
      user: googleUser,
    };
  }

  async loginWithEmail(email: string): Promise<{ success: boolean; user: UserProfile }> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const emailUser: UserProfile = {
      ...MOCK_USER_PROFILE,
      id: `usr-email-${Date.now()}`,
      name: email.split('@')[0] || 'Aishwarya',
      email: email,
      isDelhiResident: true,
    };

    return {
      success: true,
      user: emailUser,
    };
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

export const authService = new GoogleOAuthService();
