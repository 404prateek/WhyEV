import { MetadataRoute } from 'next';

/**
 * Next.js App Router robots.ts
 *
 * This file is auto-discovered by Next.js and served at /robots.txt.
 * It uses the Metadata API introduced in Next.js 13.3+.
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all search engine crawlers to index every page
        userAgent: '*',
        allow: '/',
        // Exclude private/auth-only routes from indexing
        disallow: [
          '/admin',
          '/profile',
          '/auth',
        ],
      },
    ],
    // Points Search Console to the canonical sitemap URL
    sitemap: 'https://whyev.in/sitemap.xml',
  };
}
