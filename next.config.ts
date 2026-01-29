import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  serverExternalPackages: ['@supabase/supabase-js'],

  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps to save memory

  // Limit concurrent page compilations to reduce memory usage
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Keep pages in memory for 60 seconds
    pagesBufferLength: 2, // Only keep 2 pages in memory at a time
  },

  // Enable compression
  compress: true,

  // Optimize output
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
}

export default nextConfig
