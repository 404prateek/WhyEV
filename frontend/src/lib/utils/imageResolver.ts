/**
 * WhyEV Vehicle Image Resolver Utility
 * Single Source of Truth: EXACT_VEHICLE_IMAGE_MAP from EV_Image_Source_Library_Updated.xlsx
 * Strictly 100% Exact Key Equality Matching. Zero Fuzzy / Substring Matching.
 */

import { EXACT_VEHICLE_IMAGE_MAP } from '@/lib/data/vehicleImageLibrary';

/** Normalize make and model by removing non-alphanumeric characters */
export function normalizeExactKey(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // keep strictly alphanumeric characters
}

export const normalizeName = normalizeExactKey;

/**
 * Resolves the vehicle image URL using deterministic exact key matching.
 * Returns exact OEM image URL if key exists, otherwise WhyEV placeholder.
 * NEVER uses fuzzy search, includes(), startsWith(), or fallback OEM photos.
 */
export function resolveVehicleImage(vehicle: {
  imageUrl?: string;
  id?: string;
  make?: string;
  model?: string;
  category?: string;
}): string {
  const make = vehicle.make || '';
  const model = vehicle.model || '';

  // Generate exact clean key from make + model
  const exactKey = normalizeExactKey(make + model);

  // 1. Exact Key Lookup in EXCEL Image Map
  if (exactKey && EXACT_VEHICLE_IMAGE_MAP[exactKey]) {
    return EXACT_VEHICLE_IMAGE_MAP[exactKey];
  }

  // 2. Exact Key Lookup for model alone
  const modelKey = normalizeExactKey(model);
  if (modelKey && EXACT_VEHICLE_IMAGE_MAP[modelKey]) {
    return EXACT_VEHICLE_IMAGE_MAP[modelKey];
  }

  // 3. Fallback: Return WhyEV Logo Placeholder (Never return another vehicle's photo)
  return '/whyev-logo-icon.png';
}
