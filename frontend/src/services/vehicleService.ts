import { EmpanelledVehicle } from '@/types';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';

export interface VehicleFilterParams {
  category?: string;
  brand?: string;
  bodyStyle?: string;
  minPrice?: number;
  maxPrice?: number;
  minRange?: number;
  searchQuery?: string;
}

export interface VehicleFilterOptions {
  brands: string[];
  bodyStyles: string[];
  categories: string[];
  priceRanges: { label: string; min: number; max: number }[];
  rangeOptions: { label: string; minKm: number }[];
}

export class VehicleService {
  /**
   * Fetch list of vehicles matching optional filter parameters.
   */
  static async getAllVehicles(params?: VehicleFilterParams): Promise<EmpanelledVehicle[]> {
    let list = [...MOCK_EMPANELLED_VEHICLES];

    if (!params) return list;

    if (params.category && params.category !== 'All') {
      list = list.filter((v) => v.category === params.category);
    }

    if (params.brand && params.brand !== 'All') {
      list = list.filter(
        (v) => (v.make || v.brand || '').toLowerCase() === params.brand?.toLowerCase()
      );
    }

    if (params.bodyStyle && params.bodyStyle !== 'All') {
      list = list.filter(
        (v) => (v.bodyType || '').toLowerCase() === params.bodyStyle?.toLowerCase()
      );
    }

    if (params.minPrice !== undefined) {
      list = list.filter((v) => v.exShowroomPrice >= (params.minPrice || 0));
    }

    if (params.maxPrice !== undefined) {
      list = list.filter((v) => v.exShowroomPrice <= (params.maxPrice || Infinity));
    }

    if (params.minRange !== undefined) {
      list = list.filter((v) => v.rangeKm >= (params.minRange || 0));
    }

    if (params.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.variant.toLowerCase().includes(q) ||
          (v.bodyType || '').toLowerCase().includes(q)
      );
    }

    return list;
  }

  /**
   * Fetch single vehicle details by URL slug or ID.
   */
  static async getVehicleBySlug(slug: string): Promise<EmpanelledVehicle | null> {
    const vehicle = MOCK_EMPANELLED_VEHICLES.find(
      (v) => (v.slug || v.id).toLowerCase() === slug.toLowerCase()
    );
    return vehicle || MOCK_EMPANELLED_VEHICLES[0] || null;
  }

  /**
   * Fetch featured vehicles for Hero/Landing showcase.
   */
  static async getFeaturedVehicles(): Promise<EmpanelledVehicle[]> {
    return MOCK_EMPANELLED_VEHICLES.slice(0, 4);
  }

  /**
   * Fetch similar vehicle recommendations for product details page.
   */
  static async getSimilarVehicles(vehicleId: string): Promise<EmpanelledVehicle[]> {
    return MOCK_EMPANELLED_VEHICLES.filter((v) => v.id !== vehicleId).slice(0, 3);
  }

  /**
   * Fetch dynamic marketplace filter options generated from backend dataset.
   */
  static async getFilterOptions(): Promise<VehicleFilterOptions> {
    const brands = Array.from(
      new Set(MOCK_EMPANELLED_VEHICLES.map((v) => v.make || v.brand || 'Other'))
    ).sort();

    const bodyStyles = Array.from(
      new Set(
        MOCK_EMPANELLED_VEHICLES.map((v) => v.bodyType || 'Standard').filter(Boolean)
      )
    ).sort();

    const categories = ['All', '4W', '2W', '3W'];

    const priceRanges = [
      { label: 'Under ₹10 Lakhs', min: 0, max: 1000000 },
      { label: '₹10L - ₹15L', min: 1000000, max: 1500000 },
      { label: '₹15L - ₹25L', min: 1500000, max: 2500000 },
      { label: 'Above ₹25 Lakhs', min: 2500000, max: 10000000 },
    ];

    const rangeOptions = [
      { label: '200+ km', minKm: 200 },
      { label: '300+ km', minKm: 300 },
      { label: '400+ km', minKm: 400 },
      { label: '500+ km', minKm: 500 },
    ];

    return {
      brands: ['All', ...brands],
      bodyStyles: ['All', ...bodyStyles],
      categories,
      priceRanges,
      rangeOptions,
    };
  }
}
