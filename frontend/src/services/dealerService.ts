import { Dealer } from '@/types';
import { MOCK_DEALERS } from '@/lib/mock-data';

export interface DealerFilterParams {
  city?: string;
  brand?: string;
  minRating?: number;
  searchQuery?: string;
}

export interface TestDriveBookingPayload {
  dealerId: string;
  model: string;
  preferredDate: string;
  preferredTime: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  contactChannel: 'whatsapp' | 'phone' | 'email';
}

export class DealerService {
  /**
   * Fetch all verified dealers from API response with optional filtering.
   */
  static async getDealers(params?: DealerFilterParams): Promise<Dealer[]> {
    let list = [...MOCK_DEALERS];

    if (!params) return list;

    if (params.city && params.city !== 'All') {
      list = list.filter((d) => d.city.toLowerCase() === params.city?.toLowerCase());
    }

    if (params.brand && params.brand !== 'All') {
      list = list.filter((d) =>
        d.empanelledModels.some((b) => b.toLowerCase() === params.brand?.toLowerCase())
      );
    }

    if (params.minRating && params.minRating > 0) {
      list = list.filter((d) => d.rating >= (params.minRating || 0));
    }

    if (params.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.locality.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.empanelledModels.some((b) => b.toLowerCase().includes(q))
      );
    }

    return list;
  }

  /**
   * Fetch single dealer profile details by ID.
   */
  static async getDealerById(id: string): Promise<Dealer | null> {
    const dealer = MOCK_DEALERS.find((d) => d.id === id);
    return dealer || MOCK_DEALERS[0] || null;
  }

  /**
   * Submit an opt-in test drive booking request to backend.
   */
  static async bookTestDrive(payload: TestDriveBookingPayload): Promise<{ success: boolean; appointmentId: string }> {
    return {
      success: true,
      appointmentId: `APT-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }
}
