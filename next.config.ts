import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api-hackathon.codedematrixtech.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.codedematrixtech.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
