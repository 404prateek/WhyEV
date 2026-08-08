import { EmpanelledVehicle } from '@/types';
import { MOCK_EMPANELLED_VEHICLES } from '@/lib/mock-data';
import { SEEDED_VEHICLES_MASTER } from '@/lib/seed/vehiclesMaster';
import { vehicleApi } from '@/lib/api';
import { resolveVehicleImage, normalizeName } from '@/lib/utils/imageResolver';

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

/** Enrich API vehicle data with detailed seed features/variants if available */
function enrichVehicle(apiVeh: EmpanelledVehicle): EmpanelledVehicle {
  const apiMakeNorm = normalizeName(apiVeh.make);
  const apiModelNorm = normalizeName(apiVeh.model);

  // Match seed item using normalized names
  const seedMatch = SEEDED_VEHICLES_MASTER.find(
    (s) =>
      s.id.toLowerCase() === apiVeh.id.toLowerCase() ||
      (normalizeName(s.make) === apiMakeNorm && normalizeName(s.model) === apiModelNorm) ||
      apiModelNorm.includes(normalizeName(s.model)) ||
      normalizeName(s.model).includes(apiModelNorm)
  );

  const resolvedImage = resolveVehicleImage({
    imageUrl: apiVeh.imageUrl || seedMatch?.imageUrl,
    id: apiVeh.id,
    make: apiVeh.make,
    model: apiVeh.model,
    category: apiVeh.category,
  });

  const generatedSlug = `${apiMakeNorm}-${apiModelNorm}`;

  if (!seedMatch) {
    return {
      ...apiVeh,
      slug: generatedSlug,
      imageUrl: resolvedImage,
      effectivePrice: apiVeh.effectivePrice || apiVeh.exShowroomPrice,
      whyThisFits: apiVeh.whyThisFits || `${apiVeh.make} ${apiVeh.model} electric vehicle with verified empanelment.`,
    };
  }

  return {
    ...seedMatch,
    id: apiVeh.id,
    slug: generatedSlug,
    make: apiVeh.make || seedMatch.make,
    model: apiVeh.model || seedMatch.model,
    category: apiVeh.category || seedMatch.category,
    exShowroomPrice: apiVeh.exShowroomPrice || seedMatch.exShowroomPrice,
    effectivePrice: apiVeh.effectivePrice || seedMatch.effectivePrice || apiVeh.exShowroomPrice,
    rangeKm: apiVeh.rangeKm || seedMatch.rangeKm,
    batteryCapacityKwh: apiVeh.batteryCapacityKwh || seedMatch.batteryCapacityKwh,
    imageUrl: resolvedImage,
  };
}

export class VehicleService {
  /**
   * Fetch list of vehicles matching optional filter parameters from live backend.
   */
  static async getAllVehicles(params?: VehicleFilterParams): Promise<EmpanelledVehicle[]> {
    let list: EmpanelledVehicle[] = [];

    try {
      const apiVehicles = await vehicleApi.listEmpanelled();
      if (apiVehicles && apiVehicles.length > 0) {
        list = apiVehicles.map(enrichVehicle);
      }
    } catch {
      // Fall back to seed + mock
    }

    if (list.length === 0) {
      // Retained fallback per project mock policy
      // TODO(vehicle-catalog): fallback to mock array if API is unreachable or returns 0 vehicles
      // Expected API: GET /api/v1/vehicles?empanelled=true
      // Expected DB table(s): vehicles_master
      list = MOCK_EMPANELLED_VEHICLES.map(enrichVehicle);
    }

    if (!params) return list;

    if (params.category && params.category !== 'All') {
      list = list.filter((v) => v.category === params.category);
    }

    if (params.brand && params.brand !== 'All') {
      const brandNorm = normalizeName(params.brand);
      list = list.filter(
        (v) => normalizeName(v.make || v.brand || '').includes(brandNorm)
      );
    }

    if (params.bodyStyle && params.bodyStyle !== 'All') {
      list = list.filter(
        (v) => (v.bodyType || '').toLowerCase().includes(params.bodyStyle?.toLowerCase() || '')
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
      const q = normalizeName(params.searchQuery);
      list = list.filter(
        (v) =>
          normalizeName(v.make).includes(q) ||
          normalizeName(v.model).includes(q) ||
          (v.variant || '').toLowerCase().includes(q) ||
          (v.bodyType || '').toLowerCase().includes(q)
      );
    }

    return list;
  }

  /**
   * Fetch single vehicle details by URL slug or ID from live catalog.
   * Uses normalized multi-tier matching. Returns null if not found (no silent Hero Vida fallback).
   */
  static async getVehicleBySlug(slug: string): Promise<EmpanelledVehicle | null> {
    const vehicles = await this.getAllVehicles();
    if (!vehicles || vehicles.length === 0) return null;

    const rawSlug = slug.toLowerCase();
    const slugNorm = normalizeName(slug);

    // 1. Direct UUID or generated slug match
    let match = vehicles.find(
      (v) =>
        v.id.toLowerCase() === rawSlug ||
        (v.slug && v.slug.toLowerCase() === rawSlug) ||
        (v.slug && v.slug.toLowerCase() === slugNorm)
    );

    // 2. Normalized make + model match
    if (!match) {
      match = vehicles.find((v) => {
        const fullNorm = normalizeName(`${v.make} ${v.model}`);
        return fullNorm === slugNorm || fullNorm.includes(slugNorm) || slugNorm.includes(fullNorm);
      });
    }

    // 3. Normalized model-only match
    if (!match) {
      match = vehicles.find((v) => {
        const modelNorm = normalizeName(v.model);
        return modelNorm === slugNorm || modelNorm.includes(slugNorm) || slugNorm.includes(modelNorm);
      });
    }

    return match || null;
  }

  /**
   * Fetch featured vehicles for Hero/Landing showcase.
   */
  static async getFeaturedVehicles(): Promise<EmpanelledVehicle[]> {
    const vehicles = await this.getAllVehicles();
    return vehicles.slice(0, 4);
  }

  /**
   * Fetch similar vehicle recommendations for product details page.
   */
  static async getSimilarVehicles(vehicleId: string): Promise<EmpanelledVehicle[]> {
    const vehicles = await this.getAllVehicles();
    return vehicles.filter((v) => v.id !== vehicleId).slice(0, 3);
  }

  /**
   * Fetch dynamic marketplace filter options generated from dataset.
   */
  static async getFilterOptions(): Promise<VehicleFilterOptions> {
    const vehicles = await this.getAllVehicles();
    const brands = Array.from(
      new Set(vehicles.map((v) => v.make || v.brand || 'Other'))
    ).sort();

    const bodyStyles = Array.from(
      new Set(vehicles.map((v) => v.bodyType || 'Standard').filter(Boolean))
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
