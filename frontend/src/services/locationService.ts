/**
 * locationService.ts — Persists explicit "Locate Me" GPS coordinates to the backend.
 *
 * This service is called ONLY after the browser user grants geolocation permission
 * and explicitly clicks "Locate Me". It is NOT called on page load or automatically.
 *
 * TODO: Replace with POST /api/v1/locations once the backend location endpoint is
 * live and the migration (g001_user_locations) has been applied to Supabase.
 * Expected endpoint: POST https://whyev-backend.onrender.com/api/v1/locations
 * Expected request body: { latitude: number, longitude: number, accuracy_meters?: number }
 * Expected response: { success: true }
 */

import { getSupabaseToken } from '@/lib/supabaseClient';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://whyev-backend.onrender.com/api/v1';

/**
 * Returns auth headers for the API request.
 * Uses the Supabase session token when the user is signed in.
 * Falls back to the dev sentinel token for local development.
 * This function deliberately mirrors the getAuthHeaders() in api/index.ts
 * to keep locationService.ts self-contained with zero circular imports.
 */
async function buildAuthHeaders(): Promise<Record<string, string>> {
  let token = 'dev-token-xyz';
  try {
    const supabaseToken = await getSupabaseToken();
    if (supabaseToken) token = supabaseToken;
  } catch {
    // Supabase not available — use dev token
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Save the user's GPS coordinates to the backend after an explicit "Locate Me" action.
 *
 * Designed to be called as fire-and-forget (void):
 *   void saveUserLocation(lat, lng, accuracy);
 *
 * A failure here MUST NOT block the map experience or nearby stations request.
 *
 * Privacy:
 * - Called only after browser geolocation permission is explicitly granted.
 * - Coordinates are the raw values from position.coords (no reverse geocoding).
 * - No address is derived or stored.
 * - accuracy_meters is the browser-provided radius, not a precise point.
 */
export async function saveUserLocation(
  latitude: number,
  longitude: number,
  accuracyMeters?: number
): Promise<void> {
  try {
    const headers = await buildAuthHeaders();
    const body: Record<string, number | undefined> = {
      latitude,
      longitude,
    };
    if (accuracyMeters !== undefined && accuracyMeters >= 0) {
      body.accuracy_meters = accuracyMeters;
    }

    const res = await fetch(`${API_BASE}/locations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      // Non-blocking: log warning but do not throw
      console.warn(
        `[locationService] Location save returned HTTP ${res.status} — map continues normally.`
      );
    }
  } catch (err) {
    // Non-blocking: network error or backend down — map and nearby stations are unaffected
    console.warn(
      '[locationService] Location save failed (non-fatal) — map continues normally.',
      err
    );
  }
}
