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
   *
   * TODO(charging-integration): mock retained — missing: charging_station DB table (no migration
   *   exists), app/routers/charging.py router, app/schemas/charging.py Pydantic schema,
   *   app/services/charging_service.py business logic, OpenChargeMap ETL sync job.
   * Expected API: GET /api/v1/charging/stations?lat=&lng=&radius_km=&city=
   * Expected DB table(s): charging_station, connector
   *
   * Currently reads from src/data/charging/chargingStations.json (7 dev fixture records).
   * That file is NOT the delhi_ncr_ev_stations.json seed dataset; it is a small
   * hand-crafted dev fixture and must NOT be treated as production data.
   * Replace with a real API call once all six backend conditions are met.
   */
  static async getMapStations(cityId?: string): Promise<StationData[]> {
    // TODO(charging-integration): mock retained — missing: all backend infrastructure listed above.
    // Expected API: GET /api/v1/charging/stations?city=<cityId>
    // Expected DB table(s): charging_station, connector
    return stationsData as StationData[];
  }

  /**
   * Fetch all charging stations with optional filter params.
   *
   * TODO(charging-integration): mock retained — missing: charging_station DB table (no migration
   *   exists), GET /api/v1/charging/stations endpoint, app/schemas/charging.py ChargingStationOut
   *   Pydantic schema, app/services/charging_service.py query logic, input validation.
   * Expected API: GET /api/v1/charging/stations?city=&connector_type=&min_kw=&available_only=
   * Expected DB table(s): charging_station, connector
   *
   * NOTE: This method and getMapStations() consume TWO separate mock datasets with
   * mismatched schemas (MOCK_CHARGING_STATIONS vs stationsData). This inconsistency
   * must be resolved when the real backend is built — both methods should call the same endpoint.
   */
  static async getStations(params?: StationFilterParams): Promise<ChargingStation[]> {
    // TODO(charging-integration): mock retained — see method JSDoc above for all missing pieces.
    // Expected API: GET /api/v1/charging/stations
    // Expected DB table(s): charging_station, connector
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
   *
   * TODO(charging-integration): mock retained — missing: charging_station DB table,
   *   GET /api/v1/charging/stations/{id} endpoint, ChargingStationDetailOut Pydantic schema,
   *   app/services/charging_service.py get_station_by_id() function.
   * Expected API: GET /api/v1/charging/stations/{id}
   * Expected DB table(s): charging_station, connector
   */
  static async getStationById(id: string): Promise<ChargingStation | null> {
    // TODO(charging-integration): mock retained — see method JSDoc above for all missing pieces.
    // Expected API: GET /api/v1/charging/stations/{id}
    // Expected DB table(s): charging_station, connector
    const station = (MOCK_CHARGING_STATIONS || []).find((st) => st.id === id);
    return station || MOCK_CHARGING_STATIONS[0] || null;
  }
}
