import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['placehold.co', 'i.pravatar.cc'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
