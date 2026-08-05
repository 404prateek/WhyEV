import { MetadataRoute } from 'next';

/**
 * Next.js App Router sitemap.ts
 *
 * This file is auto-discovered by Next.js and served at /sitemap.xml.
 * It uses the Metadata API introduced in Next.js 13.3+ and is the
 * recommended approach for Next.js 15/16 on Vercel.
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

const BASE_URL = 'https://whyev.in';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // ─── Homepage ────────────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },

    // ─── EV Matcher / Recommendation ─────────────────────────────────────────
    {
      url: `${BASE_URL}/recommend`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },

    // ─── Subsidy Calculator ───────────────────────────────────────────────────
    {
      url: `${BASE_URL}/subsidy`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },

    // ─── Subsidy Document Verification ───────────────────────────────────────
    {
      url: `${BASE_URL}/subsidy/document-verification`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // ─── Verified Dealers ─────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/dealers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // ─── Charging Station Map ─────────────────────────────────────────────────
    {
      url: `${BASE_URL}/map`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // ─── Charging Page ────────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/charging`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },

    // ─── Battery Inspection Certificate ──────────────────────────────────────
    {
      url: `${BASE_URL}/battery-cert`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // ─── Used EV Marketplace ─────────────────────────────────────────────────
    {
      url: `${BASE_URL}/marketplace`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },

    // ─── 30-Day Application Tracker ──────────────────────────────────────────
    // Lower priority — requires authentication to see personalized data,
    // but the page itself is publicly accessible and indexable.
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
