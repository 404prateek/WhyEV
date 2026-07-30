import { useAuthStore, useIntakeStore } from '@/lib/store';
import { ProfileService } from '@/services/profileService';
import { UserProfile } from '@/types';

export function useProfile() {
  const { user, login } = useAuthStore();
  const { savedVehicleIds, toggleSaveVehicle } = useIntakeStore();

  const savedVehicles = ProfileService.getSavedVehicles(savedVehicleIds);
  const savedReports = ProfileService.getSavedReports(user);

  const updateUserProfile = (updatedFields: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      ...updatedFields,
    };
    login(updatedUser);
  };

  const removeSavedVehicle = (vehicleId: string) => {
    toggleSaveVehicle(vehicleId);
  };

  const removeSavedReport = (reportId: string) => {
    if (!user) return;
    const currentReports = user.savedReports || savedReports;
    const filtered = currentReports.filter((r) => r.id !== reportId);
    updateUserProfile({ savedReports: filtered });
  };

  return {
    user,
    savedVehicles,
    savedReports,
    updateUserProfile,
    removeSavedVehicle,
    removeSavedReport,
  };
}
