import { BatteryReport } from '@/types';

export class BatteryService {
  /**
   * Query battery certificate report by ID or registration number.
   */
  static async getBatteryReport(idOrQuery: string): Promise<BatteryReport | null> {
    const idToSearch = (idOrQuery || '').trim().toUpperCase();

    if (!idToSearch || idToSearch.includes('INVALID')) {
      return null;
    }

    return {
      id: idToSearch || 'NABL-EV-8842',
      vehicleId: 'veh-tata-nexon-ev',
      makeModel: 'Tata Nexon EV Max (40.5 kWh)',
      year: 2024,
      odometerKm: 34200,
      inspectionDate: '18 July 2026',
      batteryScore: 92,
      healthStatus: 'Excellent',
      estimatedRemainingYears: 7.5,
      degradationPct: 7.6,
      chargingCycleCount: 340,
      certificateValidUntil: '18 July 2027',
      qrCodeUrl: '/qr-sample.png',
      inspectorName: 'Dr. R. K. Sharma (Lead Battery Scientist)',
      batteryCapacityKwh: 40.5,
      acDcRatio: '82% AC / 18% DC',
      cellDelta: '12 mV',
      resaleImpact: '+12% Resale Valuation',
      warrantyStatus: 'Active (8 Yrs / 1,60,000 km)',
    };
  }

  /**
   * Book doorstep NABL battery health inspection.
   */
  static async bookInspection(payload: any): Promise<{ success: boolean; bookingId: string }> {
    return {
      success: true,
      bookingId: `INSP-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  }
}
