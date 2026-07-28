import { UserProfile, SavedSubsidyReport, EmpanelledVehicle } from '@/types';
import { MOCK_EMPANELLED_VEHICLES, MOCK_SAVED_SUBSIDY_REPORTS } from '@/lib/mock-data';

export class ProfileService {
  static getSavedVehicles(savedIds: string[]): EmpanelledVehicle[] {
    return MOCK_EMPANELLED_VEHICLES.filter((v) => savedIds.includes(v.id));
  }

  static getSavedReports(user: UserProfile | null): SavedSubsidyReport[] {
    return user?.savedReports || MOCK_SAVED_SUBSIDY_REPORTS;
  }
}
