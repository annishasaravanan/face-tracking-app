/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Remove static export for Netlify - let Netlify plugin handle it
  // output: 'export',
  
  // Disable image optimization for better compatibility
  images: {
    unoptimized: true,
  },
  
  // Configure trailing slash behavior
  trailingSlash: false,
  
  // Configure webpack for better compatibility
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
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;