import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
const resolvedApiUrl =
  isProd && (!rawApiUrl || rawApiUrl.includes('localhost') || rawApiUrl.includes('127.0.0.1'))
    ? 'https://whyev-backend.onrender.com/api/v1'
    : rawApiUrl || 'https://whyev-backend.onrender.com/api/v1';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: resolvedApiUrl,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
