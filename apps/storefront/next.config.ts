import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ESLint is configured at the monorepo root, not per-app.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
