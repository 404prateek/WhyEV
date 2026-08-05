import { ChargingStation } from '@/types';
import { MOCK_CHARGING_STATIONS } from '@/lib/mock-data';
import { StationData } from '@/components/charging-map/PreviewPanel';
import stationsData from '@/data/charging/chargingStations.json';

export interface StationFilterParams {
  city?: string;
  connectorType?: string;
  minKw?: number;
  availabilityOnly?: boolean;
}

export class ChargingService {
  /**
   * Fetch charging station map markers dynamically for Leaflet map canvas.
   */
  static async getMapStations(cityId?: string): Promise<StationData[]> {
    return stationsData as StationData[];
  }

  /**
   * Fetch all charging stations from API response.
   */
  static async getStations(params?: StationFilterParams): Promise<ChargingStation[]> {
    let list = [...(MOCK_CHARGING_STATIONS || [])];

    if (!params) return list;

    if (params.city && params.city !== 'All') {
      list = list.filter((st) => st.city.toLowerCase() === params.city?.toLowerCase());
    }

    if (params.connectorType && params.connectorType !== 'All') {
      list = list.filter((st) =>
        st.connectorTypes.some((c) => c.toLowerCase() === params.connectorType?.toLowerCase())
      );
    }

    if (params.minKw && params.minKw > 0) {
      list = list.filter((st) => st.chargingSpeedKw >= (params.minKw || 0));
    }

    if (params.availabilityOnly) {
      list = list.filter((st) => st.availabilityStatus === 'available');
    }

    return list;
  }

  /**
   * Fetch details of a specific charging station by ID.
   */
  static async getStationById(id: string): Promise<ChargingStation | null> {
    const station = (MOCK_CHARGING_STATIONS || []).find((st) => st.id === id);
    return station || MOCK_CHARGING_STATIONS[0] || null;
  }
}
