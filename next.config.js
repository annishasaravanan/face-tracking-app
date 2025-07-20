/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configure webpack for MediaPipe dependencies
  webpack: (config, { isServer }) => {
    // Handle MediaPipe dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;