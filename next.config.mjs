/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  typescript: {
    // !! WARNING !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARNING !!
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('./'), // This maps '@/' to the project root
    };
    return config;
  },
};

export default nextConfig;
