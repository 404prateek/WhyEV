import { UserProfile, EmpanelledVehicle } from '@/types';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';

export class UserService {
  /**
   * Fetch current user profile from backend.
   */
  static async getUserProfile(userId?: string): Promise<UserProfile> {
    return {
      id: userId || 'user-123',
      name: 'Aishwarya',
      email: 'aishwarya@example.com',
      phone: '+91 98765 43210',
      city: 'New Delhi',
      state: 'Delhi NCR',
      memberSince: 'July 2026',
      isDelhiResident: true,
      housingType: 'apartment',
      hasAssignedParking: true,
      hasHomeCharger: true,
      dailyCommuteKm: 45,
      budgetMin: 1200000,
      budgetMax: 2000000,
      familySize: 4,
      preferredCategory: '4W',
      tradeInIceVehicle: false,
      profileCompletionPct: 85,
      savedVehicleIds: ['nexon-ev-max', 'mg-windsor-ev'],
    };
  }

  /**
   * Update profile fields.
   */
  static async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getUserProfile();
    return { ...current, ...data };
  }

  /**
   * Fetch saved vehicles for the authenticated user.
   */
  static async getSavedVehicles(savedIds?: string[]): Promise<EmpanelledVehicle[]> {
    const ids = savedIds || ['nexon-ev-max', 'mg-windsor-ev'];
    return MOCK_EMPANELLED_VEHICLES.filter(
      (v) => ids.includes(v.id) || (v.slug ? ids.includes(v.slug) : false)
    );
  }
}
