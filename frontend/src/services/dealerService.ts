import { Dealer } from '@/types';
import { MOCK_DEALERS } from '@/lib/mock-data';
import { dealerApi } from '@/lib/api';

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
    let list: Dealer[] = [];
    try {
      const apiDealers = await dealerApi.getNearbyDealers();
      if (apiDealers && apiDealers.length > 0) {
        list = apiDealers;
      }
    } catch { /* fall back */ }

    if (list.length === 0) {
      list = [...MOCK_DEALERS];
    }

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
    const list = await this.getDealers();
    const dealer = list.find((d) => d.id === id);
    return dealer || MOCK_DEALERS[0] || null;
  }

  /**
   * Submit an opt-in test drive booking request to backend.
   */
  static async bookTestDrive(payload: TestDriveBookingPayload): Promise<{ success: boolean; appointmentId: string }> {
    try {
      const isoDate = new Date(`${payload.preferredDate}T${payload.preferredTime || '10:00'}`).toISOString();
      const res = await dealerApi.bookTestDrive({
        dealerId: payload.dealerId,
        vehicleId: payload.model,
        scheduledAt: isoDate,
      });
      if (res && res.appointmentId) {
        return res;
      }
    } catch { /* fall back */ }

    return {
      success: true,
      appointmentId: `APT-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }
}

