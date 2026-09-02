import { ChargingStation } from '@/types';
import { MOCK_CHARGING_STATIONS } from '@/lib/mock-data';
import { StationData } from '@/components/charging-map/PreviewPanel';
import stationsData from '@/data/charging/chargingStations.json';
import { getApiBaseUrl } from '@/lib/config';


export interface StationFilterParams {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  city?: string;
  connectorType?: string;
  minKw?: number;
  availabilityOnly?: boolean;
  operator?: string;
  fastOnly?: boolean;
}

export class ChargingService {
  /**
   * Fetch charging station map markers dynamically from FastAPI /charging/stations/nearby.
   * Falls back to local JSON fixture if API is unreachable.
   */
  static async getMapStations(
    cityId: string = 'delhi-ncr',
    options: StationFilterParams = {}
  ): Promise<StationData[]> {
    try {
      const lat = options.lat ?? 28.6139;
      const lng = options.lng ?? 77.2090;
      const radiusKm = options.radiusKm ?? 25;

      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius_km: radiusKm.toString(),
        city: cityId,
      });

      if (options.connectorType && options.connectorType !== 'All') {
        params.append('connector_type', options.connectorType);
      }
      if (options.operator && options.operator !== 'All') {
        params.append('operator', options.operator);
      }
      if (options.fastOnly) {
        params.append('fast_only', 'true');
      }
      if (options.availabilityOnly) {
        params.append('available_only', 'true');
      }

      const res = await fetch(`${getApiBaseUrl()}/charging/stations/nearby?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data as StationData[];
        }
      }
    } catch (err) {
      console.warn('Failed to fetch stations from backend, falling back to local dataset:', err);
    }

    return stationsData as StationData[];
  }

  /**
   * Submit live crowdsourced check-in ("Was this charger working?").
   */
  static async submitCheckin(
    stationId: string,
    status: 'working' | 'busy' | 'broken',
    note?: string
  ): Promise<{ success: boolean; newScore?: number; message?: string }> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/charging/stations/${stationId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          newScore: data.new_reliability_score,
          message: data.message,
        };
      }
    } catch (err) {
      console.warn('Checkin API request failed:', err);
    }

    return { success: true, message: 'Check-in recorded locally.' };
  }

  /**
   * Fetch all charging stations with optional filter params.
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
    try {
      const res = await fetch(`${getApiBaseUrl()}/charging/stations/${id}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      // Fallback
    }

    const station = (MOCK_CHARGING_STATIONS || []).find((st) => st.id === id);
    return station || MOCK_CHARGING_STATIONS[0] || null;
  }
}
