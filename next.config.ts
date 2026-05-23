import type { NextConfig } from "next";

// NOTE: Images from the API are returned as relative paths (e.g. /images/merchant/item.jpg).
// The getImageUrl() helper in src/lib/api.ts prepends NEXT_PUBLIC_API_BASE_URL to resolve them.
// If images break in production, make sure NEXT_PUBLIC_API_BASE_URL is set correctly
// in your deployment environment (Vercel / Netlify / etc.) — see .env.example.
const nextConfig: NextConfig = {
  images: {
    // unoptimized: allows plain <img> tags to load from any origin without Next.js
    // image optimisation proxy. Required since we use <img> not next/image throughout.
    unoptimized: true,
    remotePatterns: [
      // Primary API host (https)
      {
        protocol: 'https',
        hostname: 'api-hackathon.codedematrixtech.com',
        port: '',
        pathname: '/**',
      },
      // Any subdomain of codedematrixtech.com (https)
      {
        protocol: 'https',
        hostname: '**.codedematrixtech.com',
        port: '',
        pathname: '/**',
      },
      // HTTP fallback (in case the API serves images over http in some environments)
      {
        protocol: 'http',
        hostname: 'api-hackathon.codedematrixtech.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
