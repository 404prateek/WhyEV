/**
 * WhyEV API & Runtime Environment Configuration
 *
 * Provides a failsafe resolution of the backend API base URL:
 * - In production browsers (e.g. whyev.in, *.vercel.app), NEVER allows localhost.
 * - If NEXT_PUBLIC_API_URL was mistakenly configured with localhost in Vercel,
 *   this automatically overrides to https://whyev-backend.onrender.com/api/v1.
 * - In local dev (localhost / 127.0.0.1), uses NEXT_PUBLIC_API_URL or defaults to production.
 */

export const PRODUCTION_API_URL = 'https://whyev-backend.onrender.com/api/v1';

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  // Browser-side check
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local');

    if (!isLocalhost) {
      if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
        return PRODUCTION_API_URL;
      }
      return envUrl;
    }
  }

  // Server-side / Build-time check
  if (process.env.NODE_ENV === 'production') {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return PRODUCTION_API_URL;
    }
    return envUrl;
  }

  // Local development
  return envUrl || PRODUCTION_API_URL;
}
